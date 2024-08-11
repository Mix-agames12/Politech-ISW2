import React, { useEffect } from 'react';
import { auth, db } from '../firebaseConfig'; // Asegúrate de exportar `db` desde `firebaseConfig`
import { useLocation, useNavigate } from 'react-router-dom';
import { applyActionCode } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore'; // Importar para actualizar Firestore
import { HeaderHome } from './HeaderHome';
import Buho from '../assets/images/buho.png';

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const actionCode = queryParams.get('oobCode'); // Usar el parámetro correcto para la acción de verificación

    if (actionCode) {
      applyActionCode(auth, actionCode) // Verifica el correo electrónico
        .then(() => {
          // Email verified successfully
          console.log('Correo electrónico verificado');

          // Obtener el usuario actual y actualizar el campo `verified` en Firestore
          const user = auth.currentUser;
          if (user) {
            const userRef = doc(db, 'users', user.uid); // Referencia al documento del usuario en Firestore
            updateDoc(userRef, { verified: true })
              .then(() => {
                console.log('Campo verified actualizado a true en Firestore');
                navigate('/login');
              })
              .catch((error) => {
                console.error('Error al actualizar el campo verified:', error);
                navigate('/login');
              });
          } else {
            navigate('/login');
          }
        })
        .catch((error) => {
          console.error('Error al verificar el correo electrónico:', error);
          navigate('/login');
        });
    } else {
      navigate('/login');
    }
  }, [location.search, navigate]);

  return (
    <>
      <HeaderHome />
      <div className="min-w-full min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-full max-w-md mx-auto flex flex-col items-center py-5 bg-white shadow-lg rounded-lg">
          <img className="mx-auto h-10 w-auto" src={Buho} alt="Your Company" />
          <h2 className="mt-5 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">Verificación de Correo</h2>
          <p className="mt-2 mb-6 text-center text-sm text-gray-600">Estamos verificando tu correo electrónico. Por favor, espera...</p>
        </div>
      </div>
    </>
  );
};

export default VerifyEmail;
