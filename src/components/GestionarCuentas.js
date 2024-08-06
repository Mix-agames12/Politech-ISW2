import React, { useEffect, useState, useContext } from 'react';
import { Sidebar } from "../components/Sidebar";
import { useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { HeaderDashboard } from "./HeaderDashboard";
import EyeOpenIcon from '../assets/images/eye-open.png';
import EyeClosedIcon from '../assets/images/eye-closed.png';
import { AuthContext } from '../context/AuthContext';

const GestionarCuentas = () => {
  const { user, loading } = useContext(AuthContext); // Incluir loading
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true); // Estado separado para cuentas
  const [showAccountNumbers, setShowAccountNumbers] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    console.log('GestionarCuentas component mounted');
    if (loading) {
      // Esperar a que se resuelva el estado de autenticación
      return;
    }
    if (!user) {
      console.log('No user found, redirecting to login');
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        console.log('Fetching accounts for user with cedula:', user.cedula);
        const q = query(collection(db, 'cuentas'), where('cedula', '==', user.cedula));
        const querySnapshot = await getDocs(q);
        const accountsList = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        }));
        console.log('Accounts fetched:', accountsList);
        setAccounts(accountsList);

        accountsList.forEach(async (account) => {
          const accountName = generateAccountName(account.tipoCuenta, account.accountNumber);
          if (!account.accountName) {
            await updateDoc(doc(db, 'cuentas', account.id), {
              accountName: accountName
            });
          }
        });
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoadingAccounts(false);
      }
    };

    fetchData();
  }, [user, loading, navigate]);

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

  const formatAccountNumber = (accountNumber, showFull) => {
    if (showFull) {
      return accountNumber;
    }
    const visibleDigits = accountNumber.slice(-4);
    const maskedDigits = '*'.repeat(accountNumber.length - 4);
    return `${maskedDigits}${visibleDigits}`;
  };

  if (loading || loadingAccounts) {
    return <div>Loading...</div>; // Mostrar estado de carga
  }

  const savingsAccounts = accounts.filter(account => account.tipoCuenta.toLowerCase() === 'ahorros');
  const currentAccounts = accounts.filter(account => account.tipoCuenta.toLowerCase() === 'corriente');

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderDashboard />
      <div className="flex flex-grow">
        <div className="w-1/4">
          <Sidebar />
        </div>
        <div className="main-content p-5 mx-auto flex flex-col items-center justify-center w-full xl:w-11/12">
          <h2 className="text-2xl font-bold mb-4">Mis Productos</h2>
          <div className="w-full">
            <h3 className="text-xl font-semibold mb-4 text-left">Cuentas de Ahorros</h3>
            <div className="account-cards grid gap-7 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {savingsAccounts.length > 0 ? savingsAccounts.map((account, index) => (
                <div key={index} className="account-card bg-sky-50 shadow-md rounded-lg p-6 lg:p-4 xl:p-6 hover:scale-105 transition-transform duration-300 cursor-pointer border border-gray-300">
                  <h4 className="account-number font-bold text-lg">{account.accountName || generateAccountName(account.tipoCuenta, account.accountNumber)}</h4>
                  <div className="flex items-center justify-between">
                    <p className="mr-2">
                      {formatAccountNumber(account.accountNumber, showAccountNumbers[account.id])}
                    </p>
                    <button onClick={() => toggleAccountNumberVisibility(account.id)}>
                      <img src={showAccountNumbers[account.id] ? EyeOpenIcon : EyeClosedIcon} alt="Toggle Visibility" className="h-5 w-5" />
                    </button>
                  </div>
                  <p>
                    Saldo Disponible: {showAccountNumbers[account.id] ? `$${account.accountBalance ? account.accountBalance.toFixed(2) : '0.00'}` : '*****'}
                  </p>
                </div>
              )) : <p>No se encontraron cuentas de ahorros.</p>}
            </div>

            <h3 className="text-xl font-semibold mb-4 mt-8 text-left">Cuentas Corrientes</h3>
            <div className="account-cards grid gap-5 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {currentAccounts.length > 0 ? currentAccounts.map((account, index) => (
                <div key={index} className="account-card bg-sky-50 shadow-md rounded-lg p-6 lg:p-4 xl:p-6 hover:scale-105 transition-transform duration-300 cursor-pointer border border-gray-300">
                  <h4 className="account-number font-bold text-lg">{account.accountName || generateAccountName(account.tipoCuenta, account.accountNumber)}</h4>
                  <div className="flex items-center justify-between">
                    <p className="mr-2">
                      {formatAccountNumber(account.accountNumber, showAccountNumbers[account.id])}
                    </p>
                    <button onClick={() => toggleAccountNumberVisibility(account.id)}>
                      <img src={showAccountNumbers[account.id] ? EyeOpenIcon : EyeClosedIcon} alt="Toggle Visibility" className="h-5 w-5" />
                    </button>
                  </div>
                  <p>
                    Saldo Disponible: {showAccountNumbers[account.id] ? `$${account.accountBalance ? account.accountBalance.toFixed(2) : '0.00'}` : '*****'}
                  </p>
                </div>
              )) : <p>No se encontraron cuentas corrientes.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GestionarCuentas;
