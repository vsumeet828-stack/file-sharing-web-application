import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File as FileIcon, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, storage, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
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

  const startUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);

    const uploadPromises = files.map(async (fileData, index) => {
      if (fileData.status === 'completed') return;

      const { file, id } = fileData;
      const fileRef = ref(storage, `files/${auth.currentUser?.uid}/${id}-${file.name}`);
      const uploadTask = uploadBytesResumable(fileRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on('state_changed', 
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setFiles(prev => prev.map((f, i) => i === index ? { ...f, progress } : f));
          }, 
          (error: any) => {
            console.error("Storage Error:", error);
            let message = `Upload failed for ${file.name}`;
            
            if (error.code === 'storage/unauthorized') {
              message = "Permission denied. Check your rules.";
            } else if (error.code === 'storage/quota-exceeded') {
              message = "Quota exceeded. Try Fast Share!";
            } else if (error.message.includes('pricing plan') || error.code === 'storage/canceled') {
              message = "Cloud Storage requires upgrade. Use Fast Share for free transfers!";
            }
            
            toast.error(message, {
              duration: 10000,
              action: {
                label: 'Use Fast Share',
                onClick: () => window.location.href = '/dashboard/local'
              }
            });
            reject(error);
          }, 
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            try {
              // Save metadata to Firestore
              const metadataPath = 'files';
              await setDoc(doc(db, metadataPath, id), {
                id: id,
                ownerId: auth.currentUser?.uid,
                name: file.name,
                size: file.size,
                type: file.type,
                url: downloadURL,
                path: fileRef.fullPath,
                isPublic: false,
                createdAt: serverTimestamp(),
              });

              // Update user storage usage
              const userPath = `users/${auth.currentUser!.uid}`;
              const userRef = doc(db, 'users', auth.currentUser!.uid);
              await updateDoc(userRef, {
                storageUsed: increment(file.size)
              });

              setFiles(prev => prev.map((f, i) => i === index ? { ...f, status: 'completed', progress: 100 } : f));
              resolve(true);
            } catch (err) {
              handleFirestoreError(err, OperationType.WRITE, 'files/users');
              reject(err);
            }
          }
        );
      });
    });

    try {
      await Promise.all(uploadPromises);
      toast.success("All files uploaded successfully!");
      setTimeout(() => {
        setFiles([]);
        setUploading(false);
        if (onComplete) onComplete();
      }, 1000);
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
        className={`relative border-2 border-dashed rounded-[3rem] p-16 transition-all duration-500 text-center cursor-pointer group bg-white ${
          isDragActive 
            ? 'border-primary bg-primary/5 scale-[1.02] shadow-2xl shadow-primary/5' 
            : 'border-black/[0.05] hover:border-primary/30 hover:bg-gray-50/50 shadow-sm'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center">
          <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-8 transition-all duration-500 shadow-inner ${isDragActive ? 'bg-primary text-white' : 'bg-gray-50 text-slate-400 group-hover:scale-110 group-hover:bg-primary group-hover:text-white'}`}>
            <Upload size={36} />
          </div>
          <h3 className="text-2xl font-black mb-3 text-slate-900 tracking-tight">Drop your assets here</h3>
          <p className="text-slate-400 font-medium max-w-xs mx-auto leading-relaxed">Large files up to 5GB supported. Securely encrypted and processed.</p>
        </div>
        
        {/* Decorative corner accents */}
        <div className="absolute top-8 left-8 w-4 h-4 border-t-2 border-l-2 border-slate-200 rounded-tl-lg" />
        <div className="absolute top-8 right-8 w-4 h-4 border-t-2 border-r-2 border-slate-200 rounded-tr-lg" />
        <div className="absolute bottom-8 left-8 w-4 h-4 border-b-2 border-l-2 border-slate-200 rounded-bl-lg" />
        <div className="absolute bottom-8 right-8 w-4 h-4 border-b-2 border-r-2 border-slate-200 rounded-br-lg" />
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-12 space-y-6"
          >
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-black text-slate-900 uppercase tracking-widest">{files.length} Selected</span>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                <span className="text-sm font-bold text-slate-400 italic">Ready to process</span>
              </div>
              {!uploading && (
                <button 
                  onClick={startUpload}
                  className="btn-primary"
                >
                  Upload Objects
                </button>
              )}
            </div>

            <div className="space-y-3">
              {files.map((fileData) => (
                <div key={fileData.id} className="premium-card !p-4 !rounded-2xl flex items-center gap-5 group !shadow-sm !translate-y-0">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-slate-400 shrink-0 border border-black/[0.02]">
                    <FileIcon size={22} />
                  </div>
                  <div className="flex-grow overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-bold truncate text-slate-900 group-hover:text-primary transition-colors">{fileData.file.name}</p>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formatBytes(fileData.file.size)}</span>
                    </div>
                    <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden border border-black/[0.02] p-[1px]">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${fileData.progress}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${fileData.status === 'completed' ? 'bg-green-500' : 'bg-primary'}`} 
                      />
                    </div>
                  </div>
                  <div className="shrink-0 w-10 flex items-center justify-center">
                    {fileData.status === 'completed' ? (
                      <CheckCircle2 className="text-green-500" size={22} />
                    ) : uploading ? (
                      <Loader2 className="text-primary animate-spin" size={22} />
                    ) : (
                      <button 
                        onClick={() => removeFile(fileData.id)}
                        className="p-2 hover:bg-red-50 text-red-500 rounded-xl transition-all"
                      >
                        <X size={20} />
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
