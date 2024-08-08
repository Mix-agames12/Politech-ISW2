import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebaseConfig';
import { confirmPasswordReset } from 'firebase/auth';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { HeaderLogin } from './HeaderLogin';
import EyeOpenIcon from '../assets/images/eye-open.png';
import EyeClosedIcon from '../assets/images/eye-closed.png';
import { FaArrowLeft } from 'react-icons/fa';

const Alerta = React.forwardRef(function Alerta(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const PasswordReset = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [open, setOpen] = useState(false);
  const [passwordConditions, setPasswordConditions] = useState({
    length: false,
    uppercase: false,
    number: false,
    specialChar: false
  });
  const navigate = useNavigate();
  const location = useLocation();

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    setPasswordConditions({
      length: password.length >= minLength,
      uppercase: hasUpperCase,
      number: hasNumbers,
      specialChar: hasSpecialChars
    });
    
    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChars;
  };

  const handlePasswordReset = async () => {
    setError('');
    setNewPasswordError('');
    setConfirmPasswordError('');

    if (!newPassword) {
      setNewPasswordError('Por favor, ingrese la nueva contraseña.');
      return;
    }
    if (!confirmPassword) {
      setConfirmPasswordError('Por favor, ingrese nuevamente la contraseña.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (!validatePassword(newPassword)) {
      setError('La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y símbolos.');
      return;
    }
    const urlParams = new URLSearchParams(location.search);
    const oobCode = urlParams.get('oobCode');
    if (oobCode && newPassword) {
      try {
        await confirmPasswordReset(auth, oobCode, newPassword);
        setOpen(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error) {
        setError('Error al restablecer la contraseña. Por favor, inténtelo de nuevo.');
      }
    } else {
      setError('El código de restablecimiento no es válido.');
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
      <HeaderLogin />
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
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Restablecer Contraseña</h2>
          </div>
          <div className="space-y-6 w-full">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                Nueva Contraseña
              </label>
              <div className="relative mt-2">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-700 focus:border-sky-500 sm:text-sm"
                  placeholder="Nueva Contraseña"
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    validatePassword(e.target.value);
                  }}
                />
                <img
                  src={showNewPassword ? EyeOpenIcon : EyeClosedIcon}
                  alt={showNewPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2 top-5 transform -translate-y-1/2 cursor-pointer"
                  style={{ height: '24px', width: '24px' }}
                />
              </div>
              {newPasswordError && <p className="mt-2 text-sm text-red-600">{newPasswordError}</p>}
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Repetir Contraseña
              </label>
              <div className="relative mt-2">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-700 focus:border-sky-500 sm:text-sm"
                  placeholder="Repetir Contraseña"
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                  }}
                />
                <img
                  src={showConfirmPassword ? EyeOpenIcon : EyeClosedIcon}
                  alt={showConfirmPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-5 transform -translate-y-1/2 cursor-pointer"
                  style={{ height: '24px', width: '24px' }}
                />
              </div>
              {confirmPasswordError && <p className="mt-2 text-sm text-red-600">{confirmPasswordError}</p>}
            </div>
            <div className="mt-4">
              <ul className="text-sm text-gray-600">
                <li className={`flex items-center ${passwordConditions.length ? 'text-green-600' : ''}`}>
                  {passwordConditions.length ? '✔' : '✘'} Al menos 8 caracteres
                </li>
                <li className={`flex items-center ${passwordConditions.uppercase ? 'text-green-600' : ''}`}>
                  {passwordConditions.uppercase ? '✔' : '✘'} Contiene mayúsculas
                </li>
                <li className={`flex items-center ${passwordConditions.number ? 'text-green-600' : ''}`}>
                  {passwordConditions.number ? '✔' : '✘'} Contiene números
                </li>
                <li className={`flex items-center ${passwordConditions.specialChar ? 'text-green-600' : ''}`}>
                  {passwordConditions.specialChar ? '✔' : '✘'} Contiene caracteres especiales
                </li>
              </ul>
            </div>
            {error && <p className="mt-2 text-sm text-red-600 text-center">{error}</p>}
            <div>
              <button
                onClick={handlePasswordReset}
                className="flex w-full justify-center rounded-md bg-sky-900 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-sky-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Restablecer Contraseña
              </button>
            </div>
          </div>
          <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
            <Alerta onClose={handleClose} severity="success" sx={{ width: '100%' }}>
              ¡Contraseña restablecida exitosamente!
            </Alerta>
          </Snackbar>
        </div>
      </div>
    </>
  );
};

export default PasswordReset;
