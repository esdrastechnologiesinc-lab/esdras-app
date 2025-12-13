// src/components/styles.jsx — FINAL ESDRAS STYLES (REAL AI + esdras-app project + women-ready)
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, onSnapshot, updateDoc, increment, collection, getDoc } from 'firebase/firestore';
import { db, auth, app } from '../firebase'; // Ensure 'app' is imported
import ImportStyle from './importstyle';
import BookingModal from './booking-modal';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';

// 🛑 NEW IMPORTS FOR SECURE CALLABLE FUNCTION 🛑
import { getFunctions, httpsCallable } from "firebase/functions";

const NAVY = '#001F3F';
const GOLD = '#B8860B';

// 🛑 REMOVED: No longer needed. We use the SDK function call instead.
// const AI_RENDER_ENDPOINT = '...'; 

// Initialize Firebase Functions service
const functions = getFunctions(app, 'us-central1'); // Use your deployed region
const renderHairCallable = httpsCallable(functions, 'renderHair'); // <--- Correct function name!


export default function Styles() {
  const [styles, setStyles] = useState([]);
  const [currentStyle, setCurrentStyle] = useState(null);
  const [userData, setUserData] = useState({});
  const [isPremium, setIsPremium] = useState(false);
  const [freeRemaining, setFreeRemaining] = useState(10);
  const [genderFilter, setGenderFilter] = useState('all');
  const [showImport, setShowImport] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [frontViewImage, setFrontViewImage] = useState(null);
  const [rendering, setRendering] = useState(false);

  const navigate = useNavigate();
  const canvasRef = useRef(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/login');
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    const unsubUser = onSnapshot(userRef, async (snap) => {
      const data = snap.data() || {};
      setUserData(data);
      setIsPremium(data.subscription === 'premium_yearly');
      
      // 🛑 CRITICAL CHECK: Use lastScanUrl (which we added in scan.jsx)
      if (!data.lastScanUrl) { 
        navigate('/scan');
        return;
      }
      
      setFreeRemaining(Math.max(0, 10 - (data.stylesUsed || 0)));
      
      if (data.gender) setGenderFilter(data.gender);
    });

    const unsubStyles = onSnapshot(collection(db, 'styles'), (snap) => {
      setStyles(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubUser(); unsubStyles(); };
  }, [navigate]);

  const filteredStyles = styles.filter(s => 
    genderFilter === 'all' || s.gender === genderFilter || !s.gender
  );

  // 🛑 REWRITTEN: Now uses the secure renderHairCallable function 🛑
  const tryStyle = async (style) => {
    // 1. Check Limits
    if (!isPremium && freeRemaining <= 0) {
      navigate('/checkout');
      return;
    }

    setCurrentStyle(style);
    setFrontViewImage(null);
    setRendering(true);

    try {
      const userSnap = await getDoc(doc(db, 'users', auth.currentUser.uid));
      const userData = userSnap.data();

      // 🛑 Use the saved head image URL 🛑
      const headImageUrl = userData?.lastScanUrl;
      
      // Ensure we have both required URLs
      if (!headImageUrl || !style.imageUrl) {
        alert('Missing image data. Complete scan and ensure style has an image.');
        setRendering(false);
        return;
      }

      // Determine hair type (default to 'coiled' if style data is missing it)
      const hairType = style.hairType || 'coiled'; 

      // 2. Call the Secure Cloud Function
      const response = await renderHairCallable({
        headImageUrl: headImageUrl,
        hairstyleImageUrl: style.imageUrl, // Assuming style.imageUrl holds the style's URL
        hairType: hairType,
      });

      // Response structure: response.data contains the return object from index.js
      const { renderedImage } = response.data;
      
      if (!renderedImage) {
        throw new Error('AI render failed to return an image URL.');
      }
      
      setFrontViewImage(renderedImage);

      // 3. Decrement Usage (If not premium)
      if (!isPremium) {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          stylesUsed: increment(1)
        });
      }
      
    } catch (err) {
      // Handles errors thrown by the Cloud Function (e.g., HttpsError)
      console.error('AI Error:', err.code, err.message);
      alert(`AI rendering busy or failed: ${err.message}. Using placeholder.`);
      setFrontViewImage('/fallback-tryon.jpg'); // Fallback on failure
    } finally {
      setRendering(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: NAVY,
      color: 'white',
      fontFamily: 'Montserrat, sans-serif',
      padding: '1rem'
    }}>
      {/* This is where you would display your UI. Since I don't have the full JSX,
        I'm leaving a placeholder comment. Ensure your style grid calls the
        tryStyle(style) function when a user selects an item.
      */}
      
      <header>...</header>
      <div className="filters">
        {/* Gender filters call setGenderFilter */}
      </div>

      <div className="style-grid">
        {filteredStyles.map(style => (
          <div key={style.id} onClick={() => tryStyle(style)}>
            {/* Display style image, name, etc. */}
          </div>
        ))}
      </div>
      
      {/* Display Rendered Image */}
      {rendering && <p>AI Rendering in progress...</p>}
      {frontViewImage && (
          <img src={frontViewImage} alt="Rendered Hairstyle" style={{ width: '100%', maxWidth: '500px', margin: '20px auto' }} />
      )}

      {showImport && <ImportStyle onClose={() => setShowImport(false)} />}
      {showBooking && <BookingModal onClose={() => setShowBooking(false)} />}
    </div>
  );
}
