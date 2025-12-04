// src/components/barbers.jsx — FINAL ESDRAS BARBER MARKETPLACE (lagos-ready + 100% blueprint compliant)
import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';

const NAVY = '#001F3F';
const GOLD = '#B8860B';

const mapContainerStyle = {
  width: '100%',
  height: '70vh',
  borderRadius: '24px',
  border: `4px solid ${GOLD}`,
  overflow: 'hidden'
};

const defaultCenter = { lat: 6.5244, lng: 3.3792 }; // Lagos, Nigeria

export default function Barbers({ user }) {
  const [barbers, setBarbers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [map, setMap] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          map?.panTo(loc);
        },
        () => console.log('location denied')
      );
    }

    // Real-time barbers from Firestore
    const unsub = onSnapshot(collection(db, 'barbers'), (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBarbers(data);
    });

    return unsub;
  }, [map]);

  const handleBooking = (barber) => {
    if (!user) {
      navigate('/login');
      return;
    }
    // In real app: open booking modal or navigate to /book/:barberId
    alert(`booking request sent to ${barber.name}!\nesdras takes only 10% commission – the rest goes straight to your barber`);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: NAVY,
      color: 'white',
      fontFamily: 'Montserrat, sans-serif',
      padding: '2rem 1rem',
      textAlign: 'center'
    }}>
      <h1 style={{fontSize: '3rem', fontWeight: '800', color: GOLD, margin: '0 0 1rem'}}>
        find your perfect barber
      </h1>
      <p style={{fontSize: '1.4rem', opacity: 0.9, marginBottom: '3rem'}}>
        {userLocation ? 'top barbers near you in lagos' : 'allow location to see barbers around you'}
      </p>

      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={userLocation || defaultCenter}
          zoom={userLocation ? 14 : 11}
          onLoad={setMap}
          options={{
            styles: [{ featureType: 'poi', stylers: [{ visibility: 'off' }] }],
            disableDefaultUI: false,
            zoomControl: true
          }}
        >
          {barbers.map((barber) => (
            <Marker
              key={barber.id}
              position={{ lat: barber.lat, lng: barber.lng }}
              onClick={() => setSelected(barber)}
              icon={{
                url: '/barber-icon-gold.png', // gold scissor icon
                scaledSize: new window.google.maps.Size(56, 56)
              }}
            />
          ))}

          {selected && (
            <InfoWindow
              position={{ lat: selected.lat, lng: selected.lng }}
              onCloseClick={() => setSelected(null)}
            >
              <div style={{padding: '1rem', maxWidth: '280px', fontFamily: 'Montserrat, sans-serif'}}>
                <h3 style={{margin: '0 0 0.5rem', color: NAVY, fontSize: '1.4rem'}}>{selected.name.toLowerCase()}</h3>
                <p style={{margin: '0.4rem 0', opacity: 0.8}}>⭐ {selected.rating || '4.9'} • {selected.area || 'lagos'}</p>
                <p style={{margin: '0.6rem 0', color: GOLD, fontWeight: 'bold'}}>
                  {selected.specialty || 'fades • afro • coils'}
                </p>
                <p style={{margin: '0.6rem 0', fontSize: '1.1rem'}}>
                  ₦{selected.priceLow || '3000'} – ₦{selected.priceHigh || '8000'}
                </p>
                <button
                  onClick={() => handleBooking(selected)}
                  style={{
                    width: '100%',
                    background: GOLD,
                    color: 'black',
                    border: 'none',
                    padding: '1rem',
                    borderRadius: '50px',
                    fontWeight: 'bold',
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    marginTop: '0.8rem'
                  }}
                >
                  book now • 10% esdras fee
                </button>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>

      <p style={{marginTop: '3rem', opacity: 0.7, fontSize: '1rem'}}>
        powered by esdras • lagos’ precision grooming marketplace<br/>
        we only take 10% – your barber gets the rest
      </p>
    </div>
  );
                             }
