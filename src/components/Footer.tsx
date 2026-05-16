import React from 'react';
import { Cloud, Github, Twitter, Linkedin, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-white/5 pt-20 pb-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-1.5 shadow-lg shadow-primary/20">
                <Cloud className="text-white w-full h-full" />
              </div>
              <span className="text-xl font-bold tracking-tighter neon-text">DropX</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              The professional-grade platform for instant file sharing and secure cloud storage. 
              Designed for speed, security, and elegance.
            </p>
            <div className="flex items-center gap-4">
              {[Twitter, Github, Linkedin, Instagram].map((Icon, i) => (
                <button key={i} className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all">
                  <Icon size={18} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-slate-200">Product</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><Link to="/#features" className="hover:text-primary transition-colors">Features</Link></li>
              <li><Link to="/#security" className="hover:text-primary transition-colors">Security</Link></li>
              <li><Link to="/dashboard" className="hover:text-primary transition-colors">Cloud Storage</Link></li>
              <li><Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-slate-200">Company</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Legal</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-slate-200">Legal</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-slate-500 text-xs">
            © {new Date().getFullYear()} DropX Technologies Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              All Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
