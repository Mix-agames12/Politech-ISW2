import React, { useState, useEffect, useMemo, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Sidebar } from '../components/Sidebar';
import { HeaderDashboard } from './HeaderDashboard';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';

const AccountMovements = () => {
  const { accountNumber } = useParams();
  const [movements, setMovements] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (accountNumber && user) {
      fetchUserData();
    } else {
      console.error("Account number or user is missing.");
      setLoading(false);
    }
  }, [accountNumber, user]);

  const fetchUserData = useCallback(async () => {
    if (!user) {
      console.error("No user is currently logged in.");
      setLoading(false);
      return;
    }

    const savedData = retrieveSavedData();
    if (savedData) {
      setSelectedAccount(savedData.account);
      setMovements(savedData.movements);
      setLoading(false);
      return;
    }

    try {
      const account = await fetchAccountData();
      if (account) {
        setSelectedAccount(account);
        await fetchAndSetMovements(account.accountNumber, account.accountBalance);
      } else {
        console.error("No account found with the provided account number.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [accountNumber, user]);

  const retrieveSavedData = () => {
    const savedAccount = localStorage.getItem('selectedAccount');
    const savedMovements = localStorage.getItem('movements');

    if (savedAccount && savedMovements) {
      const parsedAccount = JSON.parse(savedAccount);
      if (parsedAccount && parsedAccount.accountNumber === accountNumber) {
        return {
          account: parsedAccount,
          movements: JSON.parse(savedMovements),
        };
      }
    }
    return null;
  };

  const fetchAccountData = async () => {
    const userDoc = await getDoc(doc(db, 'clientes', user.uid));
    if (userDoc.exists()) {
      const accountsQuery = query(
        collection(db, 'cuentas'),
        where('id', '==', user.uid),
        where('accountNumber', '==', accountNumber)
      );
      const accountsSnapshot = await getDocs(accountsQuery);
      if (!accountsSnapshot.empty) {
        return accountsSnapshot.docs[0].data();
      }
    } else {
      console.log("No such document!");
    }
    return null;
  };

  const fetchAndSetMovements = async (accountNumber, initialBalance) => {
    const movements = await fetchMovements(accountNumber);
    const uniqueMovements = removeDuplicateMovements(movements);
    const movementsWithNames = await fetchNamesForMovements(uniqueMovements);

    const movementsWithBalance = calculateUpdatedBalances(movementsWithNames, initialBalance);

    setMovements(movementsWithBalance);
    updateAccountBalance(movementsWithBalance);
    saveToLocalStorage(movementsWithBalance);
  };

  const removeDuplicateMovements = (movements) => {
    const seen = new Set();
    return movements.filter(movement => {
      const key = `${movement.id}-${movement.fecha}-${movement.cuentaOrigen}-${movement.cuentaDestino}`;
      const duplicate = seen.has(key);
      seen.add(key);
      return !duplicate;
    });
  };

  const fetchMovements = async (accountNumber) => {
    const transaccionesCollection = collection(db, 'transacciones');
    const queries = [
      query(transaccionesCollection, where('cuentaOrigen', '==', accountNumber)),
      query(transaccionesCollection, where('cuentaDestino', '==', accountNumber)),
    ];

    const [snapshot1, snapshot2] = await Promise.all(queries.map(q => getDocs(q)));
    return [...snapshot1.docs, ...snapshot2.docs].map(doc => ({
      ...doc.data(),
      id: doc.id,
      fecha: doc.data().fecha.toDate(),
      tipoMovimiento: doc.ref.path.includes('cuentaOrigen') ? 'debito' : 'credito',
    }));
  };

  const fetchNamesForMovements = async (movements) => {
    return await Promise.all(movements.map(async (movement) => {
      const accountNumber = movement.tipoMovimiento === 'debito' ? movement.cuentaDestino : movement.cuentaOrigen;
      const [userDoc, nombre] = await fetchUserAndNameByAccountNumber(accountNumber);
      return {
        ...movement,
        [movement.tipoMovimiento === 'debito' ? 'nombreDestino' : 'nombreOrigen']: nombre,
      };
    }));
  };

  const fetchUserAndNameByAccountNumber = async (accountNumber) => {
    const accountSnapshot = await getDocs(query(collection(db, 'cuentas'), where('accountNumber', '==', accountNumber)));
    if (!accountSnapshot.empty) {
      const accountData = accountSnapshot.docs[0].data();
      const userDoc = await getDoc(doc(db, 'clientes', accountData.id));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return [userDoc, `${userData.nombre} ${userData.apellido}`];
      }
    }
    return [null, 'Usuario desconocido'];
  };

  const calculateUpdatedBalances = (movements, initialBalance) => {
    let runningBalance = initialBalance;
    return movements.map(movement => {
      runningBalance = movement.tipoMovimiento === 'credito' 
        ? runningBalance + movement.monto 
        : runningBalance - movement.monto;
      return {
        ...movement,
        saldoActualizado: runningBalance,
      };
    });
  };

  const updateAccountBalance = (movements) => {
    const finalBalance = movements.length > 0 ? movements[movements.length - 1].saldoActualizado : selectedAccount?.accountBalance || 0;
    setSelectedAccount(prevAccount => ({ ...prevAccount, accountBalance: finalBalance }));
  };

  const saveToLocalStorage = (movements) => {
    localStorage.setItem('movements', JSON.stringify(movements));
    localStorage.setItem('selectedAccount', JSON.stringify(selectedAccount));
  };

  const formatDate = (fecha) => {
    if (fecha instanceof Date) return fecha.toLocaleDateString();
    if (fecha && typeof fecha.toDate === 'function') return fecha.toDate().toLocaleDateString();
    return 'N/A';
  };

  const handleFilterClick = () => navigate(`/movimientos?account=${accountNumber}`);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const accountTypeDisplay = (tipoCuenta, accountNumber) => {
    const lastFourDigits = accountNumber?.slice(-4) || '****';
    return tipoCuenta?.toLowerCase() === 'ahorros' ? `AHO${lastFourDigits}` : `COR${lastFourDigits}`;
  };

  const movementsContent = useMemo(() => {
    if (movements.length === 0) return <p>No se encontraron movimientos.</p>;

    return Object.entries(
      movements.reduce((acc, movement) => {
        const dateStr = formatDate(movement.fecha);
        if (!acc[dateStr]) acc[dateStr] = [];
        acc[dateStr].push(movement);
        return acc;
      }, {})
    ).map(([date, movements], index) => (
      <div key={index} className="mb-6">
        <h3 className="font-semibold mb-2">{date}</h3>
        <table className="movements-table w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border-b">Descripción</th>
              <th className="p-2 border-b">Cuenta Origen</th>
              <th className="p-2 border-b">Cuenta Destino</th>
              <th className="p-2 border-b">Monto</th>
              <th className="p-2 border-b">Saldo Actualizado</th>
            </tr>
          </thead>
          <tbody>
            {movements.map((movement, index) => (
              <tr key={index} className="hover:bg-gray-100">
                <td className="p-2 border-b">
                  {movement.tipoMovimiento === 'debito'
                    ? `Transferencia a ${movement.nombreDestino || 'Desconocido'}`
                    : `Transferencia de ${movement.nombreOrigen || 'Desconocido'}`}
                </td>
                <td className="p-2 border-b">{`******${movement.cuentaOrigen?.slice(-4) || '****'}`}</td>
                <td className="p-2 border-b">{`******${movement.cuentaDestino?.slice(-4) || '****'}`}</td>
                <td className="p-2 border-b" style={{ color: movement.tipoMovimiento === 'credito' ? 'green' : 'red' }}>
                  {movement.monto?.toFixed(2) || '0.00'}
                </td>
                <td className="p-2 border-b">{`$${movement.saldoActualizado?.toFixed(2) || 'N/A'}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ));
  }, [movements]);

  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <div><p>No user is currently logged in.</p></div>;

  return (
    <div className="min-h-screen flex flex-col pt-24">
      <HeaderDashboard firstName={user.nombre} lastName={user.apellido} />
      <div className="flex flex-grow">
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className={`main-content p-5 mx-auto flex flex-col items-center justify-center w-full ${isSidebarOpen ? 'ml-72' : 'ml-72'}`}>
          {selectedAccount && (
            <div className="account-card text-center mb-8 bg-white shadow-md rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold">{accountTypeDisplay(selectedAccount.tipoCuenta, selectedAccount.accountNumber)}</h2>
              <p className="text-lg">Número de cuenta: {selectedAccount.accountNumber}</p>
              <div className="balance-info mt-4 flex items-center justify-center">
                <p className="text-lg mr-2">
                  Saldo disponible: {showBalance ? `$${selectedAccount.accountBalance?.toFixed(2) || 'N/A'}` : '***'}
                </p>
                <button className="toggle-balance-button" onClick={() => setShowBalance(!showBalance)}>
                  {showBalance ? <FaRegEye className="h-6 w-6" /> : <FaRegEyeSlash className="h-6 w-6" />}
                </button>
              </div>
            </div>
          )}
          <h4 className="movements-title text-2xl font-bold mb-4">Tus últimos movimientos</h4>
          <div className="movements-content w-full">
            {movementsContent}
          </div>
          <button className="filter-button mt-4 bg-blue-500 text-white px-4 py-2 rounded" onClick={handleFilterClick}>Filtrar por fechas</button>
        </div>
      </div>
    </div>
  );
};

export default AccountMovements;
