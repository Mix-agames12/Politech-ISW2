// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client'; // Importa desde 'react-dom/client' en lugar de 'react-dom'
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css'; // Importa Bootstrap
import App from './App';

// Utiliza createRoot para montar la aplicación
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
