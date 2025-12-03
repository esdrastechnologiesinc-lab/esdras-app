import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import html2canvas from 'html2canvas';

function Head() {
  return (
    <mesh>
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshStandardMaterial color="#f4c2a1" />
    </mesh>
  );
}

export default function Styles({ user }) {
  const [count, setCount] = useState(0);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (user) {
      getDoc(doc(db, 'users', user.uid)).then(s => {
        const data = s.data() || { count: 0 };
        setCount(data.count);
        if (data.count >= 10) setBlocked(true);
      });
    }
  }, [user]);

  const tryStyle = async () => {
    if (count >= 10) return setBlocked(true);
    const newC = count + 1;
    setCount(newC);
    await setDoc(doc(db, 'users', user.uid), { count: newC }, { merge: true });
  };

  const downloadWhatIf = () => {
    html2canvas(document.getElementById('preview')).then(c => {
      const a = document.createElement('a');
      a.href = c.toDataURL();
      a.download = 'ESDRAS-WhatIf.png';
      a.click();
    });
  };

  return (
    <div style={{padding:'1rem', textAlign:'center'}}>
      <h2 style={{color:'#001F3F'}}>3D Try-On</h2>
      <p>Free styles used: {count}/10</p>

      <div id="preview" style={{background:'white', padding:'1rem', borderRadius:'16px'}}>
        <div style={{height:'500px', background:'#f0f0f0', borderRadius:'12px'}}>
          <Canvas>
            <ambientLight />
            <directionalLight position={[5,5,5]} />
            <Head />
            <OrbitControls />
          </Canvas>
        </div>
        <p style={{fontSize:'1.5rem', margin:'1rem', color:'#001F3F'}}>High Fade Preview</p>
      </div>

      {blocked ? (
        <div style={{margin:'2rem', padding:'2rem', background:'#001F3F', color:'white', borderRadius:'16px'}}>
          <h3>Upgrade for Unlimited</h3>
          <p>$9.99/month</p>
          <button style={{background:'#B8860B', padding:'1rem 3rem', border:'none', borderRadius:'12px'}}>
            Subscribe Now
          </button>
        </div>
      ) : (
        <>
          <button onClick={tryStyle} style={{background:'#B8860B', color:'white', padding:'1.5rem 4rem', fontSize:'1.5rem', border:'none', borderRadius:'12px', margin:'1rem'}}>
            Try New Style
          </button>
          <br/>
          <button onClick={downloadWhatIf} style={{background:'#001F3F', color:'white', padding:'1rem 2rem', border:'none', borderRadius:'12px', margin:'1rem'}}>
            Download What-If Image
          </button>
        </>
      )}
    </div>
  );
}
