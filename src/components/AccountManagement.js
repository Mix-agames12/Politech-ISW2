// src/components/AccountManagement.js
import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import '../AccountManagement.css';

const AccountManagement = () => {
    const [accounts, setAccounts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAccounts = async () => {
            const user = auth.currentUser;
            if (!user) {
                navigate('/login');
                return;
            }

            const q = query(collection(db, 'cuentas'), where('userId', '==', user.uid));
            const querySnapshot = await getDocs(q);
            const accountsList = querySnapshot.docs.map(doc => doc.data());
            setAccounts(accountsList);
        };

        fetchAccounts();
    }, [navigate]);

    return (
        <div className="container">
            <div className="main-content">
                <h2>Cuenta Origen</h2>
                <p id="slc">Seleccione la cuenta origen:</p>
                <div className="account-list">
                    {accounts.map((account, index) => (
                        <div className="account" key={index}>
                            <p>Cuenta</p>
                            <p>No. {account.numero_cuenta}</p>
                            <p>Saldo disponible</p>
                            <p>${account.monto.toFixed(2)}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AccountManagement;
