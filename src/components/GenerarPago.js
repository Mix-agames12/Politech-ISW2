import React, { useState, useEffect, useContext } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where, updateDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { Sidebar } from './Sidebar';
import { HeaderDashboard } from './HeaderDashboard';
import { generatePDF } from '../assets/pdfs/editPaymentPDF';
import { AuthContext } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

const GenerarPago = () => {
  const location = useLocation();
  const { service, amount } = location.state || {};
  const { user } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [senderAccount, setSenderAccount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [paymentData, setPaymentData] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [userAccounts, setUserAccounts] = useState([]);
  const [hasClickedSubmit, setHasClickedSubmit] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [paymentDate, setPaymentDate] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const q = query(collection(db, 'cuentas'), where('id', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const accountsList = querySnapshot.docs.map(doc => doc.data());
        setUserAccounts(accountsList);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();

    const today = new Date();
    const formattedDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
    setPaymentDate(formattedDate);

  }, [user]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const generateAccountName = (tipoCuenta, accountNumber) => {
    const suffix = accountNumber.slice(-4);
    return tipoCuenta.toLowerCase() === 'ahorros' ? `AHO${suffix}` : `CORR${suffix}`;
  };

  const sendVerificationCode = async () => {
    setHasClickedSubmit(true);
    setError('');
    setSuccessMessage('');

    if (!senderAccount) {
      setError('Por favor, proporcione la información solicitada.');
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

  const handlePayment = async () => {
    if (!isCodeVerified) {
      setError('Debe verificar el código enviado a su correo antes de realizar el pago.');
      return;
    }

    setHasClickedSubmit(true);
    setError('');
    setSuccessMessage('');

    if (!senderAccount) {
      setError('Por favor, proporcione la información solicitada.');
      return;
    }

    try {
      const accountsCollection = collection(db, 'cuentas');

      const senderQuery = query(accountsCollection, where('accountNumber', '==', senderAccount));
      const senderSnapshot = await getDocs(senderQuery);
      const senderDoc = senderSnapshot.docs[0];

      if (senderDoc) {
        const senderData = senderDoc.data();

        if (senderData.accountBalance >= amount) {
          const updatedSenderBalance = senderData.accountBalance - amount;

          await updateDoc(doc(db, 'cuentas', senderDoc.id), {
            accountBalance: updatedSenderBalance
          });

          const payment = {
            tipo: 'pagoServicio',
            tipoMovimiento: 'debito',
            userId: senderData.id,
            cuentaOrigen: senderAccount,
            cuentaDestino: service,
            monto: amount,
            fecha: serverTimestamp(),
            descripcion: description,
            saldoActualizado: updatedSenderBalance
          };
          await addDoc(collection(db, 'transacciones'), payment);

          const paymentData = {
            senderAccount: senderData.accountNumber,
            senderName: `${user.nombre} ${user.apellido}`,
            service: service,
            amount: payment.monto,
            description: payment.descripcion || 'N/A',
            date: new Date().toLocaleDateString(),
          };

          setPaymentData(paymentData);

          await fetch('https://politech-isw2.onrender.com/process-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email, paymentDetails: paymentData })
          });

          setSuccessMessage('Pago de servicio realizado con éxito');
        } else {
          setError('Fondos insuficientes');
        }
      }
    } catch (error) {
      console.error('Error al procesar el pago del servicio:', error);
      setError('Error al procesar el pago del servicio');
    }
  };

  const goBackToServices = () => {
    navigate('/pago-servicios');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderDashboard />
      <div className="flex flex-grow">
        <div className="w-1/4">
          <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        </div>

        <div className={`main-content p-5 mx-auto flex flex-col items-center justify-center w-full ${isSidebarOpen ? 'ml-16' : 'ml-16'}`}>
          <div className="w-full flex">
            <button className="flex-none w-18 text-blue-500" onClick={goBackToServices}>
              Regresar
            </button>
            <h2 className="flex-1 w-64 text-center text-2xl font-bold mb-4">Paga tu factura</h2>
          </div>
          <div className="w-1/2 bg-sky-50 p-5">
            <label className='block text-center text-xl font-medium text-gray-700 mb-5'>SERVICIO DE {service}</label>
            <label className="block text-sm font-medium text-gray-700 mb-3">Valor a pagar</label>
            <h2 className='text-center font-black text-3xl text-gray-950 mb-6'>$ {amount}</h2>
            <label className="block text-sm font-medium text-gray-700 mb-2">Desde</label>
            <div className="relative mb-6">
              <button
                className="w-full mb-2 bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
              {hasClickedSubmit && !senderAccount && <p className="text-red-600 text-xs mt-1">Debe seleccionar una cuenta de origen.</p>}
            </div>
            <div className="relative mb-6 w-full flex">
              <label className="text-sm font-medium text-gray-700 mb-2">Fecha de pago</label>
              <label className="flex-1 text-sm text-right font-medium text-gray-700 mb-2">{paymentDate}</label>
            </div>
            <div className="relative mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
              <input
                className="w-full"
                type='text'
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {isCodeSent && (
              <>
                <div className="relative mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ingrese el código de verificación</label>
                  <input
                    className="w-full bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    type="text"
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
              </>
            )}

            {error && <label className="block text-center text-red-600 mb-4">{error}</label>}
            <div className="text-center">
              {!isCodeSent ? (
                <button
                  className="bg-sky-900 text-white px-4 py-2 rounded-md shadow-sm hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  onClick={sendVerificationCode}
                >
                  Enviar Código de Verificación
                </button>
              ) : (
                <input
                  className="bg-sky-900 text-white px-4 py-2 rounded-md shadow-sm hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  type="button"
                  onClick={handlePayment}
                  value="Pagar"
                />
              )}
            </div>
            {successMessage && (
              <>
                <div className="w-full mt-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative text-center" role="alert">
                  <span className="block sm:inline">{successMessage}</span>
                </div>
                <div className="text-center mt-4">
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => {
                      if (paymentData) {
                        generatePDF(paymentData);
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
    </div>
  );
};

export default GenerarPago;
