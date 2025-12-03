import React from 'react';
import ReactDOM from 'react-dom/client'; 
import './index.css'; // Confirms the necessary import for styles
import App from './app.jsx'; 

// Create the root element using the modern React 18 API
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the application
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
