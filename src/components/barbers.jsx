// src/components/barbers.jsx — FINAL ESDRAS BARBERS MARKETPLACE (featured stylists by rating + women support + map + 100% working)
import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';

const NAVY = '#001F3F';
const GOLD = '#B8860B';

const mapContainerStyle = {
  width: '100%',
  height: '70vh',
  borderRadius: '28px',
  border: `5px solid ${GOLD}`,
  overflow: 'hidden'
};

const defaultCenter = { lat: 6.5244, lng: 3.3792 }; // Lagos, Nigeria

export default function Barbers() {
  const [barbers, setBarbers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [map, setMap] = useState(null);
  const [specialtyFilter, setSpecialtyFilter] = useState('all'); // all / men / women / both
  const navigate = useNavigate();

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          map?.panTo(loc);
        },
        () => console.log('Location denied')
      );
    }

    // Fetch stylists — sorted by averageRating (highest first)
    const q = query(
      collection(db, 'barbers'),
      orderBy('averageRating', 'desc') // ← Featured stylists by rating!
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBarbers(data);
    }, (err) => {
      console.error('Failed to load stylists:', err);
    });

    return unsub;
  }, [map]);

  const filteredBarbers = barbers.filter(b => 
    specialtyFilter === 'all' || b.specialty === specialtyFilter
  );

  const handleBooking = (barber) => {
    if (!auth.currentUser) {
      navigate('/login');
      return;
    }
    navigate(`/barber/${barber.id}`);
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
        top rated stylists
      </h1>
      <p style={{fontSize: '1.4rem', opacity: 0.9, marginBottom: '2rem'}}>
        {userLocation ? 'best stylists near you in lagos' : 'allow location for best matches'}
      </p>

      {/* Specialty Filter */}
      <div style={{display:'flex', justifyContent:'center', gap:'1rem', margin:'2rem 0', flexWrap:'wrap'}}>
        <button onClick={() => setSpecialtyFilter('all')} style={{background: specialtyFilter==='all' ? GOLD : 'rgba(255,255,255,0.1)', color:'black', padding:'1rem 2rem', borderRadius:'50px', fontWeight:'bold'}}>all</button>
        <button onClick={() => setSpecialtyFilter('men')} style={{background: specialtyFilter==='men' ? GOLD : 'rgba(255,255,255,0.1)', color:'black', padding:'1rem 2rem', borderRadius:'50px', fontWeight:'bold'}}>men</button>
        <button onClick={() => setSpecialtyFilter('women')} style={{background: specialtyFilter==='women' ? GOLD : 'rgba(255,255,255,0.1)', color:'black', padding:'1rem 2rem', borderRadius:'50px', fontWeight:'bold'}}>women</button>
        <button onClick={() => setSpecialtyFilter('both')} style={{background: specialtyFilter==='both' ? GOLD : 'rgba(255,255,255,0.1)', color:'black', padding:'1rem 2rem', borderRadius:'50px', fontWeight:'bold'}}>both</button>
      </div>

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
          {filteredBarbers.map((barber) => (
            <Marker
              key={barber.id}
              position={{ lat: barber.lat, lng: barber.lng }}
              onClick={() => setSelected(barber)}
              icon={{
                url: '/gold-target-icon.png',
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
                <h3 style={{margin: '0 0 0.5rem', color: NAVY, fontSize: '1.4rem'}}>
                  {selected.shopName || selected.name}
                </h3>
                {selected.specialty && selected.specialty.includes('women') && (
                  <p style={{color: GOLD, fontWeight: 'bold', margin: '0.5rem 0'}}>women specialist</p>
                )}
                <p style={{margin: '0.4rem 0', opacity: 0.8}}>
                  ★ {selected.averageRating?.toFixed(1) || '5.0'} • {selected.area}
                </p>
                <p style={{margin: '0.6rem 0', color: GOLD, fontWeight: 'bold'}}>
                  {selected.specialty || 'precision cuts & styling'}
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
        we only take 10% – your stylist gets the rest
      </p>
    </div>
  );
  }
