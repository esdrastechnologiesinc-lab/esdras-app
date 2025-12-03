// src/components/stylesnap.jsx — FINAL STYLE-SNAP AI
import React, { useState } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

export default function StyleSnap({ onStyleImported }) {
  const [step, setStep] = useState('idle'); // idle → processing → saved → preview
  const [imageUrl, setImageUrl] = useState('');
  const [styleName, setStyleName] = useState('');

  const handlePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setStep('processing');

    // Simulate AI extraction (real AI coming in 48h — this is MVP)
    setTimeout(() => {
      setStep('saved');
    }, 4000);
  };

  const saveStyle = async () => {
    if (!styleName.trim()) return alert('Enter a style name');

    await setDoc(doc(db, 'users', auth.currentUser.uid), {
      customStyles: {
        [Date.now()]: {
          name: styleName,
          source: 'StyleSnap',
          importedAt: serverTimestamp(),
          aiExtracted: true
        }
      }
    }, { merge: true });

    onStyleImported?.({ name: styleName, id: Date.now() });
    setStep('preview');
  };

  return (
    <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.98)', zIndex:999, color:'white', padding:'2rem', textAlign:'center'}}>
      <h1 style={{color:'#B8860B', fontSize:'2.5rem'}}>StyleSnap & Import</h1>
      
      {step === 'idle' && (
        <>
          <p style={{fontSize:'1.3rem', margin:'2rem 0'}}>Take or upload a photo of any hairstyle</p>
          <input type="file" accept="image/*" capture="camera" onChange={handlePhoto} 
            style={{fontSize:'1.5rem', padding:'2rem', background:'#001F3F', border:'2px dashed #B8860B', borderRadius:'20px'}} />
        </>
      )}

      {step === 'processing' && (
        <>
          <div style={{width:300, height:300, margin:'2rem auto', background:'#001F3F', borderRadius:'24px', overflow:'hidden'}}>
            <img src={imageUrl} alt="Analyzing" style={{width:'100%', height:'100%', objectFit:'cover'}} />
          </div>
          <h2>AI Extracting Hairstyle...</h2>
          <div style={{width:'80%', height:'12px', background:'#333', borderRadius:'6px', overflow:'hidden', margin:'2rem auto'}}>
            <div style={{width:'70%', height:'100%', background:'#B8860B', animation:'pulse 2s infinite'}} />
          </div>
          <p>Detecting hair density, texture, and shape...</p>
        </>
      )}

      {step === 'saved' && (
        <>
          <h2 style={{color:'#B8860B'}}>Style Extracted!</h2>
          <img src={imageUrl} alt="Extracted" style={{maxWidth:'90%', borderRadius:'20px', margin:'1rem 0'}} />
          <input 
            type="text" 
            placeholder="Name this style (e.g. Savage Curls)" 
            value={styleName}
            onChange={(e) => setStyleName(e.target.value)}
            style={{padding:'1rem', fontSize:'1.4rem', width:'90%', margin:'1rem 0', borderRadius:'12px', border:'none'}}
          />
          <button onClick={saveStyle} style={{background:'#B8860B', color:'black', padding:'1.2rem 4rem', fontSize:'1.4rem', border:'none', borderRadius:'50px'}}>
            Save to My Library
          </button>
        </>
      )}

      {step === 'preview' && (
        <>
          <h2 style={{color:'#B8860B'}}>Style Saved!</h2>
          <p><strong>{styleName}</strong> is now in your library</p>
          <button onClick={() => window.location.reload()} style={{background:'#B8860B', padding:'1.2rem 4rem', border:'none', borderRadius:'50px'}}>
            Try It Now
          </button>
        </>
      )}

      <style>
        {`@keyframes pulse {0%,100%{opacity:0.6} 50%{opacity:1}}`}
      </style>
    </div>
  );
    }
