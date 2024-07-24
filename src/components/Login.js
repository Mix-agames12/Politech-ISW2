// src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import '../components/Login.css';
import { HeaderPrincipal2 } from './HeaderPrincipal2';
import eyeOpen from '../assets/images/eye-open.png'; // Ruta a tu imagen
import eyeClosed from '../assets/images/eye-closed.png'; // Ruta a tu imagen

export const Login = (props) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar la contraseña

  const validateInputs = () => {
    let isValid = true;
    setUsernameError('');
    setPasswordError('');

    if (username === '') {
      setUsernameError('Por favor, ingresa tu nombre de usuario');
      isValid = false;
    }

    if (password === '') {
      setPasswordError('Por favor, ingresa una contraseña');
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres');
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
      // Buscar el correo electrónico correspondiente al nombre de usuario
      const usersCollection = collection(db, 'users');
      const userQuery = query(usersCollection, where('username', '==', username));
      const userSnapshot = await getDocs(userQuery);

      if (userSnapshot.empty) {
        setUsernameError('No se encontró ningún usuario con este nombre de usuario');
        return;
      }

      const userDoc = userSnapshot.docs[0];
      const userEmail = userDoc.data().correo;

      // Intentar iniciar sesión con el correo electrónico obtenido
      await signInWithEmailAndPassword(auth, userEmail, password);
      console.log('User logged in');
      navigate('/gestionar-cuentas');
    } catch (error) {
      console.error('Error logging in:', error);
      if (error.code === 'auth/user-not-found') {
        setUsernameError('No se encontró ningún usuario con este nombre de usuario');
      } else if (error.code === 'auth/wrong-password') {
        setPasswordError('Contraseña incorrecta');
      } else {
        setUsernameError('Error al iniciar sesión. Por favor, intenta de nuevo.');
      }
    }
  };

  const handleSignUp = () => {
    navigate('/SignUp');
  };

  return (
    <>
      <HeaderPrincipal2 />
      <div className="mainContainer">

        <div className="titleContainer">
          <div>Inicio de Sesión</div>
        </div>
        <br />
        <div className="inputContainer">
          <input
            type="text"
            value={username}
            placeholder="Ingresa tu nombre de usuario"
            onChange={(ev) => setUsername(ev.target.value)}
            className="inputBox"
          />
          {usernameError && <label className="errorLabel">{usernameError}</label>}
        </div>
        <br />
        <div className="inputContainer">
        <div className="passwordContainer">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Ingresa tu contraseña"
                onChange={(e) => setPassword(e.target.value)} />
              <button className="togglePasswordButton" onClick={() => setShowPassword(!showPassword)}>
                <img src={showPassword ? eyeOpen : eyeClosed} alt="Toggle Password Visibility" />
              </button>
            </div>
          {passwordError && <label className="errorLabel">{passwordError}</label>}
        </div>
        <br />
        <a className="forgot" href="/password-reset">¿Olvidaste tu contraseña?</a>
        <br />
        <div className="buttonGroup">
          <input className="inputButton" type="button" onClick={handleLogin} value="Iniciar Sesión" />
          <input className="inputButton" type="button" onClick={handleSignUp} value="Registrarse" />
        </div>
      </div>
    </>

  );
};
