// src/components/styles.jsx — FINAL ESDRAS STYLES (REAL AI + esdras-app project + women-ready)
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// Firestore Imports
import { doc, onSnapshot, updateDoc, increment, collection, getDoc } from 'firebase/firestore';
import { db, auth, app } from '../firebase'; // Ensure 'app' is imported
// Function Imports
import { getFunctions, httpsCallable } from "firebase/functions";

import ImportStyle from './importstyle';
import BookingModal from './booking-modal';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';


const NAVY = '#001F3F';
const GOLD = '#B8860B';

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
  const [error, setError] = useState(null); // Added for displaying errors in the UI

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
      
      // CRITICAL CHECK: Use lastScanUrl (which we added in scan.jsx)
      if (!data.lastScanUrl) { 
        navigate('/scan');
        return;
      }
      
      // Calculate free previews remaining
      setFreeRemaining(Math.max(0, 10 - (data.stylesUsed || 0)));
      
      if (data.gender) setGenderFilter(data.gender);
    });

    // Fetches styles dynamically from Firestore
    const unsubStyles = onSnapshot(collection(db, 'styles'), (snap) => {
      setStyles(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubUser(); unsubStyles(); };
  }, [navigate]);

  const filteredStyles = styles.filter(s => 
    genderFilter === 'all' || s.gender === genderFilter || !s.gender
  );

  // 🛑 REPLACED: Now includes robust billing, usage calculation, and rollback logic 🛑
  const tryStyle = async (style) => {
    const userRef = doc(db, 'users', auth.currentUser.uid);
    setError(null); // Clear previous errors
    
    // 1. Calculate Total Available Renders
    const availableRenders = Math.max(0, 10 - (userData.stylesUsed || 0)) + (userData.extraPreviews || 0);

    // 2. Check Limits
    if (!isPremium && availableRenders <= 0) {
        navigate('/checkout'); // Direct to payment screen
        return;
    }

    setCurrentStyle(style);
    setFrontViewImage(null);
    setRendering(true);

    try {
        const headImageUrl = userData?.lastScanUrl;
        
        if (!headImageUrl || !style.imageUrl) {
            alert('Missing image data. Complete scan and ensure style has an image.');
            setRendering(false);
            return;
        }

        // --- USAGE DECREMENT LOGIC ---
        let fieldToDecrement = '';
        if (userData.extraPreviews > 0) {
            fieldToDecrement = 'extraPreviews'; // Prioritize paid previews
        } else if (availableRenders > 0) { 
            fieldToDecrement = 'stylesUsed'; // Fall back to free previews
        }

        // 3. ATOMICALLY DECREMENT USAGE *BEFORE* AI CALL (Protecting your budget)
        if (fieldToDecrement) {
            if (fieldToDecrement === 'extraPreviews') {
                await updateDoc(userRef, {
                    extraPreviews: increment(-1) 
                });
            } else if (fieldToDecrement === 'stylesUsed') {
                // Increment used count for free previews (stylesUsed: 0 -> 1)
                await updateDoc(userRef, {
                    stylesUsed: increment(1)
                });
            }
        }
        
        // --- AI RENDER CALL ---
        const hairType = style.hairType || 'coiled'; 

        const response = await renderHairCallable({
            headImageUrl: headImageUrl,
            hairstyleImageUrl: style.imageUrl, 
            hairType: hairType,
        });

        const { renderedImage } = response.data;
        
        if (!renderedImage) {
            throw new Error('AI render failed to return an image URL.');
        }
        
        setFrontViewImage(renderedImage);
        
        // Success: Usage remains decremented.

    } catch (err) {
        console.error('AI Error:', err.code, err.message);
        const userFacingMessage = err.message.includes('permission-denied') ? 
                                    "Permission Error: Please ensure you are logged in." : 
                                    `Rendering failed: ${err.message}.`;
        
        setError(userFacingMessage);

        // 4. ROLLBACK (If the AI call failed, restore the usage count)
        if (fieldToDecrement) {
            if (fieldToDecrement === 'extraPreviews') {
                await updateDoc(userRef, { extraPreviews: increment(1) });
            } else if (fieldToDecrement === 'stylesUsed') {
                await updateDoc(userRef, { stylesUsed: increment(-1) });
            }
        }
        
        // Inform the user about the restored count
        alert(`AI rendering failed. Your preview count has been restored. ${userFacingMessage}`);
        setFrontViewImage(null); // Clear image on failure
    } finally {
        setRendering(false);
    }
  };
  // 🛑 END tryStyle FUNCTION 🛑

  return (
    <div style={{
      minHeight: '100vh',
      background: NAVY,
      color: 'white',
      fontFamily: 'Montserrat, sans-serif',
      padding: '1rem'
    }}>
      {/* Header and Counters */}
      <h1 style={{ textAlign: 'center', color: GOLD, fontSize: '2.5rem', margin: '1rem 0' }}>
          Choose Your Style
      </h1>
      
      <p style={{textAlign: 'center', marginBottom: '1.5rem', fontSize: '1.1rem'}}>
          {isPremium ? 
              <span style={{color: '#4CAF50', fontWeight: 'bold'}}>✅ Premium Unlimited Renders</span> :
              <span style={{color: GOLD}}>
                🆓 Free Renders: {freeRemaining} | Paid Previews: {userData.extraPreviews || 0}
              </span>
          }
          {!isPremium && freeRemaining === 0 && userData.extraPreviews === 0 && (
            <span style={{display: 'block', color: 'red', marginTop: '5px'}}>Out of previews. <span onClick={() => navigate('/checkout')} style={{textDecoration: 'underline', cursor: 'pointer'}}>Buy More</span></span>
          )}
      </p>


      {/* Filters/Gender */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <button onClick={() => setGenderFilter('all')} style={{ margin: '0 5px', background: genderFilter === 'all' ? GOLD : '#444', color: genderFilter === 'all' ? NAVY : 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>All</button>
          <button onClick={() => setGenderFilter('women')} style={{ margin: '0 5px', background: genderFilter === 'women' ? GOLD : '#444', color: genderFilter === 'women' ? NAVY : 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>Women</button>
          <button onClick={() => setGenderFilter('men')} style={{ margin: '0 5px', background: genderFilter === 'men' ? GOLD : '#444', color: genderFilter === 'men' ? NAVY : 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>Men</button>
      </div>

      {/* Error Display */}
      {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '1rem' }}>Error: {error}</p>}
      
      {/* Style Grid */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center', paddingBottom: '2rem' }}>
          {filteredStyles.map(style => (
              <div 
                  key={style.id} 
                  onClick={() => tryStyle(style)}
                  style={{
                      width: '150px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      border: `3px solid ${currentStyle?.id === style.id ? GOLD : 'transparent'}`,
                      borderRadius: '10px',
                      overflow: 'hidden',
                      transition: 'border 0.2s',
                      opacity: rendering ? 0.5 : 1 // Dim styles while rendering
                  }}
              >
                  <img 
                      src={style.imageUrl} 
                      alt={style.name} 
                      style={{ width: '100%', height: '150px', objectFit: 'cover' }} 
                  />
                  <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: 'white' }}>{style.name}</p>
              </div>
          ))}
      </div>

      {/* Result & Rendering Display */}
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          {/* User's Head Image Preview (optional but helpful) */}
          {userData.lastScanUrl && !frontViewImage && !rendering && (
              <p style={{opacity: 0.7, marginBottom: '1rem'}}>
                  Your Scanned Head is Ready: 
                  <img 
                      src={userData.lastScanUrl} 
                      alt="Your Scanned Head" 
                      style={{ width: '60px', height: '60px', borderRadius: '50%', border: `2px solid ${GOLD}`, marginLeft: '10px' }} 
                  />
              </p>
          )}

          {rendering && (
              <div style={{ padding: '2rem', border: `1px solid ${GOLD}`, borderRadius: '10px', maxWidth: '400px', margin: '2rem auto' }}>
                  <h3 style={{ color: GOLD }}>AI Rendering In Progress...</h3>
                  <p>This takes 30-40 seconds. Please wait.</p>
                  <div className="spinner" style={{ width: '50px', height: '50px', border: '6px solid #f3f3f3', borderTop: `6px solid ${GOLD}`, borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '15px auto' }} />
              </div>
          )}

          {frontViewImage && !rendering && (
              <div style={{ marginTop: '2rem' }}>
                  <h3 style={{ color: GOLD }}>Your Final Try-On</h3>
                  <img 
                      src={frontViewImage} 
                      alt="Rendered Hairstyle" 
                      style={{ maxWidth: '90%', maxHeight: '500px', borderRadius: '16px', border: `6px solid ${GOLD}` }} 
                  />
              </div>
          )}
      </div>

      {/* Modal Placeholders */}
      {showImport && <ImportStyle onClose={() => setShowImport(false)} />}
      {showBooking && <BookingModal onClose={() => setShowBooking(false)} />}
      
      {/* Spinner Keyframe CSS for the loading animation */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
      }
                        
