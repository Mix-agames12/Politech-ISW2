import '../components/GestionarCuentas.css';
import { Sidebar } from "../components/Sidebar";
import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Header } from './Header';

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
                // Fetch user data
                const userDoc = await getDoc(doc(db, 'clientes', currentUser.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    console.log('User data:', userData);
                    setUser(userData);
                } else {
                    console.log("No such document!");
                }

                // Fetch accounts
                const q = query(collection(db, 'cuentas'), where('id', '==', currentUser.uid));
                const querySnapshot = await getDocs(q);
                const accountsList = querySnapshot.docs.map(doc => doc.data());
                console.log('Accounts fetched:', accountsList);
                setAccounts(accountsList);
            } catch (error) {
                console.error("Error fetching data: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    console.log('User:', user); // Verificar que los estados se actualizan
    console.log('Accounts:', accounts);
    console.log('Loading:', loading);

    if (loading) {
        console.log('Component is loading');
        return null; // No renderizar nada hasta que los datos estén listos
    }

    console.log('Component is rendering with user:', user);

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
