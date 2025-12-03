// src/components/scan.jsx
import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

export default function Scan() {
  const [status, setStatus] = useState('checking');
  const [countdown, setCountdown] = useState(8);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const user = auth.currentUser;
      if (!user) { navigate('/login'); return; }
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.data()?.has3DMesh) {
        navigate('/styles');
      } else {
        setStatus('noMesh');
      }
    };
    init();
  }, [navigate]);

  const startScan = () => {
    setStatus('scanning');
    let t = 8;
    const i = setInterval(() => {
      t--;
      setCountdown(t);
      if (t <= 0) { clearInterval(i); finishScan(); }
    }, 1000);
  };

  const finishScan = async () => {
  await setDoc(doc(db, 'users', auth.currentUser.uid), {
    has3DMesh: true,
    stylesUsed: 0,
    freeStylesRemaining: 10
  }, { merge: true });
  setStatus('done');
  setTimeout(() => navigate('/styles'), 3000);
};

  return (
    <div style={{minHeight:'100vh', background:'linear-gradient(135deg,#001F3F,#0a3d62)', color:'white', textAlign:'center', padding:'2rem 1rem', fontFamily:'Montserrat,sans-serif'}}>
      <h1 style={{fontSize:'2.5rem', margin:'2rem 0', color:'#B8860B'}}>ESDRAS</h1>
      <p style={{fontSize:'1.1rem', marginBottom:'2rem'}}>Precision Grooming. Zero Regrets.</p>

      {status === 'noMesh' && (
        <>
          <h2 style={{fontSize:'2rem'}}>One-Time 8-Second Scan</h2>
          <p style={{color:'#B8860B', fontSize:'1.3rem'}}>Unlocks 10 FREE hairstyle try-ons forever</p>
          <div style={{width:'90%', maxWidth:'380px', height:'420px', background:'#000', borderRadius:'28px', margin:'2rem auto', border:'5px solid #B8860B'}}>Camera</div>
          <button onClick={startScan} style={{background:'#B8860B', color:'black', fontWeight:'bold', padding:'1.4rem 5rem', border:'none', borderRadius:'50px', fontSize:'1.5rem'}}>Start Scan</button>
        </>
      )}

      {status === 'scanning' && (
        <>
          <h2>Creating Your 3D Head...</h2>
          <div style={{width:'200px', height:'200px', border:'12px solid #B8860B', borderTop:'12px solid transparent', borderRadius:'50%', animation:'spin 1.5s linear infinite', margin:'3rem auto'}} />
          <p style={{fontSize:'4rem', color:'#B8860B'}}>{countdown}</p>
        </>
      )}

      {status === 'done' && (
        <>
          <h1 style={{color:'#B8860B'}}>Ready!</h1>
          <p>You now have <strong>10 FREE</strong> try-ons</p>
          <p>Redirecting...</p>
        </>
      )}

      <style>{'@keyframes spin {0%{transform:rotate(0)}100%{transform:rotate(360deg)}}'}</style>
    </div>
  );
          }         
