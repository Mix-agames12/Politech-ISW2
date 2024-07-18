import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { doc, getDoc } from 'firebase/firestore';
import './CambioContrasena.css';
import { Sidebar } from "../components/Sidebar";

const Alerta = React.forwardRef(function Alerta(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const CambioContrasena = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [open, setOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
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
                    const userData = userDoc.data();
                    setUser(userData);
                    setEmail(currentUser.email);
                }
            } catch (error) {
                console.error("Error fetching user data: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    const manejarRestablecimientoContrasena = async () => {
        setError('');
        try {
            await sendPasswordResetEmail(auth, email);
            console.log('Correo de restablecimiento de contraseña enviado');
            setOpen(true);
            setTimeout(() => {
                navigate('/login');
            }, 2000); // Espera 2 segundos antes de redirigir al login
        } catch (error) {
            console.error('Error al enviar el correo de restablecimiento de contraseña:', error);
            setError('Error al enviar el correo de restablecimiento de contraseña. Por favor, inténtalo de nuevo.');
        }
    };

    const manejarCerrar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="mainContainer">
            {user && (
                <Header firstName={user.nombre} lastName={user.apellido} />
            )}
            <div className="Sidebar">
                <Sidebar />
            </div>
            <div className="titleContainer">
                <h2>Cambio de Contraseña</h2>
            </div>
            <div className="inputContainer">
                <label>Correo Electrónico</label>
                <input
                    type="email"
                    className="inputBox"
                    placeholder="Correo Electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                {error && <label className="errorLabel">{error}</label>}
            </div>
            <div className="buttonContainer">
                <input className="inputButton" type="button" onClick={manejarRestablecimientoContrasena} value="Restablecer Contraseña" />
            </div>
            <Snackbar open={open} autoHideDuration={6000} onClose={manejarCerrar}>
                <Alerta onClose={manejarCerrar} severity="success" sx={{ width: '100%' }}>
                    ¡Correo de cambio de contraseña enviado exitosamente!
                </Alerta>
            </Snackbar>
        </div>
    );
};

export default CambioContrasena;
