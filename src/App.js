import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import SignUp from './components/SignUp';
import PasswordReset from './components/PasswordReset';
import UpdateProfile from './components/UpdateProfile';
import Transaction from './components/Transaction';
import GestionarCuentas from './components/GestionarCuentas';
import AccountManagement from './components/AccountManagement';

function App() {
  return (
    <Router>
      <div className="App">
        <div className="container">
          <Routes>
            <Route path="/" element={<Login />} /> {/* Página de inicio */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/password-reset" element={<PasswordReset />} />
            <Route path="/update-profile" element={<UpdateProfile />} />
            <Route path="/transaction" element={<Transaction />} />
            <Route path="/account-management" element={<AccountManagement />} />
            <Route path="/gestionar-cuentas" element={<GestionarCuentas />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
