// src/components/barberdashboard.jsx
import React, { useState, useEffect } from 'react';
import { doc, getDoc, onSnapshot, collection } from 'firebase/firestore';
import { db, auth } from '../firebase';

export default function BarberDashboard() {
  const [barber, setBarber] = useState({});
  const [bookings, setBookings] = useState([]);
  const [earnings, setEarnings] = useState(0);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Load barber profile
    const barberRef = doc(db, 'barbers', user.uid);
    onSnapshot(barberRef, (snap) => {
      if (snap.exists()) setBarber({ id: snap.id, ...snap.data() });
    });

    // Load today's bookings
    const bookingsRef = collection(db, 'bookings');
    onSnapshot(bookingsRef, (snapshot) => {
      const today = new Date().toDateString();
      const myBookings = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(b => b.barberId === user.uid && new Date(b.date).toDateString() === today);
      setBookings(myBookings);
      setEarnings(myBookings.reduce((sum, b) => sum + (b.amount * 0.9), 0)); // 10% to ESDRAS
    });
  }, []);

  return (
    <div style={{padding:'1rem', background:'#001F3F', color:'white', minHeight:'100vh', fontFamily:'Montserrat,sans-serif'}}>
      <h1 style={{textAlign:'center', color:'#B8860B', fontSize:'2rem'}}>Barber Dashboard</h1>
      <p style={{textAlign:'center', fontSize:'1.2rem'}}>Welcome, {barber.name || 'Barber'}</p>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', margin:'2rem 0'}}>
        <div style={{background:'#0a3d62', padding:'1.5rem', borderRadius:'16px', textAlign:'center'}}>
          <p style={{fontSize:'3rem', margin:'0', color:'#B8860B'}}>₦{earnings.toFixed(0)}</p>
          <p>Today's Earnings (90% yours)</p>
        </div>
        <div style={{background:'#0a3d62', padding:'1.5rem', borderRadius:'16px', textAlign:'center'}}>
          <p style={{fontSize:'3rem', margin:'0', color:'#B8860B'}}>{bookings.length}</p>
          <p>Bookings Today</p>
        </div>
      </div>

      <h2 style={{color:'#B8860B'}}>Today's Appointments</h2>
      {bookings.length === 0 ? (
        <p style={{textAlign:'center', opacity:0.7}}>No bookings yet — share your profile!</p>
      ) : (
        bookings.map(b => (
          <div key={b.id} style={{background:'rgba(255,255,255,0.1)', padding:'1rem', borderRadius:'12px', margin:'1rem 0'}}>
            <p><strong>{b.clientName}</strong> • {b.time}</p>
            <p>Style: {b.styleName} • ₦{b.amount}</p>
            <p>Your cut: ₦{(b.amount * 0.9).toFixed(0)}</p>
          </div>
        ))
      )}

      <div style={{textAlign:'center', marginTop:'3rem'}}>
        <a href={`/barber/${auth.currentUser.uid}`} style={{background:'#B8860B', color:'black', padding:'1rem 3rem', borderRadius:'50px', textDecoration:'none', fontWeight:'bold'}}>
          View My Public Profile
        </a>
      </div>
    </div>
  );
      }    
