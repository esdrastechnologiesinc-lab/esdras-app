import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase'; // You'll create this in 10 seconds

export default function Styles({ user }) {
  const [stylesUsed, setStylesUsed] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      getDoc(userRef).then((snap) => {
        const data = snap.data() || { stylesUsed: 0 };
        setStylesUsed(data.stylesUsed);
        if (data.stylesUsed >= 10) setShowPaywall(true);
      });
    }
  }, [user]);

  const tryStyle = () => {
    if (stylesUsed >= 10) {
      setShowPaywall(true);
    } else {
      setStylesUsed(stylesUsed + 1);
      setDoc(doc(db, 'users', user.uid), { stylesUsed: stylesUsed + 1 }, { merge: true });
      alert("New style applied! (3D preview coming in v2)");
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '3rem' }}>
      <h2 style={{ color: '#001F3F' }}>Your Style Library</h2>
      <p>Styles tried: <strong>{stylesUsed}/10 free</strong></p>

      {showPaywall ? (
        <div style={{ marginTop: '3rem', padding: '2rem', background: '#fff', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
          <h3>You've unlocked premium access!</h3>
          <p>Subscribe to continue unlimited 3D try-ons</p>
          <button style={{ background: '#B8860B', color: 'white', padding: '1rem 3rem', fontSize: '1.3rem', border: 'none', borderRadius: '12px' }}>
            $9.99/mo – Unlimited Styles
          </button>
        </div>
      ) : (
        <button onClick={tryStyle} style={{ background: '#B8860B', color: 'white', padding: '1.5rem 4rem', fontSize: '1.5rem', border: 'none', borderRadius: '12px', marginTop: '3rem' }}>
          Try New Hairstyle (3D Preview)
        </button>
      )}
    </div>
  );
      }
