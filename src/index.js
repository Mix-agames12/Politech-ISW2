// src/index.js o App.js
import React from 'react';
import ReactDOM from 'react-dom/client'; // Importa desde 'react-dom/client' en lugar de 'react-dom'
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';

// Utiliza createRoot para montar la aplicación
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
