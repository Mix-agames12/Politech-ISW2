import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { HeaderHome } from './HeaderHome'; // Asegúrate de tener este componente
import { collection, query, where, getDocs } from 'firebase/firestore'; // Importa Firestore
import { FaArrowLeft } from 'react-icons/fa';

const Alerta = React.forwardRef(function Alerta(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    // Validar la estructura del correo electrónico
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return emailRegex.test(email);
  };

  const checkEmailExistsAndVerified = async (email) => {
    const usersCollection = collection(db, 'users');
    const emailQuery = query(usersCollection, where('correo', '==', email));
    const emailSnapshot = await getDocs(emailQuery);
  
    if (emailSnapshot.empty) {
      console.log("No existe el correo en la base de datos");
      return { exists: false, verified: false };
    }
  
    const userDoc = emailSnapshot.docs[0].data();
    console.log("Usuario encontrado:", userDoc);
    console.log("Estado de verificación:", userDoc.verified);
  
    return { exists: true, verified: userDoc.verified === true };
  };
  

  const handlePasswordReset = async () => {
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
      setError('El usuario no está verificado. Por favor verifica tu cuenta antes de restablecer la contraseña.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      console.log('Correo de restablecimiento de contraseña enviado');
      setOpen(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000); // Espera 2 segundos antes de redirigir al login
    } catch (error) {
      console.error('Error al enviar el correo de restablecimiento de contraseña:', error);
      setError('Error al enviar el correo de restablecimiento de contraseña. Por favor, inténtalo de nuevo.');
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
            <h2 className="mt-6 text-3xl font-bold text-gray-900">¿Olvidaste tu contraseña?</h2>
            <p className="mt-2 text-sm text-gray-600">
              Te enviaremos un correo para que puedas cambiar tu contraseña.
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
                onClick={handlePasswordReset}
                className="flex w-full justify-center rounded-md bg-sky-900 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-sky-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Enviar correo electrónico
              </button>
            </div>
          </div>
        </div>
        <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
          <Alerta onClose={handleClose} severity="success" sx={{ width: '100%' }}>
            ¡Correo de restablecimiento de contraseña enviado exitosamente!
          </Alerta>
        </Snackbar>
      </div>
    </>
  );
};

export default ForgotPassword;
