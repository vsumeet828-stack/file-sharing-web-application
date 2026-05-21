import React from 'react';
import { 
  Plus, 
  Search, 
  Grid, 
  List, 
  Download, 
  Share2, 
  ChevronRight,
  Cloud,
  Wifi,
  File as FileIcon,
  Shield,
  Lock,
  RefreshCw,
  HardDrive,
  Copy,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../../lib/firebase';
import { formatBytes } from '../../lib/utils';
import FileUpload from '../../components/FileUpload';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useStore';

export default function DashboardMain() {
  const { user } = useAuthStore();
  const isGuest = !user || user.email?.endsWith('@dropx.guest') || user.isAnonymous;
  const [showUpload, setShowUpload] = React.useState(false);
  const [files, setFiles] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [localIp, setLocalIp] = React.useState('localhost');
  const [shareFile, setShareFile] = React.useState<any | null>(null);

  React.useEffect(() => {
    fetch('/api/ip')
      .then(res => res.json())
      .then(data => {
        if (data.ip) setLocalIp(data.ip);
      })
      .catch(e => console.warn('Could not fetch server local IP:', e));
  }, []);

  const getShareUrl = (fileId: string) => {
    const originIp = localIp === 'localhost' ? window.location.hostname : localIp;
    const port = window.location.port ? `:${window.location.port}` : '';
    return `${window.location.protocol}//${originIp}${port}/share/${fileId}`;
  };

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
      setLoading(false);
      handleFirestoreError(error, OperationType.LIST, path);
    });

    return () => unsub();
  }, []);

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));
  const totalStorageUsed = files.reduce((acc, file) => acc + (file.size || 0), 0);

  return (
    <div className="space-y-6 pb-12 text-slate-700">
      
      {/* Guest Mode Callout Banner */}
      {isGuest && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50/70 border border-blue-150 rounded-2xl p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600 shrink-0 border border-blue-200/50">
              <Lock size={18} className="animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 leading-tight">Temporary Guest Vault Active</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed font-medium">
                You are accessing DropX without an account. Any shared links are transient. **Create a free permanent vault** to keep your files forever and get 5GB secure cloud storage.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              auth.signOut();
              useAuthStore.getState().logout();
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all active:scale-95 shadow-sm shrink-0 border border-blue-600 cursor-pointer"
          >
            Create Free Account
          </button>
        </div>
      )}

      {/* Visual Header / Welcome Section */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Workspace</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">E2EE Secured</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Welcome, {user?.displayName?.split(' ')[0] || 'Member'}
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowUpload(!showUpload)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 font-medium text-xs text-white flex items-center gap-1.5 transition-all shadow-sm active:scale-95 shrink-0"
          >
            {showUpload ? <ChevronRight size={14} /> : <Plus size={14} />}
            {showUpload ? 'Library View' : 'Secure Upload'}
          </button>
        </div>
      </header>

      {/* Security Trust Indicators Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white border border-slate-200/60 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <Lock size={14} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-900 uppercase tracking-wider leading-none">AES-256 E2EE</p>
            <p className="text-[9px] text-slate-400 mt-0.5">Zero-knowledge local encryption</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <Shield size={14} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-900 uppercase tracking-wider leading-none">Safe Storage</p>
            <p className="text-[9px] text-slate-400 mt-0.5">Malware scanned objects</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <Wifi size={14} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-900 uppercase tracking-wider leading-none">Local Share</p>
            <p className="text-[9px] text-slate-400 mt-0.5">P2P zero-cloud transfers</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <RefreshCw size={14} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-900 uppercase tracking-wider leading-none">Link Expiry</p>
            <p className="text-[9px] text-slate-400 mt-0.5">Secure transient download locks</p>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {showUpload ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-6 bg-white border border-slate-200/60 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] relative overflow-hidden"
          >
            <div className="mb-6">
              <h3 className="text-base font-semibold text-slate-900">Client-Side Encrypted File Upload</h3>
              <p className="text-[9px] text-blue-600 font-bold uppercase tracking-wider mt-0.5">AES-256 zero-knowledge encryption active</p>
            </div>
            <FileUpload onComplete={() => setShowUpload(false)} />
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            
            {/* Direct P2P Banner */}
            {!user?.isPremium && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 relative overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)] group">
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-50 border border-blue-100 text-[9px] font-bold uppercase tracking-wider text-blue-600">
                      <Wifi size={10} className="animate-pulse" />
                      Free Direct Share
                    </span>
                    <h3 className="text-lg font-semibold text-slate-900 tracking-tight">Need to send a massive file immediately?</h3>
                    <p className="text-xs text-slate-500 max-w-xl">
                      Skip cloud upload boundaries. Use <strong className="text-blue-600 font-medium">Fast P2P Share</strong> to transfer directly client-to-client over local rooms. No storage limits, completely unmonitored and secure.
                    </p>
                  </div>
                  <Link 
                    to="/dashboard/local"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium text-xs transition-all flex items-center gap-1 active:scale-95 shrink-0 group/btn shadow-sm"
                  >
                    Launch Fast Share
                    <ChevronRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            )}

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Objects', value: files.length, icon: <FileIcon className="text-blue-600" />, bg: 'bg-blue-50' },
                { label: 'Storage Used', value: formatBytes(totalStorageUsed), icon: <HardDrive className="text-blue-600" />, bg: 'bg-blue-50' },
                { label: 'Network status', value: 'Active', icon: <Wifi className="text-blue-600" />, bg: 'bg-blue-50' },
                { label: 'System status', value: 'Secured', icon: <Shield className="text-blue-600" />, bg: 'bg-blue-50' },
              ].map((stat, i) => (
                <div key={i} className="p-4 bg-white border border-slate-200/60 rounded-2xl flex items-center gap-3.5 hover:border-slate-300 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all">
                  <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                    {React.cloneElement(stat.icon as React.ReactElement<any>, { size: 16 })}
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-slate-900 leading-none mb-0.5">{stat.value}</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Files List Layout */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Recent Activity</h2>
                  <p className="text-[9px] text-slate-400 uppercase tracking-wider mt-0.5 font-medium">Encrypted Assets Repository</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-white border border-slate-200 px-3 py-1.5 rounded-xl focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/10 transition-all">
                    <Search size={14} className="text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search files..."
                      className="bg-transparent border-none outline-none text-xs ml-2 w-36 text-slate-800 font-medium placeholder:text-slate-400"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-0.5 shrink-0">
                    <button 
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white text-slate-800 border border-slate-200/80 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <Grid size={14} />
                    </button>
                    <button 
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white text-slate-800 border border-slate-200/80 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <List size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-40 bg-slate-50 border border-slate-100 rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : filteredFiles.length > 0 ? (
                viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {filteredFiles.map((file) => (
                      <motion.div
                        key={file.id}
                        layout
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white border border-slate-200/60 hover:border-slate-350 hover:shadow-sm p-3.5 rounded-2xl flex flex-col group relative transition-all duration-200 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
                      >
                        <div className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 border border-blue-100 text-[8px] font-bold text-blue-600">
                          <Lock size={8} />
                          AES-256
                        </div>

                        {/* File Icon / Preview section */}
                        <div className="mb-3 rounded-xl aspect-video bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden relative">
                          {file.type.startsWith('image/') ? (
                            <img src={file.url} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300" alt="" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/85 flex items-center justify-center text-slate-400">
                              <FileIcon size={16} />
                            </div>
                          )}
                          
                          {/* Grid Item hover action overlay */}
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <a 
                              href={file.url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white transition-all active:scale-95"
                              title="Download Decrypted"
                            >
                              <Download size={12} />
                            </a>
                            <button 
                              onClick={() => setShareFile(file)}
                              className="w-7 h-7 rounded-lg bg-white hover:bg-slate-50 flex items-center justify-center text-slate-800 transition-all active:scale-95 border border-slate-250 shadow-sm"
                              title="Copy Share Link"
                            >
                              <Share2 size={12} />
                            </button>
                          </div>
                        </div>
                        
                        {/* Title and metadata details */}
                        <div className="flex items-start justify-between gap-3 mt-1 min-w-0">
                          <div className="min-w-0 flex-grow">
                            <h4 className="font-semibold text-xs text-slate-900 truncate leading-snug mb-0.5">{file.name}</h4>
                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                              <span>{formatBytes(file.size)}</span>
                              <span className="w-1 h-1 rounded-full bg-slate-200" />
                              <span className="text-blue-600">{file.type.split('/')[1] || 'FILE'}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  /* Premium List View Table */
                  <div className="border border-slate-200/60 rounded-2xl overflow-hidden bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                          <th className="py-2.5 px-4 font-bold">Filename</th>
                          <th className="py-2.5 px-4 font-bold">Size</th>
                          <th className="py-2.5 px-4 font-bold">Encryption Type</th>
                          <th className="py-2.5 px-4 font-bold">Uploaded</th>
                          <th className="py-2.5 px-4 text-right font-bold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredFiles.map((file) => (
                          <tr key={file.id} className="border-b border-slate-100 hover:bg-slate-50/40 transition-colors group">
                            <td className="py-3 px-4 font-medium text-slate-900 flex items-center gap-2">
                              <FileIcon size={13} className="text-slate-400 shrink-0" />
                              <span className="truncate max-w-xs">{file.name}</span>
                            </td>
                            <td className="py-3 px-4 text-slate-500 font-medium">{formatBytes(file.size)}</td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 border border-blue-100 text-[8px] font-bold text-blue-600">
                                <Lock size={8} />
                                AES-256 E2EE
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-400 font-medium">
                              {file.createdAt ? new Date(file.createdAt.seconds * 1000).toLocaleDateString() : 'Pending'}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <a 
                                  href={file.url} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="w-6 h-6 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white flex items-center justify-center transition-colors border border-blue-100"
                                >
                                  <Download size={10} />
                                </a>
                                <button 
                                  onClick={() => setShareFile(file)}
                                  className="w-6 h-6 rounded-lg bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 flex items-center justify-center transition-colors border border-slate-200 shadow-sm"
                                >
                                  <Share2 size={10} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              ) : (
                /* Sleek Empty State */
                <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200/60 rounded-2xl p-6 text-center shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-400 mb-4 animate-pulse">
                    <Cloud size={20} />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">No secure uploads yet</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Protect your files with absolute client-side encryption. Supported size limit is up to 5GB.
                  </p>
                  <button 
                    onClick={() => setShowUpload(true)}
                    className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs active:scale-95 transition-all shadow-sm"
                  >
                    Upload first asset
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Premium Local Share Modal */}
      <AnimatePresence>
        {shareFile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 max-w-sm w-full shadow-[0_10px_40px_rgba(0,0,0,0.06)] relative overflow-hidden"
            >
              <button 
                onClick={() => setShareFile(null)}
                className="absolute top-4 right-4 p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg transition-all"
              >
                <X size={16} />
              </button>

              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mx-auto mb-4">
                  <Share2 size={20} />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">Local Network Sharing</h3>
                <p className="text-[10px] text-slate-400 mb-6 font-medium truncate px-4">file: {shareFile.name}</p>
                
                {/* QR Code Container */}
                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 inline-block mb-6 shadow-inner">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(getShareUrl(shareFile.id))}`}
                    alt="Scan to download"
                    className="w-36 h-36 mx-auto object-contain rounded-md"
                  />
                </div>

                <div className="text-left space-y-1.5 mb-6">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block ml-1">Network URL</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={getShareUrl(shareFile.id)} 
                      className="bg-slate-50 border border-slate-200 text-[10px] font-mono text-slate-600 px-3 py-2 rounded-xl flex-grow focus:outline-none"
                    />
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(getShareUrl(shareFile.id));
                        toast.success("Link copied!");
                      }}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl active:scale-95 transition-all shadow-sm flex items-center justify-center"
                      title="Copy URL"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>

                <div className="bg-blue-50/50 border border-blue-100/40 rounded-xl p-3.5 text-left flex items-start gap-2.5">
                  <Wifi size={14} className="text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-900 leading-none mb-0.5">Wi-Fi Sharing</h4>
                    <p className="text-[9px] text-slate-500 leading-relaxed">Scan the QR code with your phone camera, or open the URL. Make sure your phone is on the same Wi-Fi network.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
