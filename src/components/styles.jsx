// src/components/styles.jsx — FINAL (with gender filter for women)
import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, increment, collection } from 'firebase/firestore';
import { db, auth } from '../firebase';
import ImportStyle from './importstyle';

export default function Styles() {
  const [styles, setStyles] = useState([]);
  const [genderFilter, setGenderFilter] = useState('all'); // new for women

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'styles'), (snap) => setStyles(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    return unsub;
  }, []);

  const filteredStyles = styles.filter(s => genderFilter === 'all' || s.gender === genderFilter);

  return (
    <div>
      <select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
        <option value="all">all styles</option>
        <option value="male">men</option>
        <option value="female">women</option>
      </select>
      {filteredStyles.map(s => <div key={s.id}>{s.name}</div>)}
      <ImportStyle />
    </div>
  );
}
