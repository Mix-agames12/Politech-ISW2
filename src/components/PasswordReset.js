import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { HeaderHome } from './HeaderHome'; // Importa de la forma correcta

const Alerta = React.forwardRef(function Alerta(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const RestablecerContrasena = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const manejarRestablecimientoContrasena = async () => {
    setError('');
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

  const manejarCerrar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  return (
    <>
      <HeaderHome />
      <div className="min-w-full min-h-screen absolute flex-col items-center justify-center bg-gray-100">
        <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center p-10 my-10 bg-white shadow-lg rounded-lg">
          <div className="text-center mb-6">
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Restablecer Contraseña</h2>
          </div>
          <div className="space-y-6 w-full">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo Electrónico
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
                onClick={manejarRestablecimientoContrasena}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
              >
                Restablecer Contraseña
              </button>
            </div>
          </div>
        </div>
        <Snackbar open={open} autoHideDuration={6000} onClose={manejarCerrar}>
          <Alerta onClose={manejarCerrar} severity="success" sx={{ width: '100%' }}>
            ¡Correo de restablecimiento de contraseña enviado exitosamente!
          </Alerta>
        </Snackbar>
      </div>
    </>
  );
};

export default RestablecerContrasena;
