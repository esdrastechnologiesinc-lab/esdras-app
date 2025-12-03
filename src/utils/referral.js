// src/utils/referral.js
import { doc, setDoc, getDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';

// CALL THIS FUNCTION ONLY ONCE — when a user completes their FIRST booking
export const triggerReferralReward = async (currentUserUid) => {
  const userRef = doc(db, 'users', currentUserUid);
  const userSnap = await getDoc(userRef);
  const userData = userSnap.data();

  // Only trigger if this is their first booking AND they were referred
  if (!userData?.hasCompletedFirstBooking && userData?.referredBy) {
    const referrerId = userData.referredBy;

    // Give +3 extra premium previews to BOTH users
    await Promise.all([
      // Reward the referrer
      setDoc(doc(db, 'referrals', referrerId), {
        successful: increment(1),
        extraPreviews: increment(3)
      }, { merge: true }),

      // Reward the new user too (they get +3 also)
      setDoc(userRef, {
        extraPreviews: increment(3),
        hasCompletedFirstBooking: true
      }, { merge: true })
    ]);

    console.log(`Referral reward triggered! ${referrerId} → +3 previews`);
  }

  // Always mark first booking as done
  await setDoc(userRef, { hasCompletedFirstBooking: true }, { merge: true });
};
