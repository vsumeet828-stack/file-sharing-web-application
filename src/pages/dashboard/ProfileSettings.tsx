import React from 'react';
import { User, Shield, CreditCard, Bell, LogOut, HardDrive, Zap } from 'lucide-react';
import { useAuthStore } from '../../store/useStore';
import { auth, db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { formatBytes } from '../../lib/utils';
import { Link } from 'react-router-dom';
import { getGravatarUrl } from '../../lib/gravatar';

export default function ProfileSettings() {
  const { user, setUser } = useAuthStore();
  const isGuest = !user || user.email?.endsWith('@dropx.guest') || user.isAnonymous;
  const [displayName, setDisplayName] = React.useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = React.useState(user?.photoURL || '');
  const [avatarUrl, setAvatarUrl] = React.useState<string | null>(null);
  const [updating, setUpdating] = React.useState(false);

  React.useEffect(() => {
    const isValidPhoto = typeof photoURL === 'string' && photoURL.trim().toLowerCase().startsWith('http') && photoURL !== 'null' && photoURL !== 'undefined';
    if (isValidPhoto) {
      setAvatarUrl(photoURL);
    } else if (user?.email) {
      setAvatarUrl(getGravatarUrl(user.email));
    } else {
      setAvatarUrl(null);
    }
  }, [photoURL, user?.email]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || isGuest) return;

    setUpdating(true);
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, { displayName, photoURL: photoURL || null });
      setUser({ ...user, displayName, photoURL: photoURL || null });
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6 pb-12 text-slate-700 font-sans">
      <header className="px-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mb-1">Account Settings</h1>
        <p className="text-xs text-slate-400 font-medium">Manage your profile, subscription, and storage preferences.</p>
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Sidebar Nav */}
        <div className="space-y-1">
          {[
            { name: 'Profile', icon: <User size={15} /> },
            { name: 'Security', icon: <Shield size={15} /> },
            { name: 'Subscription', icon: <CreditCard size={15} /> },
            { name: 'Notifications', icon: <Bell size={15} /> },
          ].map((item, i) => (
            <button 
              key={item.name}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
                i === 0 
                  ? 'bg-slate-100 text-slate-900 border border-slate-200/20 shadow-sm' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className={i === 0 ? 'text-blue-600' : 'text-slate-400'}>
                {item.icon}
              </div>
              {item.name}
            </button>
          ))}
          <button 
            onClick={() => {
              auth.signOut();
              useAuthStore.getState().logout();
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-medium text-xs text-red-500 hover:bg-red-50 hover:text-red-600 transition-all mt-6"
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>

        {/* Content */}
        <div className="md:col-span-2 space-y-6">
          <section className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Personal Information</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 p-4 bg-slate-50 border border-slate-200/50 rounded-xl">
                <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center relative group shrink-0 overflow-hidden">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      onError={() => {
                        if (avatarUrl === photoURL && user?.email) {
                          setAvatarUrl(getGravatarUrl(user.email));
                        } else {
                          setAvatarUrl(null);
                        }
                      }}
                      className="w-full h-full rounded-full object-cover" 
                      alt="" 
                    />
                  ) : (
                    <span className="text-lg font-bold text-blue-600 uppercase">
                      {(displayName || user?.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  )}
                  {!isGuest && (
                    <div className="absolute inset-0 bg-slate-900/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                      <span className="text-[8px] font-bold uppercase text-white tracking-wider">Change</span>
                    </div>
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <h4 className="font-semibold text-xs text-slate-800 mb-0.5">Profile Picture</h4>
                  <p className="text-[10px] text-slate-400 font-medium">Avatar will be visible to shared contacts.</p>
                </div>
              </div>

              {isGuest && (
                <div className="p-3.5 bg-amber-50 border border-amber-200/40 rounded-xl flex items-start gap-2.5 mb-2">
                  <Shield className="text-amber-600 shrink-0 mt-0.5 animate-pulse" size={14} />
                  <div>
                    <h4 className="text-xs font-bold text-amber-800 leading-none">Profile Customization Locked</h4>
                    <p className="text-[10px] text-amber-700/80 font-medium mt-1 leading-normal">
                      Identity customizations are restricted for temporary guest vaults. Please{' '}
                      <button
                        type="button"
                        onClick={() => {
                          auth.signOut();
                          useAuthStore.getState().logout();
                        }}
                        className="underline hover:text-amber-900 font-bold text-amber-800"
                      >
                        create a free account
                      </button>{' '}
                      to customize your profile.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-0.5">Display Name</label>
                  <input 
                    type="text" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    disabled={isGuest}
                    className="w-full bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs text-slate-800 font-medium placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 outline-none transition-all shadow-[0_1px_2px_rgba(0,0,0,0.01)] disabled:bg-slate-50 disabled:text-slate-450 disabled:border-slate-200/80 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-0.5">Email Address</label>
                  <input 
                    type="email" 
                    value={user?.email || ''} 
                    disabled
                    className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs text-slate-500 font-medium cursor-not-allowed opacity-70"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 ml-0.5">Profile Picture URL</label>
                <input 
                  type="text" 
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  placeholder="https://example.com/your-avatar.jpg"
                  disabled={isGuest}
                  className="w-full bg-white border border-slate-200 px-3.5 py-2 rounded-xl text-xs text-slate-800 font-medium placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 outline-none transition-all shadow-[0_1px_2px_rgba(0,0,0,0.01)] disabled:bg-slate-50 disabled:text-slate-450 disabled:border-slate-200/80 disabled:cursor-not-allowed"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button 
                  type="submit"
                  disabled={updating || isGuest}
                  className="btn-primary !px-4 !py-2 text-xs font-medium active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </section>

          {isGuest ? (
            <section className="bg-gradient-to-br from-blue-50/50 via-indigo-50/20 to-white border border-blue-200/80 p-6 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/30 rounded-full blur-2xl pointer-events-none -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-110" />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-200/50 flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                    <Zap size={18} className="animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Claim Your Permanent Vault</h3>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">Upgrade your temporary guest session today</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    auth.signOut();
                    useAuthStore.getState().logout();
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-sm transition-all inline-block text-center shrink-0 active:scale-95"
                >
                  Create Free Account
                </button>
              </div>

              <div className="grid sm:grid-cols-3 gap-3.5 relative z-10">
                <div className="bg-white border border-slate-200/50 p-3.5 rounded-xl">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <HardDrive size={13} className="text-blue-500" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Free Storage</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">5 GB Secure Space</p>
                </div>
                <div className="bg-white border border-slate-200/50 p-3.5 rounded-xl">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Shield size={13} className="text-blue-500" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Security Type</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">AES-256 E2EE</p>
                </div>
                <div className="bg-white border border-slate-200/50 p-3.5 rounded-xl">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Zap size={13} className="text-blue-500" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Persistent Vault</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">Files Never Expire</p>
                </div>
              </div>
            </section>
          ) : (
            <section className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                    <Zap size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Premium Subscription</h3>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">Currently on {user?.isPremium ? 'Professional' : 'Free'} Plan</p>
                  </div>
                </div>
                <Link 
                  to="/pricing"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-medium shadow-sm transition-all inline-block text-center shrink-0 active:scale-95"
                >
                  {user?.isPremium ? 'Manage' : 'Upgrade'}
                </Link>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <HardDrive size={13} className="text-slate-400" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Storage</span>
                  </div>
                  <p className="text-base font-semibold text-slate-800">{formatBytes(user?.storageLimit || 0)}</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Shield size={13} className="text-slate-400" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Security Type</span>
                  </div>
                  <p className="text-base font-semibold text-slate-800">AES-256 E2EE</p>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
