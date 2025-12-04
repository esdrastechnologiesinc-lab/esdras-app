// src/components/home.jsx — FINAL ESDRAS HOME (lowercase + 100% blueprint compliant)
import React from 'react';
import { Link } from 'react-router-dom';
import StyleSnap from './StyleSnap';

const NAVY = '#001F3F';
const GOLD = '#B8860B';

export default function Home({ user }) {
  const [showStyleSnap, setShowStyleSnap] = React.useState(false);

  // logged-out hero for new users
  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        background: NAVY,
        color: 'white',
        fontFamily: 'Montserrat, sans-serif',
        textAlign: 'center',
        padding: '2rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <h1 style={{fontSize: '3.5rem', fontWeight: '800', color: GOLD, margin: '0 0 1rem'}}>
          esdras
        </h1>
        <p style={{fontSize: '1.8rem', maxWidth: '800px', margin: '0 auto 3rem', opacity: 0.9}}>
          see any hairstyle on your exact head<br/>
          in seconds — powered by real-time ai
        </p>

        {/* hero cta grid */}
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', maxWidth: '800px', margin: '0 auto 4rem'}}>
          <Link
            to="/scan"
            style={{
              background: GOLD,
              color: 'black',
              padding: '2.5rem',
              borderRadius: '24px',
              textDecoration: 'none',
              fontSize: '1.6rem',
              fontWeight: 'bold'
            }}
          >
            📸 scan your head now<br/>
            <span style={{fontSize: '1rem', opacity: 0.8}}>takes 30 seconds</span>
          </Link>

          <button
            onClick={() => setShowStyleSnap(true)}
            style={{
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              border: `3px solid ${GOLD}`,
              padding: '2.5rem',
              borderRadius: '24px',
              fontSize: '1.6rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            ✂️ import any hairstyle<br/>
            <span style={{fontSize: '1rem', opacity: 0.8}}>stylesnap ai</span>
          </button>
        </div>

        <p style={{opacity: 0.7, fontSize: '1.1rem'}}>
          join thousands of groomers in lagos already styling smarter
        </p>

        {showStyleSnap && (
          <StyleSnap
            onClose={() => setShowStyleSnap(false)}
            onStyleImported={() => setShowStyleSnap(false)}
          />
        )}
      </div>
    );
  }

  // logged-in welcome dashboard
  return (
    <div style={{
      minHeight: '100vh',
      background: NAVY,
      color: 'white',
      fontFamily: 'Montserrat, sans-serif',
      padding: '2rem 1rem',
      textAlign: 'center'
    }}>
      <h1 style={{fontSize: '3rem', fontWeight: '800', color: GOLD, margin: '2rem 0 1rem'}}>
        welcome back, {user.displayName?.split(' ')[0] || 'groomer'} 👑
      </h1>
      <p style={{fontSize: '1.6rem', opacity: 0.9, marginBottom: '4rem'}}>
        your 3d head is ready — time to level up
      </p>

      {/* quick actions */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', maxWidth: '1000px', margin: '0 auto'}}>
        <Link
          to="/styles"
          style={{
            background: GOLD,
            color: 'black',
            padding: '3rem 2rem',
            borderRadius: '24px',
            textDecoration: 'none',
            fontSize: '1.7rem',
            fontWeight: 'bold'
          }}
        >
          💇 try new styles<br/>
          <span style={{fontSize: '1.1rem', opacity: 0.8}}>from your library</span>
        </Link>

        <button
          onClick={() => setShowStyleSnap(true)}
          style={{
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            border: `3px solid ${GOLD}`,
            padding: '3rem 2rem',
            borderRadius: '24px',
            fontSize: '1.7rem',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          📸 stylesnap ai<br/>
          <span style={{fontSize: '1.1rem', opacity: 0.8}}>import any hairstyle instantly</span>
        </button>

        <Link
          to="/dashboard"
          style={{
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            border: `3px solid ${GOLD}`,
            padding: '3rem 2rem',
            borderRadius: '24px',
            textDecoration: 'none',
            fontSize: '1.7rem',
            fontWeight: 'bold'
          }}
        >
          📊 my dashboard<br/>
          <span style={{fontSize: '1.1rem', opacity: 0.8}}>stats • referrals • credits</span>
        </Link>
      </div>

      {showStyleSnap && (
        <StyleSnap
          onClose={() => setShowStyleSnap(false)}
          onStyleImported={() => setShowStyleSnap(false)}
        />
      )}
    </div>
  );
        }
