// src/components/UserDashboard.jsx — FINAL ESDRAS USER DASHBOARD (100% blueprint compliant)
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Assuming you're using React Router
import { getAuth } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import Referral from './Referral';
import StyleSnap from './StyleSnap'; // Your viral feature

const NAVY = '#001F3F';
const GOLD = '#B8860B';

export default function UserDashboard() {
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const [showStyleSnap, setShowStyleSnap] = useState(false);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      getDoc(doc(db, 'users', user.uid))
        .then(snapshot => {
          setUserData(snapshot.data() || {});
        })
        .catch(err => {
          console.error('Failed to load user data', err);
          alert('Failed to load your data – check connection');
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  const stylesLeft = 10 - (userData.stylesUsed || 0);

  if (!user) {
    return <div style={{textAlign:'center', padding:'4rem', fontFamily:'Montserrat'}}>Please log in</div>;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      color: 'white',
      fontFamily: 'Montserrat, sans-serif',
      paddingBottom: '4rem'
    }}>
      {/* Premium Header */}
      <header style={{
        background: NAVY,
        padding: '3rem 1rem 4rem',
        textAlign: 'center',
        borderBottom: `4px solid ${GOLD}`
      }}>
        <h1 style={{fontSize: '3rem', fontWeight: '800', margin: '0 0 0.5rem'}}>
          My ESDRAS
        </h1>
        <p style={{fontSize: '1.5rem', opacity: 0.9}}>
          Welcome back, {user.displayName || 'Groomer'}!
        </p>
      </header>

      <div style={{maxWidth: '1000px', margin: '0 auto', padding: '0 1rem'}}>

        {/* Stats Card */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(10px)',
          border: `1px solid rgba(184,134,11,0.2)`,
          borderRadius: '20px',
          padding: '2rem',
          margin: '2rem 0'
        }}>
          <h2 style={{color: GOLD, fontSize: '2rem', margin: '0 0 1.5rem'}}>Your Progress</h2>
          
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', fontSize: '1.2rem'}}>
            <div>
              <strong>Free Styles Left</strong><br/>
              <span style={{fontSize: '2rem', color: stylesLeft > 3 ? GOLD : '#ff6b6b'}}>
                {stylesLeft}/10
              </span>
              {stylesLeft <= 3 && <p style={{margin: '0.5rem 0 0', fontSize: '0.9rem', opacity: 0.8}}>
                Refer friends or upgrade for unlimited!
              </p>}
            </div>
            <div><strong>Bookings Made:</strong> {userData.bookings?.length || 0}</div>
            <div><strong>Credits Earned:</strong> {userData.credits || 0}</div>
            <div><strong>Friends Referred:</strong> {userData.referredCount || 0}</div>
          </div>
        </div>

        {/* Viral Feature Promos */}
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', margin: '3rem 0'}}>
          {/* StyleSnap Entry */}
          <button
            onClick={() => setShowStyleSnap(true)}
            style={{
              background: GOLD,
              color: 'black',
              border: 'none',
              borderRadius: '20px',
              padding: '2rem',
              fontSize: '1.4rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            📸 StyleSnap AI<br/>Import Any Hairstyle
          </button>

          <Link
            to="/styles"
            style={{
              background: NAVY,
              color: 'white',
              textDecoration: 'none',
              border: `3px solid ${GOLD}`,
              borderRadius: '20px',
              padding: '2rem',
              textAlign: 'center',
              fontSize: '1.4rem',
              fontWeight: 'bold',
              display: 'block'
            }}
          >
            💇 Try New Styles<br/>From Your Library
          </Link>
        </div>

        {/* Referral Section */}
        <div style={{marginTop: '3rem'}}>
          <Referral user={user} />
        </div>
      </div>

      {/* StyleSnap Modal */}
      {showStyleSnap && (
        <StyleSnap
          onClose={() => setShowStyleSnap(false)}
          onStyleImported={(newStyle) => {
            // Optional: refresh userData or show toast
            setShowStyleSnap(false);
            alert(`${newStyle.name} imported & ready!`);
          }}
        />
      )}

      {loading && (
        <div style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'grid', placeItems: 'center', zIndex: 9999}}>
          <p style={{fontSize: '1.5rem'}}>Loading your dashboard...</p>
        </div>
      )}
    </div>
  );
      }
