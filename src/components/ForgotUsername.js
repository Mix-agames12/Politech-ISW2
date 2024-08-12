import React, { useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { AuthContext } from '../context/AuthContext';
import { HeaderHome } from './HeaderHome';
import { FaArrowLeft } from 'react-icons/fa';

const Alerta = React.forwardRef(function Alerta(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const ForgotUsername = () => {
  const { user } = useContext(AuthContext);  // Contexto de autenticación, útil para manejar el usuario autenticado
  const [email, setEmail] = useState('');  // Estado para almacenar el email
  const [verificationCode, setVerificationCode] = useState('');  // Estado para almacenar el código de verificación
  const [error, setError] = useState('');  // Estado para manejar errores
  const [open, setOpen] = useState(false);  // Estado para manejar el Snackbar
  const [isCodeSent, setIsCodeSent] = useState(false);  // Estado para verificar si el código ha sido enviado
  const [isCodeVerified, setIsCodeVerified] = useState(false);  // Estado para verificar si el código ha sido validado
  const [showVerificationFields, setShowVerificationFields] = useState(false);  // Estado para mostrar el campo de verificación
  const codeInputRef = useRef(null);  // Referencia para el campo de entrada del código
  const navigate = useNavigate();  // Hook para la navegación

  // Función para enviar el código de verificación
  const sendVerificationCode = async () => {
    if (!email) {
      setError('Por favor, ingresa un correo electrónico.');
      return;
    }

    try {
      const response = await fetch('https://politech-isw2.onrender.com/users/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),  // Envía el correo electrónico al backend
      });

      const data = await response.json();
      if (data.success) {
        localStorage.setItem('sessionId', data.sessionId);  // Guarda el sessionId en el localStorage
        setIsCodeSent(true);  // Marca como que el código ha sido enviado
        setShowVerificationFields(true);  // Muestra el campo de verificación
        setError('');
        setOpen(true);  // Muestra el Snackbar
      } else {
        setError(data.message || 'No se pudo enviar el código de verificación.');
      }
    } catch (error) {
      console.error('Error al enviar el código de verificación:', error);
      setError('No se pudo enviar el código de verificación.');
      console.log(email);
    }
  };

  // Función para verificar el código de verificación
  const verifyCode = async () => {
    const sessionId = localStorage.getItem('sessionId');  // Obtén el sessionId del localStorage

    if (!sessionId || !verificationCode) {
      setError('Faltan datos para la verificación.');
      return;
    }

    try {
      const response = await fetch('https://politech-isw2.onrender.com/users/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, code: verificationCode }),  // Envía el sessionId y el código de verificación al backend
      });

      const data = await response.json();

      if (data.success) {
        setIsCodeVerified(true);
        setError('');
        navigate('/change-username');  // Redirige a la página de cambio de nombre de usuario
      } else {
        setError(data.message || 'Código incorrecto.');
      }
    } catch (error) {
      console.error('Error al verificar el código de verificación:', error);
      setError('Error al verificar el código de verificación.');
    }
  };

  // Función para cerrar el Snackbar
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
              Te enviaremos un código para que puedas cambiar tu nombre de usuario.
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
                  onChange={(e) => setEmail(e.target.value)}  // Actualiza el estado con el valor del email
                />
              </div>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
            <div>
              <button
                onClick={sendVerificationCode}  // Llama a la función para enviar el código de verificación
                className="flex w-full justify-center rounded-md bg-sky-900 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-sky-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Enviar código de verificación
              </button>
            </div>
            {showVerificationFields && (
              <div className="mt-6 w-full">
                <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">
                  Ingresa el código de verificación:
                </label>
                <div className="mt-1 flex">
                  <input
                    ref={codeInputRef}
                    id="verificationCode"
                    name="verificationCode"
                    type="text"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-l-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                    placeholder="Código de verificación"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}  // Actualiza el estado con el valor del código de verificación
                  />
                  <button
                    onClick={verifyCode}  // Llama a la función para verificar el código
                    className="ml-2 bg-sky-900 text-white px-4 py-2 rounded-r-md shadow-sm hover:bg-sky-600"
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
            ¡Código de verificación enviado con éxito!
          </Alerta>
        </Snackbar>
      </div>
    </>
  );
};

export default ForgotUsername;
