// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import SignUp from './components/SignUp';
import PasswordReset from './components/PasswordReset';
import UpdateProfile from './components/UpdateProfile';
import Transaction from './components/Transaction';
import AccountManagement from './components/AccountManagement';
import Home from './components/Home';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/password-reset" element={<PasswordReset />} />
        <Route path="/update-profile" element={<UpdateProfile />} />
        <Route path="/transaction" element={<Transaction />} />
        <Route path="/account-management" element={<AccountManagement />} />
        <Route path="/" element={<Login />} /> {/* Página de inicio */}
      </Routes>
      <div className="App">
      <Home /> {/* Usa el componente Home */}
    </div>
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
      </div>
    </Router>
  );
}

export default App;
