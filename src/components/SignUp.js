import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import '../SignUp.css';

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [cedula, setCedula] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const validateForm = () => {
        const passwordRequirements = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        let valid = true;

        const passwordRequirementsElement = document.getElementById('password-requirements');
        const passwordErrorElement = document.getElementById('password-error');

        if (!passwordRequirements.test(password)) {
            if (passwordRequirementsElement) passwordRequirementsElement.style.display = 'block';
            valid = false;
        } else {
            if (passwordRequirementsElement) passwordRequirementsElement.style.display = 'none';
        }

        if (password !== confirmPassword) {
            if (passwordErrorElement) passwordErrorElement.style.display = 'block';
            valid = false;
        } else {
            if (passwordErrorElement) passwordErrorElement.style.display = 'none';
        }

        return valid;
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        setError(''); // Clear previous errors
        if (!validateForm()) return;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            console.log('User created:', user.uid); // Debugging

            await setDoc(doc(db, 'users', user.uid), {
                id: user.uid,
                correo: email,
                contraseña: password
            });
            console.log('User document created'); // Debugging

            await setDoc(doc(db, 'clientes', user.uid), {
                id: user.uid,
                nombre: name,
                cedula: cedula,
                correo_electronico: email
            });
            console.log('Client document created'); // Debugging

            await setDoc(doc(db, 'cuentas', user.uid), {
                id: user.uid,
                cedula: cedula,
                tipo_cuenta: 'Ahorros',
                monto: 100,
                numero_cuenta: `ACC${user.uid}`
            });
            console.log('Account document created'); // Debugging

            navigate('/login');
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                setError('El correo electrónico ya está en uso. Por favor, prueba con otro.');
            } else {
                setError('Error registrando el usuario. Por favor, inténtalo de nuevo.');
                console.error('Error signing up:', error);
            }
        }
    };

    return (
        <div className="container right-panel-active" id="container">
            <div className="form-container sign-up-container">
                <form onSubmit={handleSignUp}>
                    <h1>Crear Cuenta</h1>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    <input
                        type="text"
                        placeholder="Nombre"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Número de Cédula"
                        value={cedula}
                        onChange={(e) => setCedula(e.target.value)}
                        maxLength="10"
                        minLength="10"
                        required
                        inputMode="numeric"
                        onInput={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')}
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
                        minLength="8"
                        required
                    />
                    <small id="password-requirements" style={{ color: 'red', display: 'none' }}>
                        La contraseña debe tener al menos 8 caracteres, una letra mayúscula, un número y un carácter especial.
                    </small>
                    <input
                        type="password"
                        placeholder="Confirmar Contraseña"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        minLength="8"
                        required
                    />
                    <small id="password-error" style={{ color: 'red', display: 'none' }}>
                        Las contraseñas no coinciden
                    </small>
                    <button type="submit">Registrarse</button>
                    
                </form>
            </div>
            <div className="overlay-container">
                <div className="overlay">
                    <div className="overlay-panel overlay-left">
                        <h1>Bienvenido de vuelta</h1>
                        <p>Para mantenerse conectado con nosotros, inicie sesión con su información personal</p>
                        <button className="ghost" id="signIn" onClick={() => navigate('/login')}>Iniciar Sesión</button>
                    </div>
                    <div className="overlay-panel overlay-right">
                        <h1>Bienvenido</h1>
                        <p>Ingresa tus datos personales para usar todas las funcionalidades</p>
                        <button className="ghost" id="signUp" onClick={() => document.getElementById('container').classList.add('right-panel-active')}>Registrarse</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
