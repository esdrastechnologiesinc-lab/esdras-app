import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function Referral({ user }) {
  const [code, setCode] = useState('');
  const [referredCount, setReferredCount] = useState(0);
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    if (user) {
      const ref = doc(db, 'users', user.uid);
      getDoc(ref).then(snap => {
        const data = snap.data() || {};
        setCode(data.referralCode || generateCode());
        setReferredCount(data.referredCount || 0);
        setCredits(data.credits || 0);
      });
    }
  }, [user]);

  const generateCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setDoc(doc(db, 'users', user.uid), { referralCode: code }, { merge: true });
    return code;
  };

  const shareLink = `https://esdras-app.netlify.app/?ref=${code}`;

  return (
    <div style={{padding:'2rem', background:'#001F3F', color:'white', borderRadius:'20px', textAlign:'center'}}>
      <h2>Your Referral Link</h2>
      <p style={{fontSize:'1.5rem', background:'#B8860B', color:'black', padding:'1rem', borderRadius:'12px', margin:'1rem 0'}}>
        {shareLink}
      </p>
      <p>Referred: <strong>{referredCount}</strong> people • Credits: <strong>${credits}</strong></p>
      <div style={{margin:'1.5rem 0'}}>
        <button onClick={() => navigator.share?.({url: shareLink, title: 'Join ESDRAS!'}) || alert('Link copied!')} 
          style={{background:'#B8860B', color:'black', padding:'1rem 2rem', border:'none', borderRadius:'12px', fontWeight:'bold'}}>
          Share & Earn $10 Credit
        </button>
      </div>
      <small>Both you and your friend get $10 credit when they book their first cut!</small>
    </div>
  );
}
