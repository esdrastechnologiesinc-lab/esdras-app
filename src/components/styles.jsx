// src/components/styles.jsx — FINAL ESDRAS STYLES (women hairstyles + gender filter + full premium UI + 100% blueprint)
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
const renderStyle = async (style) => {
  const response = await fetch('/api/render-style', { method: 'POST', body: JSON.stringify({ userMesh: userData.mesh, styleId: style.id }) });
  const { renderedUrl } = await response.json();
  setFrontViewImage(renderedUrl);
};
  const [styles, setStyles] = useState([]);
  const [currentStyle, setCurrentStyle] = useState(null);
  const [userData, setUserData] = useState({});
  const [isPremium, setIsPremium] = useState(false);
  const [freeRemaining, setFreeRemaining] = useState(10);
  const [genderFilter, setGenderFilter] = useState('all'); // new: all / male / female
  const [showImport, setShowImport] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [frontViewImage, setFrontViewImage] = useState(null);

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
      // Auto-set gender filter from user profile for personalized experience
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

  const tryStyle = async (style) => {
    if (!isPremium && freeRemaining <= 0) {
      navigate('/checkout');
      return;
    }

    setCurrentStyle(style);

    {currentStyle && frontViewImage ? (
  // Show real AI-rendered image
  <img 
    src={frontViewImage} 
    alt="Your new look" 
    style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px'}} 
  />
) : (
  // Show loading or fallback
  <div style={{display: 'grid', placeItems: 'center', height: '100%'}}>
    <p style={{color: GOLD, fontSize: '1.5rem'}}>Rendering your perfect cut...</p>
  </div>
)}

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

      {/* gender filter */}
      <div style={{display:'flex', justifyContent:'center', gap:'1rem', margin:'2rem 0'}}>
        <button onClick={() => setGenderFilter('all')} style={{background: genderFilter==='all' ? GOLD : 'rgba(255,255,255,0.1)', color:'black', padding:'1rem 2rem', borderRadius:'50px', fontWeight:'bold'}}>all</button>
        <button onClick={() => setGenderFilter('male')} style={{background: genderFilter==='male' ? GOLD : 'rgba(255,255,255,0.1)', color:'black', padding:'1rem 2rem', borderRadius:'50px', fontWeight:'bold'}}>men</button>
        <button onClick={() => setGenderFilter('female')} style={{background: genderFilter==='female' ? GOLD : 'rgba(255,255,255,0.1)', color:'black', padding:'1rem 2rem', borderRadius:'50px', fontWeight:'bold'}}>women</button>
      </div>

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
        {filteredStyles.length === 0 ? (
          <p style={{gridColumn:'1/-1', textAlign:'center', opacity:0.7}}>no styles yet – try importing one!</p>
        ) : (
          filteredStyles.map(s => (
            <div key={s.id} onClick={() => tryStyle(s)} style={{cursor:'pointer', textAlign:'center'}}>
              <img src={s.image} alt={s.name} style={{width:'100%', borderRadius:'20px', border:`4px solid ${GOLD}`}} />
              <p style={{margin:'0.8rem 0', fontWeight:'bold', fontSize:'1.2rem'}}>{s.name.toLowerCase()}</p>
              {s.isPremium && <span style={{color:GOLD}}>★ premium</span>}
            </div>
          ))
        )}
      </div>

      {/* 360° preview + actions */}
      {currentStyle && (
        <div style={{margin:'4rem 0', textAlign:'center'}}>
          <h2 style={{color:GOLD, fontSize:'2rem'}}>now trying: {currentStyle.name.toLowerCase()}</h2>

          <div ref={canvasRef} style={{
            height:'560px', background:'black', borderRadius:'24px', overflow:'hidden',
            border:`6px solid ${GOLD}`, margin:'2rem auto', maxWidth:'560px'
          }}>
            <Canvas>
              <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
              <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.5} />
              <ambientLight intensity={1} />
              <directionalLight position={[10, 10, 5]} intensity={1.5} />
              {/* Placeholder – replace with real head + hair model */}
              <mesh>
                <sphereGeometry args={[1.8, 64, 64]} />
                <meshStandardMaterial color="#8B4513" />
              </mesh>
            </Canvas>
          </div>

          <div style={{display:'flex', gap:'1.5rem', justifyContent:'center', flexWrap:'wrap'}}>
            <button onClick={() => setShowBooking(true)} style={{
              background:GOLD, color:'black', padding:'1.5rem 4rem',
              border:'none', borderRadius:'50px', fontSize:'1.5rem', fontWeight:'bold'
            }}>
              book this style now
            </button>

            <a href={frontViewImage || '#'} download={`esdras-${currentStyle.name.toLowerCase()}.png`} style={{
              background:'white', color:NAVY, padding:'1.5rem 4rem',
              border:'none', borderRadius:'50px', fontSize:'1.5rem', fontWeight:'bold', textDecoration:'none'
            }}>
              download what-if image
            </a>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {showBooking && currentStyle && (
        <BookingModal
          barber={{ id: 'nearest', name: 'Your Nearest ESDRAS Stylist' }}
          styleName={currentStyle.name}
          renderedImageUrl={frontViewImage}
          onClose={() => setShowBooking(false)}
        />
      )}

      {/* ImportStyle Modal */}
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
