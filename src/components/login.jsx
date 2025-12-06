// src/components/login.jsx — FINAL ESDRAS LOGIN (gender for women + referral-ready + full premium UI)
import React, { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { handleReferralLink } from '../utils/referral';
import { useNavigate } from 'react-router-dom';

const NAVY = '#001F3F';
const GOLD = '#B8860B';

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState(''); // new: for personalized women/men styles
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Auto-redirect if already logged in + handle referral link
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (u) {
        handleReferralLink(u.uid);
        window.history.replaceState({}, '', window.location.pathname);
        navigate('/styles');
      }
    });
    return unsub;
  }, [navigate]);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let userCredential;
      if (isSignup) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await userCredential.user.updateProfile({ displayName: name });
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }

      const user = userCredential.user;

      // Save profile data (including gender for women styles)
      await setDoc(doc(db, 'users', user.uid), {
        displayName: name || user.displayName || 'King',
        gender: gender || null,
        createdAt: serverTimestamp(),
        extraPreviews: 0,
        stylesUsed: 0,
        successfulReferrals: 0,
        hasCompletedFirstBooking: false
      }, { merge: true });

      navigator.geolocation.getCurrentPosition(pos => {
  setDoc(doc(db, 'users', user.uid), { location: { lat: pos.coords.latitude, lng: pos.coords.longitude } });
});

      handleReferralLink(user.uid);
      window.history.replaceState({}, '', window.location.pathname);
      navigate('/styles');
    } catch (err) {
      setError(err.message.includes('wrong-password') || err.message.includes('user-not-found')
        ? 'invalid email or password'
        : err.message);
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await setDoc(doc(db, 'users', user.uid), {
        displayName: user.displayName || 'King',
        gender: gender || null,
        createdAt: serverTimestamp(),
        extraPreviews: 0,
        stylesUsed: 0,
        successfulReferrals: 0,
        hasCompletedFirstBooking: false
      }, { merge: true });

      handleReferralLink(user.uid);
      window.history.replaceState({}, '', window.location.pathname);
      navigate('/styles');
    } catch (err) {
      setError('google sign-in failed – try again');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: NAVY,
      color: 'white',
      fontFamily: 'Montserrat, sans-serif',
      display: 'grid',
      placeItems: 'center',
      padding: '2rem 1rem'
    }}>
      <div style={{maxWidth: '420px', width: '100%', textAlign: 'center'}}>
        <h1 style={{fontSize: '3.5rem', fontWeight: '800', color: GOLD, margin: '0 0 0.5rem'}}>
          esdras
        </h1>
        <p style={{fontSize: '1.6rem', opacity: 0.9, margin: '0 0 2rem'}}>
          {isSignup ? 'join the precision grooming revolution' : 'welcome back, king'}
        </p>

        {error && <p style={{color: '#ff6b6b', background: 'rgba(255,107,107,0.2)', padding: '1rem', borderRadius: '12px', marginBottom: '1rem'}}>{error}</p>}

        <form onSubmit={handleEmailAuth} style={{marginBottom: '2rem'}}>
          {isSignup && (
            <>
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
                  fontSize: '1.1rem'
                }}
              />
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                style={{
                  width: '100%',
                  padding: '1.4rem',
                  margin: '0.8rem 0',
                  borderRadius: '16px',
                  border: 'none',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  fontSize: '1.1rem'
                }}
              >
                <option value="">gender (optional – for better styles)</option>
                <option value="male">male</option>
                <option value="female">female</option>
                <option value="other">other</option>
              </select>
            </>
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
              fontSize: '1.1rem'
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
              fontSize: '1.1rem'
            }}
          />

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
            fontWeight: 'bold'
          }}
        >
          continue with google
        </button>

        <p style={{marginTop: '2.5rem', opacity: 0.7, fontSize: '1rem'}}>
          {isSignup ? 'already have an account?' : "don't have an account?"} {' '}
          <button
            onClick={() => setIsSignup(!isSignup)}
            style={{background: 'none', border: 'none', color: GOLD, fontWeight: 'bold', cursor: 'pointer'}}
          >
            {isSignup ? 'log in' : 'sign up'}
          </button>
        </p>
      </div>
    </div>
  );
      }
