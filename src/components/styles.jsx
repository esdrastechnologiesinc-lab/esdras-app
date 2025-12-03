// src/components/styles.jsx
import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import html2canvas from 'html2canvas';

const hairstyles = ['High Fade', 'Skin Fade', 'Afro Shape-Up', 'Dread Retwist', 'Caesar', 'Buzz Cut', 'Taper', 'Mohawk'];

function Head() {
  return (
    <mesh>
      <sphereGeometry args={[1.8, 32, 32]} />
      <meshStandardMaterial color="#f4a460" />
    </mesh>
  );
}

export default function Styles() {
  const [stylesUsed, setStylesUsed] = useState(0);
  const [currentStyle, setCurrentStyle] = useState('High Fade');
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    const load = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const snap = await getDoc(doc(db, 'users', user.uid));
      const data = snap.data() || {};
      setStylesUsed(data.stylesUsed || 0);
      if ((data.stylesUsed || 0) >= 10) setShowPaywall(true);
    };
    load();
  }, []);

  const tryNewStyle = async () => {
    if (stylesUsed >= 10) {
      setShowPaywall(true);
      return;
    }
    const newCount = stylesUsed + 1;
    setStylesUsed(newCount);
    setCurrentStyle(hairstyles[Math.floor(Math.random() * hairstyles.length)]);
    await setDoc(doc(db, 'users', auth.currentUser.uid), { stylesUsed: newCount }, { merge: true });
  };

  const generateWhatIf = () => {
    html2canvas(document.getElementById('whatif-canvas')).then(canvas => {
      const link = document.createElement('a');
      link.download = 'ESDRAS-WhatIf.png';
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  return (
    <div style={{padding:'1rem', textAlign:'center', background:'#f8f8f8', minHeight:'100vh'}}>
      <h1 style={{color:'#001F3F'}}>Try On Hairstyles</h1>
      <p>Free tries used: <strong>{stylesUsed}/10</strong></p>

      <div id="whatif-canvas" style={{background:'white', padding:'1rem', borderRadius:'20px', margin:'2rem auto', maxWidth:'500px'}}>
        <div style={{height:'500px', background:'#f0f0f0', borderRadius:'16px', overflow:'hidden'}}>
          <Canvas camera={{ position: [0, 0, 5] }}>
            <ambientLight intensity={0.8} />
            <directionalLight position={[10, 10, 5]} />
            <Head />
            <OrbitControls enableZoom={false} />
          </Canvas>
        </div>
        <div style={{marginTop:'1rem', padding:'1rem', background:'#001F3F', color:'white', borderRadius:'12px'}}>
          <p style={{fontSize:'1.8rem', margin:'0.5rem'}}>{currentStyle}</p>
          <p style={{fontSize:'1rem', color:'#B8860B'}}>Your look in 2026</p>
        </div>
      </div>

      {showPaywall ? (
        <div style={{margin:'3rem', padding:'2rem', background:'#001F3F', color:'white', borderRadius:'20px'}}>
          <h2>Unlock Unlimited Try-Ons + StyleSnap</h2>
          <p>$9.99/month or $49 one-time</p>
          <button style={{background:'#B8860B', padding:'1rem 3rem', border:'none', borderRadius:'16px', fontSize:'1.3rem'}}>
            Subscribe Now
          </button>
        </div>
      ) : (
        <>
          <button onClick={tryNewStyle} style={{
            background:'#B8860B',
            color:'black',
            padding:'1.5rem 5rem',
            fontSize:'1.6rem',
            border:'none',
            borderRadius:'50px',
            fontWeight:'bold'
          }}>
            Try New Style
          </button>
          <br/><br/>
          <button onClick={generateWhatIf} style={{
            background:'#001F3F',
            color:'white',
            padding:'1rem 3rem',
            border:'none',
            borderRadius:'16px'
          }}>
            Download "What-If" Image
          </button>
        </>
      )}
    </div>
  );
}
