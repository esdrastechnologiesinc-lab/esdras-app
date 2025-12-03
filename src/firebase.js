import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // ← Paste your real Firebase config here (from Firebase Console)
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
