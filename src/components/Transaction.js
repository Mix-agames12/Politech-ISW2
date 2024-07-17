// src/components/Transaction.js
import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { Sidebar } from './Sidebar';
import './Transaction.css';

const Transaction = () => {
    const [senderEmail, setSenderEmail] = useState('');
    const [receiverEmail, setReceiverEmail] = useState('');
    const [amount, setAmount] = useState(0);
    const [error, setError] = useState('');

    const handleTransaction = async () => {
        setError('');
        try {
            const usersCollection = collection(db, 'users');

            const senderQuery = query(usersCollection, where('correo', '==', senderEmail));
            const senderSnapshot = await getDocs(senderQuery);
            const senderDoc = senderSnapshot.docs[0];

            const receiverQuery = query(usersCollection, where('correo', '==', receiverEmail));
            const receiverSnapshot = await getDocs(receiverQuery);
            const receiverDoc = receiverSnapshot.docs[0];

            if (senderDoc && receiverDoc) {
                const senderData = senderDoc.data();
                const receiverData = receiverDoc.data();

                if (senderData.accountBalance >= amount) {
                    await updateDoc(doc(db, 'users', senderDoc.id), {
                        accountBalance: senderData.accountBalance - amount
                    });
                    await updateDoc(doc(db, 'users', receiverDoc.id), {
                        accountBalance: receiverData.accountBalance + amount
                    });
                    console.log('Transacción completada');
                } else {
                    console.error('Fondos insuficientes');
                    setError('Fondos insuficientes');
                }
            } else {
                console.error('Remitente o receptor no encontrado');
                setError('Remitente o receptor no encontrado');
            }
        } catch (error) {
            console.error('Error al procesar la transacción:', error);
            setError('Error al procesar la transacción');
        }
    };

    return (
        <div className="mainContainer">
            <div className='sidebar'>
                <Sidebar />
            </div>
            <div className="titleContainer">
                <h2>Transferencia</h2>
            </div>
            <div className="inputContainer">
                <label>Correo del remitente</label>
                <input
                    type="email"
                    className="inputBox"
                    placeholder="Correo del remitente"
                    onChange={(e) => setSenderEmail(e.target.value)}
                />
            </div>
            <div className="inputContainer">
                <label>Correo del receptor</label>
                <input
                    type="email"
                    className="inputBox"
                    placeholder="Correo del receptor"
                    onChange={(e) => setReceiverEmail(e.target.value)}
                />
            </div>
            <div className="inputContainer">
                <label>Monto</label>
                <input
                    type="number"
                    className="inputBox"
                    placeholder="Monto"
                    onChange={(e) => setAmount(Number(e.target.value))}
                />
            </div>
            {error && <label className="errorLabel">{error}</label>}
            <div className="buttonContainer">
                <input className="inputButton" type="button" onClick={handleTransaction} value="Realizar Transferencia" />
            </div>
        </div>
    );
};

export default Transaction;
