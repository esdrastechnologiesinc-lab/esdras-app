// src/app.jsx — FINAL ESDRAS ROUTER (women-inclusive + clean)
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import Login from './components/login';
import Home from './components/home';
import Scan from './components/scan';
import Styles from './components/styles';
import Checkout from './components/checkout';
import Profile from './components/profile';
import BarberDashboard from './components/barberdashboard';
import BarberProfile from './components/barberprofile';
import Barbers from './components/barbers';
import ImportStyle from './components/importstyle';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY || 'pk_test_...');

function ProtectedLayout() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) return <div style={{minHeight:'100vh', background:'#001F3F', color:'#B8860B', display:'grid', placeItems:'center'}}><h2>loading...</h2></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <Elements stripe={stripePromise}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />

          <Route element={<ProtectedLayout />}>
            <Route path="/scan" element={<Scan />} />
            <Route path="/styles" element={<Styles />} />
            <Route path="/importstyle" element={<ImportStyle onClose={() => {}} onStyleImported={() => {}} />} />
            <Route path="/barbers" element={<Barbers />} />
            <Route path="/barber/:id" element={<BarberProfile />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/barber/dashboard" element={<BarberDashboard />} />
          </Route> 

          <Route path="/barber-signature-styles" element={<ProtectedRoute><SignatureUpload /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </Elements>
  );
}
