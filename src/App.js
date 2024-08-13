import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import SignUp from './components/SignUp';
import PasswordReset from './components/PasswordReset';
import UpdateProfile from './components/UpdateProfile';
import Transfer from './components/Transfer';
import ManageAccounts from './components/ManageAccounts';
import Movements from './components/Movements';
import Home from './components/Home';
import CreateAccount from './components/CreateAccount';
import ForgotUsername from './components/ForgotUsername';
import ForgotPassword from './components/ForgotPassword';
import VerifyEmail from './components/VerifyEmail'; 
import ChangeUsername from './components/ChangeUsername';
import BillsPayment from './components/BillsPayment';
import PaymentService from './components/PaymentService';
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
              <Route path="/transfer" element={<Transfer />} />
              <Route path="/manage-accounts" element={<ManageAccounts />} />
              <Route path="/movements" element={<Movements />} />
              <Route path="/reset-password" element={<PasswordReset />} />
              <Route path="/create-account" element={<CreateAccount />} />
              <Route path="/forgot-username" element={<ForgotUsername/>}/>
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} /> 
              <Route path="/bills-payment" element={<BillsPayment />} />
              <Route path="/payment-service" element={<PaymentService />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
