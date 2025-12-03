import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './app';                    // ← lowercase import
import { BrowserRouter } from 'react-router-dom';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  // ← Put your real Firebase config here
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

initializeApp(firebaseConfig);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
