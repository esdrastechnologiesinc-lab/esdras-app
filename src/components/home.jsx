import React from 'react';
import { Link } from 'react-router-dom';

export default function Home({ user }) {
  return (
    <div style={{ textAlign: 'center', marginTop: '4rem' }}>
      <h2>Welcome back, {user?.displayName || user?.email}!</h2>
      <p>Your 3D head mesh is ready.</p>
      <Link to="/styles">
        <button style={{ fontSize: '1.5rem', padding: '1rem 3rem', background: '#B8860B', color: 'white', border: 'none', borderRadius: '12px' }}>
          Try New Hairstyle
        </button>
      </Link>
    </div>
  );
}
