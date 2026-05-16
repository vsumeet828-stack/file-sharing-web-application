import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Download, File, Cloud, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatBytes } from '../lib/utils';

export default function ShareView() {
  const { id } = useParams();
  const [file, setFile] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchFile = async () => {
      if (!id) return;
      try {
        const fileRef = doc(db, 'files', id);
        const fileSnap = await getDoc(fileRef);
        if (fileSnap.exists()) {
          setFile(fileSnap.data());
        } else {
          setError("File not found or link has expired.");
        }
      } catch (err) {
        console.error(err);
        setError("Unable to access this shared link.");
      } finally {
        setLoading(false);
      }
    };

    fetchFile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.3em] text-xs">Locating File...</p>
        </div>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <div className="glass-card max-w-md w-full p-10 text-center">
          <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center text-red-500 mx-auto mb-6">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-2xl font-black mb-3 text-white">Access Denied</h2>
          <p className="text-slate-400 mb-10">{error || "This link is invalid or has been disabled by the owner."}</p>
          <Link to="/" className="btn-primary w-full inline-block">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-20 px-4 relative flex items-center justify-center overflow-hidden">
      {/* Background artifacts */}
      <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-primary/5 blur-[120px] rounded-full -z-0 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-blue-500/5 blur-[120px] rounded-full -z-0 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full z-10"
      >
        <div className="flex justify-center mb-10">
          <Link to="/" className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center p-2 shadow-lg shadow-primary/20">
                <Cloud className="text-white w-full h-full" />
              </div>
              <span className="text-3xl font-extrabold tracking-tighter text-white">DropX</span>
          </Link>
        </div>

        <div className="glass-card p-1">
          <div className="bg-slate-900/40 rounded-[2.5rem] p-8 md:p-12">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center text-primary mb-8 shadow-2xl">
                {file.type?.startsWith('image/') ? (
                  <img src={file.url} className="w-full h-full rounded-[2rem] object-cover" alt="" />
                ) : (
                  <File size={40} />
                )}
              </div>
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
                <ShieldCheck size={12} className="text-green-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-green-500">Verified Secure</span>
              </div>
              
              <h1 className="text-3xl font-black text-white mb-3 tracking-tight break-all px-4">{file.name}</h1>
              <div className="flex items-center gap-3 text-slate-400 mb-10 font-bold">
                <span className="text-sm uppercase tracking-widest">{formatBytes(file.size)}</span>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                <span className="text-sm uppercase tracking-widest">{file.type?.split('/')[1] || 'File'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <a 
                  href={file.url} 
                  download={file.name}
                  className="btn-primary w-full flex items-center justify-center gap-3 py-5 text-base"
                >
                  <Download size={20} />
                  Download File
                </a>
                <Link 
                  to="/login"
                  className="glass w-full flex items-center justify-center gap-3 py-5 text-base bg-white/5 hover:bg-white/10 text-white rounded-3xl font-black transition-all border border-white/5 active:scale-95 group"
                >
                  Create Account
                  <ArrowRight size={18} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-6">
          {[
            { label: 'Fast', icon: <Zap size={16} />, text: 'P2P Powered' },
            { label: 'Secure', icon: <ShieldCheck size={16} />, text: 'AES-256' },
            { label: 'Global', icon: <Cloud size={16} />, text: 'Cloud Edge' },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 mx-auto mb-3 border border-white/5">
                {item.icon}
              </div>
              <div className="text-[10px] font-black text-white uppercase tracking-widest mb-0.5">{item.label}</div>
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">{item.text}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
