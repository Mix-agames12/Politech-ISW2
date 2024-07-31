import React, { useEffect, useState } from 'react';
import { Sidebar } from "../components/Sidebar";
import { Header } from './Header';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { HeaderDashboard } from "./HeaderDashboard";
import EyeOpenIcon from '../assets/images/eye-open.png';
import EyeClosedIcon from '../assets/images/eye-closed.png';

const GestionarCuentas = () => {
    const [accounts, setAccounts] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAccountNumbers, setShowAccountNumbers] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                navigate('/login');
                return;
            }

            try {
                // Obtener datos del usuario
                const userDoc = await getDoc(doc(db, 'clientes', currentUser.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setUser(userData);
                }

                // Obtener cuentas del usuario
                const q = query(collection(db, 'cuentas'), where('id', '==', currentUser.uid));
                const querySnapshot = await getDocs(q);
                const accountsList = querySnapshot.docs.map(doc => ({
                    ...doc.data(),
                    id: doc.id // Save the document ID for updating
                }));
                console.log('Accounts fetched:', accountsList);
                setAccounts(accountsList);

                // Generate and save account names
                accountsList.forEach(async (account) => {
                    const accountName = generateAccountName(account.tipoCuenta, account.accountNumber);
                    if (!account.accountName) { // Check if the name is already set
                        await updateDoc(doc(db, 'cuentas', account.id), {
                            accountName: accountName
                        });
                    }
                });
            } catch (error) {
                console.error("Error fetching data: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const generateAccountName = (tipoCuenta, accountNumber) => {
        const suffix = accountNumber.slice(-4); // Últimos 4 dígitos
        if (tipoCuenta.toLowerCase() === 'ahorros') {
            return `AHO${suffix}`;
        } else if (tipoCuenta.toLowerCase() === 'corriente') {
            return `CORR${suffix}`;
        }
        return `CUENTA${suffix}`; // En caso de que el tipo no coincida
    };

    const toggleAccountNumberVisibility = (accountId) => {
        setShowAccountNumbers(prevState => ({
            ...prevState,
            [accountId]: !prevState[accountId]
        }));
    };

    if (loading) {
        return null; // No renderizar nada hasta que los datos estén listos
    }

    const savingsAccounts = accounts.filter(account => account.tipoCuenta.toLowerCase() === 'ahorros');
    const currentAccounts = accounts.filter(account => account.tipoCuenta.toLowerCase() === 'corriente');

    return (
        <div className="min-h-screen flex flex-col">
            <HeaderDashboard />
            <div className="flex flex-grow">
                <div className="w-1/4">
                    <Sidebar />
                </div>
                <div className="main-content p-6 mx-auto w-3/4 flex flex-col items-center justify-center">
                    <h2 className="text-2xl font-bold mb-4">Mis Productos</h2>
                    
                    <div className="w-full">
                        <h3 className="text-xl font-semibold mb-4 text-left">Cuentas de Ahorros</h3>
                        <div className="account-cards grid gap-5 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {savingsAccounts.length > 0 ? savingsAccounts.map((account, index) => (
                                <div key={index} className="account-card bg-white shadow-md rounded-lg p-4 hover:scale-105 transition-transform duration-300 cursor-pointer border border-gray-300">
                                    <h4 className="account-number font-bold text-lg">{account.accountName || generateAccountName(account.tipoCuenta, account.accountNumber)}</h4>
                                    <div className="flex items-center">
                                        <p className={`mr-2 ${showAccountNumbers[account.id] ? '' : 'hidden'}`}>{account.accountNumber}</p>
                                        <button onClick={() => toggleAccountNumberVisibility(account.id)}>
                                            <img src={showAccountNumbers[account.id] ? EyeClosedIcon : EyeOpenIcon} alt="Toggle Visibility" className="h-5 w-5" />
                                        </button>
                                    </div>
                                    <p>Saldo Disponible: ${account.accountBalance ? account.accountBalance.toFixed(2) : '0.00'}</p>
                                </div>
                            )) : <p>No se encontraron cuentas de ahorros.</p>}
                        </div>

                        <h3 className="text-xl font-semibold mb-4 mt-8 text-left">Cuentas Corrientes</h3>
                        <div className="account-cards grid gap-5 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                            {currentAccounts.length > 0 ? currentAccounts.map((account, index) => (
                                <div key={index} className="account-card bg-white shadow-md rounded-lg p-4 hover:scale-105 transition-transform duration-300 cursor-pointer border border-gray-300">
                                    <h4 className="account-number font-bold text-lg">{account.accountName || generateAccountName(account.tipoCuenta, account.accountNumber)}</h4>
                                    <div className="flex items-center">
                                        <p className={`mr-2 ${showAccountNumbers[account.id] ? '' : 'hidden'}`}>{account.accountNumber}</p>
                                        <button onClick={() => toggleAccountNumberVisibility(account.id)}>
                                            <img src={showAccountNumbers[account.id] ? EyeClosedIcon : EyeOpenIcon} alt="Toggle Visibility" className="h-5 w-5" />
                                        </button>
                                    </div>
                                    <p>Saldo Disponible: ${account.accountBalance ? account.accountBalance.toFixed(2) : '0.00'}</p>
                                </div>
                            )) : <p>No se encontraron cuentas corrientes.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GestionarCuentas;
