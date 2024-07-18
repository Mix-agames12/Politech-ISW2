import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';
import './PasswordReset.css';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const PasswordReset = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const handlePasswordReset = async () => {
        setError('');
        try {
            await sendPasswordResetEmail(auth, email);
            console.log('Correo de recuperación de contraseña enviado correctamente');
            setOpen(true);
            setTimeout(() => {
                navigate('/login');
            }, 2500); // Espera 3 segundos antes de redirigir al login
        } catch (error) {
            console.error('Error al enviar el correo de recuperación', error);
            setError('Error al enviar el correo de recuperación. Por favor intenta de nuevo.');
        }
    };

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }



















        
        setOpen(false);
    };

    return (
        <div className="mainContainer">
            <div className="titleContainer">
                <h2>Recuperación de contraseña</h2>
            </div>
            <div className="inputContainer">
                <label>Email</label>
                <input
                    type="email"
                    className="inputBox"
                    placeholder="Ingresa tu Email asociado"
                    onChange={(e) => setEmail(e.target.value)}
                />
                {error && <label className="errorLabel">{error}</label>}
            </div>
            <div className="buttonContainer">
                <input className="inputButton" type="button" onClick={handlePasswordReset} value="Recuperar contraseña " />
            </div>
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
                    Correo de recuperación de contraseña enviado correctamente!
                </Alert>
            </Snackbar>
        </div>
    );
};

export default PasswordReset;
