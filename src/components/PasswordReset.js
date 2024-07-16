// src/components/PasswordReset.js
import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';

const PasswordReset = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handlePasswordReset = async () => {
        try {
            await sendPasswordResetEmail(auth, email);
            setMessage('Correo de restablecimiento de contraseña enviado. Revisa tu bandeja de entrada.');
        } catch (error) {
            console.error('Error al enviar el correo de restablecimiento de contraseña:', error);
            setMessage('Error al enviar el correo de restablecimiento de contraseña. Por favor, verifica tu correo electrónico y vuelve a intentarlo.');
        }
    };

    return (
        <div className="container">
            <h2>Restablecer Contraseña</h2>
            <div className="form-group">
                <label>Email</label>
                <input
                    type="email"
                    className="form-control"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <button className="btn btn-primary" onClick={handlePasswordReset}>Restablecer Contraseña</button>
            {message && <p>{message}</p>}
        </div>
    );
};

export default PasswordReset;
