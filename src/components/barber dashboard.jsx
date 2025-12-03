import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../firebase';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';

export default function BarberDashboard() {
  const [barber, setBarber] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const auth = getAuth();

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const barberRef = doc(db, 'barbers', user.uid);
        const snap = await getDoc(barberRef);
        if (snap.exists()) {
          setBarber({ id: user.uid, ...snap.data() });
          loadBookings();
        } else {
          // First time barber — create profile
          await setDoc(barberRef, {
            name: user.displayName || "Pro Barber",
            shop: "Your Shop Name",
            location: "Lagos, Nigeria",
            specialty: "Fades & Afro",
            rating: 4.9,
            price: "$$",
            videoReels: [],
            createdAt: new Date()
          });
          setBarber({ id: user.uid, name: "Pro Barber", shop: "Your Shop Name", rating: 4.9 });
        }
      }
    });
  }, []);

  const loadBookings = async () => {
    const q = collection(db, 'bookings');
    const snaps = await getDocs(q);
    const list = snaps.docs.map(d => ({ id: d.id, ...d.data() }));
    setBookings(list.filter(b => b.barberId === auth.currentUser.uid));
  };

  const addVideoReel = async () => {
    if (!videoUrl) return;
    const barberRef = doc(db, 'barbers', auth.currentUser.uid);
    await setDoc(barberRef, {
      videoReels: [...(barber?.videoReels || []), { url: videoUrl, date: new Date() }]
    }, { merge: true });
    setVideoUrl('');
    setShowUpload(false);
    alert("Signature Style Video Added! Premium barbers get 3x more bookings");
  };

  if (!barber) {
    return <div style={{textAlign:'center', padding:'3rem', color:'#001F3F'}}><h2>Barber Portal Loading...</h2></div>;
  }

  return (
    <div style={{padding:'1rem', fontFamily:'Montserrat, sans-serif', background:'#f8f8f8', minHeight:'100vh'}}>
      <header style={{background:'#001F3F', color:'white', padding:'2rem', textAlign:'center', borderRadius:'0 0 20px 20px'}}>
        <h1>Barber Dashboard</h1>
        <p>Welcome, {barber.name} — {barber.shop}</p>
      </header>

      <div style={{maxWidth:'1000px', margin:'2rem auto', padding:'1rem'}}>
        {/* Stats */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginBottom:'2rem'}}>
          <div style={{background:'white', padding:'1.5rem', borderRadius:'16px', boxShadow:'0 5px 20px rgba(0,0,0,0.1)'}}>
            <h3 style={{color:'#001F3F', margin:'0'}}>Total Bookings</h3>
            <p style={{fontSize:'2.5rem', color:'#B8860B', margin:'0.5rem 0'}}>{bookings.length}</p>
          </div>
          <div style={{background:'white', padding:'1.5rem', borderRadius:'16px', boxShadow:'0 5px 20px rgba(0,0,0,0.1)'}}>
            <h3 style={{color:'#001F3F', margin:'0'}}>Your Rating</h3>
            <p style={{fontSize:'2.5rem', color:'#B8860B', margin:'0.5rem 0'}}>⭐ {barber.rating || 4.9}</p>
          </div>
        </div>

        {/* Signature Style Videos */}
        <div style={{background:'white', padding:'2rem', borderRadius:'16px', marginBottom:'2rem', boxShadow:'0 5px 20px rgba(0,0,0,0.1)'}}>
          <h2 style={{color:'#001F3F'}}>Your Signature Style Reels</h2>
          <p>Premium barbers with videos get 3x more bookings</p>
          
          {barber.videoReels?.length > 0 ? (
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem'}}>
              {barber.videoReels.map((v, i) => (
                <video key={i} controls style={{width:'100%', borderRadius:'12px'}}>
                  <source src={v.url} />
                </video>
              ))}
            </div>
          ) : (
            <p>No videos yet — add one below!</p>
          )}

          <button onClick={() => setShowUpload(!showUpload)} style={{background:'#B8860B', color:'white', padding:'1rem 2rem', border:'none', borderRadius:'12px', marginTop:'1rem'}}>
            {showUpload ? 'Cancel' : 'Upload Signature Style Video'}
          </button>

          {showUpload && (
            <div style={{marginTop:'1rem'}}>
              <input 
                type="text" 
                placeholder="Paste YouTube/Vimeo link" 
                value={videoUrl} 
                onChange={(e) => setVideoUrl(e.target.value)}
                style={{width:'100%', padding:'1rem', borderRadius:'8px', border:'1px solid #ccc', marginBottom:'1rem'}}
              />
              <button onClick={addVideoReel} style={{background:'#001F3F', color:'white', padding:'1rem 3rem', border:'none', borderRadius:'12px'}}>
                Add Video
              </button>
            </div>
          )}
        </div>

        {/* Upcoming Bookings */}
        <div style={{background:'white', padding:'2rem', borderRadius:'16px', boxShadow:'0 5px 20px rgba(0,0,0,0.1)'}}>
          <h2 style={{color:'#001F3F'}}>Incoming Bookings</h2>
          {bookings.length === 0 ? (
            <p>No bookings yet. Share your ESDRAS profile link!</p>
          ) : (
            bookings.map(b => (
              <div key={b.id} style={{background:'#f0f0f0', padding:'1rem', borderRadius:'12px', margin:'1rem 0'}}>
                <p><strong>{b.clientName}</strong> wants {b.styleName}</p>
                <p>Date: {new Date(b.date).toLocaleDateString()}</p>
                <p>Commission: You keep 90% — ESDRAS takes 10%</p>
              </div>
            ))
          )}
        </div>

        <div style={{textAlign:'center', margin:'3rem 0'}}>
          <p style={{fontSize:'1.2rem', color:'#001F3F'}}>
            Your Public Profile: 
            <br/>
            <a href={`https://esdras-app.netlify.app/barber/${barber.id}`} style={{color:'#B8860B', fontWeight:'bold'}}>
              esdras-app.netlify.app/barber/{barber.id}
            </a>
          </p>
          <p>Share this link on Instagram, WhatsApp, and with clients!</p>
        </div>
      </div>
    </div>
  );
                              }
