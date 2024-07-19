import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';
import './PasswordReset.css';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { HeaderPrincipal } from '../components/HeaderPrincipal';

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
      }, 2000); // Espera 3 segundos antes de redirigir al login
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
    <div className="mainContainer">
      <HeaderPrincipal />
      <div className="titleContainer">
        <h2>Restablecer Contraseña</h2>
      </div>
      <div className="inputContainer">
        <label>Correo Electrónico</label>
        <input
          type="email"
          className="inputBox"
          placeholder="Correo Electrónico"
          onChange={(e) => setEmail(e.target.value)}
        />
        {error && <label className="errorLabel">{error}</label>}
      </div>
      <div className="buttonContainer">
        <input className="inputButton" type="button" onClick={manejarRestablecimientoContrasena} value="Restablecer Contraseña" />
      </div>
      <Snackbar open={open} autoHideDuration={6000} onClose={manejarCerrar}>
        <Alerta onClose={manejarCerrar} severity="success" sx={{ width: '100%' }}>
          ¡Correo de restablecimiento de contraseña enviado exitosamente!
        </Alerta>
      </Snackbar>
    </div>
  );
};

export default RestablecerContrasena;
