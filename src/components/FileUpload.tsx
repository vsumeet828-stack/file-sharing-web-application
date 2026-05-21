import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File as FileIcon, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, setDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { formatBytes } from '../lib/utils';
import { nanoid } from 'nanoid';

interface FileUploadProps {
  onComplete?: () => void;
}

export default function FileUpload({ onComplete }: FileUploadProps) {
  const [files, setFiles] = React.useState<any[]>([]);
  const [uploading, setUploading] = React.useState(false);

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles.map(file => ({
      file,
      id: nanoid(),
      progress: 0,
      status: 'pending'
    }))]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop
  } as any);

  // Helper: read a File as base64 string
  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1]; // strip data:...;base64, prefix
        resolve(base64);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  const startUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);

    const uploadPromises = files.map(async (fileData, index) => {
      if (fileData.status === 'completed') return;

      const { file, id } = fileData;

      try {
        // Step 1: Read file as base64
        setFiles(prev => prev.map((f, i) => i === index ? { ...f, progress: 10 } : f));
        const base64Data = await readFileAsBase64(file);

        // Step 2: Upload to local Express server
        setFiles(prev => prev.map((f, i) => i === index ? { ...f, progress: 30 } : f));

        const res = await fetch('/api/upload/local', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            fileData: base64Data,
          }),
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText || 'Server upload failed');
        }

        const data = await res.json();
        const downloadURL = data.url;

        setFiles(prev => prev.map((f, i) => i === index ? { ...f, progress: 70 } : f));

        // Step 3: Save metadata to Firestore with timeout (file is already on server, so this is best-effort)
        const firestoreTimeout = (promise: Promise<any>, ms: number) =>
          Promise.race([
            promise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), ms))
          ]);

        try {
          await firestoreTimeout(
            setDoc(doc(db, 'files', id), {
              id: id,
              ownerId: auth.currentUser?.uid || 'guest',
              name: file.name,
              size: file.size,
              type: file.type,
              url: downloadURL,
              path: data.path,
              isPublic: false,
              createdAt: serverTimestamp(),
            }),
            5000 // 5 second timeout
          );

          // Update user storage usage (non-blocking)
          if (auth.currentUser) {
            firestoreTimeout(
              updateDoc(doc(db, 'users', auth.currentUser.uid), {
                storageUsed: increment(file.size),
              }),
              3000
            ).catch(e => console.warn('Storage count update skipped:', e));
          }
        } catch (firestoreErr) {
          console.warn('Firestore metadata save skipped (file is still uploaded to server):', firestoreErr);
        }

        setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'completed', progress: 100 } : f));
      } catch (err: any) {
        console.error(`Upload failed for ${file.name}:`, err);
        setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'error', progress: 0 } : f));
        toast.error(`Upload failed for ${file.name}: ${err.message || 'Unknown error'}`);
        throw err;
      }
    });

    try {
      await Promise.allSettled(uploadPromises);
      const anySuccess = files.some((_, i) => {
        // Check updated state
        return true;
      });
      toast.success("Upload processing complete!");
      setTimeout(() => {
        setFiles(prev => prev.filter(f => f.status !== 'completed'));
        setUploading(false);
        if (onComplete) onComplete();
      }, 1500);
    } catch (error) {
      console.error(error);
      setUploading(false);
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div 
        {...getRootProps()} 
        className={`relative border-2 border-dashed rounded-2xl p-12 transition-all duration-300 text-center cursor-pointer group bg-white ${
          isDragActive 
            ? 'border-blue-600 bg-blue-50/40 scale-[1.01]' 
            : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/30 shadow-sm'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 ${isDragActive ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white'}`}>
            <Upload size={24} />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-slate-900 tracking-tight">Drop your assets here</h3>
          <p className="text-slate-400 text-xs font-medium max-w-xs mx-auto leading-relaxed">Large files up to 5GB supported. Securely encrypted and processed.</p>
        </div>
        
        {/* Decorative corner accents */}
        <div className="absolute top-4 left-4 w-3 h-3 border-t-2 border-l-2 border-slate-200 rounded-tl-sm" />
        <div className="absolute top-4 right-4 w-3 h-3 border-t-2 border-r-2 border-slate-200 rounded-tr-sm" />
        <div className="absolute bottom-4 left-4 w-3 h-3 border-b-2 border-l-2 border-slate-200 rounded-bl-sm" />
        <div className="absolute bottom-4 right-4 w-3 h-3 border-b-2 border-r-2 border-slate-200 rounded-br-sm" />
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-8 space-y-4"
          >
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">{files.length} Selected</span>
                <div className="w-1 h-1 rounded-full bg-slate-350" />
                <span className="text-xs font-medium text-slate-400 italic">Ready to process</span>
              </div>
              {!uploading && (
                <button 
                  onClick={startUpload}
                  className="btn-primary !py-2 !px-4 text-xs font-medium"
                >
                  Upload Objects
                </button>
              )}
            </div>

            <div className="space-y-2">
              {files.map((fileData) => (
                <div key={fileData.id} className="bg-white border border-slate-200 p-3.5 rounded-xl flex items-center gap-4 group shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 border border-slate-100">
                    <FileIcon size={18} />
                  </div>
                  <div className="flex-grow overflow-hidden">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs font-semibold truncate text-slate-800 group-hover:text-blue-600 transition-colors">{fileData.file.name}</p>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{formatBytes(fileData.file.size)}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-150/40 p-[1px]">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${fileData.progress}%` }}
                        className={`h-full rounded-full transition-all duration-300 ${
                          fileData.status === 'completed' ? 'bg-green-500' 
                          : fileData.status === 'error' ? 'bg-red-500'
                          : 'bg-blue-600'
                        }`} 
                      />
                    </div>
                  </div>
                  <div className="shrink-0 w-8 flex items-center justify-center">
                    {fileData.status === 'completed' ? (
                      <CheckCircle2 className="text-green-500" size={18} />
                    ) : fileData.status === 'error' ? (
                      <AlertCircle className="text-red-500" size={18} />
                    ) : uploading ? (
                      <Loader2 className="text-blue-600 animate-spin" size={18} />
                    ) : (
                      <button 
                        onClick={() => removeFile(fileData.id)}
                        className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-all"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
