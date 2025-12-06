// src/components/admindashboard.jsx — FINAL ESDRAS ADMIN DASHBOARD (full access + analytics) 
import { Line } from 'react-chartjs-2';

const revenueChart = {
  labels: ['Jan', 'Feb'], // from transactions
  datasets: [{ label: 'Revenue', data: [1000, 2000], borderColor: GOLD }]
};

// Render <Line data={revenueChart} />
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [accessLevel, setAccessLevel] = useState('viewer'); // viewer / editor / superadmin

  const user = auth.currentUser;

  useEffect(() => {
    // Check admin access (custom claim)
    if (user.token.isAdmin) {
      setAccessLevel(user.token.accessLevel || 'viewer');
    } else {
      alert('admin access required');
      return;
    }

    // Fetch all data
    onSnapshot(collection(db, 'users'), snap => setUsers(snap.docs.map(d => d.data())));
    onSnapshot(collection(db, 'barbers'), snap => setBarbers(snap.docs.map(d => d.data())));
    onSnapshot(collection(db, 'bookings'), snap => {
      const data = snap.docs.map(d => d.data());
      setBookings(data);
      const revenue = data.reduce((sum, b) => sum + (b.amount * 0.1), 0); // 10% cut
      setTotalRevenue(revenue);
    });
    onSnapshot(collection(db, 'transactions'), snap => setTransactions(snap.docs.map(d => d.data())));
  }, [user]);

  const grantAccess = async (targetUserId, newLevel) => {
    if (accessLevel !== 'superadmin') return alert('superadmin only');
    await updateDoc(doc(db, 'admins', targetUserId), { accessLevel: newLevel });
  };

  return (
    <div>
      <h1>esdras admin dashboard</h1>
      <p>your access: {accessLevel}</p>
      <h2>users ({users.length})</h2>
      {users.map(u => <div>{u.displayName} - gender: {u.gender}</div>)}
      <h2>stylists ({barbers.length})</h2>
      {barbers.map(b => <div>{b.name} - specialty: {b.specialty}</div>)}
      <h2>bookings ({bookings.length})</h2>
      {bookings.map(b => <div>{b.styleName} - fee: ₦{b.amount * 0.1}</div>)}
      <h2>total revenue: ₦{totalRevenue}</h2>
      <h2>transactions</h2>
      {transactions.map(t => <div>{t.type} - ₦{t.amount}</div>)}
<h2>Reviews</h2>
{reviews.map(r => <div>{r.stars} stars - {r.comment} <button onClick={() => resolveReview(r.id)}>Resolve</button></div>)}

<h2>Feedback Tickets</h2>
{feedback.map(f => <div>{f.issue} - Status: {f.status} <button onClick={() => resolveFeedback(f.id)}>Resolve</button></div>)}

      {/* Grant access UI for superadmin */}
      {accessLevel === 'superadmin' && (
        <div>
          <h2>grant access</h2>
          {/* Form to grant/revoke */}
        </div>
      )}
    </div>
  );
}
