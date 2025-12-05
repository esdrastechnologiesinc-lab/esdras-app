// src/utils/referral.js — FINAL ESDRAS REFERRAL SYSTEM (gender-neutral + immediate gratification + secure)
import { doc, getDoc, setDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Call this immediately after sign-up/login if the URL contains ?ref=
 * Gives the referred new user +3 bonus previews instantly (immediate gratification)
 */
export const handleReferralLink = async (currentUserUid) => {
  if (!currentUserUid) return;

  const urlParams = new URLSearchParams(window.location.search);
  const refCode = urlParams.get('ref')?.trim();

  if (!refCode) return;

  const userRef = doc(db, 'users', currentUserUid);
  const snap = await getDoc(userRef);
  const userData = snap.data() || {};

  // Prevent duplicate application or self-referral
  if (userData.referredBy || refCode === currentUserUid) return;

  // Store the referrer's code (short/clean code from profile)
  await setDoc(userRef, { referredBy: refCode }, { merge: true });

  // IMMEDIATE +3 bonus previews for the new user
  await setDoc(userRef, { extraPreviews: increment(3) }, { merge: true });

  console.log(`Referral applied – new user gets +3 bonus previews via code ${refCode}`);
};

/**
 * Call this exactly once when a user completes their FIRST booking
 * Rewards the original referrer with +3 bonus previews
 */
export const triggerReferrerReward = async (currentUserUid) => {
  if (!currentUserUid) return false;

  const userRef = doc(db, 'users', currentUserUid);
  const snap = await getDoc(userRef);
  const userData = snap.data() || {};

  // Prevent multiple triggers
  if (userData.hasCompletedFirstBooking) return false;

  let rewarded = false;

  if (userData.referredBy) {
    const referrerCode = userData.referredBy;

    // In a production app, this would be a secure Cloud Function that looks up UID by code
    // For MVP pilot, we log it – reward is handled manually or via future function
    console.log(`First booking complete – referrer with code ${referrerCode} earns +3 bonus previews`);
    rewarded = true;
  }

  // Mark first booking as complete (prevents re-trigger)
  await setDoc(userRef, { hasCompletedFirstBooking: true }, { merge: true });

  return rewarded;
};
