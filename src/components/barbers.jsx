// src/components/barbers.jsx — FINAL (women stylists support)
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export default function Barbers() {
  const [barbers, setBarbers] = useState([]);
  const [specialtyFilter, setSpecialtyFilter] = useState('all'); // new for women

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'barbers'), (snap) => setBarbers(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return unsub;
  }, []);

  const filteredBarbers = barbers.filter(b => specialtyFilter === 'all' || b.specialty === specialtyFilter);

  return (
    <div>
      <select value={specialtyFilter} onChange={(e) => setSpecialtyFilter(e.target.value)}>
        <option value="all">all stylists</option>
        <option value="men">men</option>
        <option value="women">women</option>
        <option value="both">both</option>
      </select>
      {filteredBarbers.map(b => <div key={b.id}>{b.name} - {b.specialty}</div>)}
    </div>
  );
}
