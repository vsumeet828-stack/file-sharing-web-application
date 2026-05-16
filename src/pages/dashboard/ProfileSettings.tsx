import React from 'react';
import { motion } from 'framer-motion';
import { User, Shield, CreditCard, Bell, LogOut, HardDrive, Zap } from 'lucide-react';
import { useAuthStore } from '../../store/useStore';
import { auth, db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { formatBytes } from '../../lib/utils';
import { Link } from 'react-router-dom';

export default function ProfileSettings() {
  const { user, setUser } = useAuthStore();
  const [displayName, setDisplayName] = React.useState(user?.displayName || '');
  const [updating, setUpdating] = React.useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setUpdating(true);
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, { displayName });
      setUser({ ...user, displayName });
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-12">
      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Account Settings</h1>
        <p className="text-slate-400">Manage your profile, subscription, and storage preferences.</p>
      </header>

      <div className="grid md:grid-cols-3 gap-10">
        {/* Sidebar Nav */}
        <div className="space-y-1">
          {[
            { name: 'Profile', icon: <User size={18} /> },
            { name: 'Security', icon: <Shield size={18} /> },
            { name: 'Subscription', icon: <CreditCard size={18} /> },
            { name: 'Notifications', icon: <Bell size={18} /> },
          ].map((item, i) => (
            <button 
              key={item.name}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                i === 0 ? 'bg-primary text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.icon}
              {item.name}
            </button>
          ))}
          <button 
            onClick={() => auth.signOut()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-red-500 hover:bg-red-500/10 transition-all mt-10"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>

        {/* Content */}
        <div className="md:col-span-2 space-y-8">
          <section className="glass-card">
            <h3 className="text-xl font-bold mb-6">Personal Information</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="flex flex-col md:flex-row items-center gap-6 mb-8 p-4 glass rounded-2xl border-white/5">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center relative group">
                  {user?.photoURL ? (
                    <img src={user.photoURL} className="w-full h-full rounded-full" alt="" />
                  ) : (
                    <User size={32} className="text-primary" />
                  )}
                  <div className="absolute inset-0 bg-slate-950/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <span className="text-[10px] font-bold uppercase">Change</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold mb-1">Profile Picture</h4>
                  <p className="text-xs text-slate-500">Avatar will be visible to shared contacts.</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2 ml-1">Display Name</label>
                  <input 
                    type="text" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full glass bg-white/5 px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2 ml-1">Email Address</label>
                  <input 
                    type="email" 
                    value={user?.email || ''} 
                    disabled
                    className="w-full glass bg-white/5 px-4 py-3 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all opacity-50 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button 
                  type="submit"
                  disabled={updating}
                  className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </section>

          <section className="glass-card border-secondary/20 bg-secondary/5">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary neon-border">
                  <Zap size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Premium Subscription</h3>
                  <p className="text-xs text-slate-500">Currently on {user?.isPremium ? 'Professional' : 'Free'} Plan</p>
                </div>
              </div>
              <Link 
                to="/pricing"
                className="bg-secondary text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-secondary/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                {user?.isPremium ? 'Manage' : 'Upgrade'}
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="glass p-4 rounded-xl border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <HardDrive size={16} className="text-slate-500" />
                  <span className="text-xs font-bold text-slate-400">Total Storage</span>
                </div>
                <p className="text-xl font-bold">{formatBytes(user?.storageLimit || 0)}</p>
              </div>
              <div className="glass p-4 rounded-xl border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={16} className="text-slate-500" />
                  <span className="text-xs font-bold text-slate-400">Security</span>
                </div>
                <p className="text-xl font-bold">Standard</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
