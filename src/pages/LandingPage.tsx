import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Share2, 
  Cloud, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Star,
  Users,
  Wifi,
  QrCode
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAuthStore } from '../store/useStore';
import { Navigate } from 'react-router-dom';

export default function LandingPage() {
  const { user } = useAuthStore();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="pt-24 pb-20 bg-white">
      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-32 overflow-hidden hero-gradient">
        {/* Animated Background Blobs */}
        <div className="absolute top-0 left-1/4 w-[40rem] h-[40rem] bg-primary/5 blur-[120px] rounded-full -z-10 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-secondary/10 blur-[100px] rounded-full -z-10" />

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-xs font-bold tracking-wide uppercase text-primary-dark mb-8"
          >
            <Zap size={14} className="fill-primary" />
            <span>Redefining File Sharing</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-extrabold tracking-tight mb-8 text-slate-900"
          >
            Share Everything. <br />
            <span className="text-gradient">Effortlessly.</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            DropX is the minimal cloud storage and instant sharing platform built for modern teams.
            Local WiFi sharing, secure cloud storage, and beautiful micro-interactions.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link to="/dashboard" className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2">
              Start Sharing Free
              <ArrowRight size={20} />
            </Link>
            <Link to="/pricing" className="btn-secondary w-full sm:w-auto">
              Choose a Plan
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-24 relative max-w-5xl mx-auto animate-float"
          >
            <div className="absolute -inset-10 bg-primary/20 blur-[100px] opacity-10 -z-10 rounded-full" />
            <div className="bg-white rounded-[3rem] p-4 shadow-[0_32px_80px_rgba(0,0,0,0.08)] border border-black/[0.02]">
              <img 
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200" 
                alt="DropX Dashboard Mockup" 
                className="rounded-[2.5rem] w-full shadow-inner"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Middle Options Section */}
      <section className="py-24 px-4 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10">
            <motion.div
              whileHover={{ y: -12 }}
              className="premium-card flex flex-col items-center text-center group relative overflow-hidden"
            >
              <div className="w-20 h-20 rounded-[2rem] bg-primary/10 flex items-center justify-center mb-8 text-primary shadow-sm group-hover:scale-110 transition-transform duration-500">
                <Wifi size={36} />
              </div>
              <h3 className="text-3xl font-bold mb-4 text-slate-900 tracking-tight">Instant File Sharing</h3>
              <p className="text-slate-500 mb-10 max-w-sm font-medium">
                Drop files here to share with anyone on your local WiFi network. 
                Pure P2P speed without cloud overhead.
              </p>
              <Link
                to="/dashboard"
                className="mt-auto px-10 py-3.5 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
              >
                Try Direct Share
              </Link>
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                <Share2 size={160} />
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -12 }}
              className="premium-card flex flex-col items-center text-center group relative overflow-hidden border-primary/10"
            >
              <div className="w-20 h-20 rounded-[2rem] bg-primary/10 flex items-center justify-center mb-8 text-primary shadow-sm group-hover:scale-110 transition-transform duration-500">
                <Zap size={36} />
              </div>
              <h3 className="text-3xl font-bold mb-4 text-slate-900 tracking-tight">Upgrade to Premium</h3>
              <p className="text-slate-500 mb-10 max-w-sm font-medium">
                Get up to 5TB storage, end-to-end encryption, and password-protected 
                expiring links for maximum control.
              </p>
              <Link
                to="/pricing"
                className="mt-auto px-10 py-3.5 rounded-2xl bg-slate-900 text-white font-bold shadow-lg shadow-slate-900/20 hover:bg-black transition-all"
              >
                Go Premium
              </Link>
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                <Star size={160} />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Counter */}
      <section className="py-24 border-y border-black/[0.04] bg-white">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-12">
          {[
            { label: 'Files Shared', value: '2.4M+' },
            { label: 'Cloud Storage', value: '1.2PB+' },
            { label: 'Active Users', value: '850k+' },
            { label: 'Success Rate', value: '99.9%' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl md:text-5xl font-black text-slate-900 mb-3 tracking-tighter">
                {stat.value}
              </div>
              <div className="text-primary font-bold uppercase tracking-[0.2em] text-[10px]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-4 bg-gray-50/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-slate-900">Crafted for Clarity</h2>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto">Everything you need to manage your digital life, with zero distractions.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'AirDrop Speed', desc: 'Auto-detect devices on same WiFi for instant peer-to-peer sharing.', icon: <Wifi /> },
              { title: 'Encrypted Cloud', desc: 'Secure encryption at rest and in transit for absolute privacy.', icon: <ShieldCheck /> },
              { title: 'Rich Previews', desc: 'Seamlessly preview videos, PDFs, and high-res images in-browser.', icon: <Zap /> },
              { title: 'Massive Storage', desc: 'Upload files up to 5GB on our free tier, or 1TB+ on professional.', icon: <Cloud /> },
              { title: 'QR Bridge', desc: 'Connect desktop and mobile instantly with high-speed QR syncing.', icon: <QrCode /> },
              { title: 'Vanishing Links', desc: 'Self-destructing secure links for sharing sensitive data.', icon: <Zap /> },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card hover:border-primary/20 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center mb-8 text-primary group-hover:scale-110 transition-transform duration-500">
                  {React.cloneElement(feature.icon as React.ReactElement, { size: 28 })}
                </div>
                <h4 className="text-xl font-bold mb-4 text-slate-900">{feature.title}</h4>
                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
