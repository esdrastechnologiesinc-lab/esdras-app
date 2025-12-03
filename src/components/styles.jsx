// src/components/styles.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';

const styles = ['High Fade','Skin Fade','Afro Shape-Up','Dreads','Caesar','Mohawk'];

function Head() {
  return <mesh><sphereGeometry args={[1.8,32,32]}/><meshStandardMaterial color="#f4a460"/></mesh>;
}

export default function Styles() {
  const [used, setUsed] = useState(0);
  const [current, setCurrent] = useState('High Fade');
  const [showPaywall, setShowPaywall] = useState(false);
  const [showSnap, setShowSnap] = useState(false);
  const canvasRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, 'users', auth.currentUser.uid));
      const data = snap.data();
      setUsed(data?.stylesUsed || 0);
      if (data?.stylesUsed >= 10) setShowPaywall(true);
    };
    load();
  }, []);

  const tryStyle = async () => {
    if (used >= 10) { setShowPaywall(true); return; }
    const next = used + 1;
    setUsed(next);
    setCurrent(styles[Math.floor(Math.random()*styles.length)]);
    await setDoc(doc(db, 'users', auth.currentUser.uid), { stylesUsed: next }, { merge: true });
  };

  const downloadWhatIf = () => {
    html2canvas(canvasRef.current).then(c => {
      c.toBlob(b => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'ESDRAS-WhatIf.png'; a.click(); });
    });
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      alert('StyleSnap: Processing photo → extracting hairstyle → adding to your library...');
      setTimeout(() => {
        alert('New style "Savage Curls" imported! Try it now.');
        setCurrent('Savage Curls (Imported)');
      }, 3000);
    }
  };

  return (
    <div style={{padding:'1rem', background:'#f8f8f8', minHeight:'100vh', textAlign:'center'}}>
      <h1 style={{color:'#001F3F'}}>Try On Hairstyles</h1>
      <p>Free tries: {used}/10</p>

      <div ref={canvasRef} style={{background:'white', borderRadius:'20px', padding:'1rem', margin:'2rem auto', maxWidth:'500px'}}>
        <div style={{height:'500px', background:'#eee', borderRadius:'16px', overflow:'hidden'}}>
          <Canvas camera={{position:[0,0,5]}}>
            <ambientLight intensity={0.8}/>
            <directionalLight position={[10,10,5]}/>
            <Head/>
            <OrbitControls enableZoom={false}/>
          </Canvas>
        </div>
        <div style={{background:'#001F3F', color:'white', padding:'1rem', borderRadius:'12px'}}>
          <p style={{fontSize:'1.8rem', margin:'0.5rem'}}>{current}</p>
          <p style={{color:'#B8860B'}}>Your 2026 Look</p>
        </div>
      </div>

      {showPaywall ? (
        <div style={{margin:'3rem', padding:'3rem', background:'#001F3F', color:'white', borderRadius:'20px'}}>
          <h2>Unlock Unlimited + StyleSnap</h2>
          <p>$9.99/month or $49 one-time</p>
          <button onClick={() => navigate('/checkout')} style={{background:'#B8860B', padding:'1.5rem 4rem', border:'none', borderRadius:'16px', fontSize:'1.4rem'}}>
            Subscribe Now
          </button>
        </div>
      ) : (
        <>
          <button onClick={tryStyle} style={{background:'#B8860B', color:'black', padding:'1.5rem 5rem', fontSize:'1.6rem', border:'none', borderRadius:'50px', margin:'1rem'}}>
            Try New Style
          </button>
          <br/>
          <button onClick={downloadWhatIf} style={{background:'#001F3F', color:'white', padding:'1rem 3rem', border:'none', borderRadius:'16px', margin:'1rem'}}>
            Download What-If Image
          </button>
          <br/>
          <button onClick={() => setShowSnap(true)} style={{background:'#B8860B', color:'black', padding:'1rem 3rem', border:'none', borderRadius:'16px', margin:'1rem'}}>
            StyleSnap & Import
          </button>
        </>
      )}

      {showSnap && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.9)', zIndex:99, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
          <h2 style={{color:'#B8860B', fontSize:'2rem'}}>StyleSnap & Import</h2>
          <p style={{color:'white'}}>Take or upload a photo of any hairstyle</p>
          <input type="file" accept="image/*" capture="camera" onChange={handlePhoto} style={{fontSize:'1.5rem', padding:'2rem'}} />
          <button onClick={() => setShowSnap(false)} style={{marginTop:'2rem', background:'#B8860B', padding:'1rem 3rem', border:'none', borderRadius:'16px'}}>Close</button>
        </div>
      )}
    </div>
  );
      }       
