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
    setAccountError('');
    setStartDateError('');
    setEndDateError('');
    setSearchPerformed(false);
    setHasClickedSearch(true);

    let hasError = false;

    if (!selectedAccount) {
      setAccountError('Debe seleccionar una cuenta.');
      hasError = true;
    }

    if (!startDate) {
      setStartDateError('Debe ingresar la fecha de inicio.');
      hasError = true;
    }

    if (!endDate) {
      setEndDateError('Debe ingresar la fecha de fin.');
      hasError = true;
    }

    if (hasError) {
      return;
    }

    setMovements([]);
    setLoading(true);

    try {
      const transaccionesCollection = collection(db, 'transacciones');
      const q1 = query(
        transaccionesCollection,
        where('cuentaOrigen', '==', selectedAccount.accountNumber),
        where('tipoMovimiento', '==', 'debito'),
        where('fecha', '>=', new Date(startDate)),
        where('fecha', '<=', new Date(`${endDate}T23:59:59`))
      );
      const q2 = query(
        transaccionesCollection,
        where('cuentaDestino', '==', selectedAccount.accountNumber),
        where('tipoMovimiento', '==', 'credito'),
        where('fecha', '>=', new Date(startDate)),
        where('fecha', '<=', new Date(`${endDate}T23:59:59`))
      );

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

      const fetchUserDetails = async (movement) => {
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
      };

      await Promise.all(movementsArray.map(movement => fetchUserDetails(movement)));

      const sortedMovements = movementsArray.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

      setMovements(sortedMovements);
      setSearchPerformed(true);
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

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderDashboard />
      <div className="flex flex-grow justify-center items-center">
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        {/* Cuerpo del formulario */}
        <div className={`main-content p-6 mx-auto flex flex-col items-center w-full pt-16 ${isSidebarOpen ? 'ml-72' : 'ml-20'} md:ml-0`}>
          <h2 className="text-2xl font-bold mb-4 text-center">Consulta de Movimientos</h2>
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
              max={maxDate}
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
              max={maxDate}
            />
            {hasClickedSearch && endDateError && <p className="text-red-600 text-xs mt-1">{endDateError}</p>}
          </div>

          <div className="flex w-full justify-center space-x-4 mt-4">
            <button
              className="bg-sky-900 text-white px-4 py-2 rounded-md shadow-sm hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              onClick={fetchMovements}
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
                              {movement.tipoMovimiento === 'debito' ?
                                `Transferencia a ${movement.nombreDestino || 'Desconocido'}` :
                                `Transferencia de ${movement.nombreOrigen || 'Desconocido'}`}
                            </td>
                            <td className="p-2 border-b">{`******${movement.cuentaOrigen.slice(-4)}`}</td>
                            <td className="p-2 border-b">{`******${movement.cuentaDestino.slice(-4)}`}</td>
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
