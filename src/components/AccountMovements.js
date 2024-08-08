import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Sidebar } from '../components/Sidebar';
import { HeaderDashboard } from './HeaderDashboard';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';

const AccountMovements = () => {
  const { accountNumber } = useParams();
  const [movements, setMovements] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showBalance, setShowBalance] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        console.error("No user is currently logged in.");
        return;
      }

      const savedAccount = localStorage.getItem('selectedAccount');
      const savedMovements = localStorage.getItem('movements');

      if (savedAccount && savedMovements) {
        setSelectedAccount(JSON.parse(savedAccount));
        setMovements(JSON.parse(savedMovements));
      } else {
        try {
          const userDoc = await getDoc(doc(db, 'clientes', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();

            const accountsQuery = query(collection(db, 'cuentas'), where('id', '==', user.uid));
            onSnapshot(accountsQuery, (accountsSnapshot) => {
              const userAccounts = accountsSnapshot.docs.map(doc => doc.data());
              const account = userAccounts.find(account => account.accountNumber === accountNumber);
              setSelectedAccount(account);

              if (account) {
                fetchMovements(account.accountNumber);
              } else {
                console.error("No account found with the provided account number.");
              }
            });
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
    };

    fetchUserData();
  }, [accountNumber, user]);

  const fetchMovements = (accountNumber) => {
    const transaccionesCollection = collection(db, 'transacciones');

    const q1 = query(
      transaccionesCollection,
      where('cuentaOrigen', '==', accountNumber)
    );
    const q2 = query(
      transaccionesCollection,
      where('cuentaDestino', '==', accountNumber)
    );

    const allMovements = [];

    onSnapshot(q1, (querySnapshot1) => {
      querySnapshot1.forEach((doc) => {
        const data = doc.data();
        if (data.fecha && data.fecha.toDate) {
          data.fecha = data.fecha.toDate();
        } else if (data.fecha && typeof data.fecha === 'string') {
          data.fecha = new Date(data.fecha);
        }
        allMovements.push({ ...data, id: doc.id, tipoMovimiento: 'debito' });
      });

      onSnapshot(q2, (querySnapshot2) => {
        querySnapshot2.forEach((doc) => {
          const data = doc.data();
          if (data.fecha && data.fecha.toDate) {
            data.fecha = data.fecha.toDate();
          } else if (data.fecha && typeof data.fecha === 'string') {
            data.fecha = new Date(data.fecha);
          }
          allMovements.push({ ...data, id: doc.id, tipoMovimiento: 'credito' });
        });

        const movementsWithNames = allMovements.map(async (movement) => {
          if (movement.tipoMovimiento === 'debito') {
            const receiverAccountQuery = query(collection(db, 'cuentas'), where('accountNumber', '==', movement.cuentaDestino));
            const receiverAccountSnapshot = await getDoc(receiverAccountQuery);
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
            const senderAccountSnapshot = await getDoc(senderAccountQuery);
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
        });

        Promise.all(movementsWithNames).then((completedMovements) => {
          const sortedMovements = completedMovements.sort((a, b) => b.fecha - a.fecha).slice(0, 10);
          setMovements(sortedMovements);

          const newBalance = sortedMovements.reduce((acc, movement) => {
            return movement.tipoMovimiento === 'credito' ? acc + movement.monto : acc - movement.monto;
          }, selectedAccount.accountBalance || 0);

          setSelectedAccount(prevAccount => ({ ...prevAccount, accountBalance: newBalance }));

          localStorage.setItem('movements', JSON.stringify(sortedMovements));
          localStorage.setItem('selectedAccount', JSON.stringify(selectedAccount));
        });
      });
    });
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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {user && <HeaderDashboard firstName={user.nombre} lastName={user.apellido} />}
      <div className="flex flex-grow">
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className={`main-content p-5 mx-auto flex flex-col items-center justify-center w-full ${isSidebarOpen ? 'ml-72' : 'ml-20'}`}>
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
