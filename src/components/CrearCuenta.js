import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { Sidebar } from "../components/Sidebar";
import { Header } from './Header';
import '../components/CrearCuenta.css';

const CrearCuenta = () => {
    const [newAccount, setNewAccount] = useState({
        cedula: '',
        correo: '',
        tipoCuenta: 'Ahorros' // Default to 'Ahorros'
    });
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [validEmail, setValidEmail] = useState(null); // null: not checked, true: valid, false: invalid
    const [emailErrorMessage, setEmailErrorMessage] = useState(''); // Message explaining email validation error
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                navigate('/login');
                return;
            }

            try {
                const userDoc = await getDoc(doc(db, 'clientes', currentUser.uid));
                if (userDoc.exists()) {
                    setUser(userDoc.data());
                } else {
                    console.log("No se encontró el documento del usuario.");
                }
            } catch (error) {
                console.error("Error fetching user data: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleAddAccount = async () => {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                console.log('User not authenticated');
                return;
            }

            // Verificar la cédula y el correo electrónico
            const cedula = newAccount.cedula.trim();
            const correo = newAccount.correo.trim();
            if (cedula.length !== 10 || !validEmail) {
                setError("Los datos ingresados no son válidos.");
                return;
            }

            console.log('Verificando cliente con cédula:', cedula, 'y correo:', correo);

            const q = query(collection(db, 'clientes'), where('cedula', '==', cedula), where('correo', '==', correo));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
                console.log('No se encontró ningún cliente con los datos proporcionados.');
                setError("Los datos ingresados no coinciden. Intenta nuevamente");
                return;
            }

            const clientData = querySnapshot.docs[0].data();
            console.log('Datos del cliente:', clientData);
            if (clientData.id !== currentUser.uid) { // Verifica que el campo "id" coincida con el UID del usuario autenticado
                console.log('El id del cliente no coincide con el usuario autenticado.');
                setError("Los datos ingresados no coinciden. Intenta nuevamente");
                return;
            }

            // Generar un número de cuenta único
            const generateAccountNumber = async () => {
                let accountNumber;
                let exists = true;
                while (exists) {
                    accountNumber = `22${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
                    const accountQuery = query(collection(db, 'cuentas'), where('accountNumber', '==', accountNumber));
                    const accountSnapshot = await getDocs(accountQuery);
                    exists = !accountSnapshot.empty;
                }
                return accountNumber;
            };

            const accountNumber = await generateAccountNumber();

            const newAccountData = {
                accountNumber,
                tipoCuenta: newAccount.tipoCuenta,
                accountBalance: 0,
                id: currentUser.uid,
                cedula,
                createdAt: serverTimestamp()
            };

            await addDoc(collection(db, 'cuentas'), newAccountData);
            console.log('New account added:', newAccountData);
            
            navigate('/gestionar-cuentas'); // Redirigir a la página de cuentas
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    };

    const validateEmail = (email) => {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const isValid = re.test(email);
        setValidEmail(isValid);

        if (!isValid) {
            if (!email.includes('@')) {
                setEmailErrorMessage("El correo electrónico debe incluir un '@'.");
            } else if (!email.split('@')[1].includes('.')) {
                setEmailErrorMessage("El dominio del correo electrónico debe contener un '.'.");
            } else {
                setEmailErrorMessage("Correo electrónico inválido.");
            }
        } else {
            setEmailErrorMessage('');
        }
    };

    const handleEmailChange = (e) => {
        const email = e.target.value;
        setNewAccount({ ...newAccount, correo: email });
        validateEmail(email);
    };

    if (loading) {
        return <div>Cargando...</div>; // Mostrar un mensaje de carga mientras se obtienen los datos
    }

    return (
        <div>
            {user && (
                <Header firstName={user.nombre} lastName={user.apellido} />
            )}
            <div className="Sidebar">
                <Sidebar />
            </div>
            <div className="main-content">
                <h2>Crear Nueva Cuenta</h2>
                <div className="new-account-form">
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    <input
                        type="text"
                        placeholder="Cédula"
                        value={newAccount.cedula}
                        maxLength={10}
                        onChange={(e) => setNewAccount({ ...newAccount, cedula: e.target.value })}
                    />
                    <div className="email-field">
                        <input
                            type="email"
                            placeholder="Correo Electrónico"
                            value={newAccount.correo}
                            onChange={handleEmailChange}
                        />
                        {validEmail !== null && (
                            <span className={`email-validation ${validEmail ? 'valid' : 'invalid'}`}>
                                {validEmail ? '✔️' : '❌'}
                            </span>
                        )}
                        {!validEmail && emailErrorMessage && (
                            <p style={{ color: 'red' }}>{emailErrorMessage}</p>
                        )}
                    </div>
                    <select
                        value={newAccount.tipoCuenta}
                        onChange={(e) => setNewAccount({ ...newAccount, tipoCuenta: e.target.value })}
                    >
                        <option value="Ahorros">Ahorros</option>
                        <option value="Corriente">Corriente</option>
                    </select>
                    <button onClick={handleAddAccount}>Agregar Cuenta</button>
                </div>
            </div>
        </div>
    );
}

export default CrearCuenta;
