// src/components/scan.jsx
import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

export default function Scan() {
  const [status, setStatus] = useState('checking'); // checking | noMesh | scanning | done
  const [countdown, setCountdown] = useState(8);
  const navigate = useNavigate();

  useEffect(() => {
    const checkMesh = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate('/login');
        return;
      }

      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      const data = snap.data() || {};

      if (data.has3DMesh) {
        navigate('/styles');
      } else {
        setStatus('noMesh');
      }
    };

    checkMesh();
  }, [navigate]);

  const startScan = () => {
    setStatus('scanning');
    let time = 8;
    const timer = setInterval(() => {
      time--;
      setCountdown(time);
      if (time <= 0) {
        clearInterval(timer);
        finishScan();
      }
    }, 1000);
  };

  const finishScan = async () => {
    const user = auth.currentUser;
    await setDoc(doc(db, 'users', user.uid), {
      has3DMesh: true,
      stylesUsed: 0,
      freeStylesRemaining: 10,
      scanCompletedAt: new Date()
    }, { merge: true });

    setStatus('done');
    setTimeout(() => navigate('/styles'), 3000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #001F3F, #0a3d62)',
      color: 'white',
      textAlign: 'center',
      padding: '2rem 1rem',
      fontFamily: 'Montserrat, sans-serif'
    }}>
      <img src="/esdras-logo.png" alt="ESDRAS" style={{height:'100px', margin:'2rem 0'}} />

      {status === 'noMesh' && (
        <>
          <h1 style={{fontSize:'2.2rem', margin:'1.5rem 0'}}>Welcome to ESDRAS</h1>
          <p style={{color:'#B8860B', fontSize:'1.3rem', maxWidth:'90%', margin:'0 auto 2rem'}}>
            One-time 8-second scan unlocks 10 FREE hairstyle try-ons
          </p>

          <div style={{
            width:'90%',
            maxWidth:'380px',
            height:'420px',
            background:'#000',
            borderRadius:'28px',
            margin:'2rem auto',
            border:'5px solid #B8860B',
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            fontSize:'1.4rem'
          }}>
            Camera Preview
          </div>

          <div style={{
            background:'rgba(255,255,255,0.15)',
            padding:'1.5rem',
            borderRadius:'16px',
            margin:'2rem auto',
            maxWidth:'90%',
            backdropFilter:'blur(10px)'
          }}>
            <p style={{margin:'0.8rem 0', lineHeight:'1.6'}}>
              <strong>Hold steady and rotate slowly 360°</strong><br/>
              Good lighting • Keep face in frame
            </p>
          </div>

          <button onClick={startScan} style={{
            background:'#B8860B',
            color:'black',
            fontWeight:'bold',
            fontSize:'1.5rem',
            padding:'1.4rem 4.5rem',
            border:'none',
            borderRadius:'50px',
            marginTop:'1rem'
          }}>
            Start 360° Scan
          </button>
        </>
      )}

      {status === 'scanning' && (
        <>
          <h2 style={{fontSize:'2rem'}}>Creating Your 3D Head...</h2>
          <div style={{
            width:'220px',
            height:'220px',
            border:'10px solid #B8860B',
            borderTop:'10px solid transparent',
            borderRadius:'50%',
            animation:'spin 1.5s linear infinite',
            margin:'3rem auto'
          }} />
          <p style={{fontSize:'4rem', fontWeight:'bold', color:'#B8860B'}}>{countdown}</p>
          <p>Rotate slowly • Keep centered</p>
        </>
      )}

      {status === 'done' && (
        <>
          <h1 style={{color:'#B8860B', fontSize:'2.8rem'}}>Perfect!</h1>
          <p style={{fontSize:'1.5rem'}}>Your 3D head is ready</p>
          <p style={{color:'#B8860B', fontWeight:'bold'}}>
            You now have <strong>10 FREE</strong> hairstyle try-ons!
          </p>
          <p>Redirecting to styles...</p>
        </>
      )}

      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
        }     
