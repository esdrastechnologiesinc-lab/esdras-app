// src/components/importstyle.jsx — FINAL STYLE SNAP & IMPORT (global library + women-ready + full premium UI)
import React, { useState, useRef } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, updateDoc, arrayUnion, increment, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const NAVY = '#001F3F';
const GOLD = '#B8860B';

export default function ImportStyle({ onClose, onStyleImported }) {
  const [step, setStep] = useState('choose'); // choose | camera | library | crop | name | processing | done
  const [sourceImg, setSourceImg] = useState(null);
  const [croppedImg, setCroppedImg] = useState(null);
  const [styleName, setStyleName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [userData, setUserData] = useState({});
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const auth = getAuth();
  const user = auth.currentUser;

  // Load user gender for auto-tagging (women/men styles)
  useEffect(() => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      getDoc(userRef).then(snap => {
        if (snap.exists()) setUserData(snap.data());
      });
    }
  }, [user]);

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    videoRef.current.srcObject = stream;
    setStep('camera');
  };

  const captureFromCamera = () => {
    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg');
    setSourceImg(dataUrl);
    videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    setStep('crop');
  };

  const handleLibraryUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSourceImg(reader.result);
        setStep('crop');
      };
      reader.readAsDataURL(file);
    }
  };

  const processStyle = async () => {
    if (!styleName.trim()) return alert('give your style a name');
    if (!croppedImg) return;

    setProcessing(true);

    try {
      // Use cropped image as final (replace with real cropper + storage upload later)
      const imageUrl = croppedImg; // in real app: upload to Storage first

      const newStyle = {
        name: styleName,
        image: imageUrl,
        gender: userData.gender || 'universal', // auto-tag based on user gender
        length: 'medium', // AI can compute later
        faceShape: [],
        rating: 0,
        isPremium: false,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        isImported: true
      };

      // Save to GLOBAL styles library (everyone sees it)
      await addDoc(collection(db, 'styles'), newStyle);

      // Optional: Save to user's personal library too
      await updateDoc(doc(db, 'users', user.uid), {
        customStyles: arrayUnion(newStyle),
        stylesUsed: increment(1)
      });

      setProcessing(false);
      setStep('done');
      if (onStyleImported) onStyleImported(newStyle);
      setTimeout(() => onClose?.(), 2500);
    } catch (err) {
      console.error(err);
      alert('failed to save style – try again');
      setProcessing(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: NAVY,
      color: 'white',
      fontFamily: 'Montserrat, sans-serif',
      display: 'grid',
      placeItems: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      <div style={{maxWidth: '500px', width: '100%', textAlign: 'center'}}>

        {/* choose source */}
        {step === 'choose' && (
          <>
            <h1 style={{fontSize: '2.5rem', color: GOLD, marginBottom: '1rem'}}>stylesnap ai</h1>
            <p style={{fontSize: '1.4rem', opacity: 0.9, marginBottom: '3rem'}}>
              import any hairstyle in seconds
            </p>
            <div style={{display: 'grid', gap: '1.5rem'}}>
              <button onClick={startCamera} style={{
                background: GOLD,
                color: 'black',
                border: 'none',
                padding: '2rem',
                borderRadius: '20px',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}>
                📸 open camera
              </button>
              <label style={{
                background: 'rgba(255,255,255,0.1)',
                border: `3px solid ${GOLD}`,
                padding: '2rem',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}>
                🖼️ choose from library
                <input type="file" accept="image/*" onChange={handleLibraryUpload} style={{display:'none'}} />
              </label>
            </div>
            <button onClick={onClose} style={{marginTop:'2rem', opacity:0.7}}>cancel</button>
          </>
        )}

        {/* live camera */}
        {step === 'camera' && (
          <>
            <video ref={videoRef} autoPlay playsInline style={{maxWidth:'100%', borderRadius:'20px'}} />
            <canvas ref={canvasRef} style={{display:'none'}} />
            <div style={{marginTop:'1rem'}}>
              <button onClick={captureFromCamera} style={{
                background:GOLD, color:'black', border:'none', padding:'1.5rem 4rem',
                borderRadius:'50px', fontWeight:'bold', fontSize:'1.4rem', cursor:'pointer'
              }}>
                capture hairstyle
              </button>
            </div>
          </>
        )}

        {/* crop + name */}
        {(step === 'crop' || step === 'name') && sourceImg && (
          <>
            {step === 'crop' && (
              <>
                <p style={{fontSize:'1.3rem'}}>crop to just the hairstyle</p>
                <img src={sourceImg} alt="source" style={{maxWidth:'100%', borderRadius:'16px', margin:'1rem 0'}} />
                <button
                  onClick={() => {
                    setCroppedImg(sourceImg); // placeholder – replace with real cropper
                    setStep('name');
                  }}
                  style={{
                    background:GOLD, color:'black', padding:'1.5rem 4rem',
                    borderRadius:'50px', fontWeight:'bold', fontSize:'1.4rem', cursor:'pointer'
                  }}
                >
                  use this crop
                </button>
              </>
            )}

            {step === 'name' && (
              <>
                <p style={{fontSize:'1.3rem'}}>name this style</p>
                <input
                  type="text"
                  placeholder="e.g. the saheed cut"
                  value={styleName}
                  onChange={(e) => setStyleName(e.target.value)}
                  style={{
                    width:'100%', padding:'1rem', borderRadius:'12px', border:'none',
                    background:'rgba(255,255,255,0.1)', color:'white', margin:'1rem 0', fontSize:'1.2rem'
                  }}
                />
                <button
                  onClick={processStyle}
                  style={{
                    background:GOLD, color:'black', padding:'1.5rem 4rem',
                    borderRadius:'50px', fontWeight:'bold', fontSize:'1.4rem', cursor:'pointer'
                  }}
                >
                  import & share with everyone
                </button>
              </>
            )}
          </>
        )}

        {/* processing */}
        {processing && (
          <div>
            <p style={{fontSize:'1.8rem'}}>processing style...</p>
            <p>this takes a few seconds</p>
          </div>
        )}

        {/* success */}
        {step === 'done' && (
          <div>
            <p style={{fontSize:'2rem', color:GOLD}}>style saved!</p>
            <p>ready to try on your head</p>
          </div>
        )}
      </div>
    </div>
  );
  }
