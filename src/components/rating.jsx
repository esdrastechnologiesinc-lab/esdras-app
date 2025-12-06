// src/components/rating.jsx — FINAL ESDRAS RATING FORM (5 stars + comments)
import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp, updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { db, auth } from '../firebase';

const NAVY = '#001F3F';
const GOLD = '#B8860B';

export default function Rating({ bookingId, stylistId, onClose }) {
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const review = {
        bookingId,
        clientId: auth.currentUser.uid,
        stylistId,
        stars,
        comment,
        createdAt: serverTimestamp()
      };

      // Save review
      await addDoc(collection(db, 'reviews'), review);

      // Update stylist's average rating (simple – real app use Cloud Function for aggregation)
      await updateDoc(doc(db, 'barbers', stylistId), {
        ratings: arrayUnion(stars)
      });

      alert('Thanks for your review!');
      onClose();
    } catch (err) {
      alert('Review failed');
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
        <h2 style={{color: GOLD, fontSize: '2.2rem'}}>Rate Your Experience</h2>
        <div style={{margin: '2rem 0'}}>
          {[1,2,3,4,5].map(i => (
            <span
              key={i}
              onClick={() => setStars(i)}
              style={{fontSize: '2.5rem', cursor: 'pointer', color: i <= stars ? GOLD : '#888'}}
            >
              ★
            </span>
          ))}
        </div>
        <textarea
          placeholder="Your comments (optional)"
          value={comment}
          onChange={e => setComment(e.target.value)}
          style={{
            width: '100%', padding: '1rem', borderRadius: '12px',
            background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white'
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={submitting || stars === 0}
          style={{
            background: GOLD, color: 'black', padding: '1.5rem 4rem',
            border: 'none', borderRadius: '50px', fontSize: '1.5rem', fontWeight: 'bold',
            marginTop: '1.5rem'
          }}
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
        <button onClick={onClose} style={{marginTop: '1rem', color: '#888', background: 'none', border: 'none'}}>Cancel</button>
      </div>
    </div>
  );
}
