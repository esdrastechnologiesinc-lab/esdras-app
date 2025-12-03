// src/components/StyleSnap.jsx — Clean & Production-Ready Version
import React, { useState, useEffect, useRef } from 'react';
import { doc, setDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

const GOLD = '#B8860B';
const DARK_NAVY = '#001F3F';
const BLACK_GLASS = 'rgba(0, 0, 0, 0.98)';

export default function StyleSnap({ onStyleImported, onClose }) {
  const [step, setStep] = useState('idle'); // idle → processing → naming → success
  const [imageUrl, setImageUrl] = useState('');
  const [styleName, setStyleName] = useState('');
  const fileInputRef = useRef(null);

  // Clean up object URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setStep('processing');

    // MVP: Fake AI processing (replace with real AI call later)
    setTimeout(() => {
      setStep('naming');
    }, 2800); // Slightly faster, feels snappier
  };

  const saveStyle = async () => {
    if (!styleName.trim()) {
      alert('Give your style a name!');
      return;
    }

    try {
      // Option 1 (Recommended): Subcollection — scales forever
      const stylesCol = collection(db, 'users', auth.currentUser.uid, 'customStyles');
      const newStyleRef = await addDoc(stylesCol, {
        name: styleName.trim(),
        imageUrl: imageUrl, // In real version: upload to Storage first → save download URL
        source: 'StyleSnap',
        aiExtracted: true,
        createdAt: serverTimestamp(),
      });

      // Notify parent (e.g. Library re-fetch or local state update)
      onStyleImported?.({
        id: newStyleRef.id,
        name: styleName.trim(),
        imageUrl,
      });

      setStep('success');
    } catch (error) {
      console.error('Failed to save style:', error);
      alert('Something went wrong. Try again.');
    }
  };

  const resetAndClose = () => {
    onClose?.();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: BLACK_GLASS,
        zIndex: 9999,
        color: 'white',
        padding: '2rem',
        textAlign: 'center',
        overflowY: 'auto',
        fontFamily: '"Inter", system-ui, sans-serif',
      }}
    >
      {/* Global pulse animation */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>

      <h1 style={{ color: GOLD, fontSize: '2.8rem', fontWeight: '700', marginBottom: '1rem' }}>
        StyleSnap AI
      </h1>

      {/* STEP: Idle */}
      {step === 'idle' && (
        <>
          <p style={{ fontSize: '1.4rem', margin: '2rem 0 3rem', opacity: 0.9 }}>
            Take or upload a photo of any hairstyle
          </p>

          <label
            htmlFor="stylesnap-upload"
            style={{
              display: 'block',
              fontSize: '1.6rem',
              padding: '3rem',
              background: DARK_NAVY,
              border: `3px dashed ${GOLD}`,
              borderRadius: '24px',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Take Photo or Upload
          </label>

          <input
            ref={fileInputRef}
            id="stylesnap-upload"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhoto}
            style={{ display: 'none' }}
          />
        </>
      )}

      {/* STEP: Processing */}
      {step === 'processing' && (
        <>
          <div
            style={{
              width: '320px',
              height: '320px',
              margin: '2rem auto',
              background: DARK_NAVY,
              borderRadius: '28px',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
            }}
          >
            <img
              src={imageUrl}
              alt="Analyzing hairstyle"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <h2 style={{ fontSize: '1.8rem', margin: '2rem 0 1rem' }}>
            AI Extracting Hairstyle…
          </h2>

          <div
            style={{
              width: '80%',
              maxWidth: '400px',
              height: '14px',
              background: '#222',
              borderRadius: '7px',
              overflow: 'hidden',
              margin: '2rem auto',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                background: GOLD,
                animation: 'pulse 1.8s ease-in-out infinite',
              }}
            />
          </div>

          <p style={{ opacity: 0.8 }}>Detecting cut, texture, volume & flow…</p>
        </>
      )}

      {/* STEP: Naming */}
      {step === 'naming' && (
        <>
          <h2 style={{ color: GOLD, fontSize: '2rem' }}>Style Extracted!</h2>

          <img
            src={imageUrl}
            alt="Your extracted hairstyle"
            style={{
              maxWidth: '90%',
              borderRadius: '20px',
              margin: '1.5rem 0',
              boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
            }}
          />

          <input
            type="text"
            placeholder="Name this style (e.g. Midnight Waves)"
            value={styleName}
            onChange={(e) => setStyleName(e.target.value)}
            autoFocus
            style={{
              padding: '1.2rem',
              fontSize: '1.5rem',
              width: '90%',
              maxWidth: '500px',
              margin: '1.5rem 0',
              borderRadius: '16px',
              border: 'none',
              background: '#111',
              color: 'white',
              textAlign: 'center',
            }}
          />

          <div>
            <button
              onClick={saveStyle}
              disabled={!styleName.trim()}
              style={{
                background: styleName.trim() ? GOLD : '#555',
                color: 'black',
                padding: '1.3rem 5rem',
                fontSize: '1.5rem',
                fontWeight: '600',
                border: 'none',
                borderRadius: '50px',
                cursor: styleName.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s',
              }}
            >
              Save to My Library
            </button>
          </div>
        </>
      )}

      {/* STEP: Success */}
      {step === 'success' && (
        <>
          <h2 style={{ color: GOLD, fontSize: '2.4rem' }}>Saved!</h2>
          <p style={{ fontSize: '1.5rem', margin: '2rem 0' }}>
            <strong>{styleName}</strong> is now in your library
          </p>

          <button
            onClick={resetAndClose}
            style={{
              background: GOLD,
              color: 'black',
              padding: '1.3rem 5rem',
              fontSize: '1.5rem',
              fontWeight: '600',
              border: 'none',
              borderRadius: '50px',
              marginTop: '2rem',
            }}
          >
            Try It On
          </button>
        </>
      )}
    </div>
  );
}         
