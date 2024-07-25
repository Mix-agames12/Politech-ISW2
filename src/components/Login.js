// src/components/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { HeaderDashboard } from './HeaderDashboard';
import Buho from '../assets/images/buho.png';

export const Login = (props) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');

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

  // const handleSignUp = () => {
  //   navigate('/SignUp');
  // };

  return (
    <>
      <HeaderDashboard />
      <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img className="mx-auto h-10 w-auto" 
          src={Buho}
          alt="Your Company" />
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Inicio de Sesión</h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">Nombre de usuario</label>
              <div className="mt-2">
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={username}
                  onChange={(ev) => setUsername(ev.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Ingresa tu nombre de usuario"
                  required
                />
                {usernameError && <p className="mt-2 text-sm text-red-600">{usernameError}</p>}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">Contraseña</label>
                <div className="text-sm">
                  <a href="/password-reset" className="font-semibold text-indigo-600 hover:text-indigo-500">¿Olvidaste tu contraseña?</a>
                </div>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(ev) => setPassword(ev.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Ingresa tu contraseña"
                  required
                />
                {passwordError && <p className="mt-2 text-sm text-red-600">{passwordError}</p>}
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Iniciar Sesión
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm text-gray-500">
            ¿No tienes una cuenta?{' '}
            <a href="/SignUp" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">Registrarse</a>
          </p>
        </div>
      </div>
    </>
  );
};

