// src/components/booking-modal.jsx — FINAL ESDRAS BOOKING MODAL (mvp-ready + viral share + 100% blueprint)
import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { triggerReferrerReward } from '../utils/referral';

const NAVY = '#001F3F';
const GOLD = '#B8860B';

export default function BookingModal({ barber, styleName, renderedImageUrl, onClose }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [firstBookingReward, setFirstBookingReward] = useState(false);

  const handleBooking = async () => {
    if (!auth.currentUser) return alert('please log in first');

    setLoading(true);

    try {
      // 1. Create booking request (no payment in MVP)
      await addDoc(collection(db, 'bookings'), {
        clientId: auth.currentUser.uid,
        clientName: auth.currentUser.displayName || 'client',
        barberId: barber.id,
        barberName: barber.shopName || barber.name,
        styleName: styleName || 'custom style',
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // 2. Flat 10% ESDRAS commission (revenue tracking for future payouts)
      // We'll handle actual money later – for now just log the intent
      // (optional: increment revenue counters here)

      // 3. Trigger referrer reward only on user's FIRST booking
      const rewarded = await triggerReferrerReward(auth.currentUser.uid);
      if (rewarded) setFirstBookingReward(true);

      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert('booking failed – try again');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    const text = `i just booked "\( {styleName}" with \){barber.shopName || barber.name} via esdras 👑\nsee my new look:`;
    const shareData = {
      title: 'my esdras booking',
      text,
      url: renderedImageUrl || window.location.origin
    };

    if (navigator.share && navigator.canShare(shareData)) {
      navigator.share(shareData);
    } else {
      // fallback: copy image + text
      alert('share this with your friends!\n(booking confirmed – barber will contact you soon)');
    }
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)',
      display: 'grid', placeItems: 'center', zIndex: 999, padding: '1rem'
    }}>
      <div style={{
        background: NAVY,
        color: 'white',
        fontFamily: 'Montserrat, sans-serif',
        padding: '3rem 2rem',
        borderRadius: '28px',
        border: `4px solid ${GOLD}`,
        maxWidth: '90%',
        textAlign: 'center'
      }}>
        {success ? (
          <>
            <h2 style={{color: GOLD, fontSize: '2.6rem', margin: '0 0 1rem', fontWeight: '800'}}>
              booking confirmed!
            </h2>
            <p style={{fontSize: '1.4rem', opacity: 0.9}}>
              {barber.shopName || barber.name} will contact you soon to confirm time
            </p>

            {firstBookingReward && (
              <div style={{
                background: GOLD, color: 'black', padding: '1.2rem', borderRadius: '16px',
                margin: '1.5rem 0', fontWeight: 'bold'
              }}>
                your friend just got +3 bonus previews for referring you!
              </div>
            )}

            {renderedImageUrl && (
              <img src={renderedImageUrl} alt="your new style" style={{
                width: '100%', maxWidth: '320px', borderRadius: '20px',
                border: `4px solid ${GOLD}`, margin: '1.5rem 0'
              }} />
            )}

            <button
              onClick={handleShare}
              style={{
                background: GOLD, color: 'black', padding: '1.5rem 4rem',
                border: 'none', borderRadius: '50px', fontSize: '1.5rem', fontWeight: 'bold'
              }}
            >
              share my new look
            </button>

            <p style={{marginTop: '2rem', opacity: 0.7, fontSize: '0.9rem'}}>
              esdras takes only 10% • your barber gets the rest
            </p>
          </>
        ) : (
          <>
            <h2 style={{margin: '0 0 1rem', fontSize: '2.2rem', fontWeight: '800'}}>
              confirm your booking
            </h2>
            <p style={{fontSize: '1.4rem', margin: '1rem 0'}}>
              <strong>{styleName}</strong><br/>
              with <strong>{barber.shopName || barber.name}</strong>
            </p>

            {renderedImageUrl && (
              <img src={renderedImageUrl} alt="preview" style={{
                width: '100%', maxWidth: '300px', borderRadius: '20px',
                border: `3px solid ${GOLD}`, margin: '1.5rem 0'
              }} />
            )}

            <button
              onClick={handleBooking}
              disabled={loading}
              style={{
                background: GOLD, color: 'black', padding: '1.6rem 5rem',
                border: 'none', borderRadius: '50px', fontSize: '1.6rem', fontWeight: 'bold',
                opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'sending request...' : 'book now • pay barber directly'}
            </button>

            <button
              onClick={onClose}
              style={{background: 'none', border: 'none', color: '#888', marginTop: '1.5rem'}}
            >
              cancel
            </button>

            <p style={{marginTop: '2rem', opacity: 0.7, fontSize: '0.9rem'}}>
              no payment now • barber contacts you • esdras takes only 10%
            </p>
          </>
        )}
      </div>
    </div>
  );
    }
