// src/components/scan.jsx — FINAL ESDRAS 360° HEAD SCAN + INSTANT HAIR AI RENDER
import React, { useState, useEffect, useRef } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth, app } from '../firebase'; // Ensure 'app' (the initialized Firebase app) is exported from firebase.js
import { useNavigate } from 'react-router-dom';

// 🛑 FUNCTIONS IMPORTS 🛑
import { getFunctions, httpsCallable } from "firebase/functions";
// 🛑 STORAGE IMPORTS 🛑
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";


const NAVY = '#001F3F';
const GOLD = '#B8860B';

// Initialize Firebase services
const functions = getFunctions(app, 'us-central1'); // Use your deployed region
const storage = getStorage(app); 

// Define the callable function once
const renderHairCallable = httpsCallable(functions, 'renderHair');


export default function Scan() {
  const [status, setStatus] = useState('consent'); // consent | environment | scanning | uploading | rendering | done
  const [consent, setConsent] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultImage, setResultImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    const check = async () => {
      const user = auth.currentUser;
      if (!user) { navigate('/'); return; }
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists() && snap.data()?.has3DMesh) {
        navigate('/styles');
      }
    };
    check();
  }, [navigate]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStatus('environment');
      }
    } catch (err) {
      alert('Camera access required for your 3D scan');
    }
  };

  const startRecording = () => {
    if (!consent) return;
    recordedChunks.current = [];
    setProgress(0);

    const stream = videoRef.current.srcObject;
    mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm' });

    mediaRecorderRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunks.current.push(e.data);
    };

    mediaRecorderRef.current.start();
    setStatus('scanning');

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 8000;
      setProgress(Math.min(elapsed * 100, 100));
      if (elapsed >= 1) {
        clearInterval(interval);
        mediaRecorderRef.current.stop();
        // Stop all tracks (this turns off the camera light)
        stream.getTracks().forEach(t => t.stop());
        
        // Trigger the secure function call
        renderHairWithCloudFunction(); 
      }
    }, 50);
  };
  
  // 🛑 NEW: Function to upload the recorded video to Firebase Storage
  const uploadBlobToStorage = async (blob) => {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated for upload.');
    
    // Define the storage path: users/{uid}/scan_{timestamp}.webm
    const filePath = `users/${user.uid}/scan_${Date.now()}.webm`;
    const storageRef = ref(storage, filePath);

    // Upload the file
    await uploadBytes(storageRef, blob, { contentType: 'video/webm' });

    // Get the public URL for the Cloud Function to access
    const publicUrl = await getDownloadURL(storageRef);
    
    return publicUrl;
  };


  // 🛑 UPDATED: Calls the secure Cloud Function with the uploaded URL 🛑
  const renderHairWithCloudFunction = async () => {
    setStatus('uploading');
    setLoading(true);
    const user = auth.currentUser;

    if (!user) {
        console.error("User not authenticated for function call.");
        alert('Authentication error. Please log in again.');
        setLoading(false);
        setStatus('consent');
        return;
    }

    try {
        // 1. UPLOAD THE RECORDED VIDEO/BLOB
        const blob = new Blob(recordedChunks.current, { type: 'video/webm' });
        const headImageUrl = await uploadBlobToStorage(blob); // Get the public URL!

        // 2. CALL THE CLOUD FUNCTION WITH THE URL
        setStatus('rendering');

        // IMPORTANT: The hairstyleImageUrl and hairType should be selected on the /styles page.
        // For now, we use a placeholder for the style image, as the scan is only for the head.
        const hairstyleImageUrl = 'https://i.imgur.com/a-hairstyle-style.jpg'; // REPLACE THIS WITH A REAL STYLE IMAGE LATER
        const hairType = "coiled"; 
        
        const response = await renderHairCallable({
            headImageUrl: headImageUrl, // <-- Uses the actual uploaded URL
            hairstyleImageUrl: hairstyleImageUrl,
            hairType: hairType,
        });

        // 3. PROCESS RESPONSE
        const { renderedImage } = response.data;
        
        setResultImage(renderedImage);
        
        // Update Firestore state indicating the 3D mesh is created
        await setDoc(doc(db, 'users', user.uid), {
          has3DMesh: true,
          stylesUsed: 0,
          extraPreviews: 0
        }, { merge: true });

        setStatus('done');
        setTimeout(() => navigate('/styles'), 4000);

    } catch (e) {
        // Handle Firebase and network errors gracefully
        console.error("Function/Upload Render Failed:", e.code, e.message);
        alert(`Render failed: ${e.message}. Please check your internet connection or console for details.`);
        setStatus('environment');
    }
    setLoading(false);
  };


  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${NAVY}, #0a3d62)`,
      color: 'white',
      fontFamily: 'Montserrat, sans-serif',
      textAlign: 'center',
      padding: '2rem 1rem',
      display: 'grid',
      placeItems: 'center'
    }}>
      <h1 style={{fontSize: '3.5rem', fontWeight: '800', color: GOLD, margin: '0 0 1rem'}}>
        esdras
      </h1>

      {/* Consent */}
      {status === 'consent' && (
        <div style={{maxWidth: '520px'}}>
          <h2 style={{fontSize: '2.4rem', color: GOLD, margin: '1rem 0'}}>one-time 8-second scan</h2>
          <p style={{fontSize: '1.4rem', opacity: 0.9, lineHeight: '1.7'}}>
            unlock <strong>10 free</strong> precision try-ons + unlimited future styles
          </p>
          <label style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', margin: '2rem 0', fontSize: '1.1rem'}}>
            <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} style={{width: '28px', height: '28px'}} />
            <span>i agree to the <a href="/privacy" style={{color: GOLD, textDecoration: 'underline'}}>privacy policy</a> and secure 3d data storage</span>
          </label>
          <button
            onClick={startCamera}
            disabled={!consent}
            style={{
              background: consent ? GOLD : '#444',
              color: 'black',
              padding: '1.6rem 6rem',
              border: 'none',
              borderRadius: '50px',
              fontSize: '1.6rem',
              fontWeight: 'bold',
              opacity: consent ? 1 : 0.6,
              cursor: consent ? 'pointer' : 'not-allowed'
            }}
          >
            start scan
          </button>
        </div>
      )}

      {/* Environment */}
      {status === 'environment' && (
        <div>
          <h2 style={{color: GOLD, fontSize: '2.2rem'}}>perfect conditions</h2>
          <p style={{opacity: 0.9}}>bright even lighting • steady hand • face centered</p>
          <video ref={videoRef} autoPlay playsInline muted style={{
            width: '90%',
            maxWidth: '420px',
            borderRadius: '32px',
            border: `6px solid ${GOLD}`,
            margin: '2rem 0'
          }} />
          <button onClick={startRecording} style={{
            background: GOLD,
            color: 'black',
            padding: '1.6rem 6rem',
            border: 'none',
            borderRadius: '50px',
            fontSize: '1.6rem',
            fontWeight: 'bold'
          }}>
            start 8-second scan
          </button>
        </div>
      )}

      {/* Scanning */}
      {status === 'scanning' && (
        <div>
          <h2 style={{color: GOLD, fontSize: '2.4rem'}}>rotate slowly 360°</h2>
          <p>keep head steady • turn your body</p>
          <div style={{position: 'relative', width: '260px', height: '260px', margin: '3rem auto'}}>
            <svg width="260" height="260" viewBox="0 0 260 260">
              <circle cx="130" cy="130" r="120" stroke="#0a3d62" strokeWidth="20" fill="none"/>
              <circle cx="130" cy="130" r="120" stroke={GOLD} strokeWidth="20" fill="none"
                strokeDasharray={`${progress * 7.54} 754`} transform="rotate(-90 130 130)"/>
            </svg>
            <p style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: '4rem', fontWeight: 'bold', margin: 0}}>
              {Math.round(progress)}%
            </p>
          </div>
          <p style={{opacity: 0.8}}>stay still • keep face in frame</p>
        </div>
      )}

      {/* Rendering / Uploading */}
      {(status === 'uploading' || status === 'rendering') && (
        <div>
          <h2 style={{color: GOLD, fontSize: '2.4rem'}}>{status === 'uploading' ? 'uploading video...' : 'creating your hairstyle...'}</h2>
          <p>{status === 'uploading' ? 'uploading to secure storage' : 'AI rendering ultra-realistic coiled hair with physics (25-40s)'}</p>
          <div style={{width: '220px', height: '220px', border: `16px solid ${GOLD}`, borderTop: '16px solid transparent', borderRadius: '50%', animation: 'spin 1.5s linear infinite', margin: '3rem auto'}} />
        </div>
      )}

      {/* Done */}
      {status === 'done' && (
        <div>
          <h2 style={{color: GOLD, fontSize: '3.5rem', fontWeight: '800'}}>MAGIC!</h2>
          <p style={{fontSize: '1.6rem'}}>your 3D head is ready + first hairstyle rendered</p>
          {resultImage && (
            <img 
              src={resultImage} 
              alt="Your rendered hairstyle"
              style={{ width: '90%', maxWidth: '400px', borderRadius: '32px', margin: '2rem 0', border: `6px solid ${GOLD}` }}
            />
          )}
          <p>redirecting to styles...</p>
        </div>
      )}

      <style jsx>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
            }
        
