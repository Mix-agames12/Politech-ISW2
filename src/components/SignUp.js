import React, { useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import bcrypt from 'bcryptjs';
import './SignUp.css';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { useNavigate } from 'react-router-dom';
import { HeaderPrincipal } from './HeaderPrincipal'; // Importar HeaderPrincipal

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const SignUp = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState({});
    const [passwordConditions, setPasswordConditions] = useState({
        length: false,
        uppercase: false,
        number: false,
        specialChar: false,
    });
    const [passwordsMatch, setPasswordsMatch] = useState(true);
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const validateInputs = () => {
        let isValid = true;
        let errors = {};

        if (firstName === '') {
            errors.firstName = 'Por favor, ingresa tu nombre';
            isValid = false;
        }

        if (lastName === '') {
            errors.lastName = 'Por favor, ingresa tu apellido';
            isValid = false;
        }

        if (username === '') {
            errors.username = 'Por favor, ingresa un nombre de usuario';
            isValid = false;
        }

        if (email === '') {
            errors.email = 'Por favor, ingresa tu correo electrónico';
            isValid = false;
        } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
            errors.email = 'Por favor, ingresa un correo electrónico válido';
            isValid = false;
        }

        if (idNumber === '') {
            errors.idNumber = 'Por favor, ingresa tu cédula';
            isValid = false;
        }

        if (password === '') {
            errors.password = 'Por favor, ingresa una contraseña';
            isValid = false;
        } else if (!passwordConditions.length || !passwordConditions.uppercase || !passwordConditions.number || !passwordConditions.specialChar) {
            errors.password = 'La contraseña no cumple con los requisitos';
            isValid = false;
        }

        if (confirmPassword === '') {
            errors.confirmPassword = 'Por favor, repite tu contraseña';
            isValid = false;
        } else if (password !== confirmPassword) {
            errors.confirmPassword = 'Las contraseñas no coinciden';
            isValid = false;
        }

        setError(errors);
        return isValid;
    };

    const generateAccountNumber = () => {
        let accountNumber = '22';
        while (accountNumber.length < 10) {
            accountNumber += Math.floor(Math.random() * 10);
        }
        return accountNumber;
    };

    const handleSignUp = async () => {
        if (!validateInputs()) {
            return;
        }

        try {
            const hashedPassword = bcrypt.hashSync(password, 10);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const accountNumber = generateAccountNumber();

            await setDoc(doc(db, 'users', user.uid), {
                id: user.uid,
                correo: email,
                contraseña: hashedPassword,
                username
            });

            await setDoc(doc(db, 'cuentas', user.uid), {
                id: user.uid,
                cedula: idNumber,
                accountBalance: 100,
                accountNumber,
                tipoCuenta: 'ahorros'
            });

            await setDoc(doc(db, 'clientes', user.uid), {
                id: user.uid,
                correo: email,
                cedula: idNumber,
                nombre: firstName,
                apellido: lastName
            });

            console.log('Usuario registrado:', user);
            setOpen(true);
            setTimeout(() => {
                navigate('/login');
            }, 2000); // Espera 2 segundos antes de redirigir al login
        } catch (error) {
            console.error('Error al registrarse:', error);
            let errors = {};
            if (error.code === 'auth/email-already-in-use') {
                errors.email = 'Este correo electrónico ya está en uso';
            } else {
                errors.general = 'No se pudo registrar. Inténtalo de nuevo.';
            }
            setError(errors);
        }
    };

    const validatePassword = (password) => {
        const length = password.length >= 8;
        const uppercase = /[A-Z]/.test(password);
        const number = /[0-9]/.test(password);
        const specialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        setPasswordConditions({ length, uppercase, number, specialChar });
        setPassword(password);
    };

    const handleConfirmPassword = (value) => {
        setConfirmPassword(value);
        setPasswordsMatch(value === password);
    };

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };

    return (
        <div className="mainContainer">
            {/* Agregar HeaderPrincipal */}
            <HeaderPrincipal />
            <div className="titleContainer">
                <h2>Registrarse</h2>
            </div>
            <div className="formContainer">
                <div className="column">
                    <div className="inputContainer">
                        <label>Nombre</label>
                        <input
                            type="text"
                            className="inputBox"
                            placeholder="Nombre"
                            onChange={(e) => setFirstName(e.target.value)} />
                        {error.firstName && <label className="errorLabel">{error.firstName}</label>}
                    </div>
                    <div className="inputContainer">
                        <label>Apellido</label>
                        <input
                            type="text"
                            className="inputBox"
                            placeholder="Apellido"
                            onChange={(e) => setLastName(e.target.value)} />
                        {error.lastName && <label className="errorLabel">{error.lastName}</label>}
                    </div>
                    <div className="inputContainer">
                        <label>Nombre de usuario</label>
                        <input
                            type="text"
                            className="inputBox"
                            placeholder="Nombre de usuario"
                            onChange={(e) => setUsername(e.target.value)} />
                        {error.username && <label className="errorLabel">{error.username}</label>}
                    </div>
                    <div className="inputContainer">
                        <label>Cédula</label>
                        <input
                            type="text"
                            className="inputBox"
                            placeholder="Cédula"
                            onChange={(e) => setIdNumber(e.target.value)} />
                        {error.idNumber && <label className="errorLabel">{error.idNumber}</label>}
                    </div>
                </div>
                <div className="column">
                    <div className="inputContainer">
                        <label>Correo electrónico</label>
                        <input
                            type="email"
                            className="inputBox"
                            placeholder="Correo electrónico"
                            onChange={(e) => setEmail(e.target.value)} />
                        {error.email && <label className="errorLabel">{error.email}</label>}
                    </div>
                    <div className="inputContainer">
                        <label>Contraseña</label>
                        <input
                            type="password"
                            className="inputBox"
                            placeholder="Contraseña"
                            onChange={(e) => validatePassword(e.target.value)} />
                        {error.password && <label className="errorLabel">{error.password}</label>}
                    </div>
                    <div className="inputContainer">
                        <label>Repetir contraseña</label>
                        <input
                            type="password"
                            className="inputBox"
                            placeholder="Repetir contraseña"
                            onChange={(e) => handleConfirmPassword(e.target.value)} />
                        {!passwordsMatch && <label className="errorLabel">Las contraseñas no coinciden</label>}
                    </div>
                    <div className="inputContainer">
                        <label className={`passwordRequirements ${passwordConditions.length ? 'valid' : 'invalid'}`}>
                            La contraseña debe tener al menos 8 caracteres
                        </label>
                        <label className={`passwordRequirements ${passwordConditions.uppercase ? 'valid' : 'invalid'}`}>
                            La contraseña debe tener al menos una letra mayúscula
                        </label>
                        <label className={`passwordRequirements ${passwordConditions.number ? 'valid' : 'invalid'}`}>
                            La contraseña debe tener al menos un número
                        </label>
                        <label className={`passwordRequirements ${passwordConditions.specialChar ? 'valid' : 'invalid'}`}>
                            La contraseña debe tener al menos un carácter especial
                        </label>
                    </div>
                </div>
            </div>
            <div className="buttonContainer">
                <input className="inputButton" type="button" onClick={handleSignUp} value="Registrarse" />
                {error.general && <label className="errorLabel">{error.general}</label>}
            </div>
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
                    ¡Registro exitoso! Redirigiendo al login...
                </Alert>
            </Snackbar>
        </div>
    );
};

export default SignUp;
