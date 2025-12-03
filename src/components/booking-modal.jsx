// src/components/booking-modal.jsx 
import { triggerReferralReward } from '../utils/referral';
import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { triggerReferralReward } from '../utils/referral';

export default function BookingModal({ barber, styleName, onClose }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleBooking = async () => {
    if (!auth.currentUser) return alert('Login required');

    setLoading(true);
    try {
      await addDoc(collection(db, 'bookings'), {
        clientId: auth.currentUser.uid,
        clientName: auth.currentUser.displayName || 'Client',
        barberId: barber.id,
        barberName: barber.name,
        styleName,
        amount: barber.priceHigh || 5000,
        date: new Date().toISOString().split('T')[0],
        time: '10:00 AM',
        status: 'confirmed',
        createdAt: serverTimestamp()
      });
      await triggerReferralReward(auth.currentUser.uid);

      // Triggers +3 premium previews for both users if first booking via referral
      await triggerReferralReward(auth.currentUser.uid);

      setSuccess(true);
      setTimeout(onClose, 3000);
    } catch (e) {
      alert('Booking failed');
    }
    setLoading(false);
  };

  return (
    <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.92)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999}}>
      <div style={{background:'white', color:'#001F3F', padding:'2.5rem 2rem', borderRadius:'24, maxWidth:'90%', textAlign:'center'}}>
        {success ? (
          <>
            <h2 style={{color:'#B8860B', fontSize:'2rem'}}>Booking Confirmed!</h2>
            <p>{barber.name} will contact you soon</p>
            <p style={{color:'#B8860B', fontWeight:'bold', marginTop:'1rem'}}>
              +3 premium previews added if this was your first referral booking!
            </p>
          </>
        ) : (
          <>
            <h2>Book with {barber.name}</h2>
            <p><strong>{styleName}</strong> • ₦{barber.priceHigh || 5000}</p>
            <button
              onClick={handleBooking}
              disabled={loading}
              style={{background:'#B8860B', color:'black', padding:'1.2rem 4rem', border:'none', borderRadius:50, fontSize:'1.4rem', fontWeight:'bold', margin:'1.5rem 0'}}
            >
              {loading ? 'Confirming...' : 'Confirm Booking'}
            </button>
            <br/>
            <button onClick={onClose} style={{color:'gray'}}>Cancel</button>
          </>
        )}
      </div>
    </div>
  );
        }
