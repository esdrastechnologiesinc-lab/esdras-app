// src/components/wallet.jsx — FINAL ESDRAS WALLET (balances + withdrawals + Stripe Connect)
import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

const NAVY = '#001F3F';
const GOLD = '#B8860B';

export default function Wallet() {
  const [wallet, setWallet] = useState({ balance: 0, bankAccount: '' });
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [bankAccount, setBankAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const user = auth.currentUser;

  useEffect(() => {
    const walletRef = doc(db, 'wallets', user.uid);
    const unsub = onSnapshot(walletRef, (snap) => {
      if (snap.exists()) setWallet(snap.data());
    });
    return unsub;
  }, [user.uid]);

  const updateBank = async () => {
    setLoading(true);
    await updateDoc(doc(db, 'wallets', user.uid), { bankAccount });
    setLoading(false);
  };

  const withdraw = async () => {
    if (withdrawAmount > wallet.balance) return alert('insufficient balance');

    setLoading(true);
    // In real app: Call Cloud Function to transfer via Stripe Connect
    // For MVP: Log withdrawal and deduct
    await updateDoc(doc(db, 'wallets', user.uid), { balance: wallet.balance - withdrawAmount });
    await addDoc(collection(db, 'transactions'), {
      userId: user.uid,
      type: 'withdrawal',
      amount: withdrawAmount,
      status: 'pending',
      createdAt: serverTimestamp()
    });
    setLoading(false);
    alert('withdrawal requested – processing');
  };

  return (
    <div style={{background: NAVY, minHeight: '100vh', color: 'white', padding: '2rem'}}>
      <h1 style={{color: GOLD}}>wallet</h1>
      <p>balance: ₦{wallet.balance}</p>
      <input type="text" placeholder="bank account number" value={bankAccount} onChange={e => setBankAccount(e.target.value)} />
      <button onClick={updateBank} disabled={loading}>save bank details</button>

      <input type="number" placeholder="withdraw amount" value={withdrawAmount} onChange={e => setWithdrawAmount(parseFloat(e.target.value))} />
      <button onClick={withdraw} disabled={loading}>withdraw</button>
    </div>
  );
      }
