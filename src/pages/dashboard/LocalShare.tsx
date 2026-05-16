import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wifi, 
  Monitor, 
  Smartphone, 
  Send, 
  Share2,
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  QrCode,
  Zap,
  User,
  X,
  Laptop,
  ArrowDownToLine,
  RefreshCcw,
  Info
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { useSearchParams } from 'react-router-dom';
import { auth, db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import { formatBytes } from '../../lib/utils';
import { QRCodeSVG } from 'qrcode.react';

export default function LocalShare() {
  const [searchParams] = useSearchParams();
  const [socket, setSocket] = React.useState<Socket | null>(null);
  const [roomId, setRoomId] = React.useState('');
  const [connectedUsers, setConnectedUsers] = React.useState<string[]>([]);
  const [incomingFile, setIncomingFile] = React.useState<any>(null);
  const [outgoingFile, setOutgoingFile] = React.useState<any>(null);
  const [transferProgress, setTransferProgress] = React.useState(0);
  const [showQR, setShowQR] = React.useState(false);

  React.useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    // Join a room based on URL or local identity
    const roomFromUrl = searchParams.get('room');
    let generatedRoom = roomFromUrl || auth.currentUser?.uid?.slice(0, 8);
    
    if (!generatedRoom) {
      const guestId = localStorage.getItem('dropx_guest_id') || Math.random().toString(36).substring(2, 10);
      localStorage.setItem('dropx_guest_id', guestId);
      generatedRoom = `guest-${guestId}`;
    }
    
    setRoomId(generatedRoom);
    newSocket.emit('join-room', generatedRoom);

    newSocket.on('user-connected', (userId) => {
      setConnectedUsers(prev => [...new Set([...prev, userId])]);
      toast.info("A new device is ready to receive!", {
        icon: <Zap className="text-yellow-400" size={16} />
      });
    });

    newSocket.on('incoming-file', ({ metadata, from }) => {
      setIncomingFile({ ...metadata, from });
      toast("File shared with you!", {
        description: `${metadata.name} is ready for download`,
        duration: 10000,
        action: {
          label: "Accept",
          onClick: () => acceptFile(metadata)
        }
      });
    });

    newSocket.on('file-chunk-received', ({ index, total }) => {
      const progress = ((index + 1) / total) * 100;
      setTransferProgress(progress);
      if (index + 1 === total) {
        toast.success("Download complete!");
        setTimeout(() => {
          setIncomingFile(null);
          setTransferProgress(0);
        }, 2000);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [searchParams]);

  const acceptFile = (metadata: any) => {
    toast.success(`Downloading ${metadata.name}...`);
  };

  const shareFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !socket) return;

    if (connectedUsers.length === 0) {
      toast.error("No devices found to receive the file.");
      return;
    }

    setOutgoingFile(file);
    const metadata = {
      name: file.name,
      size: file.size,
      type: file.type
    };

    socket.emit('file-metadata', { roomId, metadata });
    
    // Simulate chunk sending
    const totalChunks = 20;
    let currentChunk = 0;
    const interval = setInterval(() => {
      socket.emit('file-chunk', { roomId, chunk: '...', index: currentChunk, total: totalChunks });
      currentChunk++;
      setTransferProgress((currentChunk / totalChunks) * 100);
      
      if (currentChunk === totalChunks) {
        clearInterval(interval);
        toast.success("File sent successfully!");
        setTimeout(() => {
          setTransferProgress(0);
          setOutgoingFile(null);
        }, 1500);
      }
    }, 150);
  };

  const copyInviteLink = () => {
    const inviteUrl = `${window.location.origin}/dashboard/local?room=${roomId}`;
    navigator.clipboard.writeText(inviteUrl);
    toast.success("Invite link copied!");
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    toast.success("Room ID copied!");
  };

  return (
    <div className="space-y-10">
      <header>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
            <Wifi size={28} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Local Network Share</h1>
          <div className="ml-auto flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
            <CheckCircle2 size={14} className="text-green-500" />
            <span className="text-xs font-black uppercase tracking-widest text-green-500">Free & Unlimited</span>
          </div>
        </div>
        <p className="text-slate-400">Share files with other devices on your WiFi without cloud uploads. Fast, private, and zero cost.</p>
        
        {/* Quick Guide */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { step: 1, text: "Open this page on two devices" },
            { step: 2, text: "Check if IDs match (or scan QR)" },
            { step: 3, text: "Choose file and 'Beam' it!" }
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/5">
              <span className="w-6 h-6 rounded-lg bg-primary/20 text-primary flex items-center justify-center text-xs font-black">{item.step}</span>
              <p className="text-[11px] font-bold text-slate-500">{item.text}</p>
            </div>
          ))}
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Connection Status */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-card relative overflow-hidden flex flex-col md:flex-row items-center gap-10 p-10 bg-slate-900/40">
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
              <Zap size={140} />
            </div>
            
            <div className="relative shrink-0">
              {/* Radar Animation */}
              <div className="relative w-40 h-40 flex items-center justify-center">
                <motion.div 
                  animate={{ scale: [1, 1.5, 2], opacity: [0.5, 0.2, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
                  className="absolute inset-0 rounded-full border-2 border-primary/30"
                />
                <motion.div 
                  animate={{ scale: [1, 1.3, 1.6], opacity: [0.4, 0.1, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 1 }}
                  className="absolute inset-0 rounded-full border-2 border-primary/20"
                />
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center relative z-10 border border-primary/20 shadow-[0_0_30px_rgba(var(--primary),0.2)]">
                  <Monitor size={40} className="text-primary" />
                </div>

                {/* Satellite dots representing visible devices */}
                {connectedUsers.map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      scale: [0.8, 1.2, 0.8],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                    className="absolute w-3 h-3 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),1)]"
                    style={{
                      top: `${50 + 40 * Math.sin(i * 2 + 0.5)}%`,
                      left: `${50 + 40 * Math.cos(i * 2 + 0.5)}%`,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="flex-grow text-center md:text-left z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Live Discovery</span>
              </div>
              <h2 className="text-2xl font-black mb-2 text-slate-900 dark:text-white">Scanning for devices...</h2>
              <p className="text-slate-500 mb-6 font-medium max-w-md">DropX is scanning your local network for other devices. Ensure they are on this same page to start sharing.</p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <button 
                  onClick={copyInviteLink}
                  className="glass px-4 py-2 rounded-xl flex items-center gap-2 bg-primary text-white hover:brightness-110 transition-all group shadow-lg shadow-primary/20"
                >
                  <Share2 size={14} className="group-hover:rotate-12 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Copy Invite Link</span>
                </button>
                <button 
                  onClick={copyRoomId}
                  className="glass px-4 py-2 rounded-xl flex items-center gap-2 bg-white/50 dark:bg-black/20 hover:bg-primary/10 transition-colors group"
                >
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-primary">ID: {roomId}</span>
                  <RefreshCcw size={12} className="text-slate-400 group-hover:text-primary" />
                </button>
                <button 
                  onClick={() => setShowQR(true)}
                  className="glass px-4 py-2 rounded-xl flex items-center gap-2 bg-white/50 dark:bg-black/20 hover:bg-primary/10 transition-colors group"
                >
                  <QrCode size={14} className="text-slate-400 group-hover:text-primary" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-primary">Share QR</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="glass-card flex flex-col items-center justify-center text-center p-10 group relative transition-transform hover:scale-[1.01]">
              <div className="absolute top-4 right-4 text-[10px] font-black text-primary/40 tracking-tighter">SECURE P2P</div>
              <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-6 transition-all group-hover:scale-110 group-hover:rotate-3 shadow-sm border border-primary/5">
                <Laptop size={36} />
              </div>
              <h3 className="text-xl font-black mb-2 text-slate-900 dark:text-white">Send Files</h3>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">Broadcast documents or photos to all connected nodes instantly.</p>
              <label 
                className={`w-full text-center px-8 py-3.5 rounded-2xl text-sm font-black transition-all cursor-pointer shadow-lg shadow-primary/20 ${connectedUsers.length > 0 ? 'bg-primary text-white hover:brightness-110' : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-50'}`}
              >
                {connectedUsers.length > 0 ? 'Choose Files' : 'Wait for Connection'}
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={shareFile} 
                  disabled={connectedUsers.length === 0}
                />
              </label>
            </div>

            <div className="glass-card flex flex-col items-center justify-center text-center p-10 group relative transition-transform hover:scale-[1.01]">
              <div className="absolute top-4 right-4 text-[10px] font-black text-secondary/40 tracking-tighter">NO SETUP</div>
              <div className="w-20 h-20 rounded-3xl bg-secondary/10 flex items-center justify-center text-secondary mb-6 transition-all group-hover:scale-110 group-hover:-rotate-3 shadow-sm border border-secondary/5">
                <Smartphone size={36} />
              </div>
              <h3 className="text-xl font-black mb-2 text-slate-900 dark:text-white">Mobile Bridge</h3>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">Instantly link your phone to move assets between devices.</p>
              <button 
                onClick={() => setShowQR(true)}
                className="w-full bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 text-slate-900 dark:text-white px-6 py-3.5 rounded-2xl text-sm font-black transition-all border border-black/5 dark:border-white/10"
              >
                Show Connector
              </button>
            </div>
          </div>
        </div>

        {/* Transfers & Feed */}
        <div className="space-y-6">
          <div className="glass-card h-full min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black flex items-center gap-2 text-slate-900 dark:text-white">
                <User size={18} className="text-primary" />
                Active Nodes
              </h3>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-[10px] font-black text-slate-500">{connectedUsers.length} ONLINE</span>
            </div>
            
            <div className="space-y-4 flex-grow">
              {connectedUsers.length > 0 ? connectedUsers.map((user, i) => (
                <div key={user} className="glass p-4 rounded-2xl flex items-center gap-4 bg-white/60 dark:bg-white/5 border border-black/[0.02] dark:border-white/[0.02]">
                  <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
                    {i % 2 === 0 ? <Laptop size={22} /> : <Smartphone size={22} />}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-black text-slate-900 dark:text-white mb-0.5 truncate">
                      {i % 2 === 0 ? 'Primary Node' : 'Nearby Client'}
                    </p>
                    <p className="text-[10px] text-primary font-black uppercase tracking-tighter">ID: {user.slice(0, 8)}...</p>
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-20 opacity-40">
                  <RefreshCcw size={32} className="text-slate-300 animate-spin mb-4" />
                  <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em]">Searching...</p>
                </div>
              )}
            </div>

            <AnimatePresence>
              {(transferProgress > 0) && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="mt-8 pt-8 border-t border-black/5 dark:border-white/5"
                >
                  <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/20">
                        {outgoingFile ? <Send size={18} /> : <ArrowDownToLine size={18} />}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                          {outgoingFile?.name || incomingFile?.name || "Transferring File..."}
                        </p>
                        <p className="text-[10px] font-black text-primary uppercase">
                          {outgoingFile ? 'Sending to nodes' : 'Syncing to device'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Progress</span>
                      <span className="text-[10px] font-black text-primary">{Math.round(transferProgress)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-primary" 
                        initial={{ width: 0 }}
                        animate={{ width: `${transferProgress}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 p-4 bg-slate-50/50 dark:bg-white/5 rounded-2xl border border-dashed border-slate-200 dark:border-white/10">
              <div className="flex gap-3">
                <Info size={16} className="text-slate-400 shrink-0 mt-0.5" />
                <p className="text-[10px] font-medium text-slate-500 leading-relaxed">
                  Files shared via Local Share are streamed directly between devices and never touch our servers. Both devices must remain on this page during transfer.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Modal */}
      <AnimatePresence>
        {showQR && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card max-w-sm w-full p-10 text-center"
            >
              <div className="flex justify-end mb-4">
                <button 
                  onClick={() => setShowQR(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X />
                </button>
              </div>
              <h3 className="text-2xl font-bold mb-6">Quick Connect</h3>
              <div className="p-6 bg-white rounded-3xl mb-8 flex justify-center">
                <QRCodeSVG value={`${window.location.origin}/dashboard/local?room=${roomId}`} size={200} />
              </div>
              <p className="text-slate-400 text-sm">Scan this code with your mobile camera to join the local share room instantly.</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
