import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore';
import { Sidebar } from './Sidebar';
import './Movimientos.css';
import { Header } from './Header';
import eyeOpen from '../assets/images/eye-open.png';
import eyeClosed from '../assets/images/eye-closed.png';
import { generateMovementsPDF } from '../assets/pdfs/generateMovementsPDF';

const Movimientos = () => {
  const location = useLocation();
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const reportRef = useRef();

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;

      if (!currentUser) {
        console.error("No user is currently logged in.");
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
          setAccounts(userAccounts);

          // Verifica si hay un account en la URL
          const params = new URLSearchParams(location.search);
          const account = params.get('account');
          if (account) {
            setSelectedAccount(userAccounts.find(acc => acc.accountNumber === account));
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchUserData();
  }, [location]);

  const fetchMovements = async () => {
    if (!selectedAccount || !startDate || !endDate) {
      console.error("All fields must be filled");
      return;
    }

    setMovements([]);
    setLoading(true);

    try {
      const transaccionesCollection = collection(db, 'transacciones');
      const q1 = query(
        transaccionesCollection,
        where('cuentaOrigen', '==', selectedAccount.accountNumber),
        where('tipoMovimiento', '==', 'debito')
      );
      const q2 = query(
        transaccionesCollection,
        where('cuentaDestino', '==', selectedAccount.accountNumber),
        where('tipoMovimiento', '==', 'credito')
      );

      const [querySnapshot1, querySnapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);

      let movementsArray = [];

      querySnapshot1.forEach((doc) => {
        const data = doc.data();
        if (data.fecha && data.fecha.toDate) {
          data.fecha = data.fecha.toDate();
        } else if (data.fecha && typeof data.fecha === 'string') {
          data.fecha = new Date(data.fecha);
        }
        if (data.tipoMovimiento === 'debito') {
          movementsArray.push({ ...data, id: doc.id });
        }
      });

      querySnapshot2.forEach((doc) => {
        const data = doc.data();
        if (data.fecha && data.fecha.toDate) {
          data.fecha = data.fecha.toDate();
        } else if (data.fecha && typeof data.fecha === 'string') {
          data.fecha = new Date(data.fecha);
        }
        if (data.tipoMovimiento === 'credito') {
          movementsArray.push({ ...data, id: doc.id });
        }
      });

      // Asignación de nombres de usuario de origen y destino
      for (const movement of movementsArray) {
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
      }

      // Ordenar por fecha
      const sortedMovements = movementsArray.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

      setMovements(sortedMovements);
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

  const handleGeneratePDF = async () => {
    if (user && selectedAccount && movements.length > 0) {
      await generateMovementsPDF(user, selectedAccount, movements);
    } else {
      console.error("Información insuficiente para generar el PDF.");
    }
  };

  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const maxDate = getCurrentDate();

  useEffect(() => {
    if (selectedAccount) {
      fetchMovements();
    }
  }, [selectedAccount]);

  return (
    <div className="mainContainer">
      {user && (
        <Header firstName={user.nombre} lastName={user.apellido} />
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
      <div className="movementsContainer" ref={reportRef}>
        {loading ? (
          <p>Buscando movimientos...</p>
        ) : (
          movements.length > 0 ? (
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
          )
        )}
      </div>
      <button className="generatePDFButton" onClick={handleGeneratePDF}>Generar PDF</button>
    </div>
  );
};

export default Movimientos;
