import React, { useState, useEffect, useRef, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore';
import { Sidebar } from './Sidebar';
import { HeaderDashboard } from './HeaderDashboard';
import { generateMovementsPDF } from '../assets/pdfs/generateMovementsPDF';
import { AuthContext } from '../context/AuthContext';
import moment from 'moment-timezone';

const Movimientos = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [accountError, setAccountError] = useState('');
  const [startDateError, setStartDateError] = useState('');
  const [endDateError, setEndDateError] = useState('');
  const reportRef = useRef();
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [hasClickedSearch, setHasClickedSearch] = useState(false);

  const showLastOnly = location.state?.showLastOnly || false;
  const fromProducts = location.state?.fromProducts || false;

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        console.error("No user is currently logged in.");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'clientes', user.uid));
        if (userDoc.exists()) {
          const accountsQuery = query(collection(db, 'cuentas'), where('id', '==', user.uid));
          const accountsSnapshot = await getDocs(accountsQuery);
          const userAccounts = accountsSnapshot.docs.map(doc => doc.data());
          setAccounts(userAccounts);

          const params = new URLSearchParams(location.search);
          const account = params.get('account');
          console.log("Account param:", account);

          if (account) {
            const foundAccount = userAccounts.find(acc => acc.accountNumber === account);
            console.log("Found Account:", foundAccount);
            setSelectedAccount(foundAccount);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [location, user]);

  useEffect(() => {
    if (fromProducts) {
      if (selectedAccount) {
        fetchMovements(true); // Obtener solo los últimos 10 movimientos
      } else {
        console.error("No se seleccionó ninguna cuenta al intentar cargar movimientos.");
      }
    }
  }, [fromProducts, selectedAccount]);

  const formatDate = (fecha) => {
    return moment(fecha).tz('America/Guayaquil').format('DD/MM/YYYY');
  };

  const fetchMovements = async (onlyLastTen = false) => {
    if (!selectedAccount) {
      setAccountError("Debe seleccionar una cuenta.");
      return;
    }

    if (!fromProducts && (!startDate || !endDate)) {
      if (!startDate) setStartDateError("Debe ingresar la fecha de inicio.");
      if (!endDate) setEndDateError("Debe ingresar la fecha de fin.");
      return;
    }

    setLoading(true);

    try {
      const transaccionesCollection = collection(db, 'transacciones');
      let q1, q2;

      if (fromProducts) {
        // Obtener los últimos 10 movimientos sin fechas (para "Mis Productos")
        q1 = query(
          transaccionesCollection,
          where('cuentaOrigen', '==', selectedAccount.accountNumber),
          where('tipoMovimiento', '==', 'debito')
        );
        q2 = query(
          transaccionesCollection,
          where('cuentaDestino', '==', selectedAccount.accountNumber),
          where('tipoMovimiento', '==', 'credito')
        );
      } else {
        // Obtener movimientos dentro de las fechas (para "Movimientos" en el Sidebar)
        const start = moment.tz(startDate, 'America/Guayaquil').startOf('day').toDate();
        const end = moment.tz(endDate, 'America/Guayaquil').endOf('day').toDate();

        q1 = query(
          transaccionesCollection,
          where('cuentaOrigen', '==', selectedAccount.accountNumber),
          where('tipoMovimiento', '==', 'debito'),
          where('fecha', '>=', start),
          where('fecha', '<=', end)
        );
        q2 = query(
          transaccionesCollection,
          where('cuentaDestino', '==', selectedAccount.accountNumber),
          where('tipoMovimiento', '==', 'credito'),
          where('fecha', '>=', start),
          where('fecha', '<=', end)
        );
      }

      const [querySnapshot1, querySnapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);

      let movementsArray = [];

      querySnapshot1.forEach((doc) => {
        const data = doc.data();
        movementsArray.push({ ...data, id: doc.id, fecha: data.fecha.toDate() });
      });

      querySnapshot2.forEach((doc) => {
        const data = doc.data();
        movementsArray.push({ ...data, id: doc.id, fecha: data.fecha.toDate() });
      });

      let sortedMovements = movementsArray.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

      if (fromProducts && onlyLastTen) {
        sortedMovements = sortedMovements.slice(0, 10);
        console.log("Mostrando los últimos 10 movimientos:", sortedMovements);
      }

      // Llamada a la función para obtener nombres de usuarios
      const movementsWithNames = await fetchNamesForMovements(sortedMovements);

      setMovements(movementsWithNames);
      console.log("Movimientos finales asignados:", movementsWithNames);

      setSearchPerformed(true);
    } catch (error) {
      console.error("Error al buscar movimientos:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNamesForMovements = async (movements) => {
    return await Promise.all(movements.map(async (movement) => {
      let accountNumberToLookup = movement.tipoMovimiento === 'debito' ? movement.cuentaDestino : movement.cuentaOrigen;
      let nombreCampo = movement.tipoMovimiento === 'debito' ? 'nombreDestino' : 'nombreOrigen';

      const accountSnapshot = await getDocs(query(collection(db, 'cuentas'), where('accountNumber', '==', accountNumberToLookup)));
      if (!accountSnapshot.empty) {
        const accountData = accountSnapshot.docs[0].data();
        const userDoc = await getDoc(doc(db, 'clientes', accountData.id));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          movement[nombreCampo] = `${userData.nombre} ${userData.apellido}`;
        } else {
          movement[nombreCampo] = 'Usuario desconocido';
        }
      } else {
        movement[nombreCampo] = 'Cuenta desconocida';
      }

      return movement;
    }));
  };

  const handleGeneratePDF = async () => {
    if (user && selectedAccount && movements.length > 0) {
      await generateMovementsPDF(user, selectedAccount, movements);
    } else {
      console.error("Información insuficiente para generar el PDF.");
    }
  };

  const getCurrentDate = () => {
    return moment().tz('America/Guayaquil').format('YYYY-MM-DD');
  };

  useEffect(() => {
    if (selectedAccount) {
      setAccountError('');
    }
  }, [selectedAccount]);

  useEffect(() => {
    if (startDate) {
      setStartDateError('');
    }
  }, [startDate]);

  useEffect(() => {
    if (endDate) {
      setEndDateError('');
    }
  }, [endDate]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleFilterByDates = () => {
    navigate('/movimientos', {
      state: {
        fromProducts: false,
        showLastOnly: false
      },
      search: `?account=${selectedAccount.accountNumber}`
    });
  };

  return (
    <div className="min-h-screen flex flex-col pt-24">
      <HeaderDashboard />
      <div className="flex flex-grow justify-center items-center">
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <div className={`main-content p-5 mx-auto flex flex-col items-center justify-center w-full ${isSidebarOpen ? 'ml-80' : 'ml-20'} md:ml-0`}>
          <h2 className="text-2xl font-bold mb-4 text-center">Movimientos</h2>

          {fromProducts && (
            <>
              <div className="bg-white shadow-lg rounded-lg p-6 mb-6 w-full max-w-xl text-center">
                <h3 className="text-xl font-semibold mb-4">Información de la Cuenta</h3>
                <p><strong>Número de Cuenta:</strong> {selectedAccount.accountNumber}</p>
                <p><strong>Tipo de Cuenta:</strong> {selectedAccount.tipoCuenta}</p>
                <p><strong>Saldo Disponible:</strong> ${selectedAccount.accountBalance ? selectedAccount.accountBalance.toFixed(2) : '0.00'}</p>
              </div>
              <div className="w-full flex justify-center">
                <button
                  className="bg-sky-900 text-white px-4 py-2 rounded-md shadow-sm hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600 mb-4"
                  onClick={handleFilterByDates}
                >
                  Filtrar por fechas
                </button>
              </div>
            </>
          )}

          {!fromProducts && (
            <>
              <div className="w-full max-w-xl mb-6">
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
                            <p>Saldo Disponible: ${account.accountBalance ? account.accountBalance.toFixed(2) : '0.00'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {hasClickedSearch && accountError && <p className="text-red-600 text-xs mt-1">{accountError}</p>}
              </div>

              <div className="w-full max-w-xl mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de inicio:</label>
                <input
                  type="date"
                  className="w-full bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={getCurrentDate()}
                />
                {hasClickedSearch && startDateError && <p className="text-red-600 text-xs mt-1">{startDateError}</p>}
              </div>

              <div className="w-full max-w-xl mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de fin:</label>
                <input
                  type="date"
                  className="w-full bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  max={getCurrentDate()}
                />
                {hasClickedSearch && endDateError && <p className="text-red-600 text-xs mt-1">{endDateError}</p>}
              </div>

              <div className="flex w-full justify-center space-x-4 mt-4">
                <button
                  className="bg-sky-900 text-white px-4 py-2 rounded-md shadow-sm hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  onClick={() => {
                    setHasClickedSearch(true);
                    fetchMovements(false); // Obtener todos los movimientos entre las fechas
                  }}
                >
                  Buscar Movimientos
                </button>
                <button
                  className={`px-4 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 ${searchPerformed ? 'bg-sky-900 text-white hover:bg-sky-600 cursor-pointer' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                  onClick={handleGeneratePDF}
                  disabled={!searchPerformed}
                >
                  Generar PDF
                </button>
              </div>
            </>
          )}

          <div className="w-full mt-6 max-w-4xl" ref={reportRef}>
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
                    <table className="w-full mb-6 text-left border-collapse">
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
                              {movement.tipo === 'transferencia' ? (
                                movement.tipoMovimiento === 'debito' ?
                                  `Transferencia a ${movement.nombreDestino || 'Desconocido'}` :
                                  `Transferencia de ${movement.nombreOrigen || 'Desconocido'}`
                              ) : (
                                `Pago de ${movement.cuentaDestino.toLowerCase() || 'Desconocido'}`
                              )}
                            </td>
                            <td className="p-2 border-b">{`******${movement.cuentaOrigen.slice(-4)}`}</td>
                            <td className="p-2 border-b">
                              {/^\D+$/.test(movement.cuentaDestino) ? '' : `******${movement.cuentaDestino.slice(-4)}`}
                            </td>
                            <td className="p-2 border-b" style={{ color: movement.tipoMovimiento === 'credito' ? '#228B22' : 'red' }}>
                              {movement.monto !== undefined ? `${movement.monto.toFixed(2)}` : '0.00'}
                            </td>
                            <td className="p-2 border-b">{movement.saldoActualizado !== undefined ? `$${movement.saldoActualizado.toFixed(2)}` : 'N/A'}</td>
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
        </div>
      </div>
    </div>
  );
};

export default Movimientos;
