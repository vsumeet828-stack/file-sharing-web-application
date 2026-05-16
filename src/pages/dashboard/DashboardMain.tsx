import React from 'react';
import { 
  Plus, 
  User,
  Search, 
  Grid, 
  List, 
  MoreVertical, 
  Download, 
  Share2, 
  Trash2, 
  ExternalLink,
  ChevronRight,
  Clock,
  LayoutGrid,
  Cloud,
  Wifi,
  File as FileIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../../lib/firebase';
import { formatBytes } from '../../lib/utils';
import FileUpload from '../../components/FileUpload';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useStore';

export default function DashboardMain() {
  const { user } = useAuthStore();
  const [showUpload, setShowUpload] = React.useState(false);
  const [files, setFiles] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    if (!auth.currentUser) return;

    const path = 'files';
    const q = query(
      collection(db, path),
      where('ownerId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc'),
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFiles(docs);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-10 px-4">
        <div className="flex items-center gap-8">
          <div className="w-24 h-24 rounded-[3rem] bg-slate-900 border-[6px] border-slate-50 flex items-center justify-center p-1 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] shrink-0 group hover:rotate-6 transition-transform duration-500">
             {user?.photoURL ? (
                <img src={user.photoURL} className="w-full h-full rounded-[2.5rem] object-cover" alt="" />
              ) : (
                <User size={36} className="text-white" />
              )}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-[9px] font-black uppercase tracking-widest text-indigo-500">Workspace</div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{user?.email}</div>
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 leading-none">
              Welcome, <span className="text-indigo-600">{user?.displayName?.split(' ')[0] || 'Member'}</span>.
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowUpload(!showUpload)}
            className="btn-primary !rounded-[2.5rem] flex items-center justify-center gap-4 group !py-6 !px-10 text-xl shadow-2xl shadow-indigo-200"
          >
            {showUpload ? <ChevronRight /> : <Plus className="group-hover:rotate-90 transition-transform duration-500" />}
            {showUpload ? 'Library' : 'Upload New'}
          </button>
        </div>
      </header>

      {showUpload ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <FileUpload onComplete={() => setShowUpload(false)} />
        </motion.div>
      ) : (
        <>
          {/* Free P2P Promo Banner */}
          {!user?.isPremium && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-indigo-600 rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden group shadow-2xl shadow-indigo-200"
            >
              <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-indigo-500 blur-[100px] rounded-full -z-0 opacity-50 group-hover:opacity-70 transition-opacity" />
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="flex-grow max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6 group-hover:scale-105 transition-transform">
                    <Wifi size={12} className="text-white animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Unlimited Free Transfer</span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black mb-6 leading-[1.1] tracking-tight">Need a free way to share huge files?</h2>
                  <p className="text-indigo-100 font-bold mb-0 text-lg opacity-90 max-w-xl leading-relaxed">
                    Use <strong className="text-white">Fast Share</strong> for direct P2P transfers. No storage limits, no cloud fees, and completely private.
                  </p>
                </div>
                <Link 
                  to="/dashboard/local"
                  className="bg-white text-indigo-600 px-10 py-5 rounded-3xl font-black text-lg hover:bg-indigo-50 transition-all shadow-xl shadow-black/10 active:scale-95 shrink-0 flex items-center gap-3 group/btn"
                >
                  Go to Fast Share
                  <ChevronRight className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Objects', value: files.length, icon: <LayoutGrid className="text-blue-500" />, bg: 'bg-blue-50' },
              { label: 'Usage', value: formatBytes(files.reduce((a, b) => a + (b.size || 0), 0)), icon: <Cloud className="text-primary" />, bg: 'bg-primary/10' },
              { label: 'Shared Link', value: '0', icon: <Share2 className="text-indigo-500" />, bg: 'bg-indigo-50' },
              { label: 'Network', value: 'Local', icon: <Wifi className="text-green-500" />, bg: 'bg-green-50' },
            ].map((stat, i) => (
              <div key={i} className="premium-card !p-6 group flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center transition-transform group-hover:scale-110 duration-500 shrink-0`}>
                  {React.cloneElement(stat.icon as React.ReactElement<any>, { size: 24 })}
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 leading-none mb-1">{stat.value}</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Files List */}
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <h2 className="text-2xl font-bold text-slate-900">Recent Activity</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-white border border-black/[0.04] px-4 py-2.5 rounded-2xl focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-sm">
                  <Search size={18} className="text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search library..."
                    className="bg-transparent border-none outline-none text-sm ml-3 w-40 text-slate-600 font-medium"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="flex items-center bg-white border border-black/[0.04] rounded-2xl p-1.5 shadow-sm">
                  <button className="p-2 bg-primary/5 text-primary rounded-xl"><Grid size={18} /></button>
                  <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><List size={18} /></button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="premium-card h-64 animate-pulse bg-gray-100/50" />
                ))}
              </div>
            ) : filteredFiles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredFiles.map((file) => (
                  <motion.div
                    key={file.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="premium-card !p-4 group flex flex-col"
                  >
                    <div className="relative mb-5 rounded-[2rem] aspect-square bg-gray-50 flex items-center justify-center overflow-hidden border border-black/[0.02]">
                      {file.type.startsWith('image/') ? (
                        <img src={file.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-lg border border-black/[0.02] text-slate-300">
                          <FileIcon size={32} />
                        </div>
                      )}
                      
                      <div className="absolute inset-x-4 bottom-4 p-2 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 flex items-center justify-around gap-2">
                        <a 
                          href={file.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex-grow flex items-center justify-center p-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
                        >
                          <Download size={18} />
                        </a>
                        <button 
                          onClick={() => {
                            const shareUrl = `${window.location.origin}/share/${file.id}`;
                            navigator.clipboard.writeText(shareUrl);
                            toast.success("Share link copied to clipboard!");
                          }}
                          className="flex-grow flex items-center justify-center p-2.5 bg-slate-900 text-white rounded-xl hover:bg-black transition-all shadow-lg shadow-slate-900/10"
                        >
                          <Share2 size={18} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-start justify-between gap-4 px-1">
                      <div className="overflow-hidden">
                        <h4 className="font-bold text-sm truncate text-slate-900 mb-1 leading-tight">{file.name}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formatBytes(file.size)}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span className="text-[10px] font-black text-primary uppercase tracking-widest">{file.type.split('/')[1] || 'FILE'}</span>
                        </div>
                      </div>
                      <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 premium-card bg-white">
                <div className="w-24 h-24 rounded-[2.5rem] bg-gray-50 flex items-center justify-center text-slate-200 mb-8 border border-black/[0.02]">
                  <Cloud size={48} />
                </div>
                <h3 className="text-2xl font-black mb-3 text-slate-900">Your library is empty</h3>
                <p className="text-slate-500 mb-10 max-w-sm text-center font-medium px-4 leading-relaxed">
                  Start by uploading your first asset or document. We support files up to 5GB.
                </p>
                <button 
                  onClick={() => setShowUpload(true)}
                  className="btn-primary px-12"
                >
                  Upload First File
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
