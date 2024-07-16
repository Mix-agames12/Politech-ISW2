// src/components/Transaction.js
import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where, updateDoc, doc, addDoc } from 'firebase/firestore';

const Transaction = () => {
    const [senderAccount, setSenderAccount] = useState('');
    const [receiverAccount, setReceiverAccount] = useState('');
    const [amount, setAmount] = useState(0);
    const [message, setMessage] = useState('');

    const handleTransaction = async () => {
        try {
            // Consulta la cuenta del remitente
            const senderQuery = query(collection(db, 'cuentas'), where('numero_cuenta', '==', senderAccount));
            const senderSnapshot = await getDocs(senderQuery);
            const senderDoc = senderSnapshot.docs[0];

            // Consulta la cuenta del receptor
            const receiverQuery = query(collection(db, 'cuentas'), where('numero_cuenta', '==', receiverAccount));
            const receiverSnapshot = await getDocs(receiverQuery);
            const receiverDoc = receiverSnapshot.docs[0];

            if (senderDoc && receiverDoc) {
                const senderData = senderDoc.data();
                const receiverData = receiverDoc.data();

                if (senderData.monto >= amount) {
                    // Actualiza el saldo del remitente
                    await updateDoc(doc(db, 'cuentas', senderDoc.id), {
                        monto: senderData.monto - amount
                    });

                    // Actualiza el saldo del receptor
                    await updateDoc(doc(db, 'cuentas', receiverDoc.id), {
                        monto: receiverData.monto + amount
                    });

                    // Crear una transacción
                    const transactionRef = await addDoc(collection(db, 'transacciones'), {
                        numero_cuenta_origen: senderData.numero_cuenta,
                        numero_cuenta_destino: receiverData.numero_cuenta,
                        monto: amount,
                        tipo_transaccion: 'Transferencia',
                        fecha: new Date().toISOString()
                    });

                    // Crear una transferencia
                    await addDoc(collection(db, 'transferencias'), {
                        numero_Transaccion: transactionRef.id,
                        cuenta_origen: senderData.numero_cuenta,
                        cuenta_Destino: receiverData.numero_cuenta,
                        monto: amount
                    });

                    setMessage('Transferencia completada con éxito');
                } else {
                    setMessage('Fondos insuficientes');
                }
            } else {
                setMessage('Cuenta del remitente o receptor no encontrada');
            }
        } catch (error) {
            console.error('Error al procesar la transacción:', error);
            setMessage('Error al procesar la transacción');
        }
    };

    return (
        <div className="container">
            <h2>Transacción</h2>
            <div className="form-group">
                <label>Número de Cuenta Origen</label>
                <input
                    type="text"
                    className="form-control"
                    placeholder="Número de Cuenta Origen"
                    value={senderAccount}
                    onChange={(e) => setSenderAccount(e.target.value)}
                />
            </div>
            <div className="form-group">
                <label>Número de Cuenta Destino</label>
                <input
                    type="text"
                    className="form-control"
                    placeholder="Número de Cuenta Destino"
                    value={receiverAccount}
                    onChange={(e) => setReceiverAccount(e.target.value)}
                />
            </div>
            <div className="form-group">
                <label>Monto</label>
                <input
                    type="number"
                    className="form-control"
                    placeholder="Monto"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                />
            </div>
            <button className="btn btn-primary" onClick={handleTransaction}>Realizar Transacción</button>
            {message && <p>{message}</p>}
        </div>
    );
};

export default Transaction;
