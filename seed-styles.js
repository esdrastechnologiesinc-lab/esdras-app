// seed-styles.js — ONE-TIME SCRIPT TO SEED THE STYLES LIBRARY
const admin = require('firebase-admin');
const serviceAccount = require('./path-to-your-firebase-adminsdk.json'); // download from Firebase Console → Project Settings → Service Accounts

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const coreStyles = [
  { name: 'Low Fade', gender: 'male', length: 'short', faceShape: ['oval', 'square'], rating: 4.9, isPremium: false },
  { name: 'Textured Crop', gender: 'male', length: 'short', faceShape: ['oval', 'round'], rating: 4.8, isPremium: false },
  { name: 'Cornrows', gender: 'female', length: 'long', faceShape: ['oval', 'heart'], rating: 4.9, isPremium: false },
  { name: 'Box Braids', gender: 'female', length: 'long', faceShape: ['oval', 'square'], rating: 5.0, isPremium: true },
  { name: 'Skin Fade', gender: 'male', length: 'short', faceShape: ['square', 'diamond'], rating: 4.7, isPremium: false },
  { name: 'Ghana Weaving', gender: 'female', length: 'long', faceShape: ['round', 'oval'], rating: 4.9, isPremium: false },
  // Add 44–94 more styles here (men + women, African/Coiled focus)
  // Use real image URLs from Firebase Storage
];

async function seedLibrary() {
  for (const style of coreStyles) {
    await db.collection('styles').add({
      ...style,
      image: 'https://your-storage-url.com/placeholder.jpg', // replace with real URLs
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }
  console.log('✅ Styles library seeded with', coreStyles.length, 'styles!');
  process.exit();
}

seedLibrary().catch(console.error);
