import React, { useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, getDocs, query, collection, where } from 'firebase/firestore';
import bcrypt from 'bcryptjs';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { useNavigate } from 'react-router-dom';
import { HeaderHome } from './HeaderHome';
import EyeOpenIcon from '../assets/images/eye-open.png';
import EyeClosedIcon from '../assets/images/eye-closed.png';
import Buho from '../assets/images/buho.png';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const SignUp = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const validateInputs = async () => {
    let isValid = true;
    let errors = {};

    // Validaciones de los campos...

    setError(errors);
    return isValid;
  };

  const isOver18 = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 18;
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
    const inputsAreValid = await validateInputs(); // Asegúrate de que los inputs son válidos antes de continuar
    if (!inputsAreValid) {
      return; // No continuar si los inputs no son válidos
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'tempUsers', user.uid), {
        id: user.uid,
        correo: email,
        contraseña: bcrypt.hashSync(password, 10),
        username,
        nombre: firstName,
        apellido: lastName,
        cedula: idNumber,
        fechaNacimiento: dateOfBirth,
      });

      await sendEmailVerification(user, {
        url: `https://politechsw.web.app/verify-email?uid=${user.uid}`
      });

      console.log('Usuario registrado y correo de verificación enviado:', user);
      setOpen(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
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
      <HeaderHome />
      <div className="min-w-full min-h-screen absolute flex-col items-center justify-center bg-gray-100">
        {/* Contenedor del formulario */}
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center py-5 mt-24 bg-white shadow-lg rounded-lg">
          {/* Logo y título */}
          <div className="sm:mx-auto sm:w-full sm:max-w-lg">
            <img className="mx-auto h-10 w-auto" src={Buho} alt="Your Company" />
            <h2 className="mt-5 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Registrarse</h2>
            <p className="mt-2 mb-6 text-center text-sm text-gray-600">Ingresa tus datos personales: </p>
          </div>
          {/* Formulario de registro */}
          <form className="grid grid-cols-1 md:grid-cols-2 p-10 gap-3 gap-x-9" onSubmit={handleSignUp}>
            {/* Campo de entrada para el nombre */}
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
              <label htmlFor="dateOfBirth" className="block text-sm font-medium leading-6 text-gray-900">Fecha de Nacimiento</label>
              <div className="mt-2">
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  required
                />
                {error.dateOfBirth && <p className="mt-2 text-sm text-red-600">{error.dateOfBirth}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">Correo electrónico</label>
              <div className="mt-2 relative flex items-center">
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
            {/* Campo de entrada para el apellido */}
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
            <div className="relative mb-2">
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">Contraseña</label>
              <div className="mt-2 flex items-center">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => validatePassword(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Contraseña"
                  required
                />
                <img
                  src={showPassword ? EyeOpenIcon : EyeClosedIcon}
                  alt={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-12 transform -translate-y-1/2 cursor-pointer"
                  style={{ height: '24px', width: '24px' }}
                />
              </div>
              {/* Mensaje de error para la contraseña */}
              {error.password && <p className="mt-2 text-sm text-red-600">{error.password}</p>}
            </div>
            <div className="relative mb-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-gray-900">Repetir contraseña</label>
              <div className="mt-2 flex items-center">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPassword(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Repetir contraseña"
                  required
                />
                <img
                  src={showConfirmPassword ? EyeOpenIcon : EyeClosedIcon}
                  alt={showConfirmPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-12 transform -translate-y-1/2 cursor-pointer"
                  style={{ height: '24px', width: '24px' }}
                />
              </div>
              {/* Mensaje de error si las contraseñas no coinciden */}
              {!passwordsMatch && <p className="mt-2 text-sm text-red-600">Las contraseñas no coinciden</p>}
            </div>
            <div className="mt-2">
              <ul className="text-sm text-gray-600">
                <li className={`flex items-center ${passwordConditions.length ? 'text-green-600' : ''}`}>
                  {passwordConditions.length ? '✔' : '✘'} Al menos 8 caracteres
                </li>
                <li className={`flex items-center ${passwordConditions.uppercase ? 'text-green-600' : ''}`}>
                  {passwordConditions.uppercase ? '✔' : '✘'} Contiene mayúsculas
                </li>
                <li className={`flex items-center ${passwordConditions.number ? 'text-green-600' : ''}`}>
                  {passwordConditions.number ? '✔' : '✘'} Contiene números
                </li>
                <li className={`flex items-center ${passwordConditions.specialChar ? 'text-green-600' : ''}`}>
                  {passwordConditions.specialChar ? '✔' : '✘'} Contiene caracteres especiales
                </li>
              </ul>
            </div>

            {/* Botón de registro */}
            <div className="md:col-span-2 mt-6">
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Registrarse
              </button>
            </div>
            {/* Mensaje de error general */}
            {error.general && <p className="mt-2 text-sm text-red-600">{error.general}</p>}
          </form>
        </div>
        {/* Snackbar para notificaciones */}
        <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
          <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
            ¡Registro exitoso! Redirigiendo al login...
          </Alert>
        </Snackbar>
      </div>
      <Footer/>
    </>
  );
};

export default SignUp;
