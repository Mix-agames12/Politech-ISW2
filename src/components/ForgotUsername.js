import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { HeaderHome } from './HeaderHome';
import { FaArrowLeft } from 'react-icons/fa';

const Alerta = React.forwardRef(function Alerta(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const ForgotUsername = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [isCodeSent, setIsCodeSent] = useState(false); // Estado para saber si se ha enviado el código
  const [verificationCode, setVerificationCode] = useState(''); // Estado para almacenar el código de verificación
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return emailRegex.test(email);
  };

  const sendVerificationCode = () => {
    setError('');

    if (!validateEmail(email)) {
      setError('Por favor, ingresa un correo electrónico válido.');
      return;
    }

    // Simula el envío del código y activa el campo de validación
    setIsCodeSent(true);
    setError('');
    setOpen(true);
  };

  const handleVerificationCodeChange = (e) => {
    setVerificationCode(e.target.value);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const validateCode = () => {
    // Simula la validación del código y redirige a la interfaz de cambio de nombre de usuario
    if (verificationCode === "481530") {  // Ejemplo de validación, reemplaza esto con tu lógica
      navigate('/change-username'); // Redirige a la página para cambiar el nombre de usuario
    } else {
      setError('Código de verificación incorrecto.');
    }
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
                onClick={sendVerificationCode}
                className="flex w-full justify-center rounded-md bg-sky-900 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-sky-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Enviar correo electrónico
              </button>
            </div>
            {isCodeSent && (
              <div className="mt-6 w-full">
                <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">
                  Ingresa el código de verificación:
                </label>
                <div className="mt-1 flex">
                  <input
                    id="verificationCode"
                    name="verificationCode"
                    type="text"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-l-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                    placeholder="Código de verificación"
                    onChange={handleVerificationCodeChange}
                  />
                  <button
                    onClick={validateCode}
                    className="flex justify-center rounded-r-md bg-sky-900 px-3 py-2 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-sky-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
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
            ¡Campo de verificación activado!
          </Alerta>
        </Snackbar>
      </div>
    </>
  );
};

export default ForgotUsername;


