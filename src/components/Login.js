// src/components/Login.js
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import Buho from '../assets/images/buho.png';
import EyeOpenIcon from '../assets/images/eye-open.png';
import EyeClosedIcon from '../assets/images/eye-closed.png';
import { HeaderLogin } from './HeaderLogin';
import { AuthContext } from '../context/AuthContext';
import  Footer from './Footer';

const Login = (props) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { setUser } = useContext(AuthContext);

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
      await setPersistence(auth, browserLocalPersistence);

      const usersCollection = collection(db, 'users');
      const userQuery = query(usersCollection, where('username', '==', username));
      const userSnapshot = await getDocs(userQuery);

      if (userSnapshot.empty) {
        setUsernameError('No se encontró ningún usuario con este nombre de usuario');
        return;
      }

      const userDoc = userSnapshot.docs[0];
      const userEmail = userDoc.data().correo;

      const userCredential = await signInWithEmailAndPassword(auth, userEmail, password);
      const firebaseUser = userCredential.user;

      const clientDoc = await getDoc(doc(db, 'clientes', firebaseUser.uid));
      if (clientDoc.exists()) {
        const clientData = clientDoc.data();
        setUser({ ...firebaseUser, ...clientData });
      } else {
        setUser(firebaseUser);
      }

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

  return (
    <>
      <HeaderLogin />
      <div className="min-w-full min-h-screen absolute flex-col items-center justify-center bg-gray-100">
        <div className="w-full max-w-sm mx-auto flex flex-col items-center p-5 my-28 bg-white shadow-lg rounded-lg">
          <img className="h-20 w-auto mb-6" src={Buho} alt="Your Company" />
          <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 mb-6">
            Inicio de Sesión
          </h2>
          <form className="space-y-6 w-full" onSubmit={handleLogin}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">
                Nombre de usuario
              </label>
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
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                  Contraseña
                </label>
                <div className="text-sm">
                  <a href="/password-reset" className="font-semibold text-sky-500 hover:text-indigo-500">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
              </div>
              <div className="mt-2 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(ev) => setPassword(ev.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Ingresa tu contraseña"
                  required
                />
                {password && (
                  <img
                    src={showPassword ? EyeOpenIcon : EyeClosedIcon}
                    alt={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-5 transform -translate-y-1/2 cursor-pointer"
                    style={{ height: '24px', width: '24px' }}
                  />
                )}
                {passwordError && <p className="mt-2 text-sm text-red-600">{passwordError}</p>}
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-sky-900 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-sky-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Iniciar Sesión
              </button>
            </div>
          </form>

          <p className="mt-10 text-center text-sm text-gray-500">
            ¿No tienes una cuenta?{' '}
            <a href="/SignUp" className="font-semibold leading-6 text-sky-500 hover:text-indigo-500">
              Registrarse
            </a>
          </p>
        </div>
        <Footer />
      </div>
      
    </>
  );  
};
export default Login;
