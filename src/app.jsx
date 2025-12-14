// src/app.jsx — FINAL ESDRAS ROUTER (women-inclusive + clean) 
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000 } }
});

// Wrap <App> in <QueryClientProvider client={queryClient}>
import SignatureStylesUpload from './components/signaturestylesupload.jsx'; 
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import Login from './components/login.jsx';
import Home from './components/home.jsx';
import Scan from './components/scan.jsx';
import Styles from './components/styles.jsx';
import Checkout from './components/checkout.jsx';
import Profile from './components/profile.jsx';
import BarberDashboard from './components/barberdashboard.jsx'; // CRITICAL FIX: .jsx added
import BarberProfile from './components/barberprofile.jsx';
import Barbers from './components/barbers.jsx';
import ImportStyle from './components/importstyle.jsx';

// TEMPORARILY REMOVED IMPORTS FOR BUILD STABILITY
// import Help from './components/help.jsx';
// import Wallet from './components/wallet.jsx';
// import AdminDashboard from './components/admindashboard.jsx';

import { getRemoteConfig } from 'firebase/remote-config';
const remoteConfig = getRemoteConfig();
remoteConfig.fetchAndActivate().then(() => {
  const freeLimit = remoteConfig.getNumber('free_styles_limit');
});

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
            <Route path="/barber-signature-styles" element={<SignatureStylesUpload />} /> 
            
            {/* COMMENTING OUT POTENTIAL BREAKERS */}
            {/* <Route path="/help" element={<Help />} /> */}
            {/* <Route path="/wallet" element={<Wallet />} /> */}
            {/* <Route path="/admin" element={<AdminDashboard />} /> */}
          </Route> 

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </Elements>
  );
}
