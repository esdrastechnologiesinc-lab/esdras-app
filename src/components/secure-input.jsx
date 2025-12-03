// src/components/secure-input.jsx — BULLETPROOF INPUT (AFRICAN-NAME FRIENDLY)
import React from 'react';

export default function SecureInput({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  required = true,
  maxLength 
}) {
  const patterns = {
    name: "^[A-Za-zÀ-ÖØ-öø-ÿ\\s'-]{2,40}$",     // Supports Saheed, Olamide, Chukwudi
    phone: "^\\+?234[0-9]{10}\( |^0[0-9]{10} \)",   // Nigerian numbers only
    email: "^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$",
    location: "^[A-Za-z\\s,.'-]{3,50}$",
    price: "^[0-9]{3,6}$",
    style: "^[A-Za-z0-9\\s'-]{3,40}$"
  };

  return (
    <input
      type={type === 'phone' ? 'tel' : type}
      placeholder={placeholder}
      value={value || ''}
      onChange={onChange}
      required={required}
      pattern={patterns[type] || patterns.text}
      maxLength={maxLength || (type === 'phone' ? 15 : 50)}
      style={{
        width: '100%',
        padding: '1rem',
        fontSize: '1.2rem',
        borderRadius: '16px',
        border: '2px solid #001F3F',
        background: 'white',
        margin: '0.8rem 0',
        fontFamily: 'Montserrat, sans-serif'
      }}
      title={
        type === 'name' ? "Letters, spaces, hyphens only" :
        type === 'phone' ? "Nigerian number: 08012345678 or +2348012345678" :
        type === 'price' ? "Numbers only (e.g. 5000)" : ""
      }
    />
  );
      }
