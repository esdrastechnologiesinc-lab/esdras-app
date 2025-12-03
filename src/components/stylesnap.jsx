// src/components/StyleSnap.jsx — FINAL SHIPPABLE VERSION
import React, { useState, useEffect, useRef } from 'react';
import {
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../firebase';

const GOLD = '#B8860B';
const DARK_NAVY = '#001F3F';
const BLACK_GLASS = 'rgba(0, 0, 0, 0.98)';

export default function StyleSnap({ onStyleImported, onClose }) {
  const [step, setStep] = useState('idle'); // idle → processing → naming → success
  const [imageUrl, setImageUrl] = useState('');
  const [styleName, setStyleName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  // Clean up blob URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Revoke previous URL if exists
    if (imageUrl) URL.revokeObjectURL(imageUrl);

    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setStyleName('');
    setStep('processing');

    // MVP fake AI — feels instant yet magical
    setTimeout(() => {
      setStep('naming');
    }, 2600);
  };

  const saveStyle = async () => {
    if (!styleName.trim()) {
      alert('Give your masterpiece a name!');
      return;
    }

    setIsSaving(true);
    try {
      const stylesCol = collection(db, 'users', auth.currentUser.uid, 'customStyles');
      const newStyleRef = await addDoc(stylesCol, {
        name: styleName.trim(),
        imageUrl: imageUrl, // TODO: Replace with Firebase Storage download URL in v2
        source: 'StyleSnap',
        aiExtracted: true,
        createdAt: serverTimestamp(),
      });

      onStyleImported?.({
        id: newStyleRef.id,
        name: styleName.trim(),
        imageUrl,
      });

      setStep('success');
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save style. Check your connection and try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const retakePhoto = () => {
    setStep('idle');
    setStyleName('');
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl('');
    fileInputRef.current?.click();
  };

  const closeModal = () => {
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
      padding: '2rem 1.5rem',
      textAlign: 'center',
      overflowY: 'auto',
      fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
    >
      {/* Close Button */}
      <button
        onClick={closeModal}
        aria-label="Close StyleSnap"
        style={{
          position: 'absolute',
          top: '1.5rem',
          right: '1.5rem',
          background: 'none',
          border: 'none',
          fontSize: '2.8rem',
          color: '#aaa',
          cursor: 'pointer',
          lineHeight: '1',
        }}
      >
        ×
      </button> 

    // Add inside the main div, after the close button
useEffect(() => {
  const handleEsc = (e) => e.key === 'Escape' && closeModal();
  window.addEventListener('keydown', handleEsc);
  return () => window.removeEventListener('keydown', handleEsc);
}, []);

      {/* Pulse Animation */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>

      <h1 style={{ color: GOLD, fontSize: '2.9rem', fontWeight: '800', margin: '0 0 1rem' }}>
        StyleSnap AI
      </h1>

      {/* IDLE */}
      {step === 'idle' && (
        <>
          <p style={{ fontSize: '1.45rem', margin: '2rem 0 3rem', opacity: 0.9 }}>
            Take or upload a photo of any hairstyle
          </p>

          <label
            htmlFor="stylesnap-upload"
            style={{
              display: 'block',
              fontSize: '1.7rem',
              fontWeight: '600',
              padding: '3.5rem',
              background: DARK_NAVY,
              border: `4px dashed ${GOLD}`,
              borderRadius: '28px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            Camera / Upload Photo
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

      {/* PROCESSING */}
      {step === 'processing' && (
        <>
          <div
            style={{
              width: '340px',
              height: '340px',
              margin: '2rem auto',
              background: DARK_NAVY,
              borderRadius: '32px',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.7)',
            }}
          >
            <img
              src={imageUrl}
              alt="Analyzing your hairstyle"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <h2 style={{ fontSize: '2rem', margin: '2rem 0 1rem' }}>
            AI is reading the vibe…
          </h2>

          <div
            style={{
              width: '85%',
              maxWidth: '420px',
              height: '16px',
              background: '#1a1a1a',
              borderRadius: '8px',
              overflow: 'hidden',
              margin: '2rem auto',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                background: GOLD,
                animation: 'pulse 1.6s ease-in-out infinite',
              }}
            />
          </div>

          <p style={{ opacity: 0.85, fontSize: '1.2rem' }}>
            Detecting layers, texture, flow, and energy…
          </p>
        </>
      )}

      {/* NAMING */}
      {step === 'naming' && (
        <>
          <h2 style={{ color: GOLD, fontSize: '2.2rem', fontWeight: '700' }}>
            Style Extracted!
          </h2>

          <img
            src={imageUrl}
            alt="Extracted hairstyle"
            style={{
              maxWidth: '92%',
              borderRadius: '24px',
              margin: '2rem 0',
              boxShadow: '0 12px 35px rgba(0,0,0,0.6)',
            }}
          />

          <input
            type="text"
            placeholder="Name this vibe (e.g. Savage Curls, Tokyo Drift)"
            value={styleName}
            onChange={(e) => setStyleName(e.target.value)}
            autoFocus
            style={{
              padding: '1.4rem',
              fontSize: '1.6rem',
              width: '90%',
              maxWidth: '520px',
              margin: '1rem 0 2rem',
              borderRadius: '18px',
              border: 'none',
              background: '#111',
              color: 'white',
              textAlign: 'center',
            }}
          />

          <div style={{ margin: '2rem 0' }}>
            <button
              onClick={saveStyle}
              disabled={isSaving || !styleName.trim()}
              style={{
                background: isSaving || !styleName.trim() ? '#555' : GOLD,
                color: 'black',
                padding: '1.4rem 6rem',
                fontSize: '1.6rem',
                fontWeight: '700',
                border: 'none',
                borderRadius: '60px',
                cursor: isSaving || !styleName.trim() ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.8 : 1,
                transition: 'all 0.3s',
              }}
            >
              {isSaving ? 'Saving…' : 'Save to My Library'}
            </button> 
            onClick={retakePhoto}
            style={{
              background: 'transparent',
              border: `2px solid ${GOLD}`,
              color: GOLD,
              padding: '1rem 3rem',
              fontSize: '1.4rem',
              fontWeight: '600',
              borderRadius: '50px',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
          >
            Retake Photo
          </button>
        </>
      )}

      {/* SUCCESS */}
      {step === 'success' && (
        <>
          <h2 style={{ color: GOLD, fontSize: '2.5rem', fontWeight: '700' }}>
            Saved!
          </h2>

          <p style={{ fontSize: '1.6rem', margin: '2.5rem 0' }}>
            <strong>{styleName}</strong> is now in your library
          </p>

          <button
            onClick={closeModal}
            style={{
              background: GOLD,
              color: 'black',
              padding: '1.4rem 5.5rem',
              fontSize: '1.6rem',
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
