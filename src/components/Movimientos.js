import React, { useState, useEffect, useRef, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore';
import { Sidebar } from './Sidebar';
import { HeaderDashboard } from './HeaderDashboard';
import { generateMovementsPDF } from '../assets/pdfs/generateMovementsPDF';
import { AuthContext } from '../context/AuthContext';

const Movimientos = () => {
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const reportRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        console.error("No user is currently logged in.");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'clientes', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();

          const accountsQuery = query(collection(db, 'cuentas'), where('id', '==', user.uid));
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

    fetchData();
  }, [location, user]);

  const fetchMovements = async () => {
    console.log("Start Date:", startDate);
    console.log("End Date:", endDate);

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

      const start = new Date(`${startDate}T00:00:00`);
      console.log("Start:", start);
      const end = new Date(`${endDate}T23:59:59`);
      console.log("End:", end);

      querySnapshot1.forEach((doc) => {
        const data = doc.data();
        const movementDate = data.fecha.toDate();
        if (movementDate >= start && movementDate <= end) {
          movementsArray.push({ ...data, id: doc.id, fecha: movementDate });
        }
      });

      querySnapshot2.forEach((doc) => {
        const data = doc.data();
        const movementDate = data.fecha.toDate();
        if (movementDate >= start && movementDate <= end) {
          movementsArray.push({ ...data, id: doc.id, fecha: movementDate });
        }
      });

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

      const sortedMovements = movementsArray.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

      setMovements(sortedMovements);
      console.log("Movements:", sortedMovements);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (fecha) => {
    return fecha.toLocaleDateString();
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
    <div className="min-h-screen flex flex-col">
      <HeaderDashboard />
      <div className="flex flex-grow">
        <div className="w-1/4">
          <Sidebar />
        </div>
        <div className="main-content p-6 mx-auto w-3/4 flex flex-col items-center justify-center pt-16">
          <h2 className="text-2xl font-bold mb-4">Consulta de Movimientos</h2>
          <div className="w-full mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Selecciona una cuenta:</label>
            <div className="relative">
              <button
                className="w-full bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                onClick={() => setDropdownVisible(!dropdownVisible)}
              >
                {selectedAccount ? `${selectedAccount.accountNumber}` : 'Seleccione una cuenta'}
                <span className="float-right">{dropdownVisible ? '▲' : '▼'}</span>
              </button>
              {dropdownVisible && (
                <div className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                  {accounts.map((account, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                      onClick={() => {
                        setSelectedAccount(account);
                        setDropdownVisible(false);
                      }}
                    >
                      <div>
                        <h4 className="text-sm font-bold">{account.accountNumber}</h4>
                        <p>Tipo de Cuenta: {account.tipoCuenta}</p>
                        <p>Saldo Disponible: ${account.accountBalance ? account.accountBalance.toFixed(2) : 'N/A'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="w-full mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de inicio:</label>
            <input
              type="date"
              className="w-full bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={maxDate}
            />
          </div>

          <div className="w-full mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de fin:</label>
            <input
              type="date"
              className="w-full bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              max={maxDate}
            />
          </div>

          <div className="text-center">
            <button
              className="bg-sky-900 text-white px-4 py-2 rounded-md shadow-sm hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              onClick={fetchMovements}
            >
              Buscar Movimientos
            </button>
          </div>

          <div className="w-full mt-6" ref={reportRef}>
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
                    <h3 className="text-lg font-bold mb-2">{date}</h3>
                    <table className="w-full mb-6">
                      <thead>
                        <tr>
                          <th className="text-left">Descripción</th>
                          <th className="text-left">Cuenta Origen</th>
                          <th className="text-left">Cuenta Destino</th>
                          <th className="text-left">Monto</th>
                          <th className="text-left">Saldo Actualizado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {movements.map((movement, index) => (
                          <tr key={index}>
                            <td className="border-t border-gray-300 py-2">
                              {movement.tipoMovimiento === 'debito' ?
                                `Transferencia a ${movement.nombreDestino || 'Desconocido'}` :
                                `Transferencia de ${movement.nombreOrigen || 'Desconocido'}`}
                            </td>
                            <td className="border-t border-gray-300 py-2">{`******${movement.cuentaOrigen.slice(-4)}`}</td>
                            <td className="border-t border-gray-300 py-2">{`******${movement.cuentaDestino.slice(-4)}`}</td>
                            <td className="border-t border-gray-300 py-2" style={{ color: movement.tipoMovimiento === 'credito' ? '#228B22' : 'red' }}>
                              {movement.monto !== undefined ? `${movement.monto.toFixed(2)}` : 'N/A'}
                            </td>
                            <td className="border-t border-gray-300 py-2">{movement.saldoActualizado !== undefined ? `$${movement.saldoActualizado.toFixed(2)}` : 'N/A'}</td>
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

          <div className="text-center mt-4">
            <button
              className="bg-sky-900 text-white px-4 py-2 rounded-md shadow-sm hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              onClick={handleGeneratePDF}
            >
              Generar PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Movimientos;
