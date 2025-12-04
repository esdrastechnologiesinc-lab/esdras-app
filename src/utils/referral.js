// src/utils/referral.js — FINAL ESDRAS REFERRAL SYSTEM (exact blueprint rewards + immediate gratification)

// 1. Call this on sign-up / login when URL contains ?ref=
export const handleReferralLink = async (currentUserUid) => {
  if (!currentUserUid) return;

  const urlParams = new URLSearchParams(window.location.search);
  const ref = urlParams.get('ref');

  if (!ref || ref === currentUserUid) return; // no ref or self-referral

  const userRef = doc(db, 'users', currentUserUid);
  const snap = await getDoc(userRef);
  const userData = snap.data() || {};

  // Only set referredBy once – immediate protection
  if (userData.referredBy) return;

  if (ref.length >= 20) { // Firebase UID length
    await setDoc(userRef, { referredBy: ref }, { merge: true });

    // IMMEDIATE GRATIFICATION: Give new user +3 bonus previews right now
    await setDoc(userRef, { extraPreviews: increment(3) }, { merge: true });

    console.log('Referral applied – new user gets +3 bonus previews instantly');
  }
};

// 2. Call this when a user completes their FIRST booking
export const triggerReferrerReward = async (currentUserUid) => {
  const userRef = doc(db, 'users', currentUserUid);
  const snap = await getDoc(userRef);
  const userData = snap.data() || {};

  // Prevent multiple triggers
  if (userData.hasCompletedFirstBooking) return;

  if (userData.referredBy) {
    const referrerId = userData.referredBy;

    // Give referrer +3 bonus previews ONLY after the referred user's first booking
    await setDoc(doc(db, 'users', referrerId), {
      successfulReferrals: increment(1),
      extraPreviews: increment(3)
    }, { merge: true });

    console.log(`Referrer ${referrerId} rewarded +3 previews for successful referral`);
  }

  // Mark as done
  await setDoc(userRef, { hasCompletedFirstBooking: true }, { merge: true });
};
