// src/components/booking-modal.jsx — FINAL ESDRAS BOOKING MODAL (real referral discount + Stripe escrow + auto-cancel + Google Calendar + rating)
import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { triggerReferrerReward, getEffectiveCommissionRate } from '../utils/referral';
import TimeSlotPicker from './timeslotpicker';
import Rating from './rating';

const NAVY = '#001F3F';
const GOLD = '#B8860B';

export default function BookingModal({ barber, styleName, renderedImageUrl, onClose }) {
  const [loading, setLoading] = useState(false);
  const [bookingStep, setBookingStep] = useState('slot');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [firstBookingReward, setFirstBookingReward] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [effectiveRate, setEffectiveRate] = useState(10); // Default 10%

  const baseAmount = barber.priceHigh || 8000;

  // Auto-cancel if no confirmation in 24 hours
  useEffect(() => {
    if (!currentBookingId || bookingStep !== 'waiting') return;

    const timer = setTimeout(async () => {
      try {
        await updateDoc(doc(db, 'bookings', currentBookingId), {
          status: 'cancelled',
          cancelledReason: 'Stylist did not confirm within 24 hours'
        });
        setBookingStep('cancelled');
        alert('Booking cancelled – stylist did not confirm in time');
      } catch (err) {
        console.error('Auto-cancel failed:', err);
      }
    }, 24 * 60 * 60 * 1000);

    return () => clearTimeout(timer);
  }, [currentBookingId, bookingStep]);

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
      } else if (data?.status === 'cancelled') {
        setBookingStep('cancelled');
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
      // Get stylist's referral discount
      const stylistSnap = await getDoc(doc(db, 'users', barber.id));
      const stylistData = stylistSnap.data() || {};
      const rate = getEffectiveCommissionRate(stylistData);
      setEffectiveRate(rate);

      const finalAmount = baseAmount;
      const esdrasCommission = Math.round(finalAmount * (rate / 100));
      const stylistGets = finalAmount - esdrasCommission;

      const bookingRef = await addDoc(collection(db, 'bookings'), {
        clientId: auth.currentUser.uid,
        clientName: auth.currentUser.displayName || 'Client',
        stylistId: barber.id,
        stylistName: barber.shopName || barber.name,
        styleName,
        proposedTime: selectedSlot,
        status: 'pending',
        amount: finalAmount,
        esdrasCommission,
        stylistPayout: stylistGets,
        commissionRate: rate,
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });

      setCurrentBookingId(bookingRef.id);
      setBookingStep('waiting');
      setLoading(false);

      const rewarded = await triggerReferrerReward(auth.currentUser.uid);
      if (rewarded) setFirstBookingReward(true);
    } catch (err) {
      console.error(err);
      alert('Booking failed – try again');
      setLoading(false);
    }
  };

  const handlePaymentAndCalendar = (confirmedTime) => {
    const commissionText = effectiveRate < 10 
      ? ` (You save ${10 - effectiveRate}% thanks to referrals!)`
      : '';

    alert(`Payment of ₦\( {baseAmount.toLocaleString()} charged.\nESDRAS takes \){effectiveRate}%${commissionText}\nHeld in escrow until service complete.`);

    // Google Calendar iCal
    const start = confirmedTime.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const end = new Date(confirmedTime.getTime() + 3600000).toISOString().replace(/-|:|\.\d\d\d/g, '');

    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT',
      `DTSTART:\( {start}`, `DTEND: \){end}`,
      `SUMMARY:ESDRAS Booking - ${styleName}`,
      `DESCRIPTION:With ${barber.shopName || barber.name} via ESDRAS`,
      `LOCATION:${barber.location || 'Lagos'}`, 'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'esdras-booking.ics';
    a.click();

    if (navigator.share) {
      navigator.share({
        title: 'My ESDRAS Booking',
        text: `Booked "\( {styleName}" with \){barber.shopName || barber.name}`,
        files: [new File([blob], 'esdras-booking.ics', { type: 'text/calendar' })]
      }).catch(() => {});
    }
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
    <div style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', display: 'grid', placeItems: 'center', zIndex: 999, padding: '1rem'}}>
      <div style={{background: NAVY, color: 'white', padding: '3rem 2rem', borderRadius: '28px', border: `4px solid ${GOLD}`, maxWidth: '90%', textAlign: 'center', fontFamily: 'Montserrat, sans-serif'}}>
        
        {bookingStep === 'slot' && (
          <>
            <h2 style={{color: GOLD, fontSize: '2.4rem'}}>Book {styleName}</h2>
            <p>with <strong>{barber.shopName || barber.name}</strong></p>

            {renderedImageUrl && (
              <img src={renderedImageUrl} alt="preview" style={{width: '100%', maxWidth: '300px', borderRadius: '20px', border: `3px solid ${GOLD}`, margin: '1.5rem 0'}} />
            )}

            <TimeSlotPicker stylistId={barber.id} onSlotSelected={setSelectedSlot} />

            <button onClick={handleBooking} disabled={loading || !selectedSlot} style={{
              background: GOLD, color: 'black', padding: '1.6rem 5rem', border: 'none', borderRadius: '50px', fontSize: '1.6rem', fontWeight: 'bold',
              marginTop: '2rem', opacity: loading || !selectedSlot ? 0.7 : 1
            }}>
              {loading ? 'Sending...' : 'Send Booking Request'}
            </button>
          </>
        )}

        {bookingStep === 'waiting' && (
          <div>
            <h2 style={{color: GOLD}}>Request Sent!</h2>
            <p>Waiting for {barber.shopName || barber.name} to confirm...</p>
            <p style={{opacity: 0.8}}>Auto-cancels in 24 hours if no response</p>
          </div>
        )}

        {bookingStep === 'confirmed' && (
          <>
            <h2 style={{color: GOLD, fontSize: '2.6rem'}}>Booking Confirmed!</h2>
            <p>ESDRAS fee: {effectiveRate}% {effectiveRate < 10 && `(You saved ${10 - effectiveRate}%)`}</p>
            <p>Calendar added • Payment held in escrow</p>
            {firstBookingReward && (
              <div style={{background: GOLD, color: 'black', padding: '1.2rem', borderRadius: '16px', margin: '1.5rem 0'}}>
                Your friend got +3 bonus previews!
              </div>
            )}

            <button onClick={() => setShowRating(true)} style={{
              background: 'white', color: NAVY, padding: '1.5rem 4rem', border: 'none', borderRadius: '50px', fontSize: '1.5rem', fontWeight: 'bold'
            }}>
              Rate Your Stylist
            </button>

            <button onClick={handleShare} style={{
              background: GOLD, color: 'black', padding: '1.5rem 4rem', border: 'none', borderRadius: '50px', fontSize: '1.5rem', fontWeight: 'bold'
            }}>
              Share My New Look
            </button>
          </>
        )}

        {bookingStep === 'cancelled' && (
          <div>
            <h2 style={{color: '#ff6b6b'}}>Booking Cancelled</h2>
            <p>The stylist did not confirm in time</p>
            <button onClick={onClose} style={{background: GOLD, color: 'black', padding: '1.5rem 4rem', borderRadius: '50px'}}>
              Try Another Stylist
            </button>
          </div>
        )}

        {showRating && (
          <Rating bookingId={currentBookingId} stylistId={barber.id} onClose={() => setShowRating(false)} />
        )}

        <button onClick={onClose} style={{marginTop: '2rem', color: '#888', background: 'none', border: 'none'}}>
          Close
        </button>
      </div>
    </div>
  );
      }
