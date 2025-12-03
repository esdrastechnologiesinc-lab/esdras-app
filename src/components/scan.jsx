import React, { useRef, useState } from 'react';

export default function Scan({ user }) {
  const [scanning, setScanning] = useState(false);
  const [done, setDone] = useState(false);

  const start = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setDone(true);
      alert("360° Head Mesh Ready! 🎯");
    }, 8000);
  };

  return (
    <div style={{textAlign:'center', padding:'2rem'}}>
      <h2 style={{color:'#001F3F'}}>360° Head Scan</h2>
      {!done ? (
        <>
          <p>Hold phone steady. Rotate head slowly 360°</p>
          <div style={{width:'100%', height:'400px', background:'#000', borderRadius:'16px', margin:'1rem 0'}} />
          <button onClick={start} disabled={scanning} style={{background:'#B8860B', color:'white', padding:'1rem 3rem', fontSize:'1.3rem', border:'none', borderRadius:'12px'}}>
            {scanning ? "Scanning... 8s" : "Start Scan"}
          </button>
        </>
      ) : (
        <div style={{padding:'3rem', background:'#f9f9f9', borderRadius:'16px'}}>
          <h3>✅ Mesh Captured!</h3>
          <p>Your 3D head is saved</p>
          <a href="/styles" style={{background:'#B8860B', color:'white', padding:'1rem 3rem', textDecoration:'none', borderRadius:'12px', display:'inline-block', marginTop:'1rem'}}>
            Try Hairstyles →
          </a>
        </div>
      )}
    </div>
  );
}
