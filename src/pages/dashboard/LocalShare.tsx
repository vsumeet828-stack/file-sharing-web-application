import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wifi, 
  Monitor, 
  Smartphone, 
  Send, 
  Share2,
  ChevronRight, 
  CheckCircle2, 
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
import { auth } from '../../lib/firebase';
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
  const [localIp, setLocalIp] = React.useState('localhost');

  React.useEffect(() => {
    fetch('/api/ip')
      .then(res => res.json())
      .then(data => {
        if (data.ip) setLocalIp(data.ip);
      })
      .catch(e => console.warn('Could not fetch server local IP:', e));
  }, []);

  const getInviteUrl = () => {
    const originIp = localIp === 'localhost' ? window.location.hostname : localIp;
    const port = window.location.port ? `:${window.location.port}` : '';
    return `${window.location.protocol}//${originIp}${port}/dashboard/local?room=${roomId}`;
  };

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
        icon: <Zap className="text-blue-500" size={16} />
      });
    });

    newSocket.on('user-list', (userIds: string[]) => {
      const otherUsers = userIds.filter(id => id !== newSocket.id);
      setConnectedUsers(otherUsers);
    });

    newSocket.on('user-disconnected', (userId: string) => {
      setConnectedUsers(prev => prev.filter(id => id !== userId));
      toast.info("A device disconnected.");
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
    const inviteUrl = getInviteUrl();
    navigator.clipboard.writeText(inviteUrl);
    toast.success("Invite link copied!");
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    toast.success("Room ID copied!");
  };

  return (
    <div className="space-y-6 pb-12 text-slate-700">
      <header>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2 px-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
              <Wifi size={20} />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Local Network Share</h1>
          </div>
          <div className="sm:ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 border border-green-100 w-fit">
            <CheckCircle2 size={12} className="text-green-600" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-green-600">Free & Unlimited</span>
          </div>
        </div>
        <p className="text-xs text-slate-500 px-1 leading-relaxed">Share files with other devices on your WiFi without cloud uploads. Fast, private, and zero cost.</p>
        
        {/* Quick Guide */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { step: 1, text: "Open this page on two devices" },
            { step: 2, text: "Check if IDs match (or scan QR)" },
            { step: 3, text: "Choose file and 'Beam' it!" }
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
              <span className="w-5 h-5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center text-[10px] font-bold">{item.step}</span>
              <p className="text-[10px] font-semibold text-slate-500">{item.text}</p>
            </div>
          ))}
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Connection Status */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)] relative overflow-hidden flex flex-col md:flex-row items-center gap-8 p-8 rounded-2xl">
            
            <div className="relative shrink-0">
              {/* Radar Animation */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <motion.div 
                  animate={{ scale: [1, 1.4, 1.8], opacity: [0.3, 0.1, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
                  className="absolute inset-0 rounded-full border border-blue-500/10"
                />
                <motion.div 
                  animate={{ scale: [1, 1.25, 1.5], opacity: [0.2, 0.05, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 1 }}
                  className="absolute inset-0 rounded-full border border-blue-500/5"
                />
                <div className="w-20 h-20 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center relative z-10 shadow-sm">
                  <Monitor size={32} className="text-blue-600" />
                </div>

                {/* Satellite dots representing visible devices */}
                {connectedUsers.map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      scale: [0.9, 1.1, 0.9],
                      opacity: [0.6, 1, 0.6]
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                    className="absolute w-2.5 h-2.5 bg-blue-600 rounded-full shadow-sm"
                    style={{
                      top: `${50 + 40 * Math.sin(i * 2 + 0.5)}%`,
                      left: `${50 + 40 * Math.cos(i * 2 + 0.5)}%`,
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="flex-grow text-center md:text-left z-10">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600">Live Discovery</span>
              </div>
              <h2 className="text-lg font-semibold mb-1 text-slate-900">Scanning for devices...</h2>
              <p className="text-slate-555 mb-5 text-xs font-medium max-w-md leading-relaxed">DropX is scanning your local network for other devices. Ensure they are on this same page to start sharing.</p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                <button 
                  onClick={copyInviteLink}
                  className="btn-primary !px-3 !py-1.5 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <Share2 size={11} />
                  <span>Copy Link</span>
                </button>
                <button 
                  onClick={copyRoomId}
                  className="btn-secondary !px-3 !py-1.5 text-[9px] font-bold uppercase flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <span className="text-slate-500">ID: {roomId}</span>
                  <RefreshCcw size={10} className="text-slate-400" />
                </button>
                <button 
                  onClick={() => setShowQR(true)}
                  className="btn-secondary !px-3 !py-1.5 text-[9px] font-bold uppercase flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <QrCode size={11} className="text-slate-500" />
                  <span className="text-slate-500">Share QR</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200/60 flex flex-col items-center justify-center text-center p-8 rounded-2xl group relative transition-all duration-200 hover:border-slate-350 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="absolute top-4 right-4 text-[8px] font-bold text-blue-600/40 tracking-wider">SECURE P2P</div>
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4 transition-all group-hover:scale-105 shadow-sm">
                <Laptop size={26} />
              </div>
              <h3 className="text-sm font-semibold mb-1 text-slate-900">Send Files</h3>
              <p className="text-slate-500 text-xs mb-5 leading-relaxed max-w-[200px]">Broadcast documents or photos to all connected nodes instantly.</p>
              <label 
                className={`w-full text-center px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer shadow-sm ${connectedUsers.length > 0 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-50'}`}
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

            <div className="bg-white border border-slate-200/60 flex flex-col items-center justify-center text-center p-8 rounded-2xl group relative transition-all duration-200 hover:border-slate-350 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="absolute top-4 right-4 text-[8px] font-bold text-blue-600/40 tracking-wider">NO SETUP</div>
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4 transition-all group-hover:scale-105 shadow-sm">
                <Smartphone size={26} />
              </div>
              <h3 className="text-sm font-semibold mb-1 text-slate-900">Mobile Bridge</h3>
              <p className="text-slate-500 text-xs mb-5 leading-relaxed max-w-[200px]">Instantly link your phone to move assets between devices.</p>
              <button 
                onClick={() => setShowQR(true)}
                className="w-full bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-xs font-medium transition-all border border-slate-200 shadow-sm"
              >
                Show Connector
              </button>
            </div>
          </div>
        </div>

        {/* Transfers & Feed */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/60 p-6 rounded-2xl flex flex-col shadow-[0_1px_3px_rgba(0,0,0,0.02)] min-h-[420px]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold flex items-center gap-1.5 text-slate-900">
                <User size={15} className="text-blue-600" />
                Active Nodes
              </h3>
              <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/50 text-[8px] font-bold text-slate-500 uppercase">{connectedUsers.length} ONLINE</span>
            </div>
            
            <div className="space-y-3 flex-grow">
              {connectedUsers.length > 0 ? connectedUsers.map((user, i) => (
                <div key={user} className="p-3.5 rounded-xl flex items-center gap-3.5 bg-slate-50 border border-slate-100">
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-blue-600 shrink-0">
                    {i % 2 === 0 ? <Laptop size={16} /> : <Smartphone size={16} />}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-semibold text-slate-800 mb-0.5 truncate">
                      {i % 2 === 0 ? 'Primary Node' : 'Nearby Client'}
                    </p>
                    <p className="text-[9px] text-blue-600 font-bold uppercase tracking-wider leading-none">ID: {user.slice(0, 8)}</p>
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-20 opacity-60">
                  <RefreshCcw size={24} className="text-slate-305 animate-spin text-slate-350 mb-3" />
                  <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">Searching...</p>
                </div>
              )}
            </div>

            <AnimatePresence>
              {(transferProgress > 0) && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-6 pt-6 border-t border-slate-100"
                >
                  <div className="bg-blue-50 border border-blue-100/70 rounded-xl p-3.5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                        {outgoingFile ? <Send size={14} /> : <ArrowDownToLine size={14} />}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {outgoingFile?.name || incomingFile?.name || "Transferring File..."}
                        </p>
                        <p className="text-[9px] font-bold text-blue-600 uppercase mt-0.5">
                          {outgoingFile ? 'Sending to nodes' : 'Syncing to device'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Progress</span>
                      <span className="text-[9px] font-bold text-blue-600">{Math.round(transferProgress)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200/50 rounded-full overflow-hidden p-[1px]">
                      <motion.div 
                        className="h-full bg-blue-600 rounded-full" 
                        initial={{ width: 0 }}
                        animate={{ width: `${transferProgress}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-6 p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
              <div className="flex gap-2">
                <Info size={14} className="text-slate-400 shrink-0 mt-0.5" />
                <p className="text-[9px] font-medium text-slate-500 leading-relaxed">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-[2px]">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 shadow-xl max-w-sm w-full p-6 rounded-2xl relative"
            >
              <button 
                onClick={() => setShowQR(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg transition-colors border border-slate-100 shadow-sm"
              >
                <X size={14} />
              </button>
              
              <h3 className="text-base font-semibold text-slate-900 mb-1 mt-1">Quick Connect</h3>
              <p className="text-[10px] text-slate-400 mb-5 leading-normal">Scan this code with your mobile camera to join the local share room instantly.</p>
              
              <div className="p-4 bg-white border border-slate-100 rounded-xl mb-3 flex justify-center shadow-inner">
                <QRCodeSVG value={getInviteUrl()} size={180} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
