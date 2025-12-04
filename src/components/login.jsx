// src/components/login.jsx — FINAL ESDRAS LOGIN (referral-ready + premium branding + 100% blueprint)
import React, { useState, useEffect } from 'react';
import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { handleReferralLink } from '../utils/referral';
import { useNavigate } from 'react-router-dom';

const NAVY = '#001F3F';
const GOLD = '#B8860B';

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) {
        handleReferralLink(user.uid);
        navigate('/styles');
      }
    });
    return unsub;
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await createUserProfile(result.user);
      await handleReferralLink(result.user.uid);
      // Clean URL after processing referral
      window.history.replaceState({}, '', window.location.pathname);
      navigate('/styles');
    } catch (err) {
      setError('Google sign-in failed — try again');
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email || !password || (isSignup && !name)) return;

    setLoading(true);
    setError('');
    try {
      let userCredential;
      if (isSignup) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await userCredential.user.updateProfile({ displayName: name });
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }

      const user = userCredential.user;
      await createUserProfile(user);
      await handleReferralLink(user.uid);
      window.history.replaceState({}, '', window.location.pathname);
      navigate('/styles');
    } catch (err) {
      setError(isSignup ? 'Sign-up failed — try again' : 'Wrong email or password');
      setLoading(false);
    }
  };

  const createUserProfile = async (user) => {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      displayName: user.displayName || name || 'King',
      email: user.email,
      createdAt: serverTimestamp(),
      stylesUsed: 0,
      extraPreviews: 0,
      successfulReferrals: 0,
      hasCompletedFirstBooking: false
    }, { merge: true });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: NAVY,
      color: 'white',
      fontFamily: 'Montserrat, sans-serif',
      display: 'grid',
      placeItems: 'center',
      padding: '1rem'
    }}>
      <div style={{maxWidth: '420px', width: '100%', textAlign: 'center'}}>
        <h1 style={{fontSize: '3.5rem', fontWeight: '800', color: GOLD, margin: '0 0 0.5rem'}}>
          esdras
        </h1>
        <p style={{fontSize: '1.6rem', opacity: 0.9, margin: '0 0 2rem'}}>
          {isSignup ? 'join the precision grooming revolution' : 'welcome back, king'}
        </p>

        <form onSubmit={handleEmailAuth} style={{marginBottom: '2rem'}}>
          {isSignup && (
            <input
              type="text"
              placeholder="your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '1.4rem',
                margin: '0.8rem 0',
                borderRadius: '16px',
                border: 'none',
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                fontSize: '1.1rem',
                outline: 'none'
              }}
            />
          )}

          <input
            type="email"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '1.4rem',
              margin: '0.8rem 0',
              borderRadius: '16px',
              border: 'none',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              fontSize: '1.1rem',
              outline: 'none'
            }}
          />

          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '1.4rem',
              margin: '0.8rem 0',
              borderRadius: '16px',
              border: 'none',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              fontSize: '1.1rem',
              outline: 'none'
            }}
          />

          {error && <p style={{color: '#FFD700', margin: '1rem 0'}}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: GOLD,
              color: 'black',
              padding: '1.5rem',
              border: 'none',
              borderRadius: '50px',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              margin: '1.5rem 0',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'processing...' : (isSignup ? 'create account' : 'log in')}
          </button>
        </form>

        <div style={{margin: '2rem 0', opacity: 0.7}}>or</div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{
            width: '100%',
            background: 'white',
            color: NAVY,
            padding: '1.5rem',
            border: 'none',
            borderRadius: '50px',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            margin: '0 auto'
          }}
        >
          <img src="/google-logo.svg" alt="Google" style={{height: '24px'}} />
          continue with google
        </button>

        <p style={{marginTop: '2.5rem', opacity: 0.7, fontSize: '1rem'}}>
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsSignup(!isSignup)}
            style={{background: 'none', border: 'none', color: GOLD, fontWeight: 'bold', cursor: 'pointer'}}
          >
            {isSignup ? 'log in' : 'sign up'}
          </button>
        </p>

        <p style={{marginTop: '3rem', opacity: 0.5, fontSize: '0.9rem'}}>
          by continuing, you agree to our terms • lagos precision grooming
        </p>
      </div>
    </div>
  );
             }
