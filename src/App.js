import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Login } from './components/Login';
import SignUp from './components/SignUp';
import PasswordReset from './components/PasswordReset';
import UpdateProfile from './components/UpdateProfile';
import Transaction from './components/Transaction';
import GestionarCuentas from './components/GestionarCuentas';
import Home from './components/Home';

function App() {
  return (
    <Router>
      <div class="App">
        <div class="container">
          <Routes>
            {/* Página de inicio */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/password-reset" element={<PasswordReset />} />
            <Route path="/update-profile" element={<UpdateProfile />} />
            <Route path="/transaction" element={<Transaction />} />
            <Route path="/gestionar-cuentas" element={<GestionarCuentas />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;