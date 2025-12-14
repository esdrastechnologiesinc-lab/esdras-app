import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';      // <-- ADDED: For User Authentication
import { getStorage } from 'firebase/storage'; // <-- ADDED: For File/Image Uploads (StyleSnap)

const firebaseConfig = {
  // IMPORTANT: Replace these placeholders with your actual configuration details
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET", // <-- CRITICAL for 'storage' export
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize App
const app = initializeApp(firebaseConfig);

// Initialize Services
export const db = getFirestore(app);
export const auth = getAuth(app);         // <-- ADDED: For use in app.jsx, styles.jsx, etc.
export const storage = getStorage(app);   // <-- ADDED: For use in signaturestylesupload.jsx

// Export the initialized app object itself, as required by some modules
export { app }; 
