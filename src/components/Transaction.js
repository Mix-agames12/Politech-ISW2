import React, { useState, useEffect, useContext } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where, updateDoc, doc, addDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { Sidebar } from './Sidebar';
import { HeaderDashboard } from './HeaderDashboard';
import { generatePDF } from '../assets/pdfs/editPDF';
import { AuthContext } from '../context/AuthContext';

const Transaction = () => {
  const { user } = useContext(AuthContext);
  const [senderAccount, setSenderAccount] = useState('');
  const [receiverAccount, setReceiverAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [transactionData, setTransactionData] = useState(null);
  const [userAccounts, setUserAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'clientes', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
        }

        const q = query(collection(db, 'cuentas'), where('id', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const accountsList = querySnapshot.docs.map(doc => doc.data());
        setUserAccounts(accountsList);
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const generateAccountName = (tipoCuenta, accountNumber) => {
    const suffix = accountNumber.slice(-4);
    if (tipoCuenta.toLowerCase() === 'ahorros') {
      return `AHO${suffix}`;
    } else if (tipoCuenta.toLowerCase() === 'corriente') {
      return `CORR${suffix}`;
    }
    return `CUENTA${suffix}`;
  };

  const handleTransaction = async () => {
    setError('');
    setSuccessMessage('');
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

      const receiverQuery = query(accountsCollection, where('accountNumber', '==', receiverAccount));
      const receiverSnapshot = await getDocs(receiverQuery);
      const receiverDoc = receiverSnapshot.docs[0];

      if (senderDoc && receiverDoc) {
        const senderData = senderDoc.data();
        const receiverData = receiverDoc.data();

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
            senderName: `${user.nombre} ${user.apellido}`,
            receiverAccount: receiverData.accountNumber,
            receiverName: receiverName || 'N/A',
            amount: transaction.monto,
            description: transaction.descripcion || 'N/A',
            date: new Date().toLocaleDateString()
          });
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

        const clienteDoc = await getDoc(doc(db, 'clientes', receiverData.id));

        if (clienteDoc.exists()) {
          const clienteData = clienteDoc.data();

          if (clienteData.nombre && clienteData.apellido) {
            const fullName = `${clienteData.nombre.trim()} ${clienteData.apellido.trim()}`;

            setReceiverName(fullName);
            setTransactionData((prev) => ({
              ...prev,
              receiverName: fullName
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
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderDashboard />
      <div className="flex flex-grow">
        <div className="w-1/4">
          <Sidebar />
        </div>
        <div className="main-content p-6 mx-auto w-3/4 flex flex-col items-center justify-center pt-16">
          <h2 className="text-2xl font-bold mb-4">Realizar Transferencia</h2>
          
          <div className="w-full mb-6">
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
                        <h4 className="text-sm font-bold">{generateAccountName(account.tipoCuenta, account.accountNumber)}</h4>
                        <p className="text-sm text-gray-500">Número de cuenta: {account.accountNumber}</p>
                        <p className="text-sm text-gray-500">
                          Saldo Disponible: ${account.accountBalance ? account.accountBalance.toFixed(2) : '0.00'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="w-full mb-6">
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
                className="ml-2 bg-purple-600 text-white px-3 py-2 rounded-md shadow-sm hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                onClick={validateReceiverAccount}
                disabled={receiverAccount.length !== 10}
              >
                Validar
              </button>
            </div>
          </div>

          {receiverName && (
            <div className="w-full mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del receptor</label>
              <input
                type="text"
                className="w-full bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={receiverName}
                readOnly
              />
            </div>
          )}

          <div className="w-full mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Monto</label>
            <input
              type="text"
              className="w-full bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Monto"
              value={amount}
              onChange={handleAmountChange}
            />
          </div>

          <div className="w-full mb-6">
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

          {successMessage && (
            <>
              <div className="w-full mt-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{successMessage}</span>
              </div>
              <div className="text-center mt-4">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => {
                    if (transactionData) {
                      generatePDF(transactionData);
                    }
                  }}
                >
                  Descargar Comprobante
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transaction;
