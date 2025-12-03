import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate('/');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '4rem' }}>
      <h2>{isSignup ? 'Create Account' : 'Welcome to ESDRAS'}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'inline-block', padding: '2rem', background: 'white', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ display: 'block', margin: '1rem 0', padding: '1rem', width: '300px', borderRadius: '8px', border: '1px solid #ccc' }}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ display: 'block', margin: '1rem 0', padding: '1rem', width: '300px', borderRadius: '8px', border: '1px solid #ccc' }}
          required
        />
        <button type="submit" style={{ background: '#B8860B', color: 'white', padding: '1rem 2rem', border: 'none', borderRadius: '8px', fontSize: '1.1rem' }}>
          {isSignup ? 'Sign Up' : 'Login'}
        </button>
      </form>
      <p style={{ marginTop: '1rem' }}>
        {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button onClick={() => setIsSignup(!isSignup)} style={{ color: '#B8860B', background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
          {isSignup ? 'Login' : 'Sign Up'}
        </button>
      </p>
    </div>
  );
                  }
