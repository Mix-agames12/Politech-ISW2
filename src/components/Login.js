// src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import '../components/Login.css';

export const Login = (props) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const validateInputs = () => {
        let isValid = true;
        setEmailError('');
        setPasswordError('');

        if (email === '') {
            setEmailError('Please enter your email');
            isValid = false;
        } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
            setEmailError('Please enter a valid email');
            isValid = false;
        }

        if (password === '') {
            setPasswordError('Please enter a password');
            isValid = false;
        } else if (password.length < 7) {
            setPasswordError('The password must be 8 characters or longer');
            isValid = false;
        }

        return isValid;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!validateInputs()) {
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            console.log('User logged in');
            navigate('/gestionar-cuentas');
        } catch (error) {
            console.error('Error logging in:', error);
            if (error.code === 'auth/user-not-found') {
                setEmailError('No user found with this email');
            } else if (error.code === 'auth/wrong-password') {
                setPasswordError('Incorrect password');
            } else {
                setEmailError('Failed to login. Please try again.');
            }
        }
    };

    const handleSignUp = () => {
        navigate('/SignUp');
    };

    return (
        <div className="mainContainer">
            <div className="titleContainer">
                <div>Inicio de Sesión</div>
            </div>
            <br />
            <div className="inputContainer">
                <input
                    type="email"
                    value={email}
                    placeholder="Enter your email here"
                    onChange={(ev) => setEmail(ev.target.value)}
                    className="inputBox"
                />
                {emailError && <label className="errorLabel">{emailError}</label>}
            </div>
            <br />
            <div className="inputContainer">
                <input
                    type="password"
                    value={password}
                    placeholder="Enter your password here"
                    onChange={(ev) => setPassword(ev.target.value)}
                    className="inputBox"
                />
                {passwordError && <label className="errorLabel">{passwordError}</label>}
            </div>
            <br />
            <a className="forgot" href="/password-reset">¿Olvidaste tu contraseña?</a>
            <br />
            <div className="buttonGroup">
                <input className="inputButton" type="button" onClick={handleLogin} value="Log in" />
                <input className="inputButton" type="button" onClick={handleSignUp} value="Sign Up" />
            </div>
        </div>
    );
};
