// src/components/booking-modal.jsx — FINAL VERSION (matches ALL your uploaded docs)
import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, doc, getDoc, increment, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { triggerReferralReward } from '../utils/referral';

export default function BookingModal({ barber, styleName, onClose }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [rewardGiven, setRewardGiven] = useState(false);
  const amount = barber.priceHigh || 8000;

  const handleBooking = async () => {
    if (!auth.currentUser) return alert('Login required');

    setLoading(true);

    try {
      // 1. Create booking
      const bookingRef = await addDoc(collection(db, 'bookings'), {
        clientId: auth.currentUser.uid,
        clientName: auth.currentUser.displayName || 'Client',
        barberId: barber.id,
        barberName: barber.shopName || barber.name,
        styleName,
        amount,
        date: new Date(), // Firestore timestamp
        status: 'confirmed',
        createdAt: serverTimestamp()
      });

      // 2. Calculate dynamic commission (from your referral docs)
      const barberSnap = await getDoc(doc(db, 'barbers', barber.id));
      const barberData = barberSnap.data() || {};
      const successfulReferrals = barberData.successfulReferrals || 0;
      const commissionReduction = Math.floor(successfulReferrals / 5); // 1% per 5
      const esdrasCommissionRate = Math.max(5, 10 - commissionReduction); // min 5%
      const barberGets = 100 - esdrasCommissionRate;

      // 3. Update revenue with correct split
      await setDoc(doc(db, 'revenue', barber.id), {
        totalEarnings: increment(amount),
        barberEarnings: increment(amount * (barberGets / 100)),
        esdrasCommission: increment(amount * (esdrasCommissionRate / 100)),
        lastBooking: serverTimestamp()
      }, { merge: true });

      // 4. Trigger referral reward ONCE (only on first booking)
      const rewardResult = await triggerReferralReward(auth.currentUser.uid);
      if (rewardResult) setRewardGiven(true);

      setSuccess(true);
      setTimeout(() => onClose(), 4000);
    } catch (err) {
      console.error(err);
      alert('Booking failed — try again');
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999
    }}>
      <div style={{
        background: 'white', color: '#001F3F', padding: '3rem 2rem',
        borderRadius: '24px', maxWidth: '90%', textAlign: 'center', boxShadow: '0 20px 40px rgba(184,134,11,0.3)'
      }}>
        {success ? (
          <>
            <h2 style={{color: '#B8860B', fontSize: '2.4rem', margin: '0 0 1rem'}}>Booking Confirmed!</h2>
            <p style={{fontSize: '1.3rem'}}><strong>{barber.shopName || barber.name}</strong> will contact you soon</p>
            {rewardGiven && (
              <div style={{
                background: '#B8860B', color: 'black', padding: '1rem', borderRadius: '16px',
                margin: '1.5rem 0', fontWeight: 'bold', fontSize: '1.2rem'
              }}>
                Both you and your friend got +3 premium previews!
              </div>
            )}
            <p style={{color: '#B8860B', fontWeight: 'bold'}}>Check your library</p>
          </>
        ) : (
          <>
            <h2 style={{margin: '0 0 1rem', fontSize: '2rem'}}>Confirm Booking</h2>
            <p style={{fontSize: '1.4rem', margin: '1rem 0'}}>
              <strong>{styleName}</strong> with <strong>{barber.shopName || barber.name}</strong>
            </p>
            <p style={{fontSize: '2rem', color: '#B8860B', fontWeight: 'bold', margin: '1rem 0'}}>
              ₦{amount.toLocaleString()}
            </p>
            <button
              onClick={handleBooking}
              disabled={loading}
              style={{
                background: '#B8860B', color: 'black', padding: '1.4rem 5rem',
                border: 'none', borderRadius: '50px', fontSize: '1.5rem', fontWeight: 'bold',
                margin: '1.5rem 0', opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Confirming...' : 'Confirm & Pay Later'}
            </button>
            <br />
            <button onClick={onClose} style={{color: 'gray', marginTop: '1rem', background: 'none', border: 'none'}}>
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}
