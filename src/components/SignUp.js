import React, { useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, getDocs, query, collection, where } from 'firebase/firestore';
import bcrypt from 'bcryptjs';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { useNavigate } from 'react-router-dom';
import { HeaderDashboard } from './HeaderDashboard';
import EyeOpenIcon from '../assets/images/eye-open.png'; // Asegúrate de que esta ruta sea correcta
import EyeClosedIcon from '../assets/images/eye-closed.png'; // Asegúrate de que esta ruta sea correcta
import Buho from '../assets/images/buho.png'; // Asegúrate de que esta ruta sea correcta

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
    } else {
      // Verificar si el nombre de usuario ya existe
      const usernameQuery = query(collection(db, 'users'), where('username', '==', username));
      const usernameSnapshot = await getDocs(usernameQuery);
      if (!usernameSnapshot.empty) {
        errors.username = 'Este nombre de usuario ya está en uso';
        isValid = false;
      }
    }

    if (email === '') {
      errors.email = 'Por favor, ingresa tu correo electrónico';
      isValid = false;
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      errors.email = 'Por favor, ingresa un correo electrónico válido';
      isValid = false;
    } else {
      // Verificar si el correo electrónico ya existe
      const emailQuery = query(collection(db, 'users'), where('correo', '==', email));
      const emailSnapshot = await getDocs(emailQuery);
      if (!emailSnapshot.empty) {
        errors.email = 'Este correo electrónico ya está en uso';
        isValid = false;
      }
    }

    if (idNumber === '') {
      errors.idNumber = 'Por favor, ingresa tu cédula';
      isValid = false;
    } else if (idNumber.length !== 10) {
      errors.idNumber = 'La cédula debe tener exactamente 10 dígitos';
      isValid = false;
    } else {
      // Verificar si la cédula ya existe
      const idQuery = query(collection(db, 'clientes'), where('cedula', '==', idNumber));
      const idSnapshot = await getDocs(idQuery);
      if (!idSnapshot.empty) {
        errors.idNumber = 'Esta cédula ya está en uso';
        isValid = false;
      }
    }

    if (dateOfBirth === '') {
      errors.dateOfBirth = 'Por favor, ingresa tu fecha de nacimiento';
      isValid = false;
    } else if (!isOver18(dateOfBirth)) {
      errors.dateOfBirth = 'Debes tener al menos 18 años para registrarte';
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

      await sendEmailVerification(user); // Envía el correo de verificación

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
      <HeaderDashboard />
      <div className="min-w-full min-h-screen absolute flex-col items-center justify-center bg-gray-100">
        <div className="w-full max-w-xl mx-auto flex flex-col items-center p-10 my-10 bg-white shadow-lg rounded-lg">
          <div className="sm:mx-auto sm:w-full sm:max-w-lg">
            <img className="mx-auto h-10 w-auto" src={ Buho } alt="Your Company" />
            <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Registrarse</h2>
          </div>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSignUp}>
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
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">Contraseña</label>
              <div className="mt-2 flex">
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
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <img src={showPassword ? EyeClosedIcon : EyeOpenIcon} alt="Toggle Visibility" className="h-5 w-5" />
                </button>
              </div>
              {error.password && <p className="mt-2 text-sm text-red-600">{error.password}</p>}
            </div>
            <div className="relative">
              <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-gray-900">Repetir contraseña</label>
              <div className="mt-2 flex">
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
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <img src={showConfirmPassword ? EyeClosedIcon : EyeOpenIcon} alt="Toggle Visibility" className="h-5 w-5" />
                </button>
              </div>
              {!passwordsMatch && <p className="mt-2 text-sm text-red-600">Las contraseñas no coinciden</p>}
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
            <div className="md:col-span-2">
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
            </div>
            <div className="md:col-span-2">
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
