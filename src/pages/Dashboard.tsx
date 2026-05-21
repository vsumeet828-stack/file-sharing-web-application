import React from 'react';
import { motion } from 'framer-motion';
import { 
  Share2, 
  History, 
  Settings, 
  HardDrive, 
  User, 
  ShieldCheck, 
  Wifi, 
  LayoutDashboard,
  Menu,
  Lock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuthStore, useUIStore } from '../store/useStore';
import { formatBytes } from '../lib/utils';
import { auth } from '../lib/firebase';
import { getGravatarUrl } from '../lib/gravatar';

// Dashboard Components
import DashboardMain from './dashboard/DashboardMain';
import SharedFiles from './dashboard/SharedFiles';
import LocalShare from './dashboard/LocalShare';
import ProfileSettings from './dashboard/ProfileSettings';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const location = useLocation();
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    const photo = user?.photoURL;
    const isValidPhoto = typeof photo === 'string' && photo.trim().toLowerCase().startsWith('http') && photo !== 'null' && photo !== 'undefined';
    if (isValidPhoto) {
      setAvatarUrl(photo);
    } else if (user?.email) {
      setAvatarUrl(getGravatarUrl(user.email));
    } else {
      setAvatarUrl(null);
    }
  }, [user?.photoURL, user?.email]);

  const isGuest = !user || user.email?.endsWith('@dropx.guest') || user.isAnonymous;
  const menuItems = isGuest 
    ? [
        { name: 'Workspace', path: '/dashboard', icon: <LayoutDashboard size={16} /> },
        { name: 'Fast P2P Share', path: '/dashboard/local', icon: <Wifi size={16} />, label: 'FREE' }
      ]
    : [
        { name: 'Workspace', path: '/dashboard', icon: <LayoutDashboard size={16} /> },
        { name: 'Fast P2P Share', path: '/dashboard/local', icon: <Wifi size={16} />, label: 'NEW' },
        { name: 'Secure Shared', path: '/dashboard/shared', icon: <Share2 size={16} /> },
        { name: 'Transfer Audit', path: '/dashboard/history', icon: <History size={16} /> },
        { name: 'Settings', path: '/dashboard/settings', icon: <Settings size={16} /> },
      ];

  const storagePercentage = isGuest ? 12 : (user?.storageUsed / user?.storageLimit) * 100 || 0;

  return (
    <div className="flex h-screen bg-[#fafafa] text-slate-800 overflow-hidden relative font-sans">
      
      {/* Sidebar */}
      <aside className={`fixed lg:relative z-40 h-full p-4 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full lg:translate-x-0'}`}>
        <div className="h-full bg-white border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)] rounded-2xl flex flex-col p-4 overflow-hidden relative">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6 px-2 mt-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center p-1.5 shadow-sm shrink-0">
                <Lock className="text-white w-full h-full" size={14} />
              </div>
              {isSidebarOpen && (
                <div className="flex flex-col">
                  <span className="text-sm font-bold tracking-tight text-slate-900 leading-none">DropX</span>
                  <span className="text-[8px] text-blue-600 font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                    Zero-Knowledge
                  </span>
                </div>
              )}
            </div>
            
            {/* Collapse Trigger */}
            <button 
              onClick={toggleSidebar}
              className="hidden lg:flex w-5 h-5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              {isSidebarOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-grow space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  title={!isSidebarOpen ? item.name : ''}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all relative group ${
                    isActive 
                      ? 'bg-slate-100 text-slate-900 border border-slate-200/20' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className={`shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                    {item.icon}
                  </div>
                  {isSidebarOpen && (
                    <span className="truncate flex-grow">{item.name}</span>
                  )}
                  {isSidebarOpen && item.label && (
                    <span className="text-[8px] font-bold bg-blue-500/10 text-blue-600 px-1 py-0.5 rounded border border-blue-500/20">
                      {item.label}
                    </span>
                  )}
                  {!isSidebarOpen && isActive && (
                    <div className="absolute right-0 w-1 h-4 bg-blue-600 rounded-l-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="mt-auto space-y-3">
            
            {/* Security Indicator */}
            {isSidebarOpen && (
              <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-start gap-2">
                <ShieldCheck size={14} className="text-blue-600 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-800 uppercase tracking-wider leading-none">E2EE Secured</p>
                  <p className="text-[9px] text-slate-400 mt-1 font-medium leading-normal">AES-256 client encryption fully active.</p>
                </div>
              </div>
            )}

            {/* Storage Progress */}
            {isSidebarOpen && !isGuest && (
              <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-3.5">
                <div className="flex items-center justify-between mb-1.5 px-0.5">
                  <div className="flex items-center gap-1.5">
                    <HardDrive size={10} className="text-slate-400" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Vault Space</span>
                  </div>
                  <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider">{Math.round(storagePercentage)}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200/50 rounded-full overflow-hidden p-[1px] border border-slate-300/30">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${storagePercentage}%` }}
                    className="h-full bg-blue-600 rounded-full" 
                  />
                </div>
                <p className="text-[9px] text-slate-400 mt-1.5 font-bold uppercase tracking-wide truncate">
                  {formatBytes(user?.storageUsed)} / {formatBytes(user?.storageLimit)}
                </p>
              </div>
            )}
            
            {/* User Profile */}
            {isGuest ? (
              <div className={`flex items-center gap-2 p-1.5 bg-amber-50/50 border border-amber-200/40 rounded-xl ${isSidebarOpen ? 'px-3' : 'justify-center cursor-pointer'}`} onClick={!isSidebarOpen ? toggleSidebar : undefined}>
                <div className="w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
                  <User size={14} className="text-amber-600" />
                </div>
                {isSidebarOpen && (
                  <div className="overflow-hidden flex-grow leading-tight">
                    <p className="text-xs font-bold truncate text-slate-800">Guest Session</p>
                    <button 
                      onClick={() => {
                        auth.signOut();
                        useAuthStore.getState().logout();
                      }} 
                      className="text-[9px] font-bold text-red-500 hover:underline uppercase tracking-wider"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className={`flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200/40 rounded-xl ${isSidebarOpen ? 'px-3' : 'justify-center cursor-pointer'}`} onClick={!isSidebarOpen ? toggleSidebar : undefined}>
                <div className="w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20 overflow-hidden">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      onError={() => {
                        if (avatarUrl === user?.photoURL && user?.email) {
                          setAvatarUrl(getGravatarUrl(user.email));
                        } else {
                          setAvatarUrl(null);
                        }
                      }} 
                      className="w-full h-full rounded-full object-cover" 
                      alt="" 
                    />
                  ) : (
                    <span className="text-[10px] font-bold text-blue-600 uppercase">
                      {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                {isSidebarOpen && (
                  <div className="overflow-hidden flex-grow leading-tight">
                    <p className="text-xs font-bold truncate text-slate-800">{user?.displayName || 'User'}</p>
                    <button 
                      onClick={() => {
                        auth.signOut();
                        useAuthStore.getState().logout();
                      }} 
                      className="text-[9px] font-bold text-red-500 hover:underline uppercase tracking-wider"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-grow overflow-y-auto relative z-10 flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200/80">
          <Link to="/" className="flex items-center gap-2">
             <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center p-1.5">
                <Lock size={14} className="text-white" />
              </div>
              <span className="text-base font-bold tracking-tight text-slate-900">DropX</span>
          </Link>
          <button 
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg bg-slate-50 text-slate-600 border border-slate-200"
          >
            <Menu size={16} />
          </button>
        </header>

        <div className="p-4 md:p-6 max-w-6xl w-full mx-auto flex-grow flex flex-col justify-start">
          <Routes>
            <Route path="/" element={<DashboardMain />} />
            <Route path="/local" element={<LocalShare />} />
            <Route path="/shared" element={<SharedFiles />} />
            <Route path="/settings" element={<ProfileSettings />} />
          </Routes>
        </div>
      </main>

      {/* Mobile Drawer Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
}
