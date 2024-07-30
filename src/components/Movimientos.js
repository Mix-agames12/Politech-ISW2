import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore';
import { Sidebar } from './Sidebar';
import eyeOpen from '../assets/images/eye-open.png';
import eyeClosed from '../assets/images/eye-closed.png';
import { HeaderDashboard } from './HeaderDashboard';

const Movimientos = () => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        console.error("No user is currently logged in.");
        setLoading(false);
        return;
      }

      console.log("Current User ID:", currentUser.uid);

      try {
        const userDoc = await getDoc(doc(db, 'clientes', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('User data:', userData);
          setUser(userData);

          const accountsQuery = query(collection(db, 'cuentas'), where('id', '==', currentUser.uid));
          const accountsSnapshot = await getDocs(accountsQuery);
          const userAccounts = accountsSnapshot.docs.map(doc => doc.data());

          setAccounts(userAccounts);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const fetchMovements = async () => {
    if (!selectedAccount || !startDate || !endDate) {
      console.error("All fields must be filled");
      return;
    }

    // Clear previous movements
    setMovements([]);
    setLoading(true);

    try {
      let allMovementsSet = new Set();

      const transaccionesCollection = collection(db, 'transacciones');
      const q = query(transaccionesCollection, where('cuentaOrigen', '==', selectedAccount.accountNumber));
      const q2 = query(transaccionesCollection, where('cuentaDestino', '==', selectedAccount.accountNumber));

      const [querySnapshot1, querySnapshot2] = await Promise.all([getDocs(q), getDocs(q2)]);

      querySnapshot1.forEach((doc) => {
        const data = doc.data();
        console.log('Debito movement:', data);
        if (data.fecha && data.fecha.toDate) {
          data.fecha = data.fecha.toDate();
        } else if (data.fecha && typeof data.fecha === 'string') {
          data.fecha = new Date(data.fecha);
        }
        allMovementsSet.add(JSON.stringify({ ...data, id: doc.id, tipoMovimiento: 'debito' }));
      });

      querySnapshot2.forEach((doc) => {
        const data = doc.data();
        console.log('Credito movement:', data);
        if (data.fecha && data.fecha.toDate) {
          data.fecha = data.fecha.toDate();
        } else if (data.fecha && typeof data.fecha === 'string') {
          data.fecha = new Date(data.fecha);
        }
        allMovementsSet.add(JSON.stringify({ ...data, id: doc.id, tipoMovimiento: 'credito' }));
      });

      const allMovements = Array.from(allMovementsSet).map(item => JSON.parse(item));
      console.log('All movements:', allMovements);

      // Ensure startDate and endDate are correctly interpreted as Date objects
      const startDateObj = new Date(startDate + 'T00:00:00');
      const endDateObj = new Date(endDate + 'T23:59:59');

      console.log('Start date:', startDateObj);
      console.log('End date adjusted:', endDateObj);

      // Filter movements by date on the client side
      const filteredMovements = allMovements.filter(movement => {
        const movementDate = movement.fecha instanceof Date ? movement.fecha : new Date(movement.fecha);
        console.log('Movement date:', movementDate);
        console.log('Movement date timestamp:', movementDate.getTime());
        console.log('Start date timestamp:', startDateObj.getTime());
        console.log('End date timestamp:', endDateObj.getTime());
        return movementDate >= startDateObj && movementDate <= endDateObj;
      });

      console.log('Filtered movements:', filteredMovements);

      // Fetch names for each movement
      for (const movement of filteredMovements) {
        if (movement.tipoMovimiento === 'debito') {
          const receiverAccountQuery = query(collection(db, 'cuentas'), where('accountNumber', '==', movement.cuentaDestino));
          const receiverAccountSnapshot = await getDocs(receiverAccountQuery);
          if (!receiverAccountSnapshot.empty) {
            const receiverAccountData = receiverAccountSnapshot.docs[0].data();
            const receiverUserDoc = await getDoc(doc(db, 'clientes', receiverAccountData.id));
            if (receiverUserDoc.exists()) {
              const receiverData = receiverUserDoc.data();
              movement.nombreDestino = `${receiverData.nombre} ${receiverData.apellido}`;
            }
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
            }
          }
        }
      }

      setMovements(filteredMovements);
    } catch (error) {
      console.error("Error fetching data:", error);
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

  // Obtener la fecha actual en el formato adecuado para los inputs de fecha
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const maxDate = getCurrentDate();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div>
        <p>No user is currently logged in.</p>
      </div>
    );
  }

  return (
    <div className="mainContainer">
      {user && (
        <HeaderDashboard firstName={user.nombre} lastName={user.apellido} />
      )}
      <div className='sidebar'>
        <Sidebar />
      </div>
      <div className="selectionContainer">
        <div>
          <label htmlFor="accountSelect">Selecciona una cuenta:</label>
          <div className="dropdownContainer">
            <button className="dropdownButton" onClick={() => setDropdownVisible(!dropdownVisible)}>
              {selectedAccount ? `${selectedAccount.accountNumber}` : 'Seleccione una cuenta'}
              <span className="arrow">{dropdownVisible ? '▲' : '▼'}</span>
            </button>
            {dropdownVisible && (
              <div className="dropdownMenu">
                {accounts.map((account, index) => (
                  <div
                    key={index}
                    className="dropdownItem"
                    onClick={() => {
                      setSelectedAccount(account);
                      setDropdownVisible(false);
                    }}>
                    <div className="account-info">
                      <h4 className="account-number">{account.accountNumber}</h4>
                      <p>Tipo de Cuenta: {account.tipoCuenta}</p>
                      <div className="balance-info">
                        <p className="balance-text">Saldo Disponible: {showBalance ? `$${account.accountBalance ? account.accountBalance.toFixed(2) : 'N/A'}` : '***'}</p>
                        <button className="toggleBalanceButton" onClick={(e) => {
                          e.stopPropagation();
                          setShowBalance(!showBalance);
                        }}>
                          <img src={showBalance ? eyeOpen : eyeClosed} alt="Toggle Balance Visibility" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div>
          <label htmlFor="startDate">Fecha de inicio:</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            max={maxDate}
          />
        </div>
        <div>
          <label htmlFor="endDate">Fecha de fin:</label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            max={maxDate}
          />
        </div>
        <button onClick={fetchMovements}>Buscar Movimientos</button>
      </div>
      <div className="movementsContainer">
        {movements.length > 0 ? (
          Object.entries(
            movements.reduce((acc, movement) => {
              const dateStr = formatDate(movement.fecha);
              if (!acc[dateStr]) acc[dateStr] = [];
              acc[dateStr].push(movement);
              return acc;
            }, {})
          ).map(([date, movements], index) => (
            <div key={index}>
              <h3>{date}</h3>
              <table className="movementsTable">
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
                          `Transferencia a ${movement.nombreDestino}` :
                          `Transferencia de ${movement.nombreOrigen}`}
                      </td>
                      <td>{`******${movement.cuentaOrigen.slice(-4)}`}</td>
                      <td>{`******${movement.cuentaDestino.slice(-4)}`}</td>
                      <td style={{ color: movement.tipoMovimiento === 'credito' ? 'green' : 'red' }}>
                        {movement.monto !== undefined ?
                          (movement.tipoMovimiento === 'credito' ?
                            `+${movement.monto.toFixed(2)}` :
                            `-${movement.monto.toFixed(2)}`
                          ) : 'N/A'
                        }
                      </td>
                      <td>{movement.saldoActualizado !== undefined ? `$${movement.saldoActualizado.toFixed(2)}` : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        ) : (
          <p>No se encontraron movimientos.</p>
        )}
      </div>
    </div>
  );
};

export default Movimientos;
