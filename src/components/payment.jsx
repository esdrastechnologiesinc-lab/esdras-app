// src/components/payment.js — FINAL PAYMENTS (escrow + splits + Stripe Connect)
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_...');

export default function Payment({ bookingId, amount }) {
  const stripe = useStripe();
  const elements = useElements();

  const handlePayment = async () => {
    // Create PaymentIntent on backend (Cloud Function)
    const response = await fetch('/create-payment-intent', { method: 'POST', body: JSON.stringify({ amount, bookingId }) });
    const { clientSecret } = await response.json();

    const { error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: { name: 'User Name' }
      }
    });

    if (error) {
      alert(error.message);
    } else {
      alert('payment successful – held in escrow');
    }
  };

  return (
    <Elements stripe={stripePromise}>
      <CardElement />
      <button onClick={handlePayment}>pay ₦{amount}</button>
    </Elements>
  );
}
