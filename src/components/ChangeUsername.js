import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { HeaderHome } from './HeaderHome';
import { FaArrowLeft } from 'react-icons/fa';

const Alerta = React.forwardRef(function Alerta(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const ChangeUsername = () => {
  const [newUsername, setNewUsername] = useState('');
  const [confirmUsername, setConfirmUsername] = useState('');
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleChangeUsername = async () => {
    setError('');

    if (!newUsername || !confirmUsername) {
      setError('Ambos campos son obligatorios.');
      return;
    }

    if (newUsername !== confirmUsername) {
      setError('Los nombres de usuario no coinciden.');
      return;
    }

    try {
      const email = localStorage.getItem('email'); // Recuperar el correo almacenado

      if (!email) {
        throw new Error('Correo no encontrado');
      }

      const response = await fetch('https://politech-isw2.onrender.com/users/reset-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newUsername }),
      });

      if (response.ok) {
        setOpen(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.message || 'Error al cambiar el nombre de usuario. Inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Error al cambiar el nombre de usuario:', error);
      setError('Error al cambiar el nombre de usuario. Por favor, inténtalo de nuevo.');
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
            onClick={() => navigate('/forgot-username')}
            className="absolute top-4 left-4 flex items-center text-sky-900 hover:text-sky-600 z-50"
          >
            <FaArrowLeft className="mr-2" />
            Volver
          </button>
          <div className="text-center mb-6">
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Cambiar Nombre de Usuario</h2>
            <p className="mt-2 text-sm text-gray-600">
              Ingresa tu nuevo nombre de usuario y confírmalo.
            </p>
          </div>
          <div className="space-y-6 w-full">
            <div>
              <label htmlFor="newUsername" className="block text-sm font-medium text-gray-700">
                Nuevo Nombre de Usuario:
              </label>
              <div className="mt-1">
                <input
                  id="newUsername"
                  name="newUsername"
                  type="text"
                  autoComplete="username"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                  placeholder="Nuevo Nombre de Usuario"
                  onChange={(e) => setNewUsername(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="confirmUsername" className="block text-sm font-medium text-gray-700">
                Confirmar Nombre de Usuario:
              </label>
              <div className="mt-1">
                <input
                  id="confirmUsername"
                  name="confirmUsername"
                  type="text"
                  autoComplete="username"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                  placeholder="Confirmar Nombre de Usuario"
                  onChange={(e) => setConfirmUsername(e.target.value)}
                />
              </div>
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
            <div>
              <button
                onClick={handleChangeUsername}
                className="flex w-full justify-center rounded-md bg-sky-900 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-sky-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Cambiar Nombre de Usuario
              </button>
            </div>
          </div>
        </div>
        <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
          <Alerta onClose={handleClose} severity="success" sx={{ width: '100%' }}>
            ¡Nombre de usuario cambiado exitosamente!
          </Alerta>
        </Snackbar>
      </div>
    </>
  );
};

export default ChangeUsername;
