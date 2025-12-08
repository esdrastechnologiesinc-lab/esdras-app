// utils/referral.js — FINAL ESDRAS REFERRAL (real 1% discount applied on bookings)
import { doc, getDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

// Called on signup/login
export const handleReferralLink = async (newUserId) => {
  const urlParams = new URLSearchParams(window.location.search);
  const referrerId = urlParams.get('ref');
  
  if (referrerId && referrerId !== newUserId) {
    const referrerDoc = doc(db, 'users', referrerId);
    const snap = await getDoc(referrerDoc);
    if (snap.exists()) {
      await updateDoc(doc(db, 'users', newUserId), { referrerId });
      await updateDoc(referrerDoc, { 
        referrals: increment(1),
        lastReferralAt: serverTimestamp()
      });
    }
  }
};

// Called after successful booking confirmation
export const triggerReferrerReward = async (userId) => {
  const userSnap = await getDoc(doc(db, 'users', userId));
  const userData = userSnap.data();

  if (userData.hasCompletedFirstBooking) return false;

  const referrerId = userData.referrerId;
  if (!referrerId) return false;

  const referrerRef = doc(db, 'users', referrerId);
  const referrerSnap = await getDoc(referrerRef);
  const referrerData = referrerSnap.data();

  // Give +3 previews
  await updateDoc(referrerRef, { 
    extraPreviews: increment(3),
    successfulReferrals: increment(1)
  });

  // Calculate new discount (every 5 referrals = 1% off, max 5% = 5% fee)
  const newCount = (referrerData.successfulReferrals || 0) + 1;
  const newReduction = Math.min(Math.floor(newCount / 5), 5); // cap at 5%

  if (newReduction > (referrerData.commissionReduction || 0)) {
    await updateDoc(referrerRef, { 
      commissionReduction: newReduction,
      discountUnlockedAt: serverTimestamp()
    });
  }

  // Mark first booking complete
  await updateDoc(doc(db, 'users', userId), { hasCompletedFirstBooking: true });

  return true;
};

// NEW: Use this when calculating commission (in booking or payout function)
export const getEffectiveCommissionRate = (userData) => {
  const reduction = userData.commissionReduction || 0;
  return Math.max(5, 10 - reduction); // Never below 5%
};
