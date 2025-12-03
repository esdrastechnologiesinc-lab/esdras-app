// src/components/userprofile.jsx — FINAL VERSION (matches ALL 15 pages of your docs)
import React, { useState, useEffect } from 'react';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import Referral from './referral';

export default function UserProfile() {
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);

  const user = auth.currentUser;
  if (!user) {
    return <div style={{textAlign:'center', padding:'5rem', background:'#001F3F', color:'#B8860B', minHeight:'100vh'}}>
      <h2>Please log in to view profile</h2>
    </div>;
  }

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) {
        setUserData(snap.data());
      }
      setLoading(false);
    });
    return unsub;
  }, [user.uid]);

  const stylesUsed = userData.stylesUsed || 0;
  const freeRemaining = Math.max(0, 10 - stylesUsed);
  const referralCode = user.uid.substring(0, 8).toUpperCase();
  const referralLink = `https://esdras.app/?ref=${user.uid}`;

  if (loading) {
    return <div style={{textAlign:'center', padding:'5rem', background:'#001F3F', color:'#B8860B', minHeight:'100vh'}}>
      <h2>Loading Profile...</h2>
    </div>;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#001F3F',
      color: 'white',
      padding: '2rem 1rem',
      fontFamily: 'Montserrat, sans-serif'
    }}>
      <h1 style={{textAlign:'center', color:'#B8860B', fontSize:'2.8rem', marginBottom:'0.5rem'}}>
        My ESDRAS Profile
      </h1>
      <p style={{textAlign:'center', opacity:0.9, fontSize:'1.3rem'}}>
        Welcome back, {user.displayName || 'King'}
      </p>

      {/* Style Counter — MVP Requirement #6 */}
      <div style={{
        background:'rgba(184,134,11,0.15)',
        padding:'2rem',
        borderRadius:'20px',
        margin:'2rem auto',
        maxWidth:'500px',
        border:'2px solid #B8860B'
      }}>
        <p style={{margin:'0 0 1rem', fontSize:'1.4rem', color:'#B8860B'}}>Free Try-Ons Remaining</p>
        <div style={{background:'#0a3d62', height:'40px', borderRadius:'20px', overflow:'hidden', position:'relative'}}>
          <div style={{
            width: `${(stylesUsed / 10) * 100}%`,
            background: 'linear-gradient(90deg, #B8860B, #FFD700)',
            height:'100%',
            transition:'width 0.8s ease'
          }}></div>
          <p style={{
            position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
            margin:0, fontSize:'1.6rem', fontWeight:'bold', color: stylesUsed > 5 ? 'black' : 'white'
          }}>
            {freeRemaining} / 10 FREE
          </p>
        </div>
        {freeRemaining <= 3 && (
          <p style={{color:'#FFD700', fontWeight:'bold', marginTop:'1rem'}}>
            Only {freeRemaining} free try-ons left! Refer friends to get +3 more
          </p>
        )}
      </div>

      {/* Referral System — Immediate Gratification */}
      <div style={{
        background:'linear-gradient(135deg, #001F3F, #0a3d62)',
        padding:'2.5rem',
        borderRadius:'24px',
        margin:'2rem auto',
        maxWidth:'500px',
        border:'1px solid #B8860B'
      }}>
        <h2 style={{color:'#B8860B', textAlign:'center', margin:'0 0 1rem'}}>Your Referral Power</h2>
        <p style={{textAlign:'center', fontSize:'1.2rem', opacity:0.9}}>
          You’ve earned <strong style={{color:'#B8860B'}}>{userData.premiumPreviews || 0}</strong> bonus previews
        </p>
        <div style={{background:'white', color:'#001F3F', padding:'1.5rem', borderRadius:'16px', margin:'1.5rem 0', fontWeight:'bold'}}>
          <p style={{margin:'0.5rem 0', fontSize:'1.1rem'}}>Your Code:</p>
          <p style={{fontSize:'2rem', letterSpacing:'4px', color:'#B8860B'}}>{referralCode}</p>
        </div>
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({ url: referralLink, title: 'Try ESDRAS — Precision Grooming' });
            } else {
              navigator.clipboard.writeText(referralLink);
              alert('Link copied! Share with friends');
            }
          }}
          style={{
            width:'100%',
            background:'#B8860B',
            color:'black',
            padding:'1.4rem',
            border:'none',
            borderRadius:'50px',
            fontSize:'1.4rem',
            fontWeight:'bold',
            marginTop:'1rem'
          }}
        >
          Share & Earn +3 Premium Previews
        </button>
      </div>

      {/* Quick Stats */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', maxWidth:'500px', margin:'2rem auto'}}>
        <div style={{background:'#0a3d62', padding:'1.5rem', borderRadius:'16px', textAlign:'center'}}>
          <p style={{fontSize:'2.5rem', margin:'0', color:'#B8860B'}}>{userData.bookings?.length || 0}</p>
          <p>Bookings Made</p>
        </div>
        <div style={{background:'#0a3d62', padding:'1.5rem', borderRadius:'16px', textAlign:'center'}}>
          <p style={{fontSize:'2.5rem', margin:'0', color:'#B8860B'}}>{userData.successfulReferrals || 0}</p>
          <p>Friends Referred</p>
        </div>
      </div>

      {/* Legacy Referral Component (if needed) */}
      <div style={{display:'none'}}>
        <Referral user={user} />
      </div>
    </div>
  );
                     }
