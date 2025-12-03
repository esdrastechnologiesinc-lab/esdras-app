import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './app';                    // ← lowercase import
import { BrowserRouter } from 'react-router-dom';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSy...your-real-key...",  // ← Paste here
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123...",
  appId: "1:123...:web:abc..."
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
