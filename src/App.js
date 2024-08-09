import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
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
import ForgotPassword from './components/ForgotPassword';
import VerifyEmail from './components/VerifyEmail';
import { AuthProvider } from './context/AuthContext';
import { useLocation } from 'react-router-dom';

const AppRoutes = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const mode = queryParams.get('mode');
  const oobCode = queryParams.get('oobCode');

  if (mode === 'resetPassword' && oobCode) {
    return <PasswordReset />;
  } else if (mode === 'verifyEmail' && oobCode) {
    return <VerifyEmail />;
  } else {
    return <Home />;
  }
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App w-100 h-auto">
          <div className="container">
            <Routes>
              <Route path="/*" element={<AppRoutes />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/update-profile" element={<UpdateProfile />} />
              <Route path="/transaction" element={<Transaction />} />
              <Route path="/gestionar-cuentas" element={<GestionarCuentas />} />
              <Route path="/cambio-contrasena" element={<CambioContrasena />} />
              <Route path="/movimientos" element={<Movimientos />} />
              <Route path="/crear-cuenta" element={<CrearCuenta />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/movimientos/:accountNumber" element={<AccountMovements />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
