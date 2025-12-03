import React from 'react';
import ReactDOM from 'react-dom/client'; // Notice the '/client' import for React 18
import App from './App';

// Create the root element using the modern React 18 API
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the application
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
