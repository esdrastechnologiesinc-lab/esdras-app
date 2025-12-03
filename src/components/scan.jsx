import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';

export default function Scan() {
  const [status, setStatus] = useState('checking'); // checking | noMesh | scanning | done
  const [countdown, setCountdown] = useState(8);
  const navigate = useNavigate();
  const auth = getAuth();

  // Phase 1: Feature Entry & Profile Check
  useEffect(() => {
    const checkMesh = async (user) => {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      const data = snap.data();

      if (data?.has3DMesh) {
        // Already scanned before → go straight to styles
        navigate('/styles');
      } else {
        setStatus('noMesh');
      }
    };

    onAuthStateChanged(auth, (user) => {
      if (user) {
        checkMesh(user);
      } else {
        navigate('/login');
      }
    });
  }, [navigate]);

  // Phase 2: Initial 360° Scan Flow
  const startScan = () => {
    setStatus('scanning');
    let timer = 8;
    const interval = setInterval(() => {
      timer--;
      setCountdown(timer);
      if (timer <= 0) {
        clearInterval(interval);
        finishScan();
      }
    }, 1000);
  };

  const finishScan = async () => {
    const user = auth.currentUser;
    await setDoc(doc(db, 'users', user.uid), { has3DMesh: true }, { merge: true });
    setStatus('done');
    setTimeout(() => navigate('/styles'), 3000);
  };

  if (status === 'checking') {
    return (
      <div style={{textAlign:'center', paddingTop:'5rem', color:'#001F3F'}}>
        <h2>Loading your profile...</h2>
      </div>
    );
  }

  return (
    <div style={{
      textAlign: 'center',
      padding: '2rem 1rem',
      fontFamily: 'Montserrat, sans-serif',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #001F3F, #0a3d62)'
    }}>
      <img src="/esdras-logo.png" alt="ESDRAS" style={{height:'90px', margin:'2rem 0'}} />

      {status === 'noMesh' && (
        <>
          <h1 style={{color:'white', fontSize:'2rem', margin:'1.5rem 0'}}>
            Welcome! Let’s Create Your 3D Head
          </h1>
          <p style={{color:'#B8860B', fontSize:'1.2rem', maxWidth:'90%', margin:'0 auto 2rem'}}>
            One-time 8-second 360° scan unlocks perfect hairstyle previews forever
          </p>

          <div style={{
            width:'90%',
            maxWidth:'400px',
            height:'450px',
            background:'#000',
            borderRadius:'24px',
            margin:'2rem auto',
            border:'4px solid #B8860B'
          }} />

          <div style={{
            background:'rgba(255,255,255,0.1)',
            padding:'1.5rem',
            borderRadius:'16px',
            margin:'2rem auto',
            maxWidth:'90%',
            backdropFilter:'blur(10px)'
          }}>
            <p style={{color:'white', margin:'0.8rem 0'}}>
              <strong>Instructions:</strong><br/>
              → Good lighting<br/>
              → Hold phone steady at eye level<br/>
              → Slowly rotate your head 360°<br/>
              → Keep face in frame
            </p>
          </div>

          <button
            onClick={startScan}
            style={{
              background:'#B8860B',
              color:'black',
              fontWeight:'bold',
              fontSize:'1.4rem',
              padding:'1.3rem 4rem',
              border:'none',
              borderRadius:'50px',
              marginTop:'1rem'
            }}
          >
            Start 360° Scan Now
          </button>
        </>
      )}

      {status === 'scanning' && (
        <>
          <h2 style={{color:'white', fontSize:'1.8rem'}}>Scanning in Progress...</h2>
          <div style={{
            width:'200px',
            height:'200px',
            border:'8px solid #B8860B',
            borderTop:'8px solid transparent',
            borderRadius:'50%',
            animation:'spin 1.5s linear infinite',
            margin:'3rem auto'
          }} />
          <p style={{color:'#B8860B', fontSize:'3rem', fontWeight:'bold'}}>{countdown}</p>
          <p style={{color:'white', fontSize:'1.2rem'}}>
            Rotate slowly • Keep face centered
          </p>
        </>
      )}

      {status === 'done' && (
        <>
          <h1 style={{color:'#B8860B', fontSize:'2.5rem'}}>Perfect!</h1>
          <p style={{color:'white', fontSize:'1.4rem'}}>
            Your 3D head mesh is ready
          </p>
          <p style={{color:'#B8860B', fontWeight:'bold'}}>
            Redirecting to hairstyle try-on...
          </p>
        </>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
    }
