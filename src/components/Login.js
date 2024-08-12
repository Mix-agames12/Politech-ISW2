import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import Buho from '../assets/images/buho.png';
import EyeOpenIcon from '../assets/images/eye-open.png';
import EyeClosedIcon from '../assets/images/eye-closed.png';
import { HeaderLogin } from './HeaderLogin';
import { AuthContext } from '../context/AuthContext';
import Footer from './Footer';

const Login = (props) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordInputTouched, setPasswordInputTouched] = useState(false);
  const navigate = useNavigate();
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { setUser } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();

    // Validaciones básicas
    if (!username) {
      setUsernameError('Por favor, ingresa tu nombre de usuario');
      return;
    }

    if (!password) {
      setPasswordError('Por favor, ingresa una contraseña');
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
      const userData = userDoc.data();
      const userEmail = userData.correo;

      if (!userData.verified) {
        setUsernameError('Esta cuenta no ha sido verificada. Por favor, verifica tu correo electrónico.');
        return;
      }

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
      console.error('Error al iniciar sesión:', error);
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
          <img className="h-12 w-auto mb-6" src={Buho} alt="Your Company" />
          <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 mb-6">
            Inicio de Sesión
          </h2>
          <form className="space-y-6 w-full" onSubmit={handleLogin}>
            <div className="relative">
              <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-900">
                Nombre de usuario
              </label>
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
              <Link to="/forgot-username" className="text-sm font-semibold text-sky-500 hover:text-indigo-500 absolute right-0 mt-1">
                ¿Olvidaste tu usuario?
              </Link>
            </div>

            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(ev) => {
                    setPassword(ev.target.value);
                    setPasswordInputTouched(true);
                  }}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Ingresa tu contraseña"
                  required
                />
                {passwordInputTouched && (
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <img
                      src={showPassword ? EyeOpenIcon : EyeClosedIcon}
                      alt="Toggle Password Visibility"
                      className="h-5 w-5"
                    />
                  </button>
                )}
              </div>
              {passwordError && <p className="mt-2 text-sm text-red-600">{passwordError}</p>}
              <Link to="/forgot-password" className="text-sm font-semibold text-sky-500 hover:text-indigo-500 absolute right-0 mt-1">
                ¿Olvidaste tu contraseña?
              </Link>
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
            <Link to="/SignUp" className="font-semibold leading-6 text-sky-500 hover:text-indigo-500">
              Registrarse
            </Link>
          </p>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Login;
