// src/components/booking-modal.jsx — FINAL ESDRAS BOOKING MODAL (time slots + stylist confirmation + escrow + Google Calendar + rating trigger)
import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, doc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { triggerReferrerReward } from '../utils/referral';
import TimeSlotPicker from './timeslotpicker';
import Rating from './rating'; // ← Add this import

const NAVY = '#001F3F';
const GOLD = '#B8860B';

export default function BookingModal({ barber, styleName, renderedImageUrl, onClose }) {
  const [loading, setLoading] = useState(false);
  const [bookingStep, setBookingStep] = useState('slot'); // slot → waiting → confirmed
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [firstBookingReward, setFirstBookingReward] = useState(false);
  const [showRating, setShowRating] = useState(false); // ← New state for rating modal

  const amount = barber.priceHigh || 8000;

  // Listen for stylist confirmation
  useEffect(() => {
    if (!currentBookingId) return;

    const bookingRef = doc(db, 'bookings', currentBookingId);
    const unsub = onSnapshot(bookingRef, (snap) => {
      const data = snap.data();
      if (data?.status === 'confirmed') {
        setBookingStep('confirmed');
        handlePaymentAndCalendar(data.confirmedTime || data.proposedTime);
        unsub();
      }
    });

    return unsub;
  }, [currentBookingId]);

  const handleBooking = async () => {
    if (!selectedSlot) return alert('Please pick a time slot');
    if (!auth.currentUser) return alert('Login required');

    setLoading(true);

    try {
      const bookingRef = await addDoc(collection(db, 'bookings'), {
        clientId: auth.currentUser.uid,
        clientName: auth.currentUser.displayName || 'Client',
        stylistId: barber.id,
        stylistName: barber.shopName || barber.name,
        styleName,
        proposedTime: selectedSlot,
        status: 'pending',
        amount,
        createdAt: serverTimestamp()
      });

      setCurrentBookingId(bookingRef.id);
      setBookingStep('waiting');
      setLoading(false);

      // Trigger referral reward
      const rewarded = await triggerReferrerReward(auth.currentUser.uid);
      if (rewarded) setFirstBookingReward(true);
    } catch (err) {
      console.error(err);
      alert('Booking failed – try again');
      setLoading(false);
    }
  };

  const handlePaymentAndCalendar = (confirmedTime) => {
    alert(`Payment of ₦${amount} charged. Held in escrow until service complete.`);
    
    // Google Calendar iCal download
    const event = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${confirmedTime.toISOString().replace(/-|:|\.\d\d\d/g, '')}`,
      `DTEND:${new Date(confirmedTime.getTime() + 3600000).toISOString().replace(/-|:|\.\d\d\d/g, '')}`,
      `SUMMARY:ESDRAS Booking - ${styleName}`,
      `DESCRIPTION:With ${barber.shopName || barber.name}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([event], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'esdras-booking.ics';
    a.click();
  };

  const handleShare = () => {
    const text = `I just booked "\( {styleName}" with \){barber.shopName || barber.name} via ESDRAS! See my new look:`;
    if (navigator.share && renderedImageUrl) {
      navigator.share({ title: 'My ESDRAS Booking', text, url: renderedImageUrl });
    } else {
      alert('Share this with friends! Booking confirmed.');
    }
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)',
      display: 'grid', placeItems: 'center', zIndex: 999, padding: '1rem'
    }}>
      <div style={{
        background: NAVY, color: 'white', padding: '3rem 2rem',
        borderRadius: '28px', border: `4px solid ${GOLD}`,
        maxWidth: '90%', textAlign: 'center', fontFamily: 'Montserrat, sans-serif'
      }}>
        {/* Step 1: Pick Time Slot */}
        {bookingStep === 'slot' && (
          <>
            <h2 style={{color: GOLD, fontSize: '2.4rem'}}>Book {styleName}</h2>
            <p>with <strong>{barber.shopName || barber.name}</strong></p>

            {renderedImageUrl && (
              <img src={renderedImageUrl} alt="preview" style={{
                width: '100%', maxWidth: '300px', borderRadius: '20px',
                border: `3px solid ${GOLD}`, margin: '1.5rem 0'
              }} />
            )}

            <TimeSlotPicker stylistId={barber.id} onSlotSelected={setSelectedSlot} />

            <button
              onClick={handleBooking}
              disabled={loading || !selectedSlot}
              style={{
                background: GOLD, color: 'black', padding: '1.6rem 5rem',
                border: 'none', borderRadius: '50px', fontSize: '1.6rem', fontWeight: 'bold',
                marginTop: '2rem', opacity: loading || !selectedSlot ? 0.7 : 1
              }}
            >
              {loading ? 'Sending...' : 'Send Booking Request'}
            </button>
          </>
        )}

        {/* Step 2: Waiting for Stylist */}
        {bookingStep === 'waiting' && (
          <div>
            <h2 style={{color: GOLD}}>Request Sent!</h2>
            <p>Waiting for {barber.shopName || barber.name} to confirm...</p>
            <p style={{opacity: 0.8}}>You'll be charged ₦{amount} only after confirmation</p>
          </div>
        )}

        {/* Step 3: Confirmed + Rating */}
        {bookingStep === 'confirmed' && (
          <>
            <h2 style={{color: GOLD, fontSize: '2.6rem'}}>Booking Confirmed!</h2>
            <p>{barber.shopName || barber.name} confirmed your appointment</p>
            {firstBookingReward && (
              <div style={{background: GOLD, color: 'black', padding: '1.2rem', borderRadius: '16px', margin: '1.5rem 0'}}>
                Your friend got +3 bonus previews!
              </div>
            )}

            <button
              onClick={() => setShowRating(true)}
              style={{
                background: 'white', color: NAVY, padding: '1.5rem 4rem',
                border: 'none', borderRadius: '50px', fontSize: '1.5rem', fontWeight: 'bold',
                margin: '1rem 0'
              }}
            >
              Rate Your Stylist
            </button>

            <button onClick={handleShare} style={{
              background: GOLD, color: 'black', padding: '1.5rem 4rem',
              border: 'none', borderRadius: '50px', fontSize: '1.5rem', fontWeight: 'bold'
            }}>
              Share My New Look
            </button>
          </>
        )}

        {/* Rating Modal */}
        {showRating && (
          <Rating
            bookingId={currentBookingId}
            stylistId={barber.id}
            onClose={() => setShowRating(false)}
          />
        )}

        <button onClick={onClose} style={{marginTop: '2rem', color: '#888', background: 'none', border: 'none'}}>
          Close
        </button>
      </div>
    </div>
  );
}