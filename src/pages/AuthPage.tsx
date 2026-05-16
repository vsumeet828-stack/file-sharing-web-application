import React from 'react';
import { motion } from 'framer-motion';
import { LogIn, Github, Mail, ArrowRight, Cloud, ChevronRight } from 'lucide-react';
import { signInWithGoogle, signInWithGithub, signInWithEmail, signUpWithEmail } from '../lib/firebase';
import { toast } from 'sonner';

import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useStore';

export default function AuthPage() {
  const { user } = useAuthStore();
  const [isLogin, setIsLogin] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmail(email, password);
        toast.success("Welcome back!");
      } else {
        await signUpWithEmail(email, password, name);
        toast.success("Account created successfully!");
      }
    } catch (error: any) {
      console.error("Email Auth Error:", error);
      let message = "Authentication failed";
      if (error.code === 'auth/email-already-in-use') message = "Email already registered";
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') message = "Invalid email or password";
      if (error.code === 'auth/invalid-email') message = "Invalid email format";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success("Welcome back!");
    } catch (error: any) {
      console.error("Auth Error:", error);
      let message = "Failed to sign in. Please try again.";
      
      if (error.code === 'auth/operation-not-allowed') {
        message = "Google Sign-In is not enabled. Please go to your Firebase Console.";
      } else if (error.code === 'auth/popup-blocked') {
        message = "Sign-in popup was blocked.";
      } else if (error.code === 'auth/cancelled-popup-request') {
        return; // Ignore
      }
      
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGithub();
      toast.success("Welcome back!");
    } catch (error: any) {
      console.error("Auth Error:", error);
      toast.error("Failed to sign in with GitHub.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 flex flex-col items-center justify-center overflow-hidden relative bg-white font-sans">
      {/* Background blobs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/5 blur-[100px] rounded-full -z-0" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/5 blur-[100px] rounded-full -z-0" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-3xl bg-slate-900 flex items-center justify-center p-3.5 mb-8 mx-auto shadow-2xl shadow-slate-200">
            <Cloud className="text-white w-full h-full" />
          </div>
          <h1 className="text-4xl font-black mb-3 text-slate-900 tracking-tight">
            {isLogin ? 'Welcome Back' : 'Join DropX'}
          </h1>
          <p className="text-slate-400 font-bold tracking-tight">
            Your personal cloud for fast asset sharing
          </p>
        </div>

        <div className="bg-white border border-slate-100 rounded-[3rem] p-10 md:p-12 shadow-[0_40px_80px_-16px_rgba(0,0,0,0.08)]">
          <div className="flex flex-col gap-8">
            {/* Social Logins */}
            <div className="space-y-4">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-4 py-4.5 bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-[1.5rem] font-black transition-all active:scale-[0.98] border border-slate-100 group"
              >
                <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="G" />
                <span className="text-sm uppercase tracking-[0.1em]">Continue with Google</span>
                <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>
              <button
                onClick={handleGithubSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-4 py-4.5 bg-slate-900 text-white hover:bg-black rounded-[1.5rem] font-black transition-all active:scale-[0.98] shadow-2xl shadow-slate-200 group"
              >
                <Github size={20} />
                <span className="text-sm uppercase tracking-[0.1em]">Continue with GitHub</span>
                <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em] font-black text-slate-300">
                <span className="bg-white px-8">Or professional login</span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-6">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-[11px] uppercase tracking-[0.2em] font-black text-slate-400 ml-6">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white px-8 py-5 rounded-[2rem] outline-none transition-all font-bold text-slate-900"
                  />
                </div>
              )}
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-[0.2em] font-black text-slate-400 ml-6">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white px-8 py-5 rounded-[2rem] outline-none transition-all font-bold text-slate-900"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] uppercase tracking-[0.2em] font-black text-slate-400 ml-6">Secure Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white px-8 py-5 rounded-[2rem] outline-none transition-all font-bold text-slate-900"
                />
              </div>
              
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[2rem] font-black text-lg transition-all active:scale-[0.97] mt-2 shadow-2xl shadow-indigo-100 flex items-center justify-center gap-4 disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : (isLogin ? 'Sign In' : 'Create My Account')}
                {!loading && <LogIn size={22} />}
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="group relative inline-flex items-center gap-2 text-slate-400 font-bold hover:text-slate-900 transition-colors uppercase tracking-[0.2em] text-[11px]"
              >
                <span>{isLogin ? "New to DropX? Start Free" : "Already a member? Sign in"}</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
        
        <p className="mt-12 text-center text-[10px] text-slate-300 font-bold uppercase tracking-widest leading-loose">
          Secure bank-level encryption • P2P Optimized • Cloud Secure
        </p>
      </motion.div>
    </div>
  );
}
