// src/components/login.jsx — FINAL ESDRAS LOGIN (gender for women + referral-ready)
import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
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
  const [gender, setGender] = useState(''); // new for women
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
      await setDoc(doc(db, 'users', user.uid), {
        displayName: name || user.displayName,
        gender, // save gender for personalized styles
        createdAt: new Date()
      }, { merge: true });
      navigate('/styles');
    } catch (err) {
      setError(err.message);
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
        displayName: user.displayName,
        gender, // save if set
        createdAt: new Date()
      }, { merge: true });
      navigate('/styles');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{background: NAVY, minHeight: '100vh', color: 'white', padding: '2rem', fontFamily: 'Montserrat, sans-serif'}}>
      <h1 style={{color: GOLD}}>esdras</h1>
      <form onSubmit={handleEmailAuth}>
        {isSignup && (
          <>
            <input type="text" placeholder="name" value={name} onChange={(e) => setName(e.target.value)} />
            <select value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="">gender (optional)</option>
              <option value="male">male</option>
              <option value="female">female</option>
              <option value="other">other</option>
            </select>
          </>
        )}
        <input type="email" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" disabled={loading}>{isSignup ? 'sign up' : 'log in'}</button>
      </form>
      <button onClick={handleGoogleSignIn} disabled={loading}>continue with google</button>
      <p>{isSignup ? 'already have an account? log in' : "don't have an account? sign up"}</p>
      {error && <p>{error}</p>}
    </div>
  );
    }
