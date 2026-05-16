import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuthStore } from './store/useStore';
import { Toaster } from 'sonner';

// Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import PricingPage from './pages/PricingPage';
import ShareView from './pages/ShareView';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

export default function App() {
  const { setUser, setLoading, loading, user } = useAuthStore();

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);

      if (firebaseUser) {
        try {
          console.log('[auth] Signed in uid:', firebaseUser.uid, 'providerData:', firebaseUser.providerData);

          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
            const newUser = {
              uid: firebaseUser.uid,
              email: firebaseUser.email ?? null,
              // IMPORTANT: Firestore rules expect displayName/photoURL to be optional or string/null.
              displayName: firebaseUser.displayName ?? null,
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
          // If profile sync fails, we still want the app to consider the user signed in.
          console.error('[auth] Error syncing user profile:', error);

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email ?? null,
            displayName: firebaseUser.displayName ?? null,
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

    return () => unsub();
  }, [setUser, setLoading]);

  if (loading && !user) {
    return null; // Don't show the splash screen, just a clean empty state until auth resolves
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-950 font-sans selection:bg-primary/30">
        <Navbar />
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
        <Footer />
        <Toaster position="bottom-right" richColors theme="dark" />
      </div>
    </Router>
  );
}

