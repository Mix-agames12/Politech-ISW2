import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, getDocs, query, collection, where } from 'firebase/firestore';
import bcrypt from 'bcryptjs';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { useNavigate } from 'react-router-dom';
import { HeaderHome } from './HeaderHome';
import { FaRegEye, FaRegEyeSlash, FaArrowLeft } from 'react-icons/fa';
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

  useEffect(() => {
    const checkUsername = async () => {
      if (username) {
        const q = query(collection(db, 'users'), where('username', '==', username));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setError((prev) => ({ ...prev, username: 'Nombre de usuario ya está en uso' }));
        } else {
          setError((prev) => ({ ...prev, username: null }));
        }
      }
    };
    const checkEmail = async () => {
      if (email) {
        const q = query(collection(db, 'users'), where('correo', '==', email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setError((prev) => ({ ...prev, email: 'Este correo electrónico ya está en uso' }));
        } else {
          setError((prev) => ({ ...prev, email: null }));
        }
      }
    };
    const checkIdNumber = async () => {
      if (idNumber) {
        const q = query(collection(db, 'clientes'), where('cedula', '==', idNumber));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setError((prev) => ({ ...prev, idNumber: 'Esta cédula ya está en uso' }));
        } else {
          setError((prev) => ({ ...prev, idNumber: null }));
        }
      }
    };

    const timeoutId = setTimeout(() => {
      checkUsername();
      checkEmail();
      checkIdNumber();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username, email, idNumber]);

  const validateInputs = async () => {
    let isValid = true;
    let errors = {};

    if (!firstName) errors.firstName = 'Nombre es requerido';
    if (!lastName) errors.lastName = 'Apellido es requerido';
    if (!email) errors.email = 'Correo electrónico es requerido';
    if (!idNumber.match(/^\d{10}$/)) errors.idNumber = 'Cédula debe tener 10 dígitos';
    if (!isOver18(dateOfBirth)) errors.dateOfBirth = 'Debes tener al menos 18 años';
    if (!password) errors.password = 'Contraseña es requerida';
    if (password !== confirmPassword) errors.confirmPassword = 'Las contraseñas no coinciden';

    setError(errors);
    return Object.keys(errors).length === 0;
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

  const generateAccountNumber = (accountType) => {
    let accountNumber = '22';
    while (accountNumber.length < 10) {
      accountNumber += Math.floor(Math.random() * 10);
    }
    return accountType === 'ahorros' ? `AHO${accountNumber.slice(-4)}` : `CORR${accountNumber.slice(-4)}`;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    const inputsAreValid = await validateInputs();
    if (!inputsAreValid) {
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Usuario creado:', user.uid);

      // Actualiza el perfil del usuario para incluir displayName
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
      });

      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        correo: email,
        contraseña: bcrypt.hashSync(password, 10),
        username,
        verified: false, // Campo adicional
      });

      await setDoc(doc(db, 'clientes', user.uid), {
        id: user.uid,
        correo: email,
        cedula: idNumber,
        nombre: firstName,
        apellido: lastName,
        fechaNacimiento: dateOfBirth,
      });

      const accountNumber = generateAccountNumber('ahorros');
      await setDoc(doc(db, 'cuentas', user.uid), {
        id: user.uid,
        accountBalance: 100,
        accountNumber: accountNumber,
        accountName: username,
        tipoCuenta: 'ahorros',
      });

      const actionCodeSettings = {
        url: `https://politechsw.web.app/verify-email?uid=${user.uid}`,
        handleCodeInApp: true
      };

      await sendEmailVerification(user, actionCodeSettings);

      console.log('Correo de verificación enviado:', user.email);
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
      <div className="min-w-full min-h-screen absolute flex flex-col items-center justify-center bg-gray-100">
        <div className="relative w-full max-w-2xl mx-auto flex flex-col items-center py-5 mt-24 bg-white shadow-lg rounded-lg">
          <button
            onClick={() => navigate('/login')}
            className="absolute top-4 left-4 flex items-center text-sky-900 hover:text-sky-600 z-50"
          >
            <FaArrowLeft className="mr-2" />
            Volver
          </button>
          <div className="sm:mx-auto sm:w-full sm:max-w-lg">
            <img className="mx-auto h-10 w-auto" src={Buho} alt="Your Company" />
            <h2 className="mt-5 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Registrarse</h2>
            <p className="mt-2 mb-6 text-center text-sm text-gray-600">Ingresa tus datos personales:</p>
          </div>
          <form className="grid grid-cols-1 md:grid-cols-2 p-10 pt-3 gap-3 gap-x-9 w-full" onSubmit={handleSignUp}>
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
                  maxLength={10}
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
              <div className="mt-2 flex items-center relative">
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
                <button
                  type="button"
                  className="absolute right-0 pr-3 flex items-center top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                </button>
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
              {error.password && <p className="mt-2 text-sm text-red-600">{error.password}</p>}
            </div>
            <div className="relative mb-2">
              <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-gray-900">Repetir contraseña</label>
              <div className="mt-2 flex items-center relative">
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
                <button
                  type="button"
                  className="absolute right-0 pr-3 flex items-center top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                </button>
              </div>
              {!passwordsMatch && <p className="mt-2 text-sm text-red-600">Las contraseñas no coinciden</p>}
            </div>
            <div className="col-span-full">
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-sky-900 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-sky-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Registrarse
              </button>
            </div>
            {error.general && <p className="mt-2 text-sm text-red-600 col-span-full">{error.general}</p>}
          </form>
        </div>
        <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
          <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
            ¡Registro exitoso! Revisa tu correo para verificar tu cuenta.
          </Alert>
        </Snackbar>
      </div>
    </>
  );
};

export default SignUp;
