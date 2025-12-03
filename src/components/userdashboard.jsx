import React, { useState, useEffect } from 'react';
import Referral from './referral';
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function UserDashboard() {
  const [userData, setUserData] = useState({});
  const auth = getAuth();

  useEffect(() => {
    if (auth.currentUser) {
      getDoc(doc(db, 'users', auth.currentUser.uid)).then(s => {
        setUserData(s.data() || {});
      });
    }
  }, []);

  return (
    <div style={{padding:'1rem', minHeight:'100vh', background:'#f8f8f8'}}>
      <header style={{background:'#001F3F', color:'white', padding:'2rem', textAlign:'center', borderRadius:'0 0 20px 20px'}}>
        <h1>My ESDRAS</h1>
        <p>Welcome back, {auth.currentUser?.displayName || 'Groomer'}!</p>
      </header>

      <div style={{maxWidth:'1000px', margin:'2rem auto'}}>
        <div style={{background:'white', padding:'2rem', borderRadius:'16px', marginBottom:'2rem', boxShadow:'0 5px 20px rgba(0,0,0,0.1)'}}>
          <h2 style={{color:'#001F3F'}}>Your Stats</h2>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
            <div><strong>Styles Tried:</strong> {userData.stylesUsed || 0}/10 free</div>
            <div><strong>Bookings Made:</strong> {userData.bookings?.length || 0}</div>
            <div><strong>Credits:</strong> ${userData.credits || 0}</div>
            <div><strong>Referred:</strong> {userData.referredCount || 0} friends</div>
          </div>
        </div>

        <Referral user={auth.currentUser} />

        <div style={{marginTop:'2rem', textAlign:'center'}}>
          <a href="/styles" style={{background:'#B8860B', color:'white', padding:'1.5rem 4rem', borderRadius:'16px', textDecoration:'none', display:'inline-block', fontSize:'1.3rem'}}>
            Try New Hairstyle
          </a>
        </div>
      </div>
    </div>
  );
}
