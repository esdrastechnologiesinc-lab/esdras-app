// src/app.jsx 
import { doc, setDoc } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
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

// Firebase & Stripe init
const firebaseConfig = { /* your config */ };
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

const stripePromise = loadStripe('pk_test_51SaFW5AfXtDdFCGlAboHiWv9DbJiwZSmdfPPioyOGeQ2Xk9tYFMHcUH5uGjeVZgsIAWxcDAqADHxH19kM2Ahlaif007h5rZQmy');

export default function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) navigate('/login');
    });
    return unsub;
  }, [navigate]);
  useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const refCode = urlParams.get('ref');
  if (refCode && auth.currentUser) {
    setDoc(doc(db, 'users', auth.currentUser.uid), {
      referredBy: refCode,
      signupDate: new Date()
    }, { merge: true });
  }
}, [user]);

  const logout = () => {
    signOut(auth);
    navigate('/login');
  };

  if (!user) {
    return <div style={{textAlign:'center', padding:'5rem'}}><h2>Login to access ESDRAS</h2></div>;
  }

  return (
    <Elements stripe={stripePromise}>
      <div style={{ fontFamily: 'Montserrat, sans-serif', minHeight: '100vh', background: '#f8f8f8' }}>
        <header style={{ background: '#001F3F', color: '#B8860B', padding: '1rem', position: 'sticky', top: 0 }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between' }}>
            <h1 style={{ margin: 0, fontSize: '2rem' }}>ESDRAS</h1>
            <nav style={{ display: 'flex', gap: '1rem' }}>
              <Link to="/" style={{ color: '#B8860B', textDecoration: 'none' }}>Home</Link>
              <Link to="/scan" style={{ color: '#B8860B', textDecoration: 'none' }}>Scan</Link>
              <Link to="/styles" style={{ color: '#B8860B', textDecoration: 'none' }}>Styles</Link>
              <Link to="/barbers" style={{ color: '#B8860B', textDecoration: 'none' }}>Barbers</Link>
              <Link to="/profile" style={{ color: '#B8860B', textDecoration: 'none' }}>Profile</Link>
              <button onClick={logout} style={{ background: '#B8860B', color: 'black', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px' }}>Logout</button>
            </nav>
          </div>
        </header>
        <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
          <Routes>
            <Route path="/" element={<home user={user} />} />
            <Route path="/scan" element={<scan />} />
            <Route path="/styles" element={<styles />} />
            <Route path="/checkout" element={<checkout />} />
            <Route path="/profile" element={<userProfile />} />
            <Route path="/referral" element={<referral />} />
            <Route path="/barber/dashboard" element={<barberDashboard />} />
            <Route path="/barber/:id" element={<barberProfile />} />
          </Routes>
        </main>
        <footer style={{ textAlign: 'center', padding: '2rem', background: '#001F3F', color: '#B8860B' }}>
          © 2025 ESDRAS — Precision Grooming
        </footer>
      </div>
    </Elements>
  );
}
