import React, { useEffect, useState } from 'react';
import { Sidebar } from "../components/Sidebar";
import { Header } from './Header';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import '../components/GestionarCuentas.css';

const GestionarCuentas = () => {
    const [accounts, setAccounts] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
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
                const accountsList = querySnapshot.docs.map(doc => doc.data());
                setAccounts(accountsList);
            } catch (error) {
                console.error("Error fetching data: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    if (loading) {
        return null; // No renderizar nada hasta que los datos estén listos
    }

    // Separar cuentas por tipo
    const savingsAccounts = accounts.filter(account => account.tipoCuenta.toLowerCase() === 'ahorros');
    const currentAccounts = accounts.filter(account => account.tipoCuenta.toLowerCase() === 'corriente');

    // Función para obtener el formato de número de cuenta
    const getAccountDisplay = (accountNumber, tipoCuenta) => {
        const lastFourDigits = accountNumber.slice(-4);
        const tipo = tipoCuenta.toLowerCase();
        if (tipo === 'ahorros') {
            return `AHO${lastFourDigits}`;
        } else if (tipo === 'corriente') {
            return `COR${lastFourDigits}`;
        }
        return lastFourDigits; // Default case, in case the type is neither
    };

    return (
        <div>
            {user && (
                <Header firstName={user.nombre} lastName={user.apellido} />
            )}
            <div className="Sidebar">
                <Sidebar />
            </div>
            <div className="main-content">
                <h2>Mis Productos</h2>
                <button className="new-account-button" onClick={() => navigate('/crear-cuenta')}>
                    Crear una nueva cuenta
                </button>
                <h3 className="section-title">Cuentas de ahorros</h3>
                <div className="account-cards">
                    {savingsAccounts.length > 0 ? savingsAccounts.map((account, index) => (
                        <div className="account-card" key={index}>
                            <h4 className="account-display">{getAccountDisplay(account.accountNumber, account.tipoCuenta)}</h4>
                            <p>Número de Cuenta: {account.accountNumber}</p>
                            <p>Saldo Disponible: ${account.accountBalance ? account.accountBalance.toFixed(2) : 'N/A'}</p>
                        </div>
                    )) : <p>No se encontraron cuentas de ahorros.</p>}
                </div>

                <h3 className="section-title">Cuentas corrientes</h3>
                <div className="account-cards">
                    {currentAccounts.length > 0 ? currentAccounts.map((account, index) => (
                        <div className="account-card" key={index}>
                            <h4 className="account-display">{getAccountDisplay(account.accountNumber, account.tipoCuenta)}</h4>
                            <p>Número de Cuenta: {account.accountNumber}</p>
                            <p>Saldo Disponible: ${account.accountBalance ? account.accountBalance.toFixed(2) : 'N/A'}</p>
                        </div>
                    )) : <p>No se encontraron cuentas corrientes.</p>}
                </div>
            </div>
        </div>
    );
}

export default GestionarCuentas;
