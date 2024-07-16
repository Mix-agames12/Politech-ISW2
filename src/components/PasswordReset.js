import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';
import '../PasswordReset.css';

const PasswordReset = () => {
    const [email, setEmail] = useState('');
    const [cedula, setCedula] = useState('');
    const [message, setMessage] = useState('');

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        try {
            await sendPasswordResetEmail(auth, email);
            setMessage('Correo de restablecimiento de contraseña enviado. Revisa tu bandeja de entrada.');
        } catch (error) {
            console.error('Error al enviar el correo de restablecimiento de contraseña:', error);
            setMessage('Error al enviar el correo de restablecimiento de contraseña. Por favor, verifica tu correo electrónico y vuelve a intentarlo.');
        }
    };

    return (
        <>
            <div className="navbar">
                <div className="logo">
                    <img src="assets/images/neologo.png" alt="logo" id="logo-img" />
                    <span className="logo-text"></span>
                </div>
            </div>
            <div className="recover-container">
                <h2>Recuperar Cuenta</h2>
                <form onSubmit={handlePasswordReset}>
                    <div className="form-group">
                        <label htmlFor="cedula">Número de Cédula:</label>
                        <input
                            type="text"
                            id="cedula"
                            name="cedula"
                            value={cedula}
                            onChange={(e) => setCedula(e.target.value)}
                            maxLength="10"
                            minLength="10"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group-btn">
                        <button type="submit" className="btn primary">Enviar Código</button>
                    </div>
                </form>
                {message && <p>{message}</p>}
            </div>
        </>
    );
};

export default PasswordReset;
