import React, { useEffect, useState, useContext } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
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
      console.log('No user found, redirecting to login');
      navigate('/login');
      return;
    }

    console.log('User found:', user);
    suscribeToAccounts(user.uid);
  }, [user, authLoading, navigate]);

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

  const handleCreateAccountClick = () => {
    navigate('/crear-cuenta'); // Ejemplo de navegación a una página para crear cuentas
  };

  const suscribeToAccounts = (userId) => {
    console.log('Subscribing to accounts for user:', userId);

    // Query para cuentas de ahorros
    const savingsQuery = query(
      collection(db, 'cuentas'),
      where('id', '==', userId),
      where('tipoCuenta', '==', 'ahorros')
    );

    onSnapshot(savingsQuery, (querySnapshot) => {
      let accounts = [];
      querySnapshot.forEach(doc => accounts.push({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Ahorros:', accounts); // Verificar consulta de ahorros
      setSavingsAccounts(accounts);
    }, error => {
      console.error('Error al obtener cuentas de ahorros:', error);
    });

    // Query para cuentas corrientes
    const currentQuery = query(
      collection(db, 'cuentas'),
      where('id', '==', userId),
      where('tipoCuenta', '==', 'corriente')
    );

    onSnapshot(currentQuery, (querySnapshot) => {
      let accounts = [];
      querySnapshot.forEach(doc => accounts.push({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Corriente:', accounts); // Verificar consulta de cuentas corrientes
      setCurrentAccounts(accounts);
    }, error => {
      console.error('Error al obtener cuentas corrientes:', error);
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
