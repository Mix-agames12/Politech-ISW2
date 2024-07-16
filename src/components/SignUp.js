// src/components/SignUp.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import '../Login.css';

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [cedula, setCedula] = useState('');
    const navigate = useNavigate();

    const validateForm = () => {
        const passwordRequirements = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        let valid = true;

        if (!passwordRequirements.test(password)) {
            document.getElementById('password-requirements').style.display = 'block';
            valid = false;
        } else {
            document.getElementById('password-requirements').style.display = 'none';
        }

        if (password !== confirmPassword) {
            document.getElementById('password-error').style.display = 'block';
            valid = false;
        } else {
            document.getElementById('password-error').style.display = 'none';
        }

        return valid;
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, 'users', user.uid), {
                id: user.uid,
                correo: email,
                contraseña: password
            });

            await setDoc(doc(db, 'clientes', user.uid), {
                id: user.uid,
                nombre: name,
                cedula: cedula,
                correo_electronico: email
            });

            navigate('/login');
        } catch (error) {
            console.error('Error signing up:', error);
        }
    };

    return (
        <div className="container right-panel-active" id="container">
            <div className="form-container sign-up-container">
                <form onSubmit={handleSignUp}>
                    <h1>Crear Cuenta</h1>
                    <input
                        type="text"
                        placeholder="Nombre"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Correo Electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Confirmar Contraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Número de Cédula"
                        value={cedula}
                        onChange={(e) => setCedula(e.target.value)}
                        required
                    />
                    <button type="submit">Registrarse</button>
                </form>
            </div>
            <div className="overlay-container">
                <div className="overlay">
                    <div className="overlay-panel overlay-left">
                        <h1>Bienvenido de vuelta</h1>
                        <p>Para mantenerse conectado con nosotros, inicie sesión con su información personal</p>
                        <button className="ghost" id="signIn" onClick={() => navigate('/')}>Iniciar Sesión</button>
                    </div>
                    <div className="overlay-panel overlay-right">
                        <h1>Bienvenido</h1>
                        <p>Ingresa tus datos personales para usar todas las funcionalidades</p>
                        <button className="ghost" id="signUp" onClick={() => navigate('/signup')}>Registrarse</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
