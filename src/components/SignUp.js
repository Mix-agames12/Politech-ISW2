import React, { useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDocs, query, collection, where } from 'firebase/firestore';
import bcrypt from 'bcryptjs';
import './SignUp.css';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { useNavigate } from 'react-router-dom';
import { HeaderPrincipal } from './HeaderPrincipal';

import eyeOpen from '../assets/images/eye-open.png';
import eyeClosed from '../assets/images/eye-closed.png';
import calendarIcon from '../assets/images/calendar.png';

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

  const handleSignUp = async () => {
    if (!await validateInputs()) {
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

      console.log('Usuario registrado:', user);
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
    <div className="mainContainer">
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
              value={idNumber}
              onChange={handleIdNumberChange} />
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
            <label>Fecha de nacimiento</label>
            <div className="dateInputContainer">
              <input
                type="text"
                className="inputBox"
                placeholder="Fecha de nacimiento"
                onFocus={(e) => (e.target.type = 'date')}
                onBlur={(e) => (e.target.type = 'text')}
                onChange={(e) => setDateOfBirth(e.target.value)} />
              <button className="calendarButton" onClick={() => document.querySelector('input[type="date"]').focus()}>
                <img src={calendarIcon} alt="Abrir calendario" />
              </button>
            </div>
            {error.dateOfBirth && <label className="errorLabel">{error.dateOfBirth}</label>}
          </div>
          <div className="inputContainer">
            <label>Contraseña</label>
            <div className="passwordInputContainer">
              <input
                type={showPassword ? "text" : "password"}
                className="inputBox"
                placeholder="Contraseña"
                onChange={(e) => validatePassword(e.target.value)} />
              <button className="togglePasswordButton" onClick={() => setShowPassword(!showPassword)}>
                <img src={showPassword ? eyeOpen : eyeClosed} alt="Toggle Password Visibility" />
              </button>
            </div>
            {error.password && <label className="errorLabel">{error.password}</label>}
          </div>
          <div className="inputContainer">
            <label>Repetir contraseña</label>
            <div className="passwordInputContainer">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="inputBox"
                placeholder="Repetir contraseña"
                onChange={(e) => handleConfirmPassword(e.target.value)} />
              <button className="togglePasswordButton" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                <img src={showConfirmPassword ? eyeOpen : eyeClosed} alt="Toggle Confirm Password Visibility" />
              </button>
            </div>
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
