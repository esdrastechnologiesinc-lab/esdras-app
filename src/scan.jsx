import React, { useState } from 'react';
import { getStorage, ref, uploadBytes } from 'firebase/storage';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Scan = ({ user }) => {
  const [videoFile, setVideoFile] = useState(null);
  const navigate = useNavigate();
  const storage = getStorage();
  const db = getFirestore();

  const handleScan = async () => {
    if (!videoFile) return;
    const storageRef = ref(storage, `scans/${user.uid}.mp4`);
    await uploadBytes(storageRef, videoFile);
    // Simulate mesh ID
    await setDoc(doc(db, 'users', user.uid), { currentMeshID: 'simulated-mesh' }, { merge: true });
    navigate('/styles');
  };

  return (
    <div>
      <h2>Initial 360° Scan</h2>
      <p>Upload a 360° video of your head (simulated for web).</p>
      <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files[0])} />
      <button onClick={handleScan}>Upload and Process</button>
    </div>
  );
};

export default Scan;
