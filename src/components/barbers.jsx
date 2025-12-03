import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

const mapContainerStyle = { width: '100%', height: '70vh', borderRadius: '12px' };
const center = { lat: 40.7128, lng: -74.0060 }; // Default NYC – will auto-center to user

const barbers = [
  { id: 1, name: "Ace Cuts Barbershop", lat: 40.7420, lng: -73.9880, rating: 4.9, specialty: "Fades & Tapers", price: "\[ " },
  { id: 2, name: "Levels Barbershop", lat: 40.7489, lng: -73.9680, rating: 4.8, specialty: "Afro & Coils", price: " \]$" },
  { id: 3, name: "The Master Barber", lat: 40.7614, lng: -73.9776, rating: 5.0, specialty: "Classic & Skin Fades", price: "\[ " },
  { id: 4, name: "Elite Grooming Lounge", lat: 40.7048, lng: -74.0110, rating: 4.7, specialty: "Beard Sculpting", price: " \]$$" },
];

export default function Barbers({ user }) {
  const [selected, setSelected] = useState(null);
  const [map, setMap] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.log("Location denied")
      );
    }
  }, []);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2 style={{ color: '#001F3F', marginBottom: '1rem' }}>Find Your Perfect Barber</h2>
      <p style={{ color: '#555', marginBottom: '2rem' }}>
        {userLocation ? "We found barbers near you" : "Allow location for the best matches"}
      </p>

      <LoadScript googleMapsApiKey="AIzaSyC8zEj1VeNZWo0k0FOplapSYkGwGlLwbeU">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={userLocation || center}
          zoom={13}
          onLoad={(map) => setMap(map)}
          options={{ styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }] }}
        >
          {barbers.map((barber) => (
            <Marker
              key={barber.id}
              position={{ lat: barber.lat, lng: barber.lng }}
              onClick={() => setSelected(barber)}
              icon={{ url: "https://esdras-app.netlify.app/barber-icon.png", scaledSize: new window.google.maps.Size(50, 50) }}
            />
          ))}

          {selected && (
            <InfoWindow
              position={{ lat: selected.lat, lng: selected.lng }}
              onCloseClick={() => setSelected(null)}
            >
              <div style={{ padding: '0.5rem', fontFamily: 'Montserrat, sans-serif' }}>
                <h3 style={{ margin: '0 0 0.5rem', color: '#001F3F' }}>{selected.name}</h3>
                <p style={{ margin: '0.3rem 0' }}>⭐ {selected.rating} • {selected.price}</p>
                <p style={{ margin: '0.3rem 0', fontWeight: 'bold', color: '#B8860B' }}>{selected.specialty}</p>
                <button style={{
                  background: '#B8860B', color: 'white', border: 'none',
                  padding: '0.8rem 1.5rem', borderRadius: '8px', marginTop: '0.8rem', cursor: 'pointer'
                }}>
                  Book Now (10% ESDRAS Fee)
                </button>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>

      <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#777' }}>
        Powered by ESDRAS – Precision Grooming Marketplace
      </p>
    </div>
  );
            }
