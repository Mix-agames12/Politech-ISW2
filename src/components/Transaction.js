// src/components/Transaction.js
import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';

const Transaction = () => {
    const [senderEmail, setSenderEmail] = useState('');
    const [receiverEmail, setReceiverEmail] = useState('');
    const [amount, setAmount] = useState(0);

    const handleTransaction = async () => {
        try {
            const usersCollection = collection(db, 'users');

            const senderQuery = query(usersCollection, where('email', '==', senderEmail));
            const senderSnapshot = await getDocs(senderQuery);
            const senderDoc = senderSnapshot.docs[0];

            const receiverQuery = query(usersCollection, where('email', '==', receiverEmail));
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
                    console.log('Transaction completed');
                } else {
                    console.error('Insufficient funds');
                }
            } else {
                console.error('Sender or receiver not found');
            }
        } catch (error) {
            console.error('Error processing transaction:', error);
        }
    };

    return (
        <div className="container">
            <h2>Transaction</h2>
            <div className="form-group">
                <label>Sender Email</label>
                <input
                    type="email"
                    className="form-control"
                    placeholder="Sender Email"
                    onChange={(e) => setSenderEmail(e.target.value)}
                />
            </div>
            <div className="form-group">
                <label>Receiver Email</label>
                <input
                    type="email"
                    className="form-control"
                    placeholder="Receiver Email"
                    onChange={(e) => setReceiverEmail(e.target.value)}
                />
            </div>
            <div className="form-group">
                <label>Amount</label>
                <input
                    type="number"
                    className="form-control"
                    placeholder="Amount"
                    onChange={(e) => setAmount(Number(e.target.value))}
                />
            </div>
            <button className="btn btn-primary" onClick={handleTransaction}>Make Transaction</button>
        </div>
    );
};

export default Transaction;
