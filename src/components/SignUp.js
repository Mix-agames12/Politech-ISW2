import React, { useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, getDocs, query, collection, where } from 'firebase/firestore';
import bcrypt from 'bcryptjs';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Buho from '../assets/images/buho.png';
import { HeaderLogin } from './HeaderLogin';
import  Footer  from './Footer';

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

  const handleIdNumberChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,10}$/.test(value)) {
      setIdNumber(value);
    }
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
      // Registro del usuario en Firebase
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
        apellido: lastName,
        fechaNacimiento: dateOfBirth
      });

      await sendEmailVerification(user);

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
      {/* Encabezado del formulario */}
      <HeaderLogin />
      {/* Contenedor principal */}
      <div className="min-w-full min-h-screen absolute flex-col items-center justify-center bg-gray-100">
        {/* Contenedor del formulario */}
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center py-5 mt-24 bg-white shadow-lg rounded-lg">
          {/* Logo y título */}
          <div className="sm:mx-auto sm:w-full sm:max-w-lg">
            <img className="mx-auto h-10 w-auto my-1" src={Buho} alt="Your Company" />
            <h2 className="mt-1 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Registrarse</h2>
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
            {/* Campo de entrada para el correo electrónico */}
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
              <label htmlFor="lastName" className="block text-sm font-medium leading-6 text-gray-900">Apellido</label>
              <div className="mt-2 relative flex items-center">
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
            {/* Campo de entrada para la cédula */}
            <div>
              <label htmlFor="idNumber" className="block text-sm font-medium leading-6 text-gray-900">Cédula</label>
              <div className="mt-2 relative flex items-center">
                <input
                  id="idNumber"
                  name="idNumber"
                  type="text"
                  value={idNumber}
                  onChange={handleIdNumberChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Cédula"
                  required
                />
                {error.idNumber && <p className="mt-2 text-sm text-red-600">{error.idNumber}</p>}
              </div>
            </div>
            {/* Campo de entrada para el nombre de usuario */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">Nombre de usuario</label>
              <div className="mt-2 relative flex items-cente">
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
            {/* Campo de entrada para la contraseña */}
            <div className="relative">
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
                {/* Botón para mostrar/ocultar contraseña */}
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash className="h-5 w-5 text-gray-500" /> : <FaEye className="h-5 w-5 text-gray-500" />}
                </button>
              </div>
              {/* Mensaje de error para la contraseña */}
              {error.password && <p className="mt-2 text-sm text-red-600">{error.password}</p>}

            {/* Campo de entrada para repetir la contraseña */}
            <div className="relative">
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
                {/* Botón para mostrar/ocultar la confirmación de contraseña */}
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEyeSlash className="h-5 w-5 text-gray-500" /> : <FaEye className="h-5 w-5 text-gray-500" />}
                </button>
              </div>
              {/* Mensaje de error si las contraseñas no coinciden */}
              {!passwordsMatch && <p className="mt-2 text-sm text-red-600">Las contraseñas no coinciden</p>}
            </div>
            {/* Requisitos de la contraseña */}
            <div className="flex flex-col mt-2 font-medium text-xs pl-29">
                <span className={`passwordRequirements ${passwordConditions.length ? 'text-green-500' : 'text-gray-400'}`}>
                  La contraseña debe tener al menos 8 caracteres
                </span>
                <span className={`passwordRequirements ${passwordConditions.uppercase ? 'text-green-500' : 'text-gray-400'}`}>
                  La contraseña debe tener al menos una letra mayúscula
                </span>
                <span className={`passwordRequirements ${passwordConditions.number ? 'text-green-500' : 'text-gray-400'}`}>
                  La contraseña debe tener al menos un número
                </span>
                <span className={`passwordRequirements ${passwordConditions.specialChar ? 'text-green-500' : 'text-gray-400'}`}>
                  La contraseña debe tener al menos un carácter especial
                </span>
              </div>
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
