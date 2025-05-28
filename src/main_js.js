import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/globals.css';

// Créer le point de montage React
const root = ReactDOM.createRoot(document.getElementById('root'));

// Rendre l'application
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
