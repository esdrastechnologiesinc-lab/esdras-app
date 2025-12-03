// src/components/styles.jsx — FINAL WITH STYLE-SNAP AI
import { doc, getDoc } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import StyleSnap from './stylesnap';  // <-- THIS IS THE NEW AI

export default function Styles() {
  const [styles, setStyles] = useState([]);
  const [currentStyle, setCurrentStyle] = useState(null);
  const [showSnap, setShowSnap] = useState(false);  // <-- NEW STATE

  useEffect(() => { 
    useEffect(() => {
  const load = async () => {
    const snap = await getDoc(doc(db, 'users', auth.currentUser.uid));
    const data = snap.data();
    if (!data?.has3DMesh) {
      navigate('/scan');
      return;
    }
    setUsed(data.stylesUsed || 0);
    if (data.stylesUsed >= 10) setShowPaywall(true);
  };
  load();
}, [navigate]);
    const q = collection(db, 'styles');
    onSnapshot(q, (snap) => {
      setStyles(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  return (
    <div style={{padding:'2rem', background:'#001F3F', color:'white', minHeight:'100vh'}}>
      <h1 style={{color:'#B8860B', textAlign:'center'}}>Choose Your Style</h1>

      {/* STYLE-SNAP AI BUTTON — YOUR #1 VIRAL FEATURE */}
      <div style={{textAlign:'center', margin:'2rem 0'}}>
        <button 
          onClick={() => setShowSnap(true)}
          style={{
            background:'#B8860B',
            color:'black',
            fontWeight:'bold',
            padding:'1.4rem 4rem',
            fontSize:'1.6rem',
            border:'none',
            borderRadius:'50px',
            boxShadow:'0 8px 20px rgba(184,134,11,0.4)'
          }}
        >
          StyleSnap & Import AI
        </button>
        <p style={{opacity:0.8, marginTop:'0.5rem'}}>Take a photo → AI extracts any hairstyle</p>
      </div>

      {/* STYLE GRID */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px,1fr))', gap:'1rem'}}>
        {styles.map(s => (
          <div key={s.id} onClick={() => setCurrentStyle(s)} style={{cursor:'pointer'}}>
            <img src={s.image} alt={s.name} style={{width:'100%', borderRadius:'16px'}} />
            <p style={{textAlign:'center', margin:'0.5rem 0'}}>{s.name}</p>
          </div>
        ))}
      </div>

      {/* STYLE-SNAP MODAL — FULL AI FLOW */}
      {showSnap && (
        <StyleSnap 
          onStyleImported={(newStyle) => {
            setCurrentStyle({ name: newStyle.name });
            setShowSnap(false);
            alert(`${newStyle.name} imported! Trying it now...`);
          }}
          onClose={() => setShowSnap(false)}
        /> 
      <button onClick={downloadWhatIf} style={{background:'#001F3F', color:'white', padding:'1rem 3rem', border:'none', borderRadius:'16px', margin:'1rem'}}>
  Download What-If Image
</button>consdiv   const downloadWhatIf = () => {
  const(document.getElementById('preview')).then(c => {
    const link = document.createElement('a');
    link.download = 'ESDRAS-WhatIf.png';
    link.href = c.toDataURL();
    link.click();
  });
};
      )}

      {currentStyle && (
        <div style={{marginTop:'3rem', textAlign:'center'}}>
          <h2 style={{color:'#B8860B'}}>Now trying: {currentStyle.name}</h2>
          {/* Your 3D preview will go here */}
        </div>
      )}
    </div>v
      <div id="preview" style={{background:'white', padding:'1rem', borderRadius:'16px'}}>v  );
            }      
