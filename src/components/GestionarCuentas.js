// src/components/GestionarCuentas.js
import '../components/GestionarCuentas.css';
import { Sidebar } from "../components/Sidebar";
import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const GestionarCuentas = () => {
    const [accounts, setAccounts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAccounts = async () => {
            const user = auth.currentUser;
            if (!user) {
                navigate('/login');
                return;
            }

            try {
                console.log('Fetching accounts for user ID:', user.uid);
                const q = query(collection(db, 'cuentas'), where('id', '==', user.uid));
                const querySnapshot = await getDocs(q);
                const accountsList = querySnapshot.docs.map(doc => doc.data());
                console.log('Accounts fetched:', accountsList);
                setAccounts(accountsList);
            } catch (error) {
                console.error("Error fetching accounts: ", error);
            }
        };

        fetchAccounts();
    }, [navigate]);

    return (
        <>
            <div className="Sidebar">
                <Sidebar />
            </div>
            <div className="main-content">
                <h2>Mis Productos</h2>
                <h3>Cuentas de ahorros</h3>
                <div className="account-cards">
                    {accounts.length > 0 ? accounts.map((account, index) => (
                        <div className="account-card" key={index}>
                            <h4 className="account-number">{account.accountNumber}</h4>
                            <p>Tipo de Cuenta: {account.tipoCuenta}</p>
                            <p>Saldo Disponible: ${account.accountBalance ? account.accountBalance.toFixed(2) : 'N/A'}</p>
                        </div>
                    )) : <p>No se encontraron cuentas.</p>}
                </div>
            </div>
        </>
    );
}

export default GestionarCuentas;
