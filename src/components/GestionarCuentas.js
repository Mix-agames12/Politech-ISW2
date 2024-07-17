import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import {Sidebar} from './Sidebar';
import '../GestionarCuentas.css';

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

            const q = query(collection(db, 'cuentas'), where('id', '==', user.uid));
            const querySnapshot = await getDocs(q);
            const accountsList = querySnapshot.docs.map(doc => doc.data());
            setAccounts(accountsList);
        };

        fetchAccounts();
    }, [navigate]);

    const generateAccountNumber = () => {
        let accountNumber = '22';
        for (let i = 0; i < 8; i++) {
            accountNumber += Math.floor(Math.random() * 9) + 1;
        }
        return accountNumber;
    };

    const handleAddAccount = async () => {
        const user = auth.currentUser;
        if (!user) {
            navigate('/login');
            return;
        }

        const newAccount = {
            id: user.uid,
            cedula: "1234567890", // Replace with actual cedula value
            tipo_cuenta: 'Ahorros',
            monto: 100,
            numero_cuenta: generateAccountNumber()
        };

        try {
            await addDoc(collection(db, 'cuentas'), newAccount);
            setAccounts([...accounts, newAccount]);
        } catch (error) {
            console.error("Error adding account: ", error);
        }
    };

    return (
        <div className="gestionar-cuentas-container">
            <Sidebar />
            <div className="main-content">
                <h2>Mis Productos</h2>
                <h3>Cuentas de ahorros</h3>
                <div className="account-cards">
                    {accounts.map((account, index) => (
                        <div className="account-card" key={index}>
                            <h4 className="account-number">{account.numero_cuenta}</h4>
                            <p>Tipo de Cuenta: {account.tipo_cuenta}</p>
                            <p>Saldo Disponible: ${account.monto.toFixed(2)}</p>
                        </div>
                    ))}
                    
                </div>
            </div>
        </div>
    );
};

export default GestionarCuentas;
