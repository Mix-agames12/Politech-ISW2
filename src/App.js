import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import SignUp from './components/SignUp';
import PasswordReset from './components/PasswordReset';
import UpdateProfile from './components/UpdateProfile';
import Transaction from './components/Transaction';
import GestionarCuentas from './components/GestionarCuentas';
import Movimientos from './components/Movimientos';
import Home from './components/Home';
import CrearCuenta from './components/CrearCuenta';
import ForgotUsername from './components/ForgotUsername';
import ForgotPassword from './components/ForgotPassword';
import VerifyEmail from './components/VerifyEmail'; // Importar el componente VerifyEmail
import ChangeUsername from './components/ChangeUsername';
import BillsPayment from './components/BillsPayment';
import GenerarPago from './components/GenerarPago';
import { AuthProvider } from './context/AuthContext';
import { useLocation } from 'react-router-dom';

const AppRoutes = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const mode = queryParams.get('mode');
  const oobCode = queryParams.get('oobCode');

  console.log({ mode, oobCode }); // Añade esto para ver qué valores tienes

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
        <div className="App w-full h-auto min-h-screen flex flex-col">
          <div className="flex-grow w-full">
            <Routes>
              <Route path="/*" element={<AppRoutes />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/change-username" element={<ChangeUsername/>}/>
              <Route path="/update-profile" element={<UpdateProfile />} />
              <Route path="/transaction" element={<Transaction />} />
              <Route path="/gestionar-cuentas" element={<GestionarCuentas />} />
              <Route path="/movimientos" element={<Movimientos />} />
              <Route path="/reset-password" element={<PasswordReset />} />
              <Route path="/crear-cuenta" element={<CrearCuenta />} />
              <Route path="/forgot-username" element={<ForgotUsername/>}/>
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} /> 
              <Route path="/pago-servicios" element={<BillsPayment />} />
              <Route path="/generar-pago" element={<GenerarPago />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
