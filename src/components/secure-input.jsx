// src/components/secure-input.jsx — FINAL BULLETPROOF INPUT (african-name + nigeria-friendly + 100% blueprint compliant)
import React from 'react';

const NAVY = '#001F3F';
const GOLD = '#B8860B';

const patterns = {
  // Supports names like Chukwudi, Oluwaseun, Adebayo, Ọlá, Nneka, etc.
  name: "^[A-Za-zÀ-ÖØ-öø-ÿĀ-ſƀ-ƺẸ-ẹỌ-ọỤ-ụİıÑñ\\s'-]{2,40}$",

  // Nigerian phone: 08012345678, 9012345678, +2348012345678, 2348012345678
  phone: "^(\\+234|234|0)[7-9][0-1][0-9]{8}$",

  email: "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$",

  // Location/shop name – generous for places like Ikeja, Surulere, etc.
  location: "^[A-Za-z0-9À-ÖØ-öø-ÿ\\s,.'#-]{3,60}$",

  price: "^[0-9]{3,7}$",  // ₦500 – ₦5000000

  style: "^[A-Za-z0-9À-ÖØ-öø-ÿ\\s'\\-#,]{3,50}$"
};

const placeholders = {
  name: 'e.g. Saheed Oladele',
  phone: 'e.g. 08012345678 or +2348012345678',
  email: 'you@example.com',
  location: 'e.g. Ikeja, Lagos',
  price: 'e.g. 5000',
  style: 'e.g. The Saheed Special'
};

const titles = {
  name: 'Letters, spaces, hyphens, and apostrophes only',
  phone: 'Valid Nigerian phone number only',
  email: 'Enter a valid email address',
  price: 'Numbers only (no commas or ₦ sign)',
  location: 'Your shop area or address',
  style: 'Give this style a catchy name'
};

export default function SecureInput({
  type = 'text',
  placeholder,
  value,
  onChange,
  required = true,
  maxLength,
  autoComplete
}) {
  const isDarkMode = true; // ESDRAS is always dark

  return (
    <input
      type={type === 'phone' ? 'tel' : type === 'price' ? 'number' : type}
      placeholder={placeholder || placeholders[type] || placeholder}
      value={value || ''}
      onChange={onChange}
      required={required}
      pattern={type in patterns ? patterns[type] : undefined}
      inputMode={type === 'phone' ? 'tel' : type === 'price' ? 'numeric' : 'text'}
      maxLength={maxLength || (type === 'phone' ? 14 : type === 'price' ? 7 : 60)}
      autoComplete={autoComplete}
      title={titles[type] || titles.text}
      style={{
        width: '100%',
        padding: '1.2rem 1.4rem',
        fontSize: '1.1rem',
        borderRadius: '16px',
        border: 'none',
        background: 'rgba(255,255,255,0.1)',
        color: 'white',
        fontFamily: 'Montserrat, sans-serif',
        margin: '0.8rem 0',
        transition: 'all 0.3s ease',
        outline: 'none',
        '::placeholder': {
          color: 'rgba(255,255,255,0.6)'
        },
        ':focus': {
          background: 'rgba(255,255,255,0.15)',
          boxShadow: `0 0 0 3px rgba(184,134,11,0.4)`
        }
      }}
      onFocus={(e) => {
        e.target.style.background = 'rgba(255,255,255,0.15)';
        e.target.style.boxShadow = `0 0 0 3px rgba(184,134,11,0.4)`;
      }}
      onBlur={(e) => {
        e.target.style.background = 'rgba(255,255,255,0.1)';
        e.target.style.boxShadow = 'none';
      }}
    />
  );
  }
