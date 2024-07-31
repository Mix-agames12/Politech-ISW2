import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Login } from './components/Login';
import SignUp from './components/SignUp';
import PasswordReset from './components/PasswordReset';
import UpdateProfile from './components/UpdateProfile';
import Transaction from './components/Transaction';
import GestionarCuentas from './components/GestionarCuentas';
import CambioContrasena from './components/CambioContrasena';
import Movimientos from './components/Movimientos';
import Home from './components/Home';
import CrearCuenta from './components/CrearCuenta';
import AccountMovements from './components/AccountMovements';
// import PantallaPrincipal from './components/PantallaPrincipal';


function App() {
  return (
    <Router>
      <html class="h-full bg-white"/>
      <body class="h-full"></body>
      <div class="App w-100 h-auto">
        <div class="container">
          <Routes>
            {/* Página de inicio */}
            <Route path="/" element={<Home/>} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/password-reset" element={<PasswordReset />} />
            <Route path="/update-profile" element={<UpdateProfile />} />
            <Route path="/transaction" element={<Transaction />} />
            <Route path="/gestionar-cuentas" element={<GestionarCuentas />} />
            <Route path="/cambio-contrasena" element={<CambioContrasena />} />
            <Route path="/movimientos" element={<Movimientos />} />
            <Route path="/crear-cuenta" element={<CrearCuenta />} />
            <Route path="/movimientos/:accountNumber" element={<AccountMovements />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;