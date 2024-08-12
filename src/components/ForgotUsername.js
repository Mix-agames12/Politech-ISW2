import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { HeaderHome } from './HeaderHome';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { FaArrowLeft } from 'react-icons/fa';

const Alerta = React.forwardRef(function Alerta(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const ForgotUsername = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return emailRegex.test(email);
  };

  const checkEmailExistsAndVerified = async (email) => {
    const usersCollection = collection(db, 'users');
    const emailQuery = query(usersCollection, where('correo', '==', email));
    const emailSnapshot = await getDocs(emailQuery);

    if (emailSnapshot.empty) {
      return { exists: false, verified: false };
    }

    const userDoc = emailSnapshot.docs[0].data();
    return { exists: true, verified: userDoc.verified === true };
  };

  const sendVerificationCode = async () => {
    setError('');

    if (!validateEmail(email)) {
      setError('Por favor, ingresa un correo electrónico válido.');
      return;
    }

    const { exists, verified } = await checkEmailExistsAndVerified(email);
    if (!exists) {
      setError('El correo electrónico no está registrado.');
      return;
    }

    if (!verified) {
      setError('El usuario no está verificado. Por favor verifica tu cuenta antes de cambiar el nombre de usuario.');
      return;
    }

    try {
      // Simula el envío del código
      localStorage.setItem('email', email);  // Almacenar el correo en localStorage
      setIsCodeSent(true);
      setError('');
    } catch (error) {
      console.error('Error al enviar el código de verificación:', error);
      setError('No se pudo enviar el código de verificación.');
    }
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
      <div className="min-w-full min-h-screen absolute flex items-center justify-center bg-gray-100">
        <div className="relative w-full max-w-xl flex flex-col items-center justify-center p-10 bg-white shadow-lg rounded-lg">
          <button
            onClick={() => navigate('/login')}
            className="absolute top-4 left-4 flex items-center text-sky-900 hover:text-sky-600 z-50"
          >
            <FaArrowLeft className="mr-2" />
            Volver
          </button>
          <div className="text-center mb-6">
            <h2 className="mt-6 text-3xl font-bold text-gray-900">¿Olvidaste tu usuario?</h2>
            <p className="mt-2 text-sm text-gray-600">
              Te enviaremos un correo para que puedas cambiar tu nombre de usuario.
            </p>
          </div>
          <div className="space-y-6 w-full">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Ingresa tu correo electrónico:
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                  placeholder="Correo Electrónico"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
            <div>
              <button
                onClick={sendResetLink}
                className="flex w-full justify-center rounded-md bg-sky-900 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-sky-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Enviar correo electrónico
              </button>
            </div>
            {isCodeSent && (
              <div className="mt-4">
                <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">
                  Ingresa el código de verificación:
                </label>
                <div className="mt-1 flex">
                  <input
                    id="verificationCode"
                    name="verificationCode"
                    type="text"
                    autoComplete="off"
                    required
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                    placeholder="Código de verificación"
                  />
                  <button
                    onClick={() => navigate('/change-username')}
                    className="ml-2 bg-sky-900 text-white px-4 py-2 rounded-md shadow-sm hover:bg-sky-600"
                  >
                    Validar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
          <Alerta onClose={handleClose} severity="success" sx={{ width: '100%' }}>
            ¡Correo de cambio de nombre de usuario enviado exitosamente!
          </Alerta>
        </Snackbar>
      </div>
    </>
  );
};

export default ForgotUsername;
