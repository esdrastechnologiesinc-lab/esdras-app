import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState(''); // Add error handling
  const navigate = useNavigate();
  let auth; // Declare outside try-catch

  try {
    auth = getAuth();
  } catch (err) {
    setError('Firebase not configured. Contact support.');
    return (
      <div style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h2>Setup in Progress</h2>
        <p>{error}</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '4rem', padding: '2rem' }}>
      <h2 style={{ color: '#001F3F' }}>{isSignup ? 'Create Account' : 'Welcome to ESDRAS'}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'inline-block', padding: '2rem', background: 'white', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', minWidth: '300px' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ display: 'block', margin: '1rem 0', padding: '1rem', width: '100%', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ display: 'block', margin: '1rem 0', padding: '1rem', width: '100%', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          required
        />
        <button 
          type="submit" 
          style={{ 
            background: '#B8860B', 
            color: 'white', 
            padding: '1rem 2rem', 
            border: 'none', 
            borderRadius: '8px', 
            fontSize: '1.1rem',
            width: '100%',
            cursor: 'pointer'
          }}
        >
          {isSignup ? 'Sign Up' : 'Login'}
        </button>
      </form>
      <p style={{ marginTop: '1rem' }}>
        {isSignup ? 'Already have an account?' : "Don't have an account?"} {' '}
        <button 
          onClick={() => setIsSignup(!isSignup)} 
          style={{ color: '#B8860B', background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {isSignup ? 'Login' : 'Sign Up'}
        </button>
      </p>
    </div>
  );
        }
