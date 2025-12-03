// src/components/checkout.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51SaFW5AfXtDdFCGlAboHiWv9DbJiwZSmdfPPioyOGeQ2Xk9tYFMHcUH5uGjeVZgsIAWxcDAqADHxH19kM2Ahlaif007h5rZQmy');

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Simulate success
    alert('Payment Successful! Unlimited unlocked.');
    navigate('/styles');
  };

  return (
    <form onSubmit={handleSubmit} style={{maxWidth:'400px', margin:'3rem auto', padding:'2rem', background:'white', borderRadius:'20px'}}>
      <h2 style={{color:'#001F3F', textAlign:'center'}}>Unlock Unlimited</h2>
      <CardElement style={{base:{fontSize:'18px'}}}/>
      <button type="submit" style={{width:'100%', marginTop:'2rem', background:'#B8860B', color:'black', padding:'1.2rem', border:'none', borderRadius:'16px', fontSize:'1.3rem'}}>
        Pay $49 One-Time
      </button>
    </form>
  );
};

export default function Checkout() {
  return (
    <div style={{background:'#f8f8f8', minHeight:'100vh', padding:'2rem'}}>
      <h1 style={{textAlign:'center', color:'#001F3F'}}>ESDRAS</h1>
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </div>
  );
}
