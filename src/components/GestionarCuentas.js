import React, { useEffect, useState, useContext } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, query, where, updateDoc, onSnapshot } from 'firebase/firestore';
import { HeaderDashboard } from './HeaderDashboard';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';

const GestionarCuentas = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [savingsAccounts, setSavingsAccounts] = useState([]);
  const [currentAccounts, setCurrentAccounts] = useState([]);
  const [showAccountNumbers, setShowAccountNumbers] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) {
      return; // Esperar a que se cargue la autenticación
    }

    if (!user) {
      navigate('/login');
      return;
    }

    suscribeToAccounts();
  }, [user, authLoading, navigate]);

  useEffect(() => {
    try {
      const savingsAccountsLocal = JSON.parse(localStorage.getItem('savingsAccounts'));

      if (savingsAccountsLocal.length !== 0) {
        setSavingsAccounts(savingsAccountsLocal);
      }
    } catch (e) {
      console.log(e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('savingsAccounts', JSON.stringify(savingsAccounts));
  }, [savingsAccounts]);

  const generateAccountName = (tipoCuenta, accountNumber) => {
    const suffix = accountNumber.slice(-4);
    if (tipoCuenta.toLowerCase() === 'ahorros') {
      return `AHO${suffix}`;
    } else if (tipoCuenta.toLowerCase() === 'corriente') {
      return `CORR${suffix}`;
    }
    return `CUENTA${suffix}`;
  };

  const toggleAccountNumberVisibility = (accountId) => {
    setShowAccountNumbers(prevState => ({
      ...prevState,
      [accountId]: !prevState[accountId]
    }));
  };

  const formatAccountNumber = (accountNumber) => {
    return accountNumber;
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleAccountClick = (accountNumber) => {
    navigate(`/movimientos/${accountNumber}`);
  };

  const suscribeToAccounts = () => {
    const savingsQuery = query(
      collection(db, 'cuentas'),
      where('id', '==', user.uid),
      where('tipoCuenta', '==', 'ahorros')
    );

    onSnapshot(savingsQuery, (querySnapshot) => {
      let accounts = [];
      querySnapshot.forEach(doc => accounts.push({
        id: doc.id,
        ...doc.data()
      }));
      setSavingsAccounts(accounts);
    });

    const currentQuery = query(
      collection(db, 'cuentas'),
      where('id', '==', user.uid),
      where('tipoCuenta', '==', 'corriente')
    );

    onSnapshot(currentQuery, (querySnapshot) => {
      const currentAccounts = [];
      querySnapshot.forEach((doc) => currentAccounts.push({
        id: doc.id,
        ...doc.data()
      }));
      setCurrentAccounts(currentAccounts);
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderDashboard />
      <div className="flex flex-grow">
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className={`main-content p-5 mx-auto flex flex-col items-center justify-center w-full ${isSidebarOpen ? 'ml-72' : 'ml-72 '}`}>
          <h2 className="text-2xl font-bold mb-4">Mis Productos</h2>
                    <button 
                        className="bg-sky-900 text-white font-semibold py-2 px-4 rounded mb-4 hover:bg-sky-600 transition-colors duration-300"
                        onClick={handleCreateAccountClick}
                    >
                        Agregar Cuenta
                    </button>
          <div className="w-full">
            <h3 className="text-xl font-semibold mb-4 text-left">Cuentas de Ahorros</h3>
            <div className="account-cards grid gap-7 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {savingsAccounts.length > 0 ? savingsAccounts.map((account, index) => (
                <div key={index} className="account-card bg-sky-50 shadow-md rounded-lg p-6 lg:p-5 xl:p-7 hover:scale-105 transition-transform duration-300 cursor-pointer border border-gray-300 w-full max-w-xs"
                  onClick={() => handleAccountClick(account.accountNumber)}>
                  <h4 className="account-number font-bold text-lg">{account.accountName || generateAccountName(account.tipoCuenta, account.accountNumber)}</h4>
                  <div className="flex items-center justify-between">
                    <p className="mr-2">
                      {formatAccountNumber(account.accountNumber)}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <p className="mr-2">
                      Saldo Disponible: {showAccountNumbers[account.id] ? `$${account.accountBalance ? account.accountBalance.toFixed(2) : '0.00'}` : '*****'}
                    </p>
                    <button
                      className="relative"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAccountNumberVisibility(account.id);
                      }}>
                      {showAccountNumbers[account.id] ? <FaRegEye className="h-5 w-5" /> : <FaRegEyeSlash className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              )) : <p>No se encontraron cuentas de ahorros.</p>}
            </div>

            <h3 className="text-xl font-semibold mb-4 mt-8 text-left">Cuentas Corrientes</h3>
            <div className="account-cards grid gap-5 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {currentAccounts.length > 0 ? currentAccounts.map((account, index) => (
                <div key={index} className="account-card bg-sky-50 shadow-md rounded-lg p-6 lg:p-5 xl:p-7 hover:scale-105 transition-transform duration-300 cursor-pointer border border-gray-300 w-full max-w-xs"
                  onClick={() => handleAccountClick(account.accountNumber)}>
                  <h4 className="account-number font-bold text-lg">{account.accountName || generateAccountName(account.tipoCuenta, account.accountNumber)}</h4>
                  <div className="flex items-center justify-between">
                    <p className="mr-2">
                      {formatAccountNumber(account.accountNumber)}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <p className="mr-2">
                      Saldo Disponible: {showAccountNumbers[account.id] ? `$${account.accountBalance ? account.accountBalance.toFixed(2) : '0.00'}` : '*****'}
                    </p>
                    <button
                      className="relative"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAccountNumberVisibility(account.id);
                      }}>
                      {showAccountNumbers[account.id] ? <FaRegEye className="h-5 w-5" /> : <FaRegEyeSlash className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              )) : <p>No se encontraron cuentas corrientes.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestionarCuentas;
