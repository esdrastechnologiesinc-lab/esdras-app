// src/app.jsx — FINAL VERSION (matches all 15 pages of your docs)
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, BrowserRouter } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore'; // ONLY ONE IMPORT
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Components (lowercase)
import scan from './components/scan';
import styles from './components/styles';
import checkout from './components/checkout';
import barberDashboard from './components/barber-dashboard';
import barberProfile from './components/barber-profile';
import userProfile from './components/user-profile';
import bookingModal from './components/booking-modal';
import referral from './components/referral';
import home from './components/home';
import stylesnap from './components/stylesnap'; // Added from docs

const firebaseConfig = { /* your config */ };
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

const stripePromise = loadStripe('pk_test_51SaFW5AfXtDdFCGlAboHiWv9DbJiwZSmdfPPioyOGeQ2Xk9tYFMHcUH5uGjeVZgsIAWxcDAqADHxH19kM2Ahlaif007h5rZQmy');

function AppContent() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // ONE TIME referral capture — fixed & de-duplicated
  useEffect(() => {
    if (!user) return;
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      setDoc(doc(db, 'users', user.uid), {
        referredBy: refCode,
        signupDate: new Date()
      }, { merge: true });
      // Clean URL without reload
      navigate(window.location.pathname, { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) navigate('/');
    });
    return unsub;
  }, [navigate]);

  const logout = () => {
    signOut(auth);
    navigate('/');
  };

  if (!user) {
    return (
      <div style={{textAlign:'center', padding:'8rem 2rem', background:'#001F3F', color:'#B8860B', minHeight:'100vh'}}>
        <h1 style={{fontSize:'3rem'}}>ESDRAS</h1>
        <p>Please log in to continue</p>
        {/* Add your login component here later */}
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <div style={{fontFamily:'Montserrat, sans-serif', minHeight:'100vh', background:'#f8f8f8'}}>
        <header style={{background:'#001F3F', color:'#B8860B', padding:'1rem', position:'sticky', top:0, zIndex:100}}>
          <div style={{maxWidth:'1200px', margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <h1 style={{margin:0, fontSize:'2.2rem', fontWeight:'bold'}}>ESDRAS</h1>
            <nav style={{display:'flex', gap:'2rem', alignItems:'center'}}>
              <Link to="/" style={{color:'#B8860B', textDecoration:'none', fontWeight:'bold'}}>Home</Link>
              <Link to="/scan" style={{color:'#B8860B', textDecoration:'none', fontWeight:'bold'}}>Scan</Link>
              <Link to="/styles" style={{color:'#B8860B', textDecoration:'none', fontWeight:'bold'}}>Styles</Link>
              <Link to="/barbers" style={{color:'#B8860B', textDecoration:'none', fontWeight:'bold'}}>Barbers</Link>
              <Link to="/stylesnap" style={{color:'#B8860B', textDecoration:'none', fontWeight:'bold'}}>StyleSnap</Link>
              <Link to="/profile" style={{color:'#B8860B', textDecoration:'none', fontWeight:'bold'}}>Profile</Link>
              <button onClick={logout} style={{background:'#B8860B', color:'black', border:'none', padding:'0.7rem 1.5rem', borderRadius:'12px', fontWeight:'bold'}}>Logout</button>
            </nav>
          </div>
        </header>

        <main style={{padding:'2rem 1rem', maxWidth:'1200px', margin:'0 auto'}}>
          <Routes>
            <Route path="/" element={<home />} />
            <Route path="/scan" element={<scan />} />
            <Route path="/styles" element={<styles />} />
            <Route path="/stylesnap" element={<stylesnap />} /> {/* From your docs */}
            <Route path="/barbers" element={<div>Barbers List (coming)</div>} /> {/* Placeholder */}
            <Route path="/checkout" element={<checkout />} />
            <Route path="/profile" element={<userProfile />} />
            <Route path="/referral" element={<referral />} />
            <Route path="/barber/dashboard" element={<barberDashboard />} />
            <Route path="/barber/:id" element={<barberProfile />} />
          </Routes>
        </main>

        <footer style={{background:'#001F3F', color:'#B8860B', textAlign:'center', padding:'3rem'}}>
          <p>© 2025 ESDRAS — Precision Grooming. All Rights Reserved.</p>
        </footer>
      </div>
    </Elements>
  );
}

// Wrap with BrowserRouter if not in index.js
export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
