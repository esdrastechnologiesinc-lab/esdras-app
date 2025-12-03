// src/app.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// === ALL COMPONENTS (lowercase + kebab-case) ===
import scan from './components/scan';
import styles from './components/styles';
import checkout from './components/checkout';
import barberDashboard from './components/barber-dashboard';
import barberProfile from './components/barber-profile';
import userProfile from './components/user-profile';
import bookingModal from './components/booking-modal';
import referral from './components/referral';
import home from './components/home';

// === FIREBASE & STRIPE ===
const firebaseConfig = { /* your config here */ };
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

const stripePromise = loadStripe('pk_test_51SaFW5AfXtDdFCGlAboHiWv9DbJiwZSmdfPPioyOGeQ2Xk9tYFMHcUH5uGjeVZgsIAWxcDAqADHxH19kM2Ahlaif007h5rZQmy');

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleLogout = () => {
    signOut(auth);
    navigate('/');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#001F3F',
        color: '#B8860B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Montserrat, sans-serif'
      }}>
        <h1>ESDRAS</h1>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <div style={{ fontFamily: 'Montserrat, sans-serif', minHeight: '100vh', background: '#f8f8f8' }}>
        
        {/* HEADER */}
        <header style={{
          background: '#001F3F',
          color: '#B8860B',
          padding: '1rem',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 'bold' }}>ESDRAS</h1>
              <p style={{ margin: '0.3rem 0', fontSize: '0.9rem', color: '#ccc' }}>Precision Grooming</p>
            </div>

            {user && (
              <nav style={{ display: 'flex', gap: '1.8rem', alignItems: 'center' }}>
                <Link to="/" style={navLink}>Home</Link>
                <Link to="/scan" style={navLink}>Scan</Link>
                <Link to="/styles" style={navLink}>Styles</Link>
                <Link to="/barbers" style={navLink}>Barbers</Link>
                <Link to="/profile" style={navLink}>Profile</Link>
                <Link to="/referral" style={navLink}>Refer & Earn</Link>
                {user.isBarber && <Link to="/barber/dashboard" style={navLink}>Dashboard</Link>}
                <button onClick={handleLogout} style={goldBtn}>Logout</button>
              </nav>
            )}
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
          <Routes>
            <Route path="/" element={user ? <styles /> : <home />} />
            <Route path="/scan" element={<scan />} />
            <Route path="/styles" element={<styles />} />
            <Route path="/checkout" element={<checkout />} />
            <Route path="/profile" element={<userProfile />} />
            <Route path="/referral" element={<referral />} />
            <Route path="/barber/dashboard" element={<barberDashboard />} />
            <Route path="/barber/:id" element={<barberProfile />} />
          </Routes>
        </main>

        {/* FOOTER */}
        <footer style={{
          background: '#001F3F',
          color: '#B8860B',
          textAlign: 'center',
          padding: '2rem',
          marginTop: '4rem'
        }}>
          <p>© 2025 ESDRAS — Precision Grooming. All Rights Reserved.</p>
          <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
            Built for the culture. No regrets. Ever.
          </p>
        </footer>
      </div>
    </Elements>
  );
}

// Reusable styles
const navLink = {
  color: '#B8860B',
  textDecoration: 'none',
  fontWeight: 'bold',
  fontSize: '1.1rem',
  transition: 'opacity 0.2s',
};

const goldBtn = {
  background: '#B8860B',
  color: 'black',
  border: 'none',
  padding: '0.7rem 1.4rem',
  borderRadius: '12px',
  fontWeight: 'bold',
  cursor: 'pointer'
};
