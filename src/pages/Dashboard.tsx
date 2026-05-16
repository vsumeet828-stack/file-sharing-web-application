import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cloud, 
  Share2, 
  History, 
  Settings, 
  Plus, 
  Search,
  Grid,
  List as ListIcon,
  HardDrive,
  User,
  Shield,
  Wifi,
  LayoutDashboard,
  Menu
} from 'lucide-react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuthStore, useUIStore } from '../store/useStore';
import { formatBytes } from '../lib/utils';
import { auth } from '../lib/firebase';

// Dashboard Components
import DashboardMain from './dashboard/DashboardMain';
import SharedFiles from './dashboard/SharedFiles';
import LocalShare from './dashboard/LocalShare';
import ProfileSettings from './dashboard/ProfileSettings';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const location = useLocation();

  const isGuest = !user;
  const menuItems = isGuest 
    ? [{ name: 'Local Share', path: '/dashboard/local', icon: <Wifi size={20} />, label: 'FREE' }]
    : [
        { name: 'Overview', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Local Share', path: '/dashboard/local', icon: <Wifi size={20} />, label: 'NEW' },
        { name: 'Shared with me', path: '/dashboard/shared', icon: <Share2 size={20} /> },
        { name: 'History', path: '/dashboard/history', icon: <History size={20} /> },
        { name: 'Settings', path: '/dashboard/settings', icon: <Settings size={20} /> },
      ];

  const storagePercentage = isGuest ? 0 : (user?.storageUsed / user?.storageLimit) * 100 || 0;

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      {/* Background Blobs for Dashboard */}
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-primary/5 blur-[120px] rounded-full -z-0 pointer-events-none" />
      
      {/* Sidebar */}
      <aside className={`fixed lg:relative z-40 h-full p-6 transition-all duration-500 ease-in-out ${isSidebarOpen ? 'w-80 translate-x-0' : 'w-24 -translate-x-full lg:translate-x-0'}`}>
        <div className="h-full bg-white rounded-[2.5rem] border border-black/[0.03] shadow-[0_8px_30px_rgba(0,0,0,0.02)] flex flex-col p-6 overflow-hidden">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center p-2 shadow-lg shadow-primary/20 shrink-0">
              <Cloud className="text-white w-full h-full" />
            </div>
            {isSidebarOpen && (
              <span className="text-xl font-extrabold tracking-tighter text-slate-900 truncate">DropX</span>
            )}
          </div>

          <nav className="flex-grow space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  title={!isSidebarOpen ? item.name : ''}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all relative group ${
                    isActive 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'text-slate-500 hover:bg-primary/5 hover:text-primary-dark'
                  }`}
                >
                  <div className={`${isActive ? '' : 'group-hover:scale-110'} transition-transform shrink-0`}>
                    {item.icon}
                  </div>
                  {isSidebarOpen && (
                    <span className="truncate flex-grow">{item.name}</span>
                  )}
                  {isSidebarOpen && item.label && (
                    <span className="text-[9px] font-black bg-primary/10 text-primary px-1.5 py-0.5 rounded-lg">
                      {item.label}
                    </span>
                  )}
                  {!isSidebarOpen && isActive && (
                    <div className="absolute right-0 w-1 h-6 bg-white rounded-l-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-6">
            {isSidebarOpen && !isGuest && (
              <div className="bg-gray-50/80 backdrop-blur-sm rounded-[2rem] p-5 border border-black/[0.02]">
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <HardDrive size={14} className="text-slate-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Storage</span>
                  </div>
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">{Math.round(storagePercentage)}%</span>
                </div>
                <div className="h-2 w-full bg-white rounded-full overflow-hidden border border-black/[0.03] p-[2px]">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${storagePercentage}%` }}
                    className="h-full bg-primary rounded-full shadow-[0_0_8px_rgba(110,168,254,0.3)]" 
                  />
                </div>
                <p className="text-[9px] text-slate-500 mt-3 font-bold px-1 uppercase tracking-tight truncate">
                  {formatBytes(user?.storageUsed)} of {formatBytes(user?.storageLimit)} used
                </p>
              </div>
            )}
            
            {isGuest ? (
              <div className={`p-1.5 glass rounded-2xl ${isSidebarOpen ? 'px-4' : 'justify-center'}`}>
                <Link to="/login" className="flex items-center gap-3 w-full">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                    <User size={20} className="text-slate-400" />
                  </div>
                  {isSidebarOpen && (
                    <div className="overflow-hidden flex-grow">
                      <p className="text-sm font-bold truncate text-slate-900 leading-tight">Guest User</p>
                      <p className="text-[10px] font-bold text-primary hover:underline">Log in for cloud</p>
                    </div>
                  )}
                </Link>
              </div>
            ) : (
              <div className={`flex items-center gap-3 p-1.5 glass rounded-2xl ${isSidebarOpen ? 'px-4' : 'justify-center cursor-pointer'}`} onClick={!isSidebarOpen ? toggleSidebar : undefined}>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                  {user?.photoURL ? (
                    <img src={user.photoURL} className="w-full h-full rounded-full" alt="" />
                  ) : (
                    <User size={20} className="text-primary" />
                  )}
                </div>
                {isSidebarOpen && (
                  <div className="overflow-hidden flex-grow">
                    <p className="text-sm font-bold truncate text-slate-900">{user?.displayName || 'User'}</p>
                    <button onClick={() => auth.signOut()} className="text-[10px] font-bold text-red-500 hover:underline">Sign Out</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto relative z-10">
        <header className="lg:hidden flex items-center justify-between p-6 bg-white border-b border-black/[0.03]">
          <Link to="/" className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center p-1.5">
                <Cloud size={16} className="text-white" />
              </div>
              <span className="text-lg font-extrabold tracking-tighter">DropX</span>
          </Link>
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-xl bg-gray-50 text-slate-600 border border-black/[0.03]"
          >
            <Menu size={24} />
          </button>
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto pt-10 lg:pt-16">
          <Routes>
            <Route path="/" element={<DashboardMain />} />
            <Route path="/local" element={<LocalShare />} />
            <Route path="/shared" element={<SharedFiles />} />
            <Route path="/settings" element={<ProfileSettings />} />
          </Routes>
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
}
