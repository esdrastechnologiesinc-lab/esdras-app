// src/App.jsx — FINAL ESDRAS ROUTER (clean, branded, referral-free + 100% blueprint)
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import Login from './components/login';
import Scan from './components/scan';
import Styles from './components/styles';
import Checkout from './components/checkout';
import UserProfile from './components/user-profile';
import BarberDashboard from './components/barber-dashboard';
import BarberProfile from './components/barberprofile';
import Home from './components/home'; // or landing page
import StyleSnap from './components/stylesnap'; // if exists
import BarbersList from './components/barbers-list'; // placeholder or real

const stripePromise = loadStripe('pk_test_51SaFW5AfXtDdFCGlAboHiWv9DbJiwZSmdfPPioyOGeQ2Xk9tYFMHcUH5uGjeVZgsIAWxcDAqADHxH19kM2Ahlaif007h5rZQmy');

const NAVY = '#001F3F';
const GOLD = '#B8860B';

function ProtectedRoute({ children }) {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) return <div style={{minHeight:'100vh', background:NAVY, color:GOLD, display:'grid', placeItems:'center', fontFamily:'Montserrat, sans-serif'}}><h2>loading...</h2></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    signOut(auth);
    navigate('/login');
  };

  // Hide nav on login
  if (location.pathname === '/login') return null;

  return (
    <header style={{
      background: NAVY,
      color: GOLD,
      padding: '1.2rem 1rem',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      fontFamily: 'Montserrat, sans-serif'
    }}>
      <div style={{maxWidth:'1200px', margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h1 style={{margin:0, fontSize:'2.4rem', fontWeight:'800', letterSpacing:'1px'}}>
          esdras
        </h1>
        <nav style={{display:'flex', gap:'2rem', alignItems:'center', fontWeight:'bold'}}>
          <a href="/" style={{color:GOLD, textDecoration:'none'}}>home</a>
          <a href="/styles" style={{color:GOLD, textDecoration:'none'}}>styles</a>
          <a href="/barbers" style={{color:GOLD, textDecoration:'none'}}>barbers</a>
          <a href="/stylesnap" style={{color:GOLD, textDecoration:'none'}}>stylesnap</a>
          <a href="/profile" style={{color:GOLD, textDecoration:'none'}}>profile</a>
          <button onClick={logout} style={{
            background:GOLD,
            color:'black',
            border:'none',
            padding:'0.8rem 1.8rem',
            borderRadius:'50px',
            fontWeight:'bold',
            fontSize:'1rem'
          }}>
            logout
          </button>
        </nav>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <Elements stripe={stripePromise}>
      <BrowserRouter>
        <div style={{
          minHeight: '100vh',
          background: NAVY,
          color: 'white',
          fontFamily: 'Montserrat, sans-serif'
        }}>
          <Navigation />
          <main style={{paddingBottom:'4rem'}}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Home />} />

              {/* Protected Routes */}
              <Route path="/scan" element={<ProtectedRoute><Scan /></ProtectedRoute>} />
              <Route path="/styles" element={<ProtectedRoute><Styles /></ProtectedRoute>} />
              <Route path="/stylesnap" element={<ProtectedRoute><StyleSnap /></ProtectedRoute>} />
              <Route path="/barbers" element={<ProtectedRoute><BarbersList /></ProtectedRoute>} />
              <Route path="/barber/:id" element={<ProtectedRoute><BarberProfile /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/barber/dashboard" element={<ProtectedRoute><BarberDashboard /></ProtectedRoute>} />

              {/* Redirect unknown */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <footer style={{
            background: NAVY,
            color: GOLD,
            textAlign: 'center',
            padding: '3rem 1rem',
            fontSize: '0.9rem',
            opacity: 0.8
          }}>
            <p>© 2025 esdras — precision grooming for kings</p>
          </footer>
        </div>
      </BrowserRouter>
    </Elements>
  );
                              }
