// src/components/barberprofile.jsx — FINAL ESDRAS BARBER PROFILE (supply-side capture + signature styles + video reel)
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import BookingModal from './booking-modal';

const NAVY = '#001F3F';
const GOLD = '#B8860B';

export default function BarberProfile() {
  const { id } = useParams();
  const [barber, setBarber] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(null);
  const [frontViewImage, setFrontViewImage] = useState(null); // from try-on if user previews
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    const fetchBarber = async () => {
      const snap = await getDoc(doc(db, 'barbers', id));
      if (snap.exists()) {
        setBarber({ id: snap.id, ...snap.data() });
      } else {
        alert('barber not found');
      }
    };
    fetchBarber();
  }, [id]);

  if (!barber) {
    return (
      <div style={{ minHeight: '100vh', background: NAVY, color: GOLD, display: 'grid', placeItems: 'center', fontFamily: 'Montserrat, sans-serif' }}>
        <h2>loading barber...</h2>
      </div>
    );
  }

  const signatureStyles = barber.signatureStyles || []; // array of { name, image, styleId }
  const averageRating = barber.averageRating?.toFixed(1) || '4.8';
  const totalBookings = barber.totalBookings || 0;

  return (
    <div style={{
      minHeight: '100vh',
      background: NAVY,
      color: 'white',
      fontFamily: 'Montserrat, sans-serif',
      padding: '2rem 1rem'
    }}>
      {/* Hero */}
      <h1 style={{ textAlign: 'center', color: GOLD, fontSize: '3rem', fontWeight: '800', margin: '0 0 0.5rem' }}>
        {barber.shopName || barber.name}
      </h1>
      <p style={{ textAlign: 'center', fontSize: '1.5rem', opacity: 0.9 }}>
        {barber.location} • ★ {averageRating} ({totalBookings} bookings)
      </p>

      {/* Video Reel Showcase */}
      {barber.reelVideoUrl && (
        <div style={{ maxWidth: '560px', margin: '2.5rem auto', borderRadius: '28px', overflow: 'hidden', border: `6px solid ${GOLD}` }}>
          <video src={barber.reelVideoUrl} controls autoPlay loop muted style={{ width: '100%', display: 'block' }} />
        </div>
      )}

      {/* Info Card */}
      <div style={{
        background: 'rgba(184,134,11,0.15)',
        padding: '2rem',
        borderRadius: '24px',
        margin: '2rem auto',
        maxWidth: '560px',
        border: `2px solid ${GOLD}`
      }}>
        <p style={{ margin: '0.8rem 0', fontSize: '1.3rem' }}>
          <strong>hours:</strong> {barber.hours || 'mon–sat 9am–7pm'}
        </p>
        <p style={{ margin: '0.8rem 0', fontSize: '1.3rem' }}>
          <strong>price range:</strong> ₦{barber.priceLow?.toLocaleString()} – ₦{barber.priceHigh?.toLocaleString()}
        </p>
        <p style={{ margin: '0.8rem 0', fontSize: '1.3rem' }}>
          <strong>specialty:</strong> {barber.specialty || 'precision fades & modern styles'}
        </p>
      </div>

      {/* Signature Styles Grid */}
      <h2 style={{ textAlign: 'center', color: GOLD, fontSize: '2.2rem', margin: '3rem 0 1.5rem' }}>
        signature styles
      </h2>
      {signatureStyles.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1.5rem',
          maxWidth: '680px',
          margin: '0 auto'
        }}>
          {signatureStyles.map((style) => (
            <div
              key={style.id}
              onClick={() => {
                // In real app: trigger try-on with this styleId
                // For now: just select for booking
                setSelectedStyle(style);
                alert(`preview "${style.name}" on your head coming soon • tap book below`);
              }}
              style={{ cursor: 'pointer', textAlign: 'center' }}
            >
              <img
                src={style.image}
                alt={style.name}
                style={{
                  width: '100%',
                  borderRadius: '20px',
                  border: `4px solid ${GOLD}`
                }}
              />
              <p style={{ margin: '0.8rem 0', fontWeight: 'bold' }}>{style.name.toLowerCase()}</p>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ textAlign: 'center', opacity: 0.7 }}>no signature styles yet • check back soon</p>
      )}

      {/* Book Button – only active if style selected */}
      <div style={{ textAlign: 'center', margin: '3rem 0' }}>
        <button
          onClick={() => selectedStyle && setShowBooking(true)}
          disabled={!selectedStyle}
          style={{
            background: selectedStyle ? GOLD : '#444',
            color: 'black',
            padding: '1.6rem 6rem',
            border: 'none',
            borderRadius: '50px',
            fontSize: '1.6rem',
            fontWeight: 'bold',
            opacity: selectedStyle ? 1 : 0.6,
            cursor: selectedStyle ? 'pointer' : 'not-allowed'
          }}
        >
          {selectedStyle ? `book "${selectedStyle.name.toLowerCase()}" now` : 'choose a style first'}
        </button>
      </div>

      {/* Booking Modal */}
      {showBooking && selectedStyle && (
        <BookingModal
          barber={barber}
          styleName={selectedStyle.name}
          renderedImageUrl={frontViewImage} // will come from try-on later
          onClose={() => {
            setShowBooking(false);
            setSelectedStyle(null);
          }}
        />
      )}

      {/* Share */}
      <p style={{ textAlign: 'center', opacity: 0.7, marginTop: '4rem', fontSize: '1.1rem' }}>
        share this barber → esdras.app/barbers/{id}
      </p>
    </div>
  );
      }
