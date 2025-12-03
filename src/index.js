import React from 'react';
import ReactDOM from 'react-dom/client'; 
// *** FINAL FIX: Path is now lowercase and includes extension ***
import App from './app.jsx'; 

// Create the root element using the modern React 18 API
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the application
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
