// src/components/SignUp.js
import React, { useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import bcrypt from 'bcryptjs';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { useNavigate } from 'react-router-dom';

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

  const handleSignUp = async (e) => {
    e.preventDefault();
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
    <>
      <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img className="mx-auto h-10 w-auto" src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600" alt="Your Company" />
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Registrarse</h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" onSubmit={handleSignUp}>
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium leading-6 text-gray-900">Nombre</label>
              <div className="mt-2">
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Nombre"
                  required
                />
                {error.firstName && <p className="mt-2 text-sm text-red-600">{error.firstName}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium leading-6 text-gray-900">Apellido</label>
              <div className="mt-2">
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Apellido"
                  required
                />
                {error.lastName && <p className="mt-2 text-sm text-red-600">{error.lastName}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">Nombre de usuario</label>
              <div className="mt-2">
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Nombre de usuario"
                  required
                />
                {error.username && <p className="mt-2 text-sm text-red-600">{error.username}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="idNumber" className="block text-sm font-medium leading-6 text-gray-900">Cédula</label>
              <div className="mt-2">
                <input
                  id="idNumber"
                  name="idNumber"
                  type="text"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Cédula"
                  required
                />
                {error.idNumber && <p className="mt-2 text-sm text-red-600">{error.idNumber}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">Correo electrónico</label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Correo electrónico"
                  required
                />
                {error.email && <p className="mt-2 text-sm text-red-600">{error.email}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">Contraseña</label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => validatePassword(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Contraseña"
                  required
                />
                {error.password && <p className="mt-2 text-sm text-red-600">{error.password}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-gray-900">Repetir contraseña</label>
              <div className="mt-2">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPassword(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Repetir contraseña"
                  required
                />
                {!passwordsMatch && <p className="mt-2 text-sm text-red-600">Las contraseñas no coinciden</p>}
              </div>
            </div>
            <div className="inputContainer">
              <label className={`passwordRequirements ${passwordConditions.length ? 'text-green-500' : 'text-red-600'}`}>
                La contraseña debe tener al menos 8 caracteres
              </label>
              <label className={`passwordRequirements ${passwordConditions.uppercase ? 'text-green-500' : 'text-red-600'}`}>
                La contraseña debe tener al menos una letra mayúscula
              </label>
              <label className={`passwordRequirements ${passwordConditions.number ? 'text-green-500' : 'text-red-600'}`}>
                La contraseña debe tener al menos un número
              </label>
              <label className={`passwordRequirements ${passwordConditions.specialChar ? 'text-green-500' : 'text-red-600'}`}>
                La contraseña debe tener al menos un carácter especial
              </label>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Registrarse
              </button>
            </div>
            {error.general && <p className="mt-2 text-sm text-red-600">{error.general}</p>}
          </form>
        </div>
        <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
          <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
            ¡Registro exitoso! Redirigiendo al login...
          </Alert>
        </Snackbar>
      </div>
    </>
  );
};

export default SignUp;
