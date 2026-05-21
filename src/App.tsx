import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuthStore } from './store/useStore';
import { Toaster } from 'sonner';
import { Cloud } from 'lucide-react';

// Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import PricingPage from './pages/PricingPage';
import ShareView from './pages/ShareView';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function AppContent() {
  const { setUser, setLoading, loading, user } = useAuthStore();
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  React.useEffect(() => {
    // 1.5s fallback timeout to prevent infinite hangs if auth is slow or offline
    const timeoutId = setTimeout(() => {
      console.warn('[auth] Auth resolution took too long, fallback triggered');
      setLoading(false);
    }, 1500);

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(timeoutId);
      setLoading(true);

      if (firebaseUser) {
        try {
          console.log('[auth] Signed in uid:', firebaseUser.uid, 'providerData:', firebaseUser.providerData);

          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);

          const mockEmail = firebaseUser.email ?? `guest-${firebaseUser.uid.slice(0, 8)}@dropx.guest`;
          const mockName = firebaseUser.displayName ?? 'Guest User';

          if (!userSnap.exists()) {
            const newUser = {
              uid: firebaseUser.uid,
              email: mockEmail,
              displayName: mockName,
              photoURL: firebaseUser.photoURL ?? null,
              storageUsed: 0,
              storageLimit: 5 * 1024 * 1024 * 1024, // 5GB free plan
              isPremium: false,
              createdAt: serverTimestamp(),
            };

            console.log('[auth] Creating users/' + firebaseUser.uid);
            await setDoc(userRef, newUser);

            const createdSnap = await getDoc(userRef);
            if (!createdSnap.exists()) throw new Error('User doc was not created');

            setUser(createdSnap.data());
          } else {
            setUser(userSnap.data());
          }
        } catch (error) {
          console.error('[auth] Error syncing user profile:', error);

          const mockEmail = firebaseUser.email ?? `guest-${firebaseUser.uid.slice(0, 8)}@dropx.guest`;
          const mockName = firebaseUser.displayName ?? 'Guest User';

          setUser({
            uid: firebaseUser.uid,
            email: mockEmail,
            displayName: mockName,
            photoURL: firebaseUser.photoURL ?? null,
            storageUsed: 0,
            storageLimit: 5 * 1024 * 1024 * 1024,
            isPremium: false,
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => {
      clearTimeout(timeoutId);
      unsub();
    };
  }, [setUser, setLoading]);

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] text-slate-900 select-none">
        <div className="flex flex-col items-center gap-6">
          <div className="relative flex items-center justify-center">
            {/* Pulsing rings */}
            <div className="absolute w-20 h-20 rounded-2xl bg-blue-500/5 animate-ping duration-1000" />
            <div className="absolute w-16 h-16 rounded-2xl bg-blue-500/10 animate-pulse" />
            
            {/* Centered Cloud Icon */}
            <div className="relative w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-sm text-white">
              <Cloud size={20} className="text-white animate-bounce duration-1000" />
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">DropX</h2>
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 animate-pulse">
              Securing connection...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans selection:bg-blue-500/10">
      {!isDashboard && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />} 
          />
          <Route 
            path="/dashboard/*" 
            element={user ? <Dashboard /> : <Navigate to="/login" replace />} 
          />
          <Route path="/share/:id" element={<ShareView />} />
          <Route path="/pricing" element={<PricingPage />} />
        </Routes>
      </main>
      {!isDashboard && <Footer />}
      <Toaster position="bottom-right" richColors theme="light" />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

