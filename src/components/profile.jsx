// src/components/userprofile.jsx
import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

export default function UserProfile() {
  const [userData, setUserData] = useState({});

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (snap.exists()) setUserData(snap.data());
    };
    load();
  }, []);

  const referralLink = `https://esdras.app/?ref=${auth.currentUser.uid.substring(0,8)}`;

  return (
    <div style={{padding:'2rem', background:'#f8f8f8', minHeight:'100vh', textAlign:'center'}}>
      <h1 style={{color:'#001F3F'}}>My Profile</h1>
      <div style={{background:'white', padding:'2rem', borderRadius:'20px', margin:'2rem auto', maxWidth:'500px', boxShadow:'0 10px 30px rgba(0,0,0,0.1)'}}>
        <p><strong>Free Try-Ons Used:</strong> {userData.stylesUsed || 0}/10</p>
        <p><strong>Bookings Made:</strong> {userData.bookings?.length || 0}</p>
        <p><strong>Referral Code:</strong> {auth.currentUser.uid.substring(0,8)}</p>
        
        <div style={{margin:'2rem 0', padding:'1.5rem', background:'#001F3F', color:'white', borderRadius:'16px'}}>
          <p>Your Link:</p>
          <p style={{fontWeight:'bold', wordBreak:'break-all'}}>{referralLink}</p>
          <button onClick={() => navigator.share?.({url: referralLink}) || alert('Copied!')} 
            style={{background:'#B8860B', color:'black', padding:'1rem 2rem', border:'none', borderRadius:'12px', marginTop:'1rem'}}>
            Share & Earn ₦2000 Credit
          </button>
        </div>
      </div>
    </div>
  );
}
