// src/components/help.jsx — FINAL ESDRAS HELP/FEEDBACK (for users & stylists – admin resolves)
import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

const NAVY = '#001F3F';
const GOLD = '#B8860B';

export default function Help({ onClose }) {
  const [issue, setIssue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        userId: auth.currentUser.uid,
        issue,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      alert('Thanks – our team will resolve this soon!');
      onClose();
    } catch (err) {
      alert('Submission failed');
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)',
      display: 'grid', placeItems: 'center', zIndex: 999, padding: '1rem'
    }}>
      <div style={{
        background: NAVY, color: 'white', padding: '2rem',
        borderRadius: '28px', border: `4px solid ${GOLD}`,
        maxWidth: '90%', textAlign: 'center'
      }}>
        <h2 style={{color: GOLD, fontSize: '2.2rem'}}>Help & Feedback</h2>
        <p style={{opacity: 0.9, marginBottom: '1.5rem'}}>Tell us what's wrong – we'll fix it</p>
        <textarea
          placeholder="Describe the issue..."
          value={issue}
          onChange={e => setIssue(e.target.value)}
          style={{
            width: '100%', height: '150px', padding: '1rem', borderRadius: '12px',
            background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white'
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={submitting || !issue.trim()}
          style={{
            background: GOLD, color: 'black', padding: '1.5rem 4rem',
            border: 'none', borderRadius: '50px', fontSize: '1.5rem', fontWeight: 'bold',
            marginTop: '1.5rem'
          }}
        >
          {submitting ? 'Sending...' : 'Send'}
        </button>
        <button onClick={onClose} style={{marginTop: '1rem', color: '#888', background: 'none', border: 'none'}}>Cancel</button>
      </div>
    </div>
  );
      }
