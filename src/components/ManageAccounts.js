import React, { useEffect, useState, useContext, useCallback } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { HeaderDashboard } from './HeaderDashboard';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import { IoMdPersonAdd } from "react-icons/io";
import { AuthContext } from '../context/AuthContext';

const ManageAccounts = () => {
    const { user } = useContext(AuthContext);
    const [accounts, setAccounts] = useState([]);
    const [showAccountNumbers, setShowAccountNumbers] = useState({});
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();

    const navigateToLogin = useCallback(() => {
        navigate('/login');
    }, [navigate]);

    const subscribeToAccounts = useCallback((userId) => {
        const q = query(
            collection(db, 'cuentas'),
            where('id', '==', userId)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const allAccounts = querySnapshot.docs.map((doc) => ({
                id: doc.id, // Usar solo doc.id como key
                ...doc.data()
            }));
            setAccounts(allAccounts);
            localStorage.setItem('accounts', JSON.stringify(allAccounts));
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            if (!user) {
                const storedAccounts = localStorage.getItem('accounts');
                if (storedAccounts) {
                    setAccounts(JSON.parse(storedAccounts));
                }
            }
        } else if (!user) {
            navigateToLogin();
        }

        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
            subscribeToAccounts(user.uid);
        }
    }, [user, navigateToLogin, subscribeToAccounts]);

    const generateAccountName = (tipoCuenta, accountNumber) => {
        const suffix = accountNumber.slice(-4);
        const prefix = tipoCuenta.toLowerCase() === 'ahorros' ? 'AHO' : 'CORR';
        return `${prefix}${suffix}`;
    };

    const toggleAccountNumberVisibility = (accountId) => {
        setShowAccountNumbers(prevState => ({
            ...prevState,
            [accountId]: !prevState[accountId]
        }));
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const handleAccountClick = (accountNumber) => {
        navigate(`/movements?account=${accountNumber}`, { state: { fromProducts: true } });
    };

    const handleCreateAccountClick = () => navigate('/create-account');

    const savingsAccounts = accounts.filter(account => account.tipoCuenta.toLowerCase() === 'ahorros');
    const currentAccounts = accounts.filter(account => account.tipoCuenta.toLowerCase() === 'corriente');

    const renderAccountCard = (account) => (
        <div
            key={account.id}  // Usar id como key
            className="account-card bg-sky-50 shadow-md rounded-lg p-6 lg:p-5 xl:p-7 hover:scale-105 transition-transform duration-300 cursor-pointer border border-gray-300 w-full max-w-full sm:max-w-xs"
            onClick={() => handleAccountClick(account.accountNumber)}
        >
            <h4 className="account-number font-bold text-lg">{account.accountName || generateAccountName(account.tipoCuenta, account.accountNumber)}</h4>
            <div className="flex items-center justify-between">
                <p className="mr-2">{account.accountNumber}</p>
            </div>
            <div className="flex items-center">
                <p className="mr-2">
                    Saldo Disponible: {showAccountNumbers[account.id] ? `$${account.accountBalance?.toFixed(2) || '0.00'}` : '*****'}
                </p>
                <button
                    className="relative"
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleAccountNumberVisibility(account.id);
                    }}
                >
                    {showAccountNumbers[account.id] ? <FaRegEye className="h-5 w-5" /> : <FaRegEyeSlash className="h-5 w-5" />}
                </button>
            </div>
        </div>
    );

    const renderAccountSection = (title, accounts) => (
        <>
            <h3 className="text-xl font-semibold mb-4 text-left">{title}</h3>
            <div className="account-cards grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {accounts.length > 0 ? accounts.map(renderAccountCard) : <p>No se encontraron cuentas.</p>}
            </div>
        </>
    );

    return (
        <div className="min-h-screen flex flex-col pt-16">
            <HeaderDashboard />
            <div className="flex flex-grow">
                <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
                <div className={`main-content p-5 mx-auto flex flex-col items-center justify-center w-full ${isSidebarOpen ? 'ml-72' : 'ml-20'}`}>
                    <div className="flex justify-between items-center w-full">
                        <div className="flex items-center space-x-4">
                            <h2 className="text-3xl font-bold mb-4 lg:text-left">Mis Productos</h2>
                            <button 
                                className="bg-sky-900 text-white font-semibold p-2 rounded-lg hover:bg-sky-600 transition-colors duration-300"
                                onClick={handleCreateAccountClick}
                            >
                                <IoMdPersonAdd className="h-6 w-6" />
                            </button>
                        </div>
                    </div>
                    <div className="w-full space-y-8">
                        {renderAccountSection('Cuentas de Ahorros', savingsAccounts)}
                        {renderAccountSection('Cuentas Corrientes', currentAccounts)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageAccounts;
