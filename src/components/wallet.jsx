// src/components/wallet.jsx — FINAL ESDRAS WALLET (Withdraw All + real Stripe Transfer + full premium UI)
import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

const NAVY = '#001F3F';
const GOLD = '#B8860B';

export default function Wallet() {
  const [wallet, setWallet] = useState({ balance: 0, bankAccount: '' });
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingBank, setSavingBank] = useState(false);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const walletRef = doc(db, 'wallets', user.uid);
    const unsub = onSnapshot(walletRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setWallet(data);
        setBankAccount(data.bankAccount || '');
      }
    });

    return unsub;
  }, [user]);

  const saveBankDetails = async () => {
    if (!bankAccount.trim()) return alert('Enter bank account');
    setSavingBank(true);
    try {
      await updateDoc(doc(db, 'wallets', user.uid), { bankAccount });
      alert('Bank details saved!');
    } catch (err) {
      alert('Failed to save bank details');
    }
    setSavingBank(false);
  };

  const withdrawCustom = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0 || amount > wallet.balance) {
      return alert('Invalid amount');
    }
    await initiateWithdrawal(amount);
  };

  const withdrawAll = async () => {
    if (wallet.balance <= 0) return alert('No funds to withdraw');
    await initiateWithdrawal(wallet.balance);
  };

  const initiateWithdrawal = async (amount) => {
    if (!wallet.bankAccount) return alert('Add bank account first');

    setLoading(true);
    try {
      // Call secure Cloud Function (never expose Stripe keys in client)
      const response = await fetch('https://us-central1-esdras-app.cloudfunctions.net/initiatePayout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount * 100, // in kobo
          destination: wallet.bankAccount,
          userId: user.uid
        })
      });

      const result = await response.json();
      if (result.success) {
        alert(`₦${amount.toLocaleString()} withdrawal initiated!`);
        // Balance will update via real-time listener
      } else {
        alert('Withdrawal failed: ' + result.error);
      }
    } catch (err) {
      console.error(err);
      alert('Network error – try again');
    }
    setLoading(false);
    setWithdrawAmount('');
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
      <h1 style={{color: GOLD, fontSize: '3rem', fontWeight: '800', margin: '0 0 1rem'}}>
        Wallet
      </h1>

      <div style={{
        background: 'rgba(184,134,11,0.2)',
        padding: '2rem',
        borderRadius: '24px',
        border: `3px solid ${GOLD}`,
        maxWidth: '500px',
        margin: '2rem auto'
      }}>
        <p style={{fontSize: '2.8rem', margin: '0', color: GOLD}}>
          ₦{wallet.balance?.toLocaleString() || '0'}
        </p>
        <p style={{opacity: 0.8, marginTop: '0.5rem'}}>Available Balance</p>
      </div>

      {/* Bank Account */}
      <div style={{maxWidth: '500px', margin: '2rem auto'}}>
        <input
          type="text"
          placeholder="Bank Account Number"
          value={bankAccount}
          onChange={(e) => setBankAccount(e.target.value)}
          style={{
            width: '100%',
            padding: '1.4rem',
            borderRadius: '16px',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: 'white',
            fontSize: '1.1rem',
            marginBottom: '1rem'
          }}
        />
        <button
          onClick={saveBankDetails}
          disabled={savingBank}
          style={{
            background: GOLD,
            color: 'black',
            padding: '1.2rem 3rem',
            border: 'none',
            borderRadius: '50px',
            fontWeight: 'bold',
            fontSize: '1.2rem'
          }}
        >
          {savingBank ? 'Saving...' : 'Save Bank'}
        </button>
      </div>

      {/* Custom Withdraw */}
      <div style={{maxWidth: '500px', margin: '2rem auto'}}>
        <input
          type="number"
          placeholder="Amount to withdraw"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
          style={{
            width: '100%',
            padding: '1.4rem',
            borderRadius: '16px',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: 'white',
            fontSize: '1.1rem',
            marginBottom: '1rem'
          }}
        />
        <button
          onClick={withdrawCustom}
          disabled={loading || !withdrawAmount}
          style={{
            background: 'white',
            color: NAVY,
            padding: '1.4rem 4rem',
            border: 'none',
            borderRadius: '50px',
            fontWeight: 'bold',
            fontSize: '1.4rem',
            margin: '0.5rem'
          }}
        >
          Withdraw Amount
        </button>
      </div>

      {/* WITHDRAW ALL BUTTON */}
      <div style={{margin: '3rem 0'}}>
        <button
          onClick={withdrawAll}
          disabled={loading || wallet.balance <= 0}
          style={{
            background: GOLD,
            color: 'black',
            padding: '1.8rem 6rem',
            border: 'none',
            borderRadius: '50px',
            fontSize: '1.8rem',
            fontWeight: 'bold',
            boxShadow: '0 10px 30px rgba(184,134,11,0.4)',
            opacity: loading || wallet.balance <= 0 ? 0.6 : 1,
            cursor: loading || wallet.balance <= 0 ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Processing...' : 'Withdraw All Balance'}
        </button>
      </div>

      <p style={{opacity: 0.7, marginTop: '3rem', fontSize: '0.9rem'}}>
        Withdrawals processed within 24 hours • ESDRAS takes 0% on stylist earnings
      </p>
    </div>
  );
  }
