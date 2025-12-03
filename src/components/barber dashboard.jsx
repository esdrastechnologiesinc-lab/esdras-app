// src/components/barberdashboard.jsx — FINAL VERSION (100% matches your docs)
import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { db, auth } from '../firebase';

export default function BarberDashboard() {
  const [barber, setBarber] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [earnings, setEarnings] = useState(0);
  const [referrals, setReferrals] = useState(0);
  const [commissionRate, setCommissionRate] = useState(10); // ESDRAS takes 10%
  const [loading, setLoading] = useState(true);

  const user = auth.currentUser;
  if (!user) {
    return <div style={{textAlign:'center', padding:'5rem', color:'white', background:'#001F3F'}}>Login required</div>;
  }

  useEffect(() => {
    // Load barber profile
    const barberRef = doc(db, 'barbers', user.uid);
    const unsubBarber = onSnapshot(barberRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setBarber({ id: snap.id, ...data });
        setReferrals(data.successfulReferrals || 0);
        // 1% reduction per 5 referrals (from your docs)
        const reduction = Math.floor((data.successfulReferrals || 0) / 5);
        setCommissionRate(Math.max(5, 10 - reduction)); // Min 5%
      }
      setLoading(false);
    });

    // Load today's bookings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const q = query(
      collection(db, 'bookings'),
      where('barberId', '==', user.uid),
      where('date', '>=', today)
    );

    const unsubBookings = onSnapshot(q, (snapshot) => {
      const myBookings = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setBookings(myBookings);
      const total = myBookings.reduce((sum, b) => sum + b.amount, 0);
      const barberGets = total * (1 - commissionRate / 100);
      setEarnings(barberGets);
    });

    return () => {
      unsubBarber();
      unsubBookings();
    };
  }, [user.uid, commissionRate]);

  if (loading) {
    return <div style={{textAlign:'center', padding:'5rem', color:'#B8860B', background:'#001F3F'}}>Loading Dashboard...</div>;
  }

  if (!barber) {
    return <div style={{textAlign:'center', padding:'5rem', color:'white', background:'#001F3F'}}>Barber profile not found</div>;
  }

  return (
    <div style={{padding:'1rem', background:'#001F3F', color:'white', minHeight:'100vh', fontFamily:'Montserrat,sans-serif'}}>
      <h1 style={{textAlign:'center', color:'#B8860B', fontSize:'2.5rem', marginBottom:'0.5rem'}}>Barber Dashboard</h1>
      <p style={{textAlign:'center', fontSize:'1.4rem', opacity:0.9}}>Welcome, {barber.shopName || barber.name}</p>

      {/* Commission Incentive Banner */}
      {commissionRate < 10 && (
        <div style={{background:'#B8860B', color:'black', padding:'1rem', borderRadius:'16px', textAlign:'center', margin:'1rem 0', fontWeight:'bold'}}>
          Congratulations! You now pay only {commissionRate}% commission (saved {(10 - commissionRate)}%) thanks to {referrals} referrals!
        </div>
      )}

      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px,1fr))', gap:'1rem', margin:'2rem 0'}}>
        <div style={{background:'#0a3d62', padding:'2rem', borderRadius:'20px', textAlign:'center'}}>
          <p style={{fontSize:'3.5rem', margin:'0', color:'#B8860B'}}>₦{earnings.toFixed(0)}</p>
          <p style={{fontSize:'1.1rem'}}>Today's Earnings ({100 - commissionRate}% yours)</p>
        </div>
        <div style={{background:'#0a3d62', padding:'2rem', borderRadius:'20px', textAlign:'center'}}>
          <p style={{fontSize:'3.5rem', margin:'0', color:'#B8860B'}}>{bookings.length}</p>
          <p style={{fontSize:'1.1rem'}}>Bookings Today</p>
        </div>
        <div style={{background:'#0a3d62', padding:'2rem', borderRadius:'20px', textAlign:'center'}}>
          <p style={{fontSize:'3.5rem', margin:'0', color:'#B8860B'}}>{referrals}</p>
          <p style={{fontSize:'1.1rem'}}>Successful Referrals</p>
        </div>
      </div>

      <h2 style={{color:'#B8860B', marginTop:'2rem'}}>Today's Appointments</h2>
      {bookings.length === 0 ? (
        <p style={{textAlign:'center', opacity:0.7, fontSize:'1.2rem'}}>No bookings yet — share your profile link!</p>
      ) : (
        bookings.map(b => (
          <div key={b.id} style={{background:'rgba(255,255,255,0.1)', padding:'1.5rem', borderRadius:'16px', margin:'1rem 0'}}>
            <p style={{margin:'0.5rem 0'}}><strong>{b.clientName}</strong> • {new Date(b.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            <p style={{margin:'0.5rem 0'}}>Style: {b.styleName} • ₦{b.amount.toLocaleString()}</p>
            <p style={{margin:'0.5rem 0', color:'#B8860B'}}>You earn: ₦{(b.amount * (1 - commissionRate/100)).toFixed(0)}</p>
          </div>
        ))
      )}

      <div style={{textAlign:'center', margin:'3rem 0'}}>
        <a 
          href={`https://esdras.app/barber/${user.uid}`} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{background:'#B8860B', color:'black', padding:'1.2rem 4rem', borderRadius:'50px', textDecoration:'none', fontWeight:'bold', fontSize:'1.2rem'}}
        >
          View My Public Profile
        </a>
      </div>

      <div style={{textAlign:'center', marginTop:'1rem', opacity:0.8}}>
        <small>Your referral link: esdras.app/?ref={user.uid}</small>
      </div>
    </div>
  );
                   }
