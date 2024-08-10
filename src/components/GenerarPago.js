import React, { useState, useEffect, useContext } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where, updateDoc, doc, addDoc, getDoc, serverTimestamp } from 'firebase/firestore';
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
    const [paymentDate, setPaymentDate] = useState(''); // Estado para la fecha de pago
    const navigate = useNavigate(); // Para navegar de vuelta a la selección de servicios

    useEffect(() => {
        if (!user) {
            return;
        }

        const fetchData = async () => {
            try {
                const userDoc = await getDoc(doc(db, 'clientes', user.uid));
                if (userDoc.exists()) {
                    // No necesitas usar `userData`, así que elimínalo
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

        // Obtener la fecha actual y formatearla
        const today = new Date();
        const formattedDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
        setPaymentDate(formattedDate); // Establecer la fecha en el estado

    }, [user]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const generateAccountName = (tipoCuenta, accountNumber) => {
        const suffix = accountNumber.slice(-4);
        if (tipoCuenta.toLowerCase() === 'ahorros') {
            return `AHO${suffix}`;
        } else if (tipoCuenta.toLowerCase() === 'corriente') {
            return `CORR${suffix}`;
        }
        return `CUENTA${suffix}`;
    };

    const handlePayment = async () => {
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
                        servicio: { service },
                        monto: amount,
                        fecha: serverTimestamp(),
                        descripcion: description,
                        saldoActualizado: updatedSenderBalance
                    };
                    await addDoc(collection(db, 'transacciones'), payment);
                    
                    setSuccessMessage('Pago de servicio realizado con éxito');
                    setPaymentData({
                        senderAccount: senderData.accountNumber,
                        senderName: `${user.nombre} ${user.apellido}`,
                        receiverName: service,
                        amount: payment.monto,
                        description: payment.descripcion || 'N/A',
                        date: new Date().toLocaleDateString()
                    });
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
        navigate('/pago-servicios'); // Navegar de vuelta a la selección de servicios
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
                        {error && <label className="block text-center text-red-600 mb-4">{error}</label>}
                        <div className="text-center">
                            <input
                                className="bg-sky-900 text-white px-4 py-2 rounded-md shadow-sm hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                type="button"
                                onClick={handlePayment}
                                value="Pagar"
                            />
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