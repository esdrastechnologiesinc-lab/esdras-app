// src/components/signaturestylesupload.jsx — FINAL STYLIST SIGNATURE STYLES UPLOAD
import React, { useState } from 'react';
import { auth, db, storage } from '../firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const NAVY = '#001F3F';
const GOLD = '#B8860B';

export default function SignatureStylesUpload() {
  const [styleName, setStyleName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!styleName.trim() || (!imageFile && !videoFile)) {
      alert('please add a name and at least one image or video');
      return;
    }

    setUploading(true);

    try {
      let imageUrl = null;
      let videoUrl = null;

      if (imageFile) {
        const imgRef = storageRef(storage, `signature-styles/\( {auth.currentUser.uid}/ \){Date.now()}-image.jpg`);
        await uploadBytes(imgRef, imageFile);
        imageUrl = await getDownloadURL(imgRef);
      }

      if (videoFile) {
        const vidRef = storageRef(storage, `signature-styles/\( {auth.currentUser.uid}/ \){Date.now()}-video.mp4`);
        await uploadBytes(vidRef, videoFile);
        videoUrl = await getDownloadURL(vidRef);
      }

      // Add to global styles library
      await addDoc(collection(db, 'styles'), {
        name: styleName,
        image: imageUrl,
        video: videoUrl,
        gender: 'universal', // or let stylist choose later
        createdBy: auth.currentUser.uid,
        isSignature: true,
        createdAt: serverTimestamp()
      });

      setSuccess(true);
      setTimeout(() => navigate('/barber/dashboard'), 2000);
    } catch (err) {
      console.error(err);
      alert('upload failed – try again');
      setUploading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: NAVY,
      color: 'white',
      fontFamily: 'Montserrat, sans-serif',
      padding: '2rem 1rem',
      textAlign: 'center'
    }}>
      <h1 style={{color: GOLD, fontSize: '2.8rem', fontWeight: '800'}}>
        upload signature style
      </h1>
      <p style={{opacity: 0.9, margin: '1rem 0 2rem'}}>
        showcase your best work – it goes to the global style library
      </p>

      <input
        type="text"
        placeholder="style name (e.g. the saheed cut)"
        value={styleName}
        onChange={(e) => setStyleName(e.target.value)}
        style={{
          width: '90%',
          maxWidth: '500px',
          padding: '1.4rem',
          margin: '1rem 0',
          borderRadius: '20px',
          background: 'rgba(255,255,255,0.1)',
          border: 'none',
          color: 'white',
          fontSize: '1.2rem'
        }}
      />

      <div style={{margin: '2rem 0'}}>
        <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
        <p style={{opacity: 0.7, fontSize: '0.9rem'}}>photo of the style</p>
      </div>

      <div style={{margin: '2rem 0'}}>
        <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files[0])} />
        <p style={{opacity: 0.7, fontSize: '0.9rem'}}>optional 30-60s reel</p>
      </div>

      <button
        onClick={handleUpload}
        disabled={uploading}
        style={{
          background: GOLD,
          color: 'black',
          padding: '1.6rem 5rem',
          border: 'none',
          borderRadius: '50px',
          fontSize: '1.6rem',
          fontWeight: 'bold',
          opacity: uploading ? 0.7 : 1
        }}
      >
        {uploading ? 'uploading...' : 'publish to library'}
      </button>

      {success && <p style={{color: GOLD, marginTop: '2rem', fontSize: '1.4rem'}}>style published!</p>}
    </div>
  );
        }
