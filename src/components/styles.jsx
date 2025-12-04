// src/components/styles.jsx — FINAL ESDRAS STYLES (booking modal + viral what-if + front-view share + 100% blueprint)
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, onSnapshot, updateDoc, increment, collection } from 'firebase/firestore';
import { db, auth } from '../firebase';
import ImportStyle from './importstyle';
import BookingModal from './booking-modal';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useScreenshot } from 'use-react-screenshot';

const NAVY = '#001F3F';
const GOLD = '#B8860B';

export default function Styles() {
  const [styles, setStyles] = useState([]);
  const [currentStyle, setCurrentStyle] = useState(null);
  const [userData, setUserData] = useState({});
  const [isPremium, setIsPremium] = useState(false);
  const [freeRemaining, setFreeRemaining] = useState(10);
  const [showImport, setShowImport] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [frontViewImage, setFrontViewImage] = useState(null); // viral share image

  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [_, takeScreenshot] = useScreenshot();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/login');
      return;
    }

    const userRef = doc(db, 'users', user.uid);
    const unsubUser = onSnapshot(userRef, (snap) => {
      const data = snap.data() || {};
      setUserData(data);
      setIsPremium(data.subscription === 'premium_yearly');
      if (!data.has3DMesh) {
        navigate('/scan');
        return;
      }
      setFreeRemaining(Math.max(0, 10 - (data.stylesUsed || 0)));
    });

    const unsubStyles = onSnapshot(collection(db, 'styles'), (snap) => {
      setStyles(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubUser(); unsubStyles(); };
  }, [navigate]);

  const tryStyle = async (style) => {
    if (!isPremium && freeRemaining <= 0) {
      navigate('/checkout');
      return;
    }

    setCurrentStyle(style);

    // Capture front-view screenshot for viral sharing
    setTimeout(async () => {
      const img = await takeScreenshot(canvasRef.current);
      setFrontViewImage(img);
    }, 800); // wait for render + auto-rotate

    if (!isPremium && freeRemaining > 0) {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        stylesUsed: increment(1)
      });
    }
  };

  const openBooking = () => setShowBooking(true);

  return (
    <div style={{
      minHeight: '100vh',
      background: NAVY,
      color: 'white',
      fontFamily: 'Montserrat, sans-serif',
      padding: '1rem'
    }}>
      <h1 style={{textAlign:'center', color:GOLD, fontSize:'2.8rem', fontWeight:'800', margin:'2rem 0'}}>
        choose your next look
      </h1>

      {/* free / premium counter */}
      {!isPremium && (
        <div style={{textAlign:'center', margin:'2rem 0', padding:'1.5rem', background:'rgba(184,134,11,0.2)', borderRadius:'20px', border:`2px solid ${GOLD}`}}>
          <p style={{margin:0, fontSize:'1.5rem'}}>
            {freeRemaining} free try-ons remaining<br/>
            <span style={{fontSize:'1rem', opacity:0.8}}>upgrade for unlimited • ₦15,000/year</span>
          </p>
        </div>
      )}

      {/* stylesnap entry */}
      <div style={{textAlign:'center', margin:'3rem 0'}}>
        <button onClick={() => setShowImport(true)} style={{
          background:GOLD, color:'black', padding:'1.8rem 5rem', border:'none', borderRadius:'50px',
          fontSize:'1.6rem', fontWeight:'bold'
        }}>
          📸 stylesnap ai • import any hairstyle
        </button>
      </div>

      {/* style grid */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px,1fr))', gap:'2rem', padding:'0 1rem'}}>
        {styles.length === 0 ? (
          <p style={{gridColumn:'1/-1', textAlign:'center', opacity:0.7}}>loading styles...</p>
        ) : (
          styles.map(s => (
            <div key={s.id} onClick={() => tryStyle(s)} style={{cursor:'pointer', textAlign:'center'}}>
              <img src={s.image} alt={s.name} style={{width:'100%', borderRadius:'20px', border:`4px solid ${GOLD}`}} />
              <p style={{margin:'0.8rem 0', fontWeight:'bold', fontSize:'1.2rem'}}>{s.name.toLowerCase()}</p>
            </div>
          ))
        )}
      </div>

      {/* 360° preview + actions */}
      {currentStyle && (
        <div style={{margin:'4rem 0', textAlign:'center'}}>
          <h2 style={{color:GOLD, fontSize:'2rem'}}>now trying: {currentStyle.name.toLowerCase()}</h2>

          {/* 3D Canvas – front view captured automatically */}
          <div ref={canvasRef} style={{
            height:'560px', background:'black', borderRadius:'24px', overflow:'hidden',
            border:`6px solid ${GOLD}`, margin:'2rem auto', maxWidth:'560px'
          }}>
            <Canvas>
              <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
              <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.5} />
              <ambientLight intensity={1} />
              <directionalLight position={[10, 10, 5]} intensity={1.5} />
              {/* Replace with real HeadMesh + HairOverlay */}
              <mesh>
                <sphereGeometry args={[1.8, 64, 64]} />
                <meshStandardMaterial color="#8B4513" />
              </mesh>
            </Canvas>
          </div>

          <div style={{display:'flex', gap:'1.5rem', justifyContent:'center', flexWrap:'wrap'}}>
            <button
              onClick={openBooking}
              style={{
                background:GOLD, color:'black', padding:'1.5rem 4rem',
                border:'none', borderRadius:'50px', fontSize:'1.5rem', fontWeight:'bold'
              }}
            >
              book this style now
            </button>

            <a
              href={frontViewImage || '#'}
              download={`esdras-${currentStyle.name.toLowerCase()}.png`}
              onClick={(e) => {
                if (!frontViewImage) e.preventDefault();
              }}
              style={{
                background:'white', color:NAVY, padding:'1.5rem 4rem',
                border:'none', borderRadius:'50px', fontSize:'1.5rem', fontWeight:'bold',
                textDecoration:'none'
              }}
            >
              download what-if image
            </a>
          </div>

          <p style={{opacity:0.7, marginTop:'1.5rem'}}>
            share with “should i do this?” → watch it go viral
          </p>
        </div>
      )}

      {/* Booking Modal – passes the viral front-view image */}
      {showBooking && currentStyle && (
        <BookingModal
          barber={{ id: 'nearest', name: 'Your Nearest ESDRAS Barber', shopName: 'Premium ESDRAS Partner' }}
          styleName={currentStyle.name}
          renderedImageUrl={frontViewImage}
          onClose={() => setShowBooking(false)}
        />
      )}

      {/* stylesnap modal */}
      {showImport && (
        <ImportStyle
          onClose={() => setShowImport(false)}
          onStyleImported={(newStyle) => {
            setCurrentStyle(newStyle);
            setShowImport(false);
          }}
        />
      )}
    </div>
  );
                                   }
