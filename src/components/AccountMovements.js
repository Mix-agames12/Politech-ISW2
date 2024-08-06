import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore';
import { Sidebar } from '../components/Sidebar';
import { HeaderDashboard } from './HeaderDashboard';
import eyeOpen from '../assets/images/eye-open.png';
import eyeClosed from '../assets/images/eye-closed.png';

const AccountMovements = () => {
  const { accountNumber } = useParams();
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showBalance, setShowBalance] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        console.error("No user is currently logged in.");
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'clientes', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser(userData);

          const accountsQuery = query(collection(db, 'cuentas'), where('id', '==', currentUser.uid));
          const accountsSnapshot = await getDocs(accountsQuery);
          const userAccounts = accountsSnapshot.docs.map(doc => doc.data());

          const account = userAccounts.find(account => account.accountNumber === accountNumber);
          setSelectedAccount(account);

          if (account) {
            await fetchMovements(account.accountNumber);
          } else {
            console.error("No account found with the provided account number.");
            setLoading(false);
          }
        } else {
          console.log("No such document!");
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [accountNumber]);

  const fetchMovements = async (accountNumber) => {
    try {
      const allMovements = [];
      const transaccionesCollection = collection(db, 'transacciones');
      const q1 = query(
        transaccionesCollection,
        where('cuentaOrigen', '==', accountNumber),
        where('tipoMovimiento', '==', 'debito')
      );
      const q2 = query(
        transaccionesCollection,
        where('cuentaDestino', '==', accountNumber),
        where('tipoMovimiento', '==', 'credito')
      );

      const [querySnapshot1, querySnapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);

      querySnapshot1.forEach((doc) => {
        const data = doc.data();
        if (data.fecha && data.fecha.toDate) {
          data.fecha = data.fecha.toDate();
        } else if (data.fecha && typeof data.fecha === 'string') {
          data.fecha = new Date(data.fecha);
        }
        allMovements.push({ ...data, id: doc.id, tipoMovimiento: 'debito' });
      });

      querySnapshot2.forEach((doc) => {
        const data = doc.data();
        if (data.fecha && data.fecha.toDate) {
          data.fecha = data.fecha.toDate();
        } else if (data.fecha && typeof data.fecha === 'string') {
          data.fecha = new Date(data.fecha);
        }
        allMovements.push({ ...data, id: doc.id, tipoMovimiento: 'credito' });
      });

      const movementsWithNames = await Promise.all(allMovements.map(async (movement) => {
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

      // Mostrar solo los últimos 10 movimientos
      setMovements(movementsWithNames.sort((a, b) => b.fecha - a.fecha).slice(0, 10));
    } catch (error) {
      console.error("Error fetching movements:", error);
    } finally {
      setLoading(false);
    }
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
        <div key={index}>
          <h3>{date}</h3>
          <table className="movements-table">
            <thead>
              <tr>
                <th>Descripción</th>
                <th>Cuenta Origen</th>
                <th>Cuenta Destino</th>
                <th>Monto</th>
                <th>Saldo Actualizado</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((movement, index) => (
                <tr key={index}>
                  <td>
                    {movement.tipoMovimiento === 'debito' ?
                      `Transferencia a ${movement.nombreDestino || 'Desconocido'}` :
                      `Transferencia de ${movement.nombreOrigen || 'Desconocido'}`}
                  </td>
                  <td>{`******${movement.cuentaOrigen.slice(-4)}`}</td>
                  <td>{`******${movement.cuentaDestino.slice(-4)}`}</td>
                  <td style={{ color: movement.tipoMovimiento === 'credito' ? 'green' : 'red' }}>
                    {movement.monto !== undefined ?
                      (movement.tipoMovimiento === 'credito' ?
                        `+${movement.monto.toFixed(2)}` :
                        `-${movement.monto.toFixed(2)}`
                      ) : '0.00'
                    }
                  </td>
                  <td>{movement.saldoActualizado !== undefined ? `$${movement.saldoActualizado.toFixed(2)}` : 'N/A'}</td>
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
    <div className="">
      {user && (
        <HeaderDashboard firstName={user.nombre} lastName={user.apellido} />
      )}
      <div className="min-h-screen flex flex-col items-center justify-center w-full max-w-5xl p-4">
        <div className="sidebar">
          <Sidebar />
        </div>
        {selectedAccount && (
          <div className="accountCard text-center mb-8">
            <h2 className="text-2xl font-bold">{accountTypeDisplay(selectedAccount.tipoCuenta, selectedAccount.accountNumber)}</h2>
            <p className="text-lg">Número de cuenta: {selectedAccount.accountNumber}</p>
            <div className="balance-info mt-4">
              <p className="text-lg">
                Saldo disponible: {showBalance ? `$${selectedAccount.accountBalance?.toFixed(2) || 'N/A'}` : '***'}
              </p>
              <button className="toggleBalanceButton mt-2" onClick={() => setShowBalance(!showBalance)}>
                <img src={showBalance ? eyeOpen : eyeClosed} alt="Toggle Balance Visibility" />
              </button>
            </div>
          </div>
        )}
        <h4 className="movements-title text-2xl font-bold mb-4">Tus últimos movimientos</h4>
        <div className="movements-content">
          {movementsContent}
        </div>
        <button className="filterButton mt-4 bg-blue-500 text-white px-4 py-2 rounded" onClick={handleFilterClick}>Filtrar por fechas</button>
      </div>
    </div>
  );
};

export default AccountMovements;
  