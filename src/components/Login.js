// src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import '../Login.css';


const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            console.log('User logged in');
            navigate('/gestionar-cuentas');
        } catch (error) {
            console.error('Error logging in:', error);
        }
    };

    const handleSignInClick = () => {
        document.getElementById('container').classList.remove('right-panel-active');
    };

    return (

        <div className="container" id="container">

            <div className="form-container sign-up-container">
                <form>
                    <h1>Crear Cuenta</h1>
                    <span>o usa tu correo electrónico para registrarte</span>
                    <input type="text" placeholder="Nombre"/>
                    <input type="email" placeholder="Correo Electrónico" />
                    <input type="password" placeholder="Contraseña" />
                    <button type="button" onClick={() => navigate('/signup')}>Registrarse</button>
                </form>

            </div>
            <div className="form-container sign-in-container">
                <form onSubmit={handleLogin}>
                    <h1>Iniciar Sesión</h1>
                    <input
                        type="email"
                        placeholder="Correo Electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <a href="/password-reset">¿Olvidaste tu contraseña?</a>
                    <button type="submit">Iniciar Sesión</button>
                </form>
            </div>
            <div className="overlay-container">
                <div className="overlay">
                    <div className="overlay-panel overlay-left">
                        <h1>Bienvenido </h1>
                        <p>Ingresa tus datos personales para usar todas las funcionalidades</p>
                        <button className="ghost" id="signIn" onClick={handleSignInClick}>Iniciar Sesión</button>
                    </div>
                    <div className="overlay-panel overlay-right">
                        <h1>Bienvenido de vuelta</h1>
                        <p>Para mantenerse conectado con nosotros, inicie sesión con su información personal.</p>
                        <button type="button" className="ghost" id="signUp" onClick={() => navigate('/signup')}>Registrarse</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
