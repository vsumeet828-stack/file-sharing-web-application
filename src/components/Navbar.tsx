import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  Cloud, 
  Share2, 
  LayoutDashboard, 
  CreditCard, 
  LogOut, 
  Menu, 
  X,
  User as UserIcon
} from 'lucide-react';
import { useAuthStore, useUIStore } from '../store/useStore';
import { auth } from '../lib/firebase';
import { cn } from '../lib/utils';

export default function Navbar() {
  const { user } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Features', path: '/#features' },
    { name: 'Pricing', path: '/pricing' },
  ];

  return (
    <nav className="fixed top-6 left-0 right-0 z-50 px-6 pointer-events-none">
      <div className="max-w-6xl mx-auto flex items-center justify-between pointer-events-auto glass px-6 py-3 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/50">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center p-2 shadow-lg shadow-primary/20 group-hover:rotate-6 transition-transform">
            <Cloud className="text-white w-full h-full" />
          </div>
          <span className="text-xl font-extrabold tracking-tighter text-slate-900">DropX</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="px-5 py-2 rounded-full text-sm font-bold text-slate-600 hover:text-primary transition-all hover:bg-primary/5"
            >
              {link.name}
            </Link>
          ))}
          <Link
            to="/dashboard/local"
            className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold text-primary bg-primary/5 hover:bg-primary/10 transition-all ml-2"
          >
            <Share2 size={16} />
            Fast Share
          </Link>
          <div className="w-px h-4 bg-black/10 mx-4" />
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-black transition-all shadow-lg shadow-slate-900/10 active:scale-95"
              >
                <div className="w-6 h-6 rounded-full border border-white/20 overflow-hidden bg-slate-800 shrink-0">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon size={14} className="text-slate-400" />
                  )}
                </div>
                <LayoutDashboard size={16} className="hidden sm:block" />
                <span className="hidden sm:block">Dashboard</span>
              </Link>
              <button
                onClick={() => auth.signOut()}
                className="p-2.5 rounded-2xl hover:bg-red-50 text-red-500 transition-all border border-transparent hover:border-red-100 active:scale-90"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-primary transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/login"
                className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2 rounded-xl text-slate-600"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute top-24 left-6 right-6 glass p-8 rounded-[2.5rem] md:hidden pointer-events-auto border border-white shadow-2xl"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-lg font-bold text-slate-900 hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/dashboard/local"
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-bold text-primary hover:text-primary-dark transition-colors"
              >
                Fast Share (No Login)
              </Link>
              <hr className="border-black/[0.05]" />
              {user ? (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-2xl font-bold"
                >
                  <LayoutDashboard size={20} />
                  Dashboard
                </Link>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="bg-primary text-white py-4 rounded-2xl font-bold text-center"
                  >
                    Get Started Free
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="bg-white text-slate-900 border border-black/10 py-4 rounded-2xl font-bold text-center"
                  >
                    Log In
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
