import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { collection, getDocs, query, where, updateDoc, doc, addDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { Sidebar } from './Sidebar';
import { generatePDF } from '../assets/pdfs/editPDF';
import eyeOpen from '../assets/images/eye-open.png'; // Ruta a tu imagen
import eyeClosed from '../assets/images/eye-closed.png'; // Ruta a tu imagen
import { HeaderDashboard } from './HeaderDashboard';

const Transaction = () => {
  const [senderAccount, setSenderAccount] = useState('');
  const [receiverAccount, setReceiverAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [transactionData, setTransactionData] = useState(null);
  const [user, setUser] = useState(null);
  const [userAccounts, setUserAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
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
          console.log("User Data:", userData); // Depurar datos del usuario
          setUser(userData);
        }

        const q = query(collection(db, 'cuentas'), where('id', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        const accountsList = querySnapshot.docs.map(doc => doc.data());
        console.log("Accounts List:", accountsList); // Depurar lista de cuentas
        setUserAccounts(accountsList);
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTransaction = async () => {
    setError('');
    setSuccessMessage('');
    console.log("Handling transaction..."); // Verificar si la función se llama
    if (Number(amount) <= 0) {
      setError('El monto debe ser mayor a cero.');
      return;
    }
    if (receiverAccount.length !== 10) {
      setError('La cuenta de destino debe tener exactamente 10 dígitos.');
      return;
    }
    try {
      const accountsCollection = collection(db, 'cuentas');

      const senderQuery = query(accountsCollection, where('accountNumber', '==', senderAccount));
      const senderSnapshot = await getDocs(senderQuery);
      const senderDoc = senderSnapshot.docs[0];
      console.log("Sender Doc:", senderDoc);

      const receiverQuery = query(accountsCollection, where('accountNumber', '==', receiverAccount));
      const receiverSnapshot = await getDocs(receiverQuery);
      const receiverDoc = receiverSnapshot.docs[0];
      console.log("Receiver Doc:", receiverDoc);

      if (senderDoc && receiverDoc) {
        const senderData = senderDoc.data();
        const receiverData = receiverDoc.data();
        console.log("Sender Data:", senderData); // Depurar datos del remitente
        console.log("Receiver Data:", receiverData); // Depurar datos del receptor

        if (senderData.accountBalance >= Number(amount)) {
          const updatedSenderBalance = senderData.accountBalance - Number(amount);
          const updatedReceiverBalance = receiverData.accountBalance + Number(amount);

          await updateDoc(doc(db, 'cuentas', senderDoc.id), {
            accountBalance: updatedSenderBalance
          });

          const transaction = {
            tipo: 'transferencia',
            tipoMovimiento: 'debito',
            userId: senderData.id,
            cuentaOrigen: senderAccount,
            cuentaDestino: receiverAccount,
            monto: Number(amount),
            fecha: serverTimestamp(),
            descripcion: description,
            saldoActualizado: updatedSenderBalance
          };
          await addDoc(collection(db, 'transacciones'), transaction);

          await updateDoc(doc(db, 'cuentas', receiverDoc.id), {
            accountBalance: updatedReceiverBalance
          });

          await addDoc(collection(db, 'transacciones'), {
            tipo: 'transferencia',
            tipoMovimiento: 'credito',
            userId: receiverData.id,
            cuentaOrigen: senderAccount,
            cuentaDestino: receiverAccount,
            monto: Number(amount),
            fecha: serverTimestamp(),
            descripcion: description,
            saldoActualizado: updatedReceiverBalance
          });

          setSuccessMessage('Transferencia realizada con éxito');
          setTransactionData({
            senderAccount: senderData.accountNumber,
            senderName: `${user.nombre} ${user.apellido}`, // Nombre del remitente
            receiverAccount: receiverData.accountNumber,
            receiverName: receiverName || 'N/A', // Nombre del beneficiario, obtenido de la validación
            amount: transaction.monto,
            description: transaction.descripcion || 'N/A',
            date: new Date().toLocaleDateString()
          });

          console.log('Transacción completada');
        } else {
          setError('Fondos insuficientes');
        }
      } else {
        setError('Cuenta remitente o receptor no encontrada');
      }
    } catch (error) {
      console.error('Error al procesar la transacción:', error);
      setError('Error al procesar la transacción');
    }
  };

  const handleReceiverAccountChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 10) {
      setReceiverAccount(value);
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(value) && Number(value) >= 0) {
      setAmount(value);
    }
  };

  const validateReceiverAccount = async () => {
    setError('');
    if (receiverAccount.length !== 10) {
      setError('La cuenta de destino debe tener exactamente 10 dígitos.');
      return;
    }
    try {
      const accountsCollection = collection(db, 'cuentas');
      const receiverQuery = query(accountsCollection, where('accountNumber', '==', receiverAccount));
      const receiverSnapshot = await getDocs(receiverQuery);
      const receiverDoc = receiverSnapshot.docs[0];
  
      if (receiverDoc) {
        const receiverData = receiverDoc.data();
        console.log('Receiver Data:', receiverData); // Verifica los datos del receptor
  
        const clienteDoc = await getDoc(doc(db, 'clientes', receiverData.id));
        console.log('Cliente Doc:', clienteDoc);
  
        if (clienteDoc.exists()) {
          const clienteData = clienteDoc.data();
          console.log('Cliente Data:', clienteData); // Verifica los datos del cliente
  
          // Asegúrate de que los campos nombre y apellido existen y no están vacíos
          if (clienteData.nombre && clienteData.apellido) {
            const fullName = `${clienteData.nombre.trim()} ${clienteData.apellido.trim()}`;
            console.log('Full Name:', fullName); // Verifica el nombre completo
  
            setReceiverName(fullName);
            setTransactionData((prev) => ({
              ...prev,
              receiverName: fullName // Asigna el nombre del receptor directamente
            }));
          } else {
            setError('El cliente no tiene nombre o apellido definidos.');
          }
        } else {
          setError('Cliente no encontrado.');
        }
      } else {
        setError('Cuenta de destino no encontrada.');
      }
    } catch (error) {
      console.error('Error al validar la cuenta de destino:', error);
      setError('Error al validar la cuenta de destino.');
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Mostrar mensaje de carga mientras se obtienen los datos
  }

  return (
    <div className="min-h-screen min-w-auto flex flex-col bg-gray-100">
      <HeaderDashboard />
      <Sidebar />
      <div className="flex flex-grow">
        <div className="w-3/4 p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Transferencia</h2>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Cuenta de origen</label>
            <div className="relative">
              <button
                className="w-full bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                onClick={() => setDropdownVisible(!dropdownVisible)}
              >
                {senderAccount ? `${senderAccount}` : 'Seleccione una cuenta'}
                <span className="float-right">{dropdownVisible ? '▲' : '▼'}</span>
              </button>
              {dropdownVisible && (
                <div className="absolute z-10 mt-2 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                  {userAccounts.map((account, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                      onClick={() => {
                        setSenderAccount(account.accountNumber);
                        setDropdownVisible(false);
                      }}
                    >
                      <div>
                        <h4 className="text-sm font-bold">{account.accountNumber}</h4>
                        <p className="text-sm text-gray-500">Tipo de Cuenta: {account.tipoCuenta}</p>
                        <div className="flex items-center">
                          <p className="text-sm text-gray-500 mr-2">
                            Saldo Disponible: {showBalance ? `$${account.accountBalance ? account.accountBalance.toFixed(2) : 'N/A'}` : '***'}
                          </p>
                          <button
                            className="text-indigo-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowBalance(!showBalance);
                            }}
                          >
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

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Cuenta de destino</label>
            <div className="flex items-center">
              <input
                type="text"
                className="w-full bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Cuenta de destino"
                value={receiverAccount}
                onChange={handleReceiverAccountChange}
              />
              <button
                className="ml-2 bg-indigo-600 text-white px-3 py-2 rounded-md shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onClick={validateReceiverAccount}
                disabled={receiverAccount.length !== 10}
              >
                Validar
              </button>
            </div>
          </div>

          {receiverName && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del receptor</label>
              <input
                type="text"
                className="w-full bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={receiverName}
                readOnly
              />
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Monto</label>
            <input
              type="text"
              className="w-full bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Monto"
              value={amount}
              onChange={handleAmountChange}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
            <input
              type="text"
              className="w-full bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Descripción"
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {error && <label className="block text-red-600 mb-4">{error}</label>}

          <div className="text-center">
            <input
              className="bg-indigo-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              type="button"
              onClick={handleTransaction}
              value="Realizar Transferencia"
            />
          </div>
        </div>
      </div>
      {error && (
        <div className="errorMessage">
          <p>{error}</p>
        </div>
      )}
      {successMessage && (
        <div className="successMessage">
          <p>{successMessage}</p>
          <button className="downloadReceiptButton" onClick={() => {
            if (transactionData) {
              generatePDF(transactionData);
            }
          }}>
            Descargar Comprobante
          </button>
        </div>
      )}
    </div>
  );
};

export default Transaction;
