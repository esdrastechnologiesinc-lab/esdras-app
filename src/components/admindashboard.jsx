// src/components/admindashboard.jsx — FINAL ESDRAS ADMIN DASHBOARD (feedback resolve UI + revoke access + full premium UI)
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const NAVY = '#001F3F';
const GOLD = '#B8860B';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [stylists, setStylists] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [accessLevel, setAccessLevel] = useState('viewer');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [reply, setReply] = useState('');

  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      alert('Login required');
      return;
    }

    const checkAdmin = async () => {
      const idTokenResult = await user.getIdTokenResult();
      if (idTokenResult.claims.isAdmin) {
        setAccessLevel(idTokenResult.claims.accessLevel || 'viewer');
      } else {
        alert('Admin access required');
        return;
      }
    };
    checkAdmin();

    const unsubs = [
      onSnapshot(collection(db, 'users'), snap => setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })))),
      onSnapshot(collection(db, 'barbers'), snap => setStylists(snap.docs.map(d => ({ id: d.id, ...d.data() })))),
      onSnapshot(collection(db, 'bookings'), snap => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setBookings(data);
        const revenue = data.reduce((sum, b) => sum + (b.amount * 0.1), 0);
        setTotalRevenue(revenue);
      }),
      onSnapshot(collection(db, 'transactions'), snap => setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })))),
      onSnapshot(collection(db, 'reviews'), snap => setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() })))),
      onSnapshot(collection(db, 'feedback'), snap => setFeedback(snap.docs.map(d => ({ id: d.id, ...d.data() })))),
    ];

    return () => unsubs.forEach(unsub => unsub());
  }, [user]);

  const resolveFeedback = async (feedbackId) => {
    if (reply.trim() === '') return alert('Enter a reply');

    await updateDoc(doc(db, 'feedback', feedbackId), {
      status: 'resolved',
      reply,
      resolvedBy: user.uid,
      resolvedAt: serverTimestamp()
    });
    setSelectedFeedback(null);
    setReply('');
    alert('Feedback resolved');
  };

  const revokeAccess = async (targetUserId) => {
    if (accessLevel !== 'superadmin') return alert('Superadmin only');
    await setDoc(doc(db, 'admins', targetUserId), { accessLevel: 'none' }, { merge: true });
    alert('Access revoked');
  };

  // Revenue Chart
  const revenueChart = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Revenue (₦)',
      data: [12000, 19000, 30000, 25000, 42000, 58000],
      borderColor: GOLD,
      backgroundColor: 'rgba(184, 134, 11, 0.2)',
      tension: 0.4
    }]
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: NAVY,
      color: 'white',
      padding: '2rem',
      fontFamily: 'Montserrat, sans-serif'
    }}>
      <h1 style={{textAlign: 'center', color: GOLD, fontSize: '3rem', fontWeight: '800'}}>
        ESDRAS ADMIN DASHBOARD
      </h1>
      <p style={{textAlign: 'center', fontSize: '1.4rem', opacity: 0.9}}>
        Access Level: <strong>{accessLevel.toUpperCase()}</strong>
      </p>

      <div style={{background: 'rgba(255,255,255,0.1)', padding: '2rem', borderRadius: '20px', margin: '2rem 0'}}>
        <h2>Total Revenue: ₦{totalRevenue.toLocaleString()}</h2>
        <Line data={revenueChart} options={{ responsive: true, plugins: { legend: { labels: { color: 'white' } } } }} />
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem'}}>
        <div style={{background: 'rgba(255,255,255,0.08)', padding: '1.5rem', borderRadius: '16px'}}>
          <h2>Users ({users.length})</h2>
          {users.slice(0, 5).map(u => <p key={u.id}>{u.displayName} • {u.gender || '—'}</p>)}
        </div>

        <div style={{background: 'rgba(255,255,255,0.08)', padding: '1.5rem', borderRadius: '16px'}}>
          <h2>Stylists ({stylists.length})</h2>
          {stylists.slice(0, 5).map(s => <p key={s.id}>{s.shopName || s.name} • {s.specialty}</p>)}
        </div>

        <div style={{background: 'rgba(255,255,255,0.08)', padding: '1.5rem', borderRadius: '16px'}}>
          <h2>Bookings ({bookings.length})</h2>
          {bookings.slice(0, 5).map(b => <p key={b.id}>{b.styleName} • ₦{b.amount}</p>)}
        </div>
      </div>

      <h2 style={{color: GOLD, margin: '3rem 0 1rem'}}>Recent Reviews</h2>
      {reviews.length === 0 ? <p>No reviews yet</p> : 
        reviews.map(r => (
          <div key={r.id} style={{background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '12px', margin: '0.5rem 0'}}>
            <p>{'★'.repeat(r.stars)} ({r.stars}/5) — {r.comment}</p>
            <button onClick={() => resolveReview(r.id)} style={{background: GOLD, color: 'black', padding: '0.5rem 1rem', borderRadius: '50px'}}>
              Resolve
            </button>
          </div>
        ))
      }

      <h2 style={{color: GOLD, margin: '3rem 0 1rem'}}>Feedback Tickets</h2>
      {feedback.length === 0 ? <p>No tickets</p> :
        feedback.map(f => (
          <div key={f.id} style={{background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '12px', margin: '0.5rem 0'}}>
            <p><strong>{f.userId}</strong>: {f.issue}</p>
            <p>Status: {f.status}</p>
            <button onClick={() => setSelectedFeedback(f)} style={{background: GOLD, color: 'black', padding: '0.5rem 1rem', borderRadius: '50px'}}>
              Resolve
            </button>
          </div>
        ))
      }

      {/* Resolve UI */}
      {selectedFeedback && (
        <div style={{margin: '2rem 0', background: 'rgba(255,255,255,0.1)', padding: '2rem', borderRadius: '20px'}}>
          <h3>Resolve Feedback</h3>
          <p>{selectedFeedback.issue}</p>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Your reply (sent to user)"
            style={{width: '100%', padding: '1rem', borderRadius: '12px', background: NAVY, color: 'white', border: '1px solid #444'}}
          />
          <button onClick={() => resolveFeedback(selectedFeedback.id)} style={{background: GOLD, color: 'black', padding: '1rem 2rem', borderRadius: '50px'}}>
            Send & Resolve
          </button>
        </div>
      )}

      {accessLevel === 'superadmin' && (
        <div style={{marginTop: '3rem', padding: '2rem', background: 'rgba(184,134,11,0.3)', borderRadius: '20px'}}>
          <h2 style={{color: GOLD}}>Grant/Revoke Access</h2>
          <input placeholder="User ID" id="accessId" style={{padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', color: 'white'}} />
          <select style={{padding: '1rem', margin: '0 1rem', borderRadius: '12px'}}>
            <option>viewer</option>
            <option>editor</option>
            <option>superadmin</option>
            <option>none (revoke)</option>
          </select>
          <button onClick={() => {
            const uid = document.getElementById('accessId').value;
            const level = document.querySelector('select').value;
            grantAccess(uid, level);
          }} style={{background: GOLD, color: 'black', padding: '1rem 2rem', borderRadius: '50px'}}>
            Apply
          </button>
        </div>
      )}
    </div>
  );
    }
