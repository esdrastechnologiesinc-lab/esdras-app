// src/utils/referral.js — FINAL VERSION (100% matches your uploaded docs)
import { doc, setDoc, getDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';

export const triggerReferralReward = async (currentUserUid) => {
  const userRef = doc(db, 'users', currentUserUid);
  const snap = await getDoc(userRef);
  const userData = snap.data() || {};

  // Only trigger ONCE per user — after their FIRST booking
  if (userData.hasCompletedFirstBooking) return;

  // If this user was referred (came from ?ref=ABC123)
  if (userData.referredBy) {
    const referrerId = userData.referredBy;

    await Promise.all([
      // 1. Give +3 premium previews to the REFERRER (existing user)
      setDoc(doc(db, 'referrals', referrerId), {
        successfulReferrals: increment(1),
        extraPreviews: increment(3)
      }, { merge: true }),

      // 2. Give +3 premium previews to the NEW USER (current user)
      setDoc(userRef, {
        extraPreviews: increment(3)
      }, { merge: true })
    ]);

    console.log(`Referral reward: ${referrerId} +3, new user +3`);
  }

  // Mark first booking as done — never trigger again
  await setDoc(userRef, { hasCompletedFirstBooking: true }, { merge: true });
};
