import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore';
import { Sidebar } from './Sidebar';
import { HeaderDashboard } from './HeaderDashboard';
import { generateMovementsPDF } from '../assets/pdfs/generateMovementsPDF';
import { AuthContext } from '../context/AuthContext';
import moment from 'moment-timezone';

const Movements = () => {
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

  const getCurrentDate = () => {
    return moment().tz('America/Guayaquil').format('YYYY-MM-DD');
  };

  const fromProducts = location.state?.fromProducts || false;

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, 'clientes', user.uid));
        if (userDoc.exists()) {
          const accountsQuery = query(collection(db, 'cuentas'), where('id', '==', user.uid));
          const accountsSnapshot = await getDocs(accountsQuery);
          const userAccounts = accountsSnapshot.docs.map(doc => doc.data());
          setAccounts(userAccounts);

          const account = new URLSearchParams(location.search).get('account');
          if (account) {
            const foundAccount = userAccounts.find(acc => acc.accountNumber === account);
            setSelectedAccount(foundAccount);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchUserData();
  }, [location, user]);

  const fetchMovements = useCallback(async (onlyLastTen = false) => {
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
      const queries = [];

      if (fromProducts) {
        queries.push(
          query(transaccionesCollection, where('cuentaOrigen', '==', selectedAccount.accountNumber), where('tipoMovimiento', '==', 'debito')),
          query(transaccionesCollection, where('cuentaDestino', '==', selectedAccount.accountNumber), where('tipoMovimiento', '==', 'credito'))
        );
      } else {
        const start = moment.tz(startDate, 'America/Guayaquil').startOf('day').toDate();
        const end = moment.tz(endDate, 'America/Guayaquil').endOf('day').toDate();

        queries.push(
          query(transaccionesCollection, where('cuentaOrigen', '==', selectedAccount.accountNumber), where('tipoMovimiento', '==', 'debito'), where('fecha', '>=', start), where('fecha', '<=', end)),
          query(transaccionesCollection, where('cuentaDestino', '==', selectedAccount.accountNumber), where('tipoMovimiento', '==', 'credito'), where('fecha', '>=', start), where('fecha', '<=', end))
        );
      }

      const [querySnapshot1, querySnapshot2] = await Promise.all(queries.map(getDocs));

      const movementsArray = [
        ...querySnapshot1.docs.map(doc => ({ ...doc.data(), id: doc.id, fecha: doc.data().fecha.toDate() })),
        ...querySnapshot2.docs.map(doc => ({ ...doc.data(), id: doc.id, fecha: doc.data().fecha.toDate() }))
      ];

      let sortedMovements = movementsArray.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

      if (fromProducts && onlyLastTen) {
        sortedMovements = sortedMovements.slice(0, 10);
      }

      const movementsWithNames = await fetchNamesForMovements(sortedMovements);
      setMovements(movementsWithNames);
      setSearchPerformed(true);
    } catch (error) {
      console.error("Error al buscar movimientos:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedAccount, fromProducts, startDate, endDate]);

  useEffect(() => {
    if (fromProducts && selectedAccount) {
      fetchMovements(true);
    }
  }, [fromProducts, selectedAccount, fetchMovements]);

  const formatDate = (date) => moment(date).tz('America/Guayaquil').format('DD/MM/YYYY');

  const fetchNamesForMovements = async (movements) => {
    return await Promise.all(movements.map(async (movement) => {
      const accountNumberToLookup = movement.tipoMovimiento === 'debito' ? movement.cuentaDestino : movement.cuentaOrigen;
      const nombreCampo = movement.tipoMovimiento === 'debito' ? 'nombreDestino' : 'nombreOrigen';

      const accountSnapshot = await getDocs(query(collection(db, 'cuentas'), where('accountNumber', '==', accountNumberToLookup)));
      if (!accountSnapshot.empty) {
        const accountData = accountSnapshot.docs[0].data();
        const userDoc = await getDoc(doc(db, 'clientes', accountData.id));
        movement[nombreCampo] = userDoc.exists() ? `${userDoc.data().nombre} ${userDoc.data().apellido}` : 'Usuario desconocido';
      } else {
        movement[nombreCampo] = 'Cuenta desconocida';
      }

      return movement;
    }));
  };

  const handleGeneratePDF = async () => {
    if (user && selectedAccount && movements.length > 0) {
      await generateMovementsPDF(user, selectedAccount, movements);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleFilterByDates = () => {
    navigate('/movements', {
      state: {
        fromProducts: false,
        showLastOnly: false
      },
      search: `?account=${selectedAccount.accountNumber}`
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderDashboard />
      <div className="flex flex-grow">
        <div className="xl:w-1/4 md:w-1/4 sm:w-6/12">
          <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        </div>

        <div className={`mt-20 main-content p-5 mx-auto flex flex-col items-center justify-center xl:w-full md:w-8/12 sm:w-4/12 ${isSidebarOpen ? 'sm:ml-16 md:mr-16 lg:mr-32' : 'sm:ml-16 md:mr-16 lg:mr-32'}`}>
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
                    fetchMovements(false);
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
                        {movements.map((movement, idx) => (
                          <tr key={idx} className="hover:bg-gray-100">
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

export default Movements;
