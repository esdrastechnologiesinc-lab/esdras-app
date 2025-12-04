// src/components/profile.jsx — FINAL ESDRAS USER PROFILE (exact referral rewards + premium + 100% blueprint)
import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

const NAVY = '#001F3F';
const GOLD = '#B8860B';

export default function Profile() {
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const unsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) setUserData(snap.data());
      setLoading(false);
    });
    return unsub;
  }, [user, navigate]);

  if (!user || loading) {
    return (
      <div style={{minHeight:'100vh', background:NAVY, color:GOLD, display:'grid', placeItems:'center', fontFamily:'Montserrat, sans-serif'}}>
        <h2>{loading ? 'loading profile...' : 'please log in'}</h2>
      </div>
    );
  }

  const isPremium = userData.subscription === 'premium_yearly';
  const stylesUsed = userData.stylesUsed || 0;
  const freeRemaining = Math.max(0, 10 - stylesUsed);
  const extraPreviews = userData.extraPreviews || 0; // from referrals
  const totalAvailable = isPremium ? 'unlimited' : freeRemaining + extraPreviews;

  // Clean referral code – use displayName or fallback to short UID
  const referralCode = (user.displayName || user.email.split('@')[0]).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
  const referralLink = `https://esdras.app/?ref=${user.uid}`;

  const handleShare = async () => {
    const shareText = `Try ESDRAS – see any hairstyle on your exact head in seconds! Use my code \( {referralCode} for 3 extra premium previews 👑\n \){referralLink}`;
    if (navigator.share) {
      await navigator.share({ title: 'ESDRAS – Precision Grooming', text: shareText });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Referral link copied! Paste and share with friends');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: NAVY,
      color: 'white',
      fontFamily: 'Montserrat, sans-serif',
      padding: '2rem 1rem'
    }}>
      <h1 style={{textAlign:'center', color:GOLD, fontSize:'3rem', fontWeight:'800', margin:'0 0 0.5rem'}}>
        my profile
      </h1>
      <p style={{textAlign:'center', opacity:0.9, fontSize:'1.5rem'}}>
        welcome back, {user.displayName || 'king'}
      </p>

      {/* Premium Status */}
      {isPremium && (
        <div style={{textAlign:'center', margin:'2rem 0', padding:'1.5rem', background:'rgba(184,134,11,0.2)', borderRadius:'20px', border:`2px solid ${GOLD}`}}>
          <p style={{margin:0, fontSize:'1.6rem', color:GOLD}}>premium member • unlimited styles 👑</p>
        </div>
      )}

      {/* Style Counter */}
      {!isPremium && (
        <div style={{maxWidth:'500px', margin:'2rem auto', background:'rgba(184,134,11,0.15)', padding:'2rem', borderRadius:'20px', border:`2px solid ${GOLD}`}}>
          <p style={{margin:'0 0 1rem', fontSize:'1.4rem', color:GOLD}}>your try-ons</p>
          <div style={{background:'#0a3d62', height:'50px', borderRadius:'20px', overflow:'hidden', position:'relative'}}>
            <div style={{
              width: `${(stylesUsed / 10) * 100}%`,
              background: 'linear-gradient(90deg, #B8860B, #FFD700)',
              height:'100%',
              transition:'width 0.8s ease'
            }}></div>
            <p style={{position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', margin:0, fontSize:'1.8rem', fontWeight:'bold'}}>
              {freeRemaining} free + {extraPreviews} bonus
            </p>
          </div>
          {totalAvailable <= 3 && (
            <p style={{color:GOLD, fontWeight:'bold', marginTop:'1rem'}}>
              only {totalAvailable} left • refer friends for +3 more
            </p>
          )}
        </div>
      )}

      {/* Referral Section – Exact Blueprint Rewards */}
      <div style={{maxWidth:'500px', margin:'2rem auto', background:'linear-gradient(135deg, #001F3F, #0a3d62)', padding:'2.5rem', borderRadius:'24px', border:`1px solid ${GOLD}`}}>
        <h2 style={{color:GOLD, textAlign:'center', margin:'0 0 1rem'}}>refer & earn</h2>
        <p style={{textAlign:'center', opacity:0.9}}>
          you’ve earned <strong style={{color:GOLD}}>{extraPreviews}</strong> bonus previews
        </p>
        <div style={{background:'white', color:NAVY, padding:'1.5rem', borderRadius:'16px', margin:'1.5rem 0', textAlign:'center', fontWeight:'bold'}}>
          <p style={{margin:'0.5rem 0', fontSize:'1.1rem'}}>your code</p>
          <p style={{fontSize:'2.2rem', letterSpacing:'6px', color:GOLD}}>{referralCode}</p>
        </div>
        <button
          onClick={handleShare}
          style={{
            width:'100%',
            background:GOLD,
            color:'black',
            padding:'1.5rem',
            border:'none',
            borderRadius:'50px',
            fontSize:'1.5rem',
            fontWeight:'bold'
          }}
        >
          share & earn +3 bonus previews
        </button>
      </div>

      {/* Quick Stats */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px,1fr))', gap:'1.5rem', maxWidth:'500px', margin:'3rem auto'}}>
        <div style={{background:'#0a3d62', padding:'2rem', borderRadius:'20px', textAlign:'center'}}>
          <p style={{fontSize:'3rem', margin:'0', color:GOLD}}>{userData.bookings?.length || 0}</p>
          <p style={{margin:'0.5rem 0 0', opacity:0.8}}>bookings</p>
        </div>
        <div style={{background:'#0a3d62', padding:'2rem', borderRadius:'20px', textAlign:'center'}}>
          <p style={{fontSize:'3rem', margin:'0', color:GOLD}}>{userData.successfulReferrals || 0}</p>
          <p style={{margin:'0.5rem 0 0', opacity:0.8}}>friends referred</p>
        </div>
      </div>
    </div>
  );
        }
