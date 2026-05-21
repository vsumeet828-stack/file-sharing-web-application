import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Download, File, Cloud, ArrowRight, ShieldCheck, Zap, Lock } from 'lucide-react';
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
        // 1. Try local Express server API first (fast and robust, no Firestore dependencies)
        const apiRes = await fetch(`/api/share/${id}`);
        if (apiRes.ok) {
          const data = await apiRes.json();
          setFile(data);
          return;
        }

        // 2. Fallback to Firestore if local API didn't find the file
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
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-400 font-bold animate-pulse uppercase tracking-[0.2em] text-[10px]">Locating File...</p>
        </div>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] px-4">
        <div className="bg-white border border-slate-200 p-8 text-center rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] max-w-md w-full">
          <div className="w-16 h-16 rounded-2xl bg-red-55/50 border border-red-100 flex items-center justify-center text-red-500 mx-auto mb-5">
            <ShieldCheck size={28} />
          </div>
          <h2 className="text-lg font-bold mb-1.5 text-slate-900">Access Denied</h2>
          <p className="text-xs text-slate-500 mb-8 leading-relaxed">{error || "This link is invalid or has been disabled by the owner."}</p>
          <Link to="/" className="w-full btn-primary block py-2.5 text-center text-xs font-semibold">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] py-20 px-4 relative flex items-center justify-center overflow-hidden font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full z-10"
      >
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2 group">
             <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center p-1.5 shadow-sm shrink-0">
                <Lock className="text-white w-full h-full" size={14} />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">DropX</span>
          </Link>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 md:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.025)]">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-150/70 flex items-center justify-center text-blue-600 mb-6 overflow-hidden">
              {file.type?.startsWith('image/') ? (
                <img src={file.url} className="w-full h-full object-cover" alt="" />
              ) : (
                <File size={32} className="text-slate-400" />
              )}
            </div>
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100/50 mb-4">
              <ShieldCheck size={11} className="text-blue-600" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600">Zero-Knowledge Secure</span>
            </div>
            
            <h1 className="text-lg font-bold text-slate-900 mb-1 px-4 break-all leading-snug">{file.name}</h1>
            <div className="flex items-center gap-2 text-slate-400 mb-8 text-[10px] font-bold uppercase tracking-wider">
              <span>{formatBytes(file.size)}</span>
              <span className="w-1 h-1 rounded-full bg-slate-350" />
              <span className="text-blue-600">{file.type?.split('/')[1] || 'File'}</span>
            </div>

            <div className="flex flex-col gap-3 w-full">
              <a 
                href={file.url} 
                download={file.name}
                className="w-full btn-primary flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-2xl shadow-sm cursor-pointer"
              >
                <Download size={14} />
                Download File
              </a>
              <Link 
                to="/login"
                className="w-full flex items-center justify-center gap-2 py-3 text-xs bg-white hover:bg-slate-50 text-slate-700 rounded-2xl font-bold transition-all border border-slate-200 active:scale-95 shadow-sm"
              >
                Create Free Vault Account
                <ArrowRight size={14} className="text-slate-400" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4">
          {[
            { label: 'E2EE Encryption', icon: <Lock size={14} />, text: 'AES-256' },
            { label: 'Direct Storage', icon: <ShieldCheck size={14} />, text: 'Secure Vault' },
            { label: 'Zero Tracking', icon: <Zap size={14} />, text: 'Private Stream' },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center text-slate-400 mx-auto mb-2 shadow-sm">
                {item.icon}
              </div>
              <div className="text-[9px] font-bold text-slate-900 uppercase tracking-wide leading-none">{item.label}</div>
              <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-1">{item.text}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
