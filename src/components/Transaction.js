import React, { useState, useEffect, useContext, useRef } from 'react';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [receiverName, setReceiverName] = useState('');
  const [receiverEmail, setReceiverEmail] = useState(''); // Nuevo estado para el correo del receptor
  const [error, setError] = useState('');
  const [receiverError, setReceiverError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [transactionData, setTransactionData] = useState(null);
  const [userAccounts, setUserAccounts] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [hasClickedSubmit, setHasClickedSubmit] = useState(false);
  const [isTransferCompleted, setIsTransferCompleted] = useState(false);
  const [showVerificationFields, setShowVerificationFields] = useState(false);

  const [isCodeSent, setIsCodeSent] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const codeInputRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'clientes', user.uid));
        if (userDoc.exists()) {
          // Extrae el correo del usuario receptor y almacénalo en el estado
          const receiverEmail = userDoc.data().email;
          console.log(receiverEmail);
          setReceiverEmail(receiverEmail);
        }

        const q = query(collection(db, 'cuentas'), where('id', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const accountsList = querySnapshot.docs.map(doc => doc.data());
        setUserAccounts(accountsList);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, [user]);

  const generateAccountName = (tipoCuenta, accountNumber) => {
    const suffix = accountNumber.slice(-4);
    if (tipoCuenta.toLowerCase() === 'ahorros') return `AHO${suffix}`;
    if (tipoCuenta.toLowerCase() === 'corriente') return `CORR${suffix}`;
    return `CUENTA${suffix}`;
  };

  const sendVerificationCode = async () => {
    setHasClickedSubmit(true);

    if (!senderAccount || !receiverAccount || !amount || !receiverName) {
      setError('Debe completar todos los campos antes de enviar el código de verificación.');
      return;
    }

    if (Number(amount) > (userAccounts.find(account => account.accountNumber === senderAccount)?.accountBalance || 0)) {
      setError('El monto no puede exceder el saldo disponible en la cuenta de origen.');
      return;
    }

    try {
      const response = await fetch('https://politech-isw2.onrender.com/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });

      const data = await response.json();
      if (data.success) {
        localStorage.setItem('sessionId', data.sessionId);
        setIsCodeSent(true);
        setShowVerificationFields(true);
        setError('');
      } else {
        setError('No se pudo enviar el código de verificación.');
      }
    } catch (error) {
      console.error('Error al enviar el código de verificación:', error);
      setError('No se pudo enviar el código de verificación.');
    }
  };

  const verifyCode = async () => {
    try {
      const sessionId = localStorage.getItem('sessionId');
      if (!sessionId || !inputCode) {
        setError('Faltan datos para la verificación.');
        return;
      }

      const response = await fetch('https://politech-isw2.onrender.com/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, code: inputCode })
      });

      const data = await response.json();

      if (response.ok) {
        setIsCodeVerified(true);
        setSuccessMessage('Código verificado correctamente.');
        setError('');
      } else {
        setError(data.message || 'Error al verificar el código.');
      }
    } catch (error) {
      console.error('Error al verificar el código:', error);
      setError('Error al verificar el código.');
    }
  };

  const handleTransaction = async () => {
    setHasClickedSubmit(true);
    setError('');
    setReceiverError('');
    setSuccessMessage('');

    if (!isCodeVerified) {
      setError('Debe verificar el código enviado a su correo antes de realizar la transacción.');
      return;
    }

    if (!senderAccount || !receiverAccount || !amount || receiverAccount.length !== 10 || Number(amount) <= 0) {
      setError('Por favor, complete todos los campos correctamente.');
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

          await updateDoc(doc(db, 'cuentas', senderDoc.id), { accountBalance: updatedSenderBalance });

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

          await updateDoc(doc(db, 'cuentas', receiverDoc.id), { accountBalance: updatedReceiverBalance });

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

          // Enviar correos de confirmación de transacción
          await fetch('https://politech-isw2.onrender.com/process-transaction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              senderEmail: user.email,
              receiverEmail: receiverEmail,
              transactionDetails: {
                senderAccount,
                receiverAccount,
                amount,
                description,
                date: new Date().toLocaleDateString(),
              }
            })
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
          setIsTransferCompleted(true);
          setIsCodeVerified(false);
          setShowVerificationFields(false);
          setIsCodeSent(false);
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
      setReceiverError('');
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(value) && Number(value) >= 0) {
      setAmount(value);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const validateReceiverAccount = async () => {
    setReceiverError('');
    setSuccessMessage('');
    if (receiverAccount.length !== 10) {
      setReceiverError('La cuenta de destino debe tener exactamente 10 dígitos.');
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
            setReceiverError('');
          } else {
            setReceiverError('El cliente no tiene nombre o apellido definidos.');
          }
        } else {
          setReceiverError('Cliente no encontrado.');
        }
      } else {
        setReceiverError('Cuenta de destino no encontrada.');
      }
    } catch (error) {
      console.error('Error al validar la cuenta de destino:', error);
      setReceiverError('Error al validar la cuenta de destino.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderDashboard />
      <div className="flex flex-grow">
        <div className="w-1/4">
          <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        </div>

        <div className={`main-content p-5 mx-auto flex flex-col items-center justify-center w-full ${isSidebarOpen ? 'ml-16' : 'ml-16'}`}>
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
            {hasClickedSubmit && !senderAccount && <p className="text-red-600 text-xs mt-1">Debe seleccionar una cuenta de origen.</p>}
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
                className={`ml-2 px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 ${receiverAccount.length !== 10 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-sky-900 text-white hover:bg-sky-600 cursor-pointer'}`}
                onClick={validateReceiverAccount}
                disabled={receiverAccount.length !== 10}
              >
                Validar
              </button>
            </div>
            {hasClickedSubmit && (!receiverAccount || receiverAccount.length !== 10) && <p className="text-red-600 text-xs mt-1">Debe ingresar y validar una cuenta de destino.</p>}
            {receiverError && <p className="text-red-600 text-xs mt-1">{receiverError}</p>}
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
            {hasClickedSubmit && (!amount || Number(amount) <= 0) && (
              <p className="text-red-600 text-xs mt-1">Debe ingresar un monto a transferir.</p>
            )}
            {hasClickedSubmit && senderAccount && Number(amount) > (userAccounts.find(account => account.accountNumber === senderAccount)?.accountBalance || 0) && (
              <p className="text-red-600 text-xs mt-1">El monto excede el saldo disponible en la cuenta de origen.</p>
            )}
            {hasClickedSubmit && senderAccount && Number(amount) === (userAccounts.find(account => account.accountNumber === senderAccount)?.accountBalance || 0) && (
              <p className="text-green-600 text-xs mt-1">Transfiriendo todo el saldo disponible.</p>
            )}
          </div>

          <div className="w-full mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Descripción (Opcional)</label>
            <input
              type="text"
              className="w-full bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Descripción"
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {showVerificationFields && (
            <div className="w-full mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Ingrese el código de verificación</label>
              <input
                ref={codeInputRef}
                type="text"
                className="w-full bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Código de verificación"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
              />
              <button
                className="mt-2 px-4 py-2 bg-sky-900 text-white rounded-md shadow-sm hover:bg-sky-600"
                onClick={verifyCode}
              >
                Verificar Código
              </button>
            </div>
          )}

          {isCodeVerified && !isTransferCompleted && (
            <div className="w-full mt-4 mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
              <p>Código verificado con éxito.</p>
            </div>
          )}

          {error && <label className="block text-red-600 mb-4">{error}</label>}

          <div className="text-center">
            {!showVerificationFields && !isTransferCompleted && (
              <button
                className="bg-sky-900 text-white px-4 py-2 rounded-md shadow-sm hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                onClick={sendVerificationCode}
              >
                Enviar Código de Verificación
              </button>
            )}
            {isCodeVerified && !isTransferCompleted && (
              <input
                className={`bg-sky-900 text-white px-4 py-2 rounded-md shadow-sm hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-indigo-600`}
                type="button"
                onClick={handleTransaction}
                value="Realizar Transferencia"
                disabled={!isCodeVerified}
              />
            )}
          </div>

          {isTransferCompleted && (
            <>
              <div className="w-full mt-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{successMessage}</span>
              </div>
              <div className="text-center mt-4">
                <button
                  className="bg-sky-900 text-white px-4 py-2 rounded-md shadow-sm hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-indigo-600"
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
