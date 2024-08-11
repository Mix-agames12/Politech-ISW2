import React, { useState, useEffect, useMemo, useContext } from 'react';
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
    const fetchUserData = async () => {
      if (!user) {
        console.error("No user is currently logged in.");
        setLoading(false);
        return;
      }

      const savedAccount = localStorage.getItem('selectedAccount');
      const savedMovements = localStorage.getItem('movements');

      if (savedAccount && savedMovements) {
        const parsedAccount = JSON.parse(savedAccount);
        if (parsedAccount.accountNumber === accountNumber) {
          setSelectedAccount(parsedAccount);
          setMovements(JSON.parse(savedMovements));
          setLoading(false);
          return;
        }
      }

      try {
        const userDoc = await getDoc(doc(db, 'clientes', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();

          const accountsQuery = query(collection(db, 'cuentas'), where('id', '==', user.uid), where('accountNumber', '==', accountNumber));
          const accountsSnapshot = await getDocs(accountsQuery);
          if (!accountsSnapshot.empty) {
            const account = accountsSnapshot.docs[0].data();
            setSelectedAccount(account);
            await fetchMovements(account.accountNumber);
          } else {
            console.error("No account found with the provided account number.");
          }
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setLoading(false);
    };

    fetchUserData();
  }, [accountNumber, user]);

  const fetchMovements = async (accountNumber) => {
    const transaccionesCollection = collection(db, 'transacciones');

    const q1 = query(
      transaccionesCollection,
      where('cuentaOrigen', '==', accountNumber)
    );
    const q2 = query(
      transaccionesCollection,
      where('cuentaDestino', '==', accountNumber)
    );

    const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    let allMovements = [];

    snapshot1.forEach((doc) => {
      const data = doc.data();
      allMovements.push({ ...data, id: doc.id, fecha: data.fecha.toDate(), tipoMovimiento: 'debito' });
    });

    snapshot2.forEach((doc) => {
      const data = doc.data();
      allMovements.push({ ...data, id: doc.id, fecha: data.fecha.toDate(), tipoMovimiento: 'credito' });
    });

    // Ordenar los movimientos por fecha en orden descendente y tomar solo los primeros 10
    const sortedMovements = allMovements
      .sort((a, b) => b.fecha - a.fecha)
      .slice(0, 10);

    const movementsWithNames = await Promise.all(sortedMovements.map(async (movement) => {
      if (movement.tipoMovimiento === 'debito') {
        const receiverAccountQuery = query(collection(db, 'cuentas'), where('accountNumber', '==', movement.cuentaDestino));
        const receiverAccountSnapshot = await getDocs(receiverAccountQuery);
        if (!receiverAccountSnapshot.empty) {
          const receiverAccountData = receiverAccountSnapshot.docs[0].data();
          const receiverUserDoc = await getDoc(doc(db, 'clientes', receiverAccountData.id));
          if (receiverUserDoc.exists()) {
            const receiverData = receiverUserDoc.data();
            movement.nombreDestino = `${receiverData.nombre} ${receiverData.apellido}`;
          } else {
            movement.nombreDestino = 'Usuario desconocido';
          }
        } else {
          movement.nombreDestino = 'Cuenta desconocida';
        }
      } else if (movement.tipoMovimiento === 'credito') {
        const senderAccountQuery = query(collection(db, 'cuentas'), where('accountNumber', '==', movement.cuentaOrigen));
        const senderAccountSnapshot = await getDocs(senderAccountQuery);
        if (!senderAccountSnapshot.empty) {
          const senderAccountData = senderAccountSnapshot.docs[0].data();
          const senderUserDoc = await getDoc(doc(db, 'clientes', senderAccountData.id));
          if (senderUserDoc.exists()) {
            const senderData = senderUserDoc.data();
            movement.nombreOrigen = `${senderData.nombre} ${senderData.apellido}`;
          } else {
            movement.nombreOrigen = 'Usuario desconocido';
          }
        } else {
          movement.nombreOrigen = 'Cuenta desconocida';
        }
      }
      return movement;
    }));

    setMovements(movementsWithNames);

    const newBalance = movementsWithNames.reduce((acc, movement) => {
      return movement.tipoMovimiento === 'credito' ? acc + movement.monto : acc - movement.monto;
    }, selectedAccount?.accountBalance || 0);

    setSelectedAccount(prevAccount => ({ ...prevAccount, accountBalance: newBalance }));

    localStorage.setItem('movements', JSON.stringify(movementsWithNames));
    localStorage.setItem('selectedAccount', JSON.stringify(selectedAccount));
  };

  const formatDate = (fecha) => {
    if (fecha instanceof Date) {
      return fecha.toLocaleDateString();
    } else if (fecha && typeof fecha.toDate === 'function') {
      return fecha.toDate().toLocaleDateString();
    } else if (typeof fecha === 'string') {
      return new Date(fecha).toLocaleDateString();
    } else {
      return 'N/A';
    }
  };

  const handleFilterClick = () => {
    navigate(`/movimientos?account=${accountNumber}`);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const accountTypeDisplay = (tipoCuenta, accountNumber) => {
    const lastFourDigits = accountNumber.slice(-4);
    const tipo = tipoCuenta.toLowerCase();
    if (tipo === 'ahorros') {
      return `AHO${lastFourDigits}`;
    } else if (tipo === 'corriente') {
      return `COR${lastFourDigits}`;
    }
    return lastFourDigits;
  };

  const movementsContent = useMemo(() => {
    if (movements.length > 0) {
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
                    {movement.tipoMovimiento === 'debito' ?
                      `Transferencia a ${movement.nombreDestino || 'Desconocido'}` :
                      `Transferencia de ${movement.nombreOrigen || 'Desconocido'}`}
                  </td>
                  <td className="p-2 border-b">{`******${movement.cuentaOrigen.slice(-4)}`}</td>
                  <td className="p-2 border-b">{`******${movement.cuentaDestino.slice(-4)}`}</td>
                  <td className="p-2 border-b" style={{ color: movement.tipoMovimiento === 'credito' ? 'green' : 'red' }}>
                    {movement.monto !== undefined ? movement.monto.toFixed(2) : '0.00'}
                  </td>
                  <td className="p-2 border-b">{movement.saldoActualizado !== undefined ? `$${movement.saldoActualizado.toFixed(2)}` : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ));
    } else {
      return <p>No se encontraron movimientos.</p>;
    }
  }, [movements]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return (
      <div>
        <p>No user is currently logged in.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pt-24">
      {user && <HeaderDashboard firstName={user.nombre} lastName={user.apellido} />}
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
