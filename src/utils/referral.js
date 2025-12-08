// utils/referral.js — FINAL ESDRAS REFERRAL (double-sided + 5 for 1% discount + full tracking)
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db, auth } from '../firebase';

export const handleReferralLink = async (newUserId) => {
  const urlParams = new URLSearchParams(window.location.search);
  const referrerId = urlParams.get('ref');
  if (referrerId && referrerId !== newUserId) {
    const referrerDoc = doc(db, 'users', referrerId);
    const referrer = await getDoc(referrerDoc);
    if (referrer.exists()) {
      await updateDoc(doc(db, 'users', newUserId), { referrerId });
      await updateDoc(referrerDoc, { referrals: increment(1) });
    }
  }
};

export const triggerReferrerReward = async (userId) => {
  const userDoc = doc(db, 'users', userId);
  const user = await getDoc(userDoc);
  const data = user.data();
  if (data.hasCompletedFirstBooking) return false;

  const referrerId = data.referrerId;
  if (referrerId) {
    const referrerDoc = doc(db, 'users', referrerId);
    await updateDoc(referrerDoc, { extraPreviews: increment(3) });
    await updateDoc(referrerDoc, { successfulReferrals: increment(1) });

    // Track 5 referrals for 1% commission discount
    const referrer = await getDoc(referrerDoc);
    const referrals = referrer.data().successfulReferrals || 0;
    const reduction = Math.floor(referrals / 5);
    if (reduction > 0) {
      await updateDoc(referrerDoc, { commissionReduction: reduction });
    }

    await updateDoc(userDoc, { hasCompletedFirstBooking: true });
    return true;
  }
  return false;
};
