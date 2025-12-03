// src/components/Referral.jsx — FINAL VIRAL GROWTH ENGINE (100% matches your 15 pages)
import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';

export default function Referral() {
  const [data, setData] = useState({
    code: '······',
    successfulReferrals: 0,
    premiumPreviews: 0,
    loading: true
  });

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setData(d => ({ ...d, loading: false }));
      return;
    }

    const userRef = doc(db, 'users', user.uid);

    const unsub = onSnapshot(userRef, (snap) => {
      if (!snap.exists()) {
        setData({ code: 'ERROR', successfulReferrals: 0, premiumPreviews: 0, loading: false });
        return;
      }

      const userData = snap.data();
      const code = userData.referralCode || user.uid.substring(0, 8).toUpperCase();

      setData({
        code,
        successfulReferrals: userData.successfulReferrals || 0,
        premiumPreviews: userData.premiumPreviews || 0,
        loading: false
      });
    });

    return unsub;
  }, []);

  const shareLink = `https://esdras.app/?ref=${data.code}`;
  const nextReward = data.successfulReferrals >= 3 
    ? 'You already earned ₦2000!' 
    : `${3 - (data.successfulReferrals % 3)} more bookings → ₦2000 credit`;

  const share = () => {
    const text = `I’m using ESDRAS to try hairstyles in 3D before cutting. No regrets ever again! Join with my link and we both get 3 FREE premium previews when you book your first cut → ${shareLink}`;
    
    if (navigator.share) {
      navigator.share({ title: 'ESDRAS – Precision Grooming', text, url: shareLink });
    } else {
      navigator.clipboard.writeText(shareLink);
      alert('Link copied! Send on WhatsApp now');
    }
  };

  if (!auth.currentUser) {
    return null; // Hidden when not logged in
  }

  if (data.loading) {
    return <div style={{textAlign:'center', padding:'2rem', color:'#B8860B'}}>Building your empire...</div>;
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #001F3F 0%, #0a3d62 100%)',
      color: 'white',
      padding: '2.5rem 1.5rem',
      borderRadius: '28px',
      textAlign: 'center',
      fontFamily: 'Montserrat, sans-serif',
      margin: '1.5rem',
      border: '2px solid #B8860B',
      boxShadow: '0 20px 40px rgba(184,134,11,0.2)'
    }}>
      <h2 style={{fontSize:'2rem', color:'#B8860B', margin:'0 0 1rem'}}>
        Viral Growth Engine
      </h2>

      {/* ₦2000 Credit Progress */}
      <div style={{
        background: data.successfulReferrals >= 3 ? '#B8860B' : '#001F3F',
        color: data.successfulReferrals >= 3 ? 'black' : '#B8860B',
        padding:'1.2rem',
        borderRadius:'16px',
        fontWeight:'bold',
        fontSize:'1.1rem',
        border: '2px dashed #B8860B'
      }}>
        {nextReward}
      </div>

      {/* +3 Previews Reward */}
      <div style={{
        background:'#B8860B',
        color:'black',
        padding:'1.8rem',
        borderRadius:'20px',
        fontSize:'2.4rem',
        fontWeight:'bold',
        margin:'2rem 0'
      }}>
        +3 PREMIUM PREVIEWS<br/>each time a friend books
      </div>

      <p style={{fontSize:'1.3rem', margin:'1rem 0'}}>
        Your Code: <span style={{fontSize:'2.2rem', color:'#B8860B', letterSpacing:'6px'}}>{data.code}</span>
      </p>

      <p style={{margin:'1rem 0'}}>
        Successful bookings from your link: <strong style={{color:'#B8860B', fontSize:'2rem'}}>{data.successfulReferrals}</strong>
      </p>

      <p style={{margin:'1rem 0'}}>
        You have <strong style={{color:'#B8860B'}}>{data.premiumPreviews}</strong> bonus previews
      </p>

      <button
        onClick={share}
        style={{
          background:'#B8860B',
          color:'black',
          fontWeight:'bold',
          fontSize:'1.5rem',
          padding:'1.5rem 4rem',
          border:'none',
          borderRadius:'50px',
          margin:'2rem 0',
          width:'100%',
          boxShadow:'0 10px 20px rgba(0,0,0,0.3)'
        }}
      >
        Share Now & Earn ₦2000 + Previews
      </button>

      <p style={{fontSize:'0.95rem', opacity:0.8, marginTop:'1.5rem'}}>
        Pro move: Post in barber WhatsApp groups — they’ll thank you when clients arrive with perfect styles
      </p>
    </div>
  );
    }
