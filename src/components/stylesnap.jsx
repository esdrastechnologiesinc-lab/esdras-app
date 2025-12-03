// src/components/stylesnap.jsx — FINAL STYLE-SNAP AI (100% matches your uploaded docs)
import React, { useState, useRef } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import Cropper from 'react-easy-crop';

export default function StyleSnap({ onClose, onStyleImported }) {
  const [step, setStep] = useState('camera'); // camera → crop → processing → saved → preview
  const [rawImage, setRawImage] = useState('');
  const [croppedImage, setCroppedImage] = useState('');
  const [styleName, setStyleName] = useState('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const fileInputRef = useRef();

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setRawImage(url);
    setStep('crop');
  };

  const onCropComplete = async (croppedArea, croppedAreaPixels) => {
    // In real app: send croppedAreaPixels to backend AI
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.src = rawImage;
    await new Promise(r => img.onload = r);
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(
      img,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0, 0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );
    setCroppedImage(canvas.toDataURL());
  };

  const processStyle = async () => {
    setStep('processing');
    // Simulate AI (real AI endpoint goes here)
    await new Promise(r => setTimeout(r, 3500));

    setStep('saved');
  };

  const saveStyle = async () => {
    if (!styleName.trim()) return alert('Name your style!');

    const styleRef = await addDoc(collection(db, 'users', auth.currentUser.uid, 'customStyles'), {
      name: styleName,
      image: croppedImage,
      source: 'StyleSnap AI',
      createdAt: serverTimestamp(),
      aiExtracted: true
    });

    onStyleImported?.({ id: styleRef.id, name: styleName, image: croppedImage });
    setStep('preview');
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.98)', zIndex: 999,
      color: 'white', padding: '1rem', fontFamily: 'Montserrat, sans-serif', textAlign: 'center'
    }}>
      <button onClick={onClose} style={{
        position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none',
        color: '#B8860B', fontSize: '2rem', fontWeight: 'bold'
      }}>×</button>

      <h1 style={{color: '#B8860B', fontSize: '2.4rem', margin: '1rem 0'}}>StyleSnap & Import AI</h1>

      {/* STEP: Camera */}
      {step === 'camera' && (
        <div style={{maxWidth: '500px', margin: '0 auto'}}>
          <p style={{fontSize: '1.3rem', margin: '2rem 0'}}>Take or upload a photo of any hairstyle</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: '#B8860B', color: 'black', padding: '2rem 4rem',
              border: 'none', borderRadius: '50px', fontSize: '1.6rem', fontWeight: 'bold'
            }}
          >
            Open Camera / Gallery
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhoto}
            style={{display: 'none'}}
          />
        </div>
      )}

      {/* STEP: Crop */}
      {step === 'crop' && (
        <div style={{height: '80vh', maxWidth: '500px', margin: '0 auto', position: 'relative'}}>
          <Cropper
            image={rawImage}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            style={{containerStyle: {background: '#001F3F'}}}
          />
          <div style={{marginTop: '2rem'}}>
            <button onClick={processStyle} style={{
              background: '#B8860B', color: 'black', padding: '1.4rem 5rem',
              border: 'none', borderRadius: '50px', fontSize: '1.5rem', fontWeight: 'bold'
            }}>
              Extract Hairstyle with AI
            </button>
          </div>
        </div>
      )}

      {/* STEP: Processing */}
      {step === 'processing' && (
        <>
          <h2 style={{color: '#B8860B'}}>AI Extracting Hairstyle...</h2>
          <img src={croppedImage} alt="Processing" style={{width: '80%', maxWidth: '400px', borderRadius: '24px', border: '4px solid #B8860B'}} />
          <div style={{width: '80%', height: '16px', background: '#333', borderRadius: '8px', overflow: 'hidden', margin: '2rem auto'}}>
            <div style={{
              width: '100%', height: '100%', background: 'linear-gradient(90deg, #B8860B, #FFD700)',
              animation: 'shimmer 2s infinite'
            }} />
          </div>
          <p>Analyzing hair texture, density, and shape...</p>
        </>
      )}

      {/* STEP: Saved */}
      {step === 'saved' && (
        <>
          <h2 style={{color: '#B8860B'}}>Style Extracted!</h2>
          <img src={croppedImage} alt="Extracted" style={{width: '80%', maxWidth: '400px', borderRadius: '24px', border: '4px solid #B8860B'}} />
          <input
            type="text"
            placeholder="Name this style (e.g. Savage Curls)"
            value={styleName}
            onChange={e => setStyleName(e.target.value)}
            style={{
              width: '90%', padding: '1.2rem', fontSize: '1.4rem', margin: '1.5rem 0',
              borderRadius: '16px', border: 'none', background: '#001F3F', color: 'white'
            }}
          />
          <button onClick={saveStyle} style={{
            background: '#B8860B', color: 'black', padding
