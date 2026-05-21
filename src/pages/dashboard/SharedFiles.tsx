import React from 'react';
import { Share2, Users, Download, Clock, MoreVertical, Search, Filter, User } from 'lucide-react';
import { formatBytes } from '../../lib/utils';
import { auth } from '../../lib/firebase';

export default function SharedFiles() {
  const [sharedFiles, setSharedFiles] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!auth.currentUser) return;
    setLoading(false);
  }, []);

  return (
    <div className="space-y-6 pb-12 text-slate-700">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 mb-1">Shared Workspace</h1>
          <p className="text-xs text-slate-400 font-medium">Files and folders shared with you by other DropX users.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary !px-4 !py-2 text-xs font-medium flex items-center gap-1.5 active:scale-95 shadow-sm">
            <Users size={14} />
            Manage Teams
          </button>
        </div>
      </header>

      <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center bg-white border border-slate-200 px-3 py-1.5 rounded-xl focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500/10 transition-all w-full sm:w-72 shadow-sm">
              <Search size={14} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Search shared files..."
                className="bg-transparent border-none outline-none text-xs ml-2 w-full text-slate-800 placeholder:text-slate-400 font-medium"
              />
            </div>
            <button className="btn-secondary !p-2 rounded-xl active:scale-95 shadow-sm">
              <Filter size={14} />
            </button>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.01)] shrink-0 self-start sm:self-auto">
            <Share2 size={11} />
            12 Files Shared
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/60 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-4 font-bold">Name</th>
                <th className="py-2.5 px-4 font-bold">Shared By</th>
                <th className="py-2.5 px-4 font-bold">Date</th>
                <th className="py-2.5 px-4 text-right font-bold">Size</th>
                <th className="py-2.5 px-4 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Product_Roadmap_2026.pdf', owner: 'sarah.design@corp.com', date: '2 days ago', size: 1024 * 1024 * 5.2 },
                { name: 'Campaign_Assets.zip', owner: 'mike.marketing@corp.com', date: '1 week ago', size: 1024 * 1024 * 842 },
                { name: 'Brand_Identity_v2.mp4', owner: 'design@dropx.io', date: 'Jul 12, 2025', size: 1024 * 1024 * 45 },
              ].map((file, i) => (
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors group">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
                        <Share2 size={14} />
                      </div>
                      <span className="font-semibold text-slate-900">{file.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                         <User size={10} className="text-slate-400" />
                       </div>
                       <span className="text-slate-500 font-medium">{file.owner}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1.5 tracking-wide font-medium">
                      <Clock size={12} />
                      {file.date}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{formatBytes(file.size)}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-6 h-6 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white flex items-center justify-center transition-colors border border-blue-100 shadow-sm"><Download size={10} /></button>
                      <button className="w-6 h-6 rounded-lg bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors border border-slate-200 shadow-sm"><MoreVertical size={10} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sharedFiles.length === 0 && !loading && (
          <div className="text-center py-16 flex flex-col items-center justify-center">
             <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-400 mb-4 animate-pulse">
                <Users size={20} />
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">Invite a collaborator</h3>
              <p className="text-slate-500 text-xs mb-6 max-w-xs text-center leading-relaxed">Teams on Professional plan can collaborate in real-time on shared folders.</p>
              <button className="btn-primary !px-4 !py-2 text-xs font-medium active:scale-95 shadow-sm">Learn more about teams</button>
          </div>
        )}
      </div>
    </div>
  );
}
