// src/components/barberdashboard.jsx — FINAL ESDRAS STYLIST DASHBOARD (women-inclusive + lowercase + 100% blueprint compliant)
import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Link } from 'react-router-dom';

const NAVY = '#001F3F';
const GOLD = '#B8860B';

export default function BarberDashboard() {
  const [barber, setBarber] = useState(null);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [referrals, setReferrals] = useState(0);
  const [commissionRate, setCommissionRate] = useState(10);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const user = auth.currentUser;
  if (!user) return <div style={{textAlign:'center', padding:'5rem', color:'white', background:NAVY, fontFamily:'Montserrat'}}>login required</div>;

  useEffect(() => {
    const barberRef = doc(db, 'barbers', user.uid);
    const unsubBarber = onSnapshot(barberRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setBarber({ id: snap.id, ...data });
        const refs = data.successfulReferrals || 0;
        setReferrals(refs);
        const reduction = Math.floor(refs / 5);
        setCommissionRate(Math.max(5, 10 - reduction));
      }
      setLoading(false);
    });

    const now = new Date();
    const q = query(
      collection(db, 'bookings'),
      where('barberId', '==', user.uid),
      where('date', '>=', now),
      orderBy('date', 'asc')
    );

    const unsubBookings = onSnapshot(q, (snapshot) => {
      const bookings = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setUpcomingBookings(bookings);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todays = bookings.filter(b => b.date.toDate() >= today);
      const total = todays.reduce((sum, b) => sum + (b.amount || 0), 0);
      setTodayEarnings(total * (1 - commissionRate / 100));
    });

    return () => { unsubBarber(); unsubBookings(); };
  }, [user.uid, commissionRate]);

  const copyReferralLink = () => {
    navigator.clipboard.writeText(`https://esdras.app/?ref=${user.uid}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div style={{textAlign:'center', padding:'5rem', color:GOLD, background:NAVY, fontFamily:'Montserrat'}}>loading your empire...</div>;
  }

  if (!barber) {
    return <div style={{textAlign:'center', padding:'5rem', color:'white', background:NAVY, fontFamily:'Montserrat'}}>complete your stylist profile to unlock dashboard</div>;
  }

  const nextTier = referrals % 5 === 0 ? 5 : 5 - (referrals % 5);
  const isWomenSpecialist = barber.specialty?.includes('women') || barber.specialty === 'both';

  return (
    <div style={{
      minHeight:'100vh',
      background:NAVY,
      color:'white',
      padding:'1rem',
      fontFamily:'Montserrat, sans-serif'
    }}>
      <h1 style={{textAlign:'center', color:GOLD, fontSize:'2.8rem', fontWeight:'800', margin:'1rem 0'}}>
        stylist dashboard
      </h1>
      <p style={{textAlign:'center', fontSize:'1.5rem', opacity:0.9}}>
        welcome, {barber.shopName || barber.name} 👑
      </p>

      {/* women specialist badge */}
      {isWomenSpecialist && (
        <div style={{textAlign:'center', margin:'1rem 0', padding:'1rem', background:'rgba(184,134,11,0.3)', borderRadius:'20px', fontWeight:'bold'}}>
          women hairstylist specialist
        </div>
      )}

      {/* commission incentive banner */}
      {commissionRate < 10 && (
        <div style={{
          background:GOLD, color:'black', padding:'1.5rem', borderRadius:'20px',
          textAlign:'center', margin:'2rem 0', fontWeight:'bold', fontSize:'1.3rem'
        }}>
          🔥 you now pay only {commissionRate}% commission!<br/>
          <small>{referrals} successful referrals → {(10 - commissionRate)}% permanent discount</small>
        </div>
      )}
      {commissionRate === 10 && referrals > 0 && (
        <div style={{background:'rgba(184,134,11,0.3)', padding:'1rem', borderRadius:'16px', textAlign:'center'}}>
          only {nextTier} more referrals → 1% off forever!
        </div>
      )} 
      
<input type="text" placeholder="bank account" onChange={e => setBankAccount(e.target.value)} />
<button onClick={saveBankDetails}>save bank</button>

      {/* key metrics */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px,1fr))', gap:'1.5rem', margin:'2rem 0'}}>
        <div style={{background:'rgba(255,255,255,0.08)', padding:'2rem', borderRadius:'20px', textAlign:'center'}}>
          <p style={{fontSize:'3.5rem', margin:'0', color:GOLD}}>₦{todayEarnings.toFixed(0)}</p>
          <p>today's earnings ({100 - commissionRate}% yours)</p>
        </div>
        <div style={{background:'rgba(255,255,255,0.08)', padding:'2rem', borderRadius:'20px', textAlign:'center'}}>
          <p style={{fontSize:'3.5rem', margin:'0', color:GOLD}}>{upcomingBookings.length}</p>
          <p>upcoming bookings</p>
        </div>
        <div style={{background:'rgba(255,255,255,0.08)', padding:'2rem', borderRadius:'20px', textAlign:'center'}}>
          <p style={{fontSize:'3.5rem', margin:'0', color:GOLD}}>{referrals}</p>
          <p>successful referrals</p>
        </div>
      </div>

      {/* signature styles cta */}
      <div style={{textAlign:'center', margin:'3rem 0'}}>
        <Link
          to="/barber-signature-styles"
          style={{
            background:GOLD, color:'black', padding:'1.5rem 4rem',
            borderRadius:'50px', textDecoration:'none', fontWeight:'bold', fontSize:'1.3rem'
          }}
        >
          🎥 upload signature styles & reels
        </Link>
        <p style={{opacity:0.7, marginTop:'0.5rem'}}>showcase your best work → attract premium clients</p>
      </div>

      {/* upcoming appointments */}
      <h2 style={{color:GOLD, margin:'2rem 0 1rem'}}>upcoming appointments</h2>
      {upcomingBookings.length === 0 ? (
        <p style={{textAlign:'center', opacity:0.7}}>no bookings yet — share your profile!</p>
      ) : (
        upcomingBookings.map(b => (
          <div key={b.id} style={{background:'rgba(255,255,255,0.1)', padding:'1.5rem', borderRadius:'16px', margin:'1rem 0'}}>
            <p style={{margin:'0.5rem 0', fontWeight:'bold'}}>
              {b.clientName} • {b.date.toDate().toLocaleDateString()} at {b.date.toDate().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
            </p>
            <p style={{margin:'0.5rem 0'}}>style: {b.styleName} • ₦{b.amount?.toLocaleString()}</p>
            <p style={{margin:'0.5rem 0', color:GOLD}}>
              you earn: ₦{(b.amount * (1 - commissionRate/100)).toFixed(0)}
            </p>
          </div>
        ))
      )}

      {/* share profile */}
      <div style={{textAlign:'center', margin:'3rem 0'}}>
        <a
          href={`https://esdras.app/barber/${user.uid}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background:GOLD, color:'black', padding:'1.4rem 5rem',
            borderRadius:'50px', textDecoration:'none', fontWeight:'bold', fontSize:'1.3rem', margin:'0.5rem'
          }}
        >
          view public profile
        </a>
      </div> 

      {booking.status === 'pending' && (
  <button
    onClick={async () => {
      await updateDoc(doc(db, 'bookings', booking.id), {
        status: 'confirmed',
        confirmedTime: booking.proposedTime
      });
      // Trigger payment charge + calendar add via Cloud Function
    }}
    style={{background: GOLD, color: 'black', padding: '1rem', borderRadius: '50px'}}
  >
    Confirm Booking
  </button>
)}

      {/* referral link */}
      <div style={{textAlign:'center', margin:'2rem 0'}}>
        <p style={{opacity:0.8}}>your referral link (earn 1% off forever):</p>
        <code style={{background:'rgba(255,255,255,0.1)', padding:'0.5rem 1rem', borderRadius:'8px', fontSize:'1.1rem'}}>
          esdras.app/?ref={user.uid}
        </code>
        <button
          onClick={copyReferralLink}
          style={{
            background:GOLD, color:'black', border:'none', padding:'0.8rem 2rem',
            borderRadius:'50px', marginLeft:'1rem', cursor:'pointer', fontWeight:'bold'
          }}
        >
          {copied ? 'copied!' : 'copy'}
        </button>
      </div>

      <div style={{textAlign:'center', marginTop:'1rem', opacity:0.7, fontSize:'0.9rem'}}>
        powered by esdras — lagos pilot live
      </div>
    </div>
  );
      }
