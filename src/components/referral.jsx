// src/components/Referral.jsx — FINAL VIRAL GROWTH ENGINE
import React, { useState, useEffect } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';

export default function Referral() {
  const [state, setState] = useState({
    code: '',
    referredCount: 0,
    successfulReferrals: 0,   // Only counts users who BOOKED
    extraPreviews: 0,
    loading: true
  });

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    
    // Generate code if doesn't exist
    getDoc(userRef).then(snap => {
      const data = snap.data() || {};
      const code = data.referralCode || user.uid.substring(0, 8).toUpperCase();
      if (!data.referralCode) {
        setDoc(userRef, { referralCode: code }, { merge: true });
      }
      setState(s => ({ ...s, code }));
    });

    // Listen to referred users who actually BOOKED
    const referralsQuery = doc(db, 'referrals', user.uid);
    const unsub = onSnapshot(referralsQuery, (snap) => {
      if (snap.exists()) {
        const { successful = 0, extraPreviews = 0 } = snap.data();
        setState(s => ({ ...s, successfulReferrals: successful, extraPreviews, loading: false }));
      } else {
        setState(s => ({ ...s, loading: false }));
      }
    });

    return unsub;
  }, []);

  const shareLink = `https://esdras.app/?ref=${state.code}`;
  const whatsappText = `Yo! I just found the dopest grooming app. Try any hairstyle in 3D before you cut — no regrets! Use my link and we both get 3 EXTRA premium previews when you book your first cut: ${shareLink}`;

  const share = () => {
    if (navigator.share) {
      navigator.share({ title: 'Join ESDRAS!', text: whatsappText, url: shareLink });
    } else {
      navigator.clipboard.writeText(shareLink);
      alert('Link copied! Send it on WhatsApp');
    }
  };

  if (state.loading) return <p style={{color:'#B8860B', textAlign:'center'}}>Loading your empire...</p>;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #001F3F, #0a3d62)',
      color: 'white',
      padding: '2rem',
      borderRadius: '24px',
      textAlign: 'center',
      fontFamily: 'Montserrat, sans-serif',
      margin: '1rem'
    }}>
      <h2 style={{fontSize:'1.8rem', color:'#B8860B'}}>Grow Your Free Previews</h2>
      <p style={{fontSize:'1.1rem', opacity:0.9}}>
        Refer friends → When they <strong>book their first cut</strong>, you both get
      </p>
      <div style={{
        background:'#B8860B',
        color:'black',
        padding:'1rem',
        borderRadius:'16px',
        fontSize:'2rem',
        fontWeight:'bold',
        margin:'1.5rem 0'
      }}>
        +3 Premium Previews Each
      </div>

      <p>Your Code: <strong style={{fontSize:'1.6rem', color:'#B8860B'}}>{state.code}</strong></p>
      <p>Successful Referrals: <strong style={{color:'#B8860B'}}>{state.successfulReferrals}</strong></p>
      <p>You have <strong style={{color:'#B8860B'}}>{state.extraPreviews}</strong> extra premium previews</p>

      <button
        onClick={share}
        style={{
          background:'#B8860B',
          color:'black',
          fontWeight:'bold',
          padding:'1.4rem 3rem',
          border:'none',
          borderRadius:'50px',
          fontSize:'1.4rem',
          margin:'1rem 0'
        }}
      >
        Share on WhatsApp & Earn
      </button>

      <p style={{fontSize:'0.9rem', opacity:0.7, marginTop:'1rem'}}>
        Pro tip: Share in barber WhatsApp groups — barbers love when clients come with perfect styles
      </p>
    </div>
  );
}
