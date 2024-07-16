// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import SignUp from './components/SignUp';
import Login from './components/Login';
import PasswordReset from './components/PasswordReset';
import UpdateProfile from './components/UpdateProfile';
import Transaction from './components/Transaction';
// import { Sidebar } from './components/Sidebar';
import { GestionarCuentas } from './components/GestionarCuentas';

function App() {
  return (
    <Router>
      {/* <Sidebar /> */}
      <GestionarCuentas />

      <div className="container">
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <Link className="navbar-brand" to="/">Banking App</Link>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav mr-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/signup">Sign Up</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/login">Login</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/password-reset">Reset Password</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/update-profile">Update Profile</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/transaction">Transaction</Link>
              </li>
            </ul>
          </div>
        </nav>

        <Routes>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/password-reset" element={<PasswordReset />} />
          <Route path="/update-profile" element={<UpdateProfile />} />
          <Route path="/transaction" element={<Transaction />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
