// src/components/barberprofile.jsx 
import BookingModal from './booking-modal';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function BarberProfile() {
  const { id } = useParams();
  const [barber, setBarber] = useState(null);
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    getDoc(doc(db, 'barbers', id)).then(snap => {
      if (snap.exists()) setBarber({ id: snap.id, ...snap.data() });
    });
  }, [id]);

  if (!barber) return <div style={{textAlign:'center', padding:'5rem', color:'#001F3F'}}><h2>Loading...</h2></div>;

  return (
    <div style={{background:'#001F3F', color:'white', minHeight:'100vh', padding:'1rem', textAlign:'center'}}>
      <h1 style={{color:'#B8860B', fontSize:'2.5rem'}}>{barber.name}</h1>
      <p style={{fontSize:'1.3rem', color:'#B8860B'}}>{barber.location} • ★★★★☆</p>

      <div style={{background:'rgba(255,255,255,0.1)', padding:'1.5rem', borderRadius:'16px', margin:'2rem auto', maxWidth:'500px'}}>
        <p><strong>Working Hours:</strong> {barber.hours || 'Mon-Sat 9AM-7PM'}</p>
        <p><strong>Price Range:</strong> ₦{barber.priceLow} - ₦{barber.priceHigh}</p>
        <p><strong>Specialty:</strong> {barber.specialty || 'All Styles'}</p>
      </div>

      <button onClick={() => setShowBooking(true)} style={{background:'#B8860B', color:'black', padding:'1rem 3rem', border:'none', borderRadius:'16px'}}>
  Book Appointment
</button>

{showBooking && <BookingModal barber={barber} styleName="High Fade" onClose={() => setShowBooking(false)} />}

      <p style={{marginTop:'2rem', opacity:0.8}}>
        Share this profile → esdras.app/barber/{id}
      </p>
    </div>
  );
}        
