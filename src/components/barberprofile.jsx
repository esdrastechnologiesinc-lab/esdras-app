import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function BarberProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [barber, setBarber] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState('');
  const [date, setDate] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    const fetchBarber = async () => {
      const snap = await getDoc(doc(db, 'barbers', id));
      if (snap.exists()) {
        setBarber({ id, ...snap.data() });
      }
    };
    fetchBarber();
  }, [id]);

  const handleBooking = async () => {
    if (!selectedStyle || !date || !name || !phone) {
      alert('Please fill all fields');
      return;
    }

    // In real app, save to Firestore bookings collection
    alert(`Booking Confirmed!\n\n\( {name}, your \){selectedStyle} with \( {barber.name} is set for \){date}\n\nA WhatsApp message has been prepared for ${barber.name}.`);
    
    // Auto-open WhatsApp with pre-filled message
    const message = `Hi \( {barber.name}, I'd like to book a \){selectedStyle} on ${date}. Seen on ESDRAS — Precision Grooming. Zero Regrets.`;
    window.open(`https://wa.me/\( {phone.replace(/[^0-9]/g, '')}?text= \){encodeURIComponent(message)}`, '_blank');
  };

  if (!barber) return <div style={{textAlign:'center', padding:'3rem', color:'#001F3F'}}><h2>Loading Pro Barber...</h2></div>;

  return (
    <div style={{background:'#f8f8f8', minHeight:'100vh', fontFamily:'Montserrat, sans-serif'}}>
      {/* Hero */}
      <div style={{background:'linear-gradient(135deg, #001F3F, #001830)', color:'white', padding:'3rem 1rem', textAlign:'center'}}>
        <img src="/esdras-logo.png" alt="ESDRAS" style={{height:'80px', marginBottom:'1rem'}} />
        <h1 style={{color:'#B8860B', fontSize:'2.2rem', margin:'0.5rem 0'}}>{barber.name}</h1>
        <p style={{fontSize:'1.3rem', margin:'0.5rem 0'}}>{barber.shop} • {barber.location}</p>
        <p style={{fontSize:'1.5rem'}}>⭐ {barber.rating || 4.9} • {barber.specialty} • {barber.price}</p>
      </div>

      {/* Video Reels */}
      {barber.videoReels?.length > 0 && (
        <div style={{padding:'2rem 1rem'}}>
          <h2 style={{color:'#001F3F', textAlign:'center'}}>Signature Style Reels</h2>
          <div style={{display:'grid', gridTemplateColumns:'1fr', gap:'1rem', maxWidth:'500px', margin:'0 auto'}}>
            {barber.videoReels.map((v, i) => (
              <video key={i} controls style={{width:'100%', borderRadius:'16px', boxShadow:'0 10px 30px rgba(0,0,0,0.2)'}}>
                <source src={v.url} />
              />
              </video>
            ))}
          </div>
        </div>
      )}

      {/* Booking Form */}
      <div style={{background:'white', margin:'2rem 1rem', padding:'2rem', borderRadius:'20px', boxShadow:'0 10px 40px rgba(0,0,0,0.1)'}}>
        <h2 style={{color:'#001F3F', textAlign:'center'}}>Book Your Perfect Cut</h2>
        <div style={{maxWidth:'400px', margin:'0 auto'}}>
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{width:'100%', padding:'1rem', margin:'0.8rem 0', borderRadius:'12px', border:'1px solid #ddd'}}
          />
          <input
            type="tel"
            placeholder="Your Phone (WhatsApp)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{width:'100%', padding:'1rem', margin:'0.8rem 0', borderRadius:'12px', border:'1px solid #ddd'}}
          />
          <select
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value)}
            style={{width:'100%', padding:'1rem', margin:'0.8rem 0', borderRadius:'12px', border:'1px solid #ddd'}}
          >
            <option value="">Select Style</option>
            <option>High Fade</option>
            <option>Skin Fade</option>
            <option>Afro Shape-Up</option>
            <option>Dread Retwist</option>
            <option>Beard Sculpt</option>
            <option>Custom Design</option>
          </select>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{width:'100%', padding:'1rem', margin:'0.8rem 0', borderRadius:'12px', border:'1px solid #ddd'}}
          />
          <button
            onClick={handleBooking}
            style={{width:'100%', background:'#B8860B', color:'white', padding:'1.3rem', fontSize:'1.3rem', border:'none', borderRadius:'16px', marginTop:'1rem'}}
          >
            Book Now → ESDRAS takes only 10%
          </button>
        </div>
      </div>

      <div style={{textAlign:'center', padding:'2rem', color:'#001F3F'}}>
        <p>Powered by <strong>ESDRAS</strong><br/>Precision Grooming. Zero Regrets</p>
      </div>
    </div
