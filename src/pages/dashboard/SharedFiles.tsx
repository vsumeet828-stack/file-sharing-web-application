import React from 'react';
import { Share2, Users, ExternalLink, Download, Clock, MoreVertical, Search, Filter, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatBytes } from '../../lib/utils';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';

export default function SharedFiles() {
  const [sharedFiles, setSharedFiles] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!auth.currentUser) return;

    // In a real app, you'd query files where user is in sharedWith array
    // For now, we'll just show an empty state or a dummy sample
    setLoading(false);
  }, []);

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Shared Workspace</h1>
          <p className="text-slate-400">Files and folders shared with you by other DropX users.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="glass px-6 py-3 rounded-2xl flex items-center gap-2 font-bold hover:bg-white/10 transition-all border-white/10">
            <Users size={20} />
            Manage Teams
          </button>
        </div>
      </header>

      <div className="glass-card">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="flex items-center glass px-4 py-2 rounded-xl focus-within:ring-2 focus-within:ring-primary/50 transition-all w-full sm:w-80">
              <Search size={18} className="text-slate-500" />
              <input 
                type="text" 
                placeholder="Search shared files..."
                className="bg-transparent border-none outline-none text-sm ml-3 w-full"
              />
            </div>
            <button className="glass p-2.5 rounded-xl hover:bg-white/10 transition-all">
              <Filter size={18} />
            </button>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl">
            <Share2 size={16} />
            12 Files Shared
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-white/5">
                <th className="pb-4 font-bold text-slate-500 text-xs uppercase tracking-wider px-4">Name</th>
                <th className="pb-4 font-bold text-slate-500 text-xs uppercase tracking-wider px-4">Shared By</th>
                <th className="pb-4 font-bold text-slate-500 text-xs uppercase tracking-wider px-4">Date</th>
                <th className="pb-4 font-bold text-slate-500 text-xs uppercase tracking-wider px-4 text-right">Size</th>
                <th className="pb-4 px-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                { name: 'Product_Roadmap_2026.pdf', owner: 'sarah.design@corp.com', date: '2 days ago', size: 1024 * 1024 * 5.2 },
                { name: 'Campaign_Assets.zip', owner: 'mike.marketing@corp.com', date: '1 week ago', size: 1024 * 1024 * 842 },
                { name: 'Brand_Identity_v2.mp4', owner: 'design@dropx.io', date: 'Jul 12, 2025', size: 1024 * 1024 * 45 },
              ].map((file, i) => (
                <tr key={i} className="group hover:bg-white/5 transition-all">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Share2 size={20} />
                      </div>
                      <span className="font-bold text-sm">{file.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                         <User size={12} className="text-slate-400" />
                       </div>
                       <span className="text-sm text-slate-400">{file.owner}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-xs text-slate-500 flex items-center gap-2 tracking-wide font-medium">
                      <Clock size={14} />
                      {file.date}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{formatBytes(file.size)}</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:text-primary transition-colors"><Download size={18} /></button>
                      <button className="p-2 hover:text-white transition-colors"><MoreVertical size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sharedFiles.length === 0 && !loading && (
          <div className="text-center py-20 flex flex-col items-center">
             <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-slate-700 mb-6">
                <Users size={40} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-300">Invite a collaborator</h3>
              <p className="text-slate-500 mb-8 max-w-sm text-center text-sm">Teams on Professional plan can collaborate in real-time on shared folders.</p>
              <button className="text-primary font-bold hover:underline">Learn more about teams</button>
          </div>
        )}
      </div>
    </div>
  );
}
