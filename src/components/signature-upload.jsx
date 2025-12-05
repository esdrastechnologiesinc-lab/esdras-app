// src/components/signature-upload.jsx — NEW: STYLIST SIGNATURE UPLOAD
import React, { useState } from 'react';
import { auth, db, storage } from '../firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export default function SignatureUpload() {
  const [styleName, setStyleName] = useState('');
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);

  const handleUpload = async () => {
    // Upload image/video to Storage
    const imageUrl = image ? await uploadToStorage(image, 'images') : null;
    const videoUrl = video ? await uploadToStorage(video, 'videos') : null;

    // Add to global styles
    await addDoc(collection(db, 'styles'), {
      name: styleName,
      image: imageUrl,
      video: videoUrl,
      gender: 'universal', // or stylist input
      createdBy: auth.currentUser.uid,
      isSignature: true,
      createdAt: serverTimestamp()
    });

    alert('signature style added to library!');
  };

  const uploadToStorage = async (file, type) => {
    const path = `signature/\( {auth.currentUser.uid}/ \){Date.now()}.${type === 'images' ? 'jpg' : 'mp4'}`;
    const ref = storageRef(storage, path);
    await uploadBytes(ref, file);
    return await getDownloadURL(ref);
  };

  return (
    <div>
      <input type="text" placeholder="style name" onChange={e => setStyleName(e.target.value)} />
      <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} />
      <input type="file" accept="video/*" onChange={e => setVideo(e.target.files[0])} />
      <button onClick={handleUpload}>upload signature style</button>
    </div>
  );
      }
