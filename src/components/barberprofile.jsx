// src/components/barberprofile.jsx — FINAL (women specialist badge)
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function BarberProfile() {
  const { id } = useParams();
  const [barber, setBarber] = useState(null);

  useEffect(() => {
    getDoc(doc(db, 'barbers', id)).then(snap => setBarber(snap.data()));
  }, [id]);

  return (
    <div>
      <h1>{barber?.name}</h1>
      {barber?.specialty.includes('women') && <p>women specialist</p>}
      {/* ... rest as before */}
    </div>
  );
}
