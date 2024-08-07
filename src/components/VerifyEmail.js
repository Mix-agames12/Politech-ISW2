import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { applyActionCode } from 'firebase/auth';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { HeaderHome } from './HeaderHome';

const VerifyEmail = () => {
  const [message, setMessage] = useState('Verificación de correo electrónico');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const oobCode = queryParams.get('oobCode'); // Código de verificación
    const uid = queryParams.get('uid'); // ID del usuario

    const verifyEmail = async () => {
      if (oobCode && uid) {
        try {
          console.log('Código de verificación recibido:', oobCode);
          console.log('UID recibido:', uid);

          await applyActionCode(auth, oobCode);
          console.log('Código de acción aplicado:', oobCode);

          const userDoc = await getDoc(doc(db, 'users', uid));
          if (userDoc.exists()) {
            console.log('Documento del usuario encontrado:', userDoc.data());

            await updateDoc(doc(db, 'users', uid), {
              verified: true,
            });

            console.log('Estado de verificación actualizado a true para:', uid);
            setMessage('¡Correo electrónico verificado exitosamente! Redirigiendo al login...');
            setTimeout(() => {
              navigate('/login');
            }, 3000);
          } else {
            setMessage('Error al verificar el correo electrónico. Por favor, inténtalo de nuevo.');
            console.log('No se encontró el documento del usuario:', uid);
          }
        } catch (error) {
          console.error('Error al verificar el correo electrónico:', error);
          setMessage('Error al verificar el correo electrónico. Por favor, inténtalo de nuevo.');
        }
      } else {
        setMessage('Código de verificación inválido. Por favor, inténtalo de nuevo.');
      }
    };

    verifyEmail();
  }, [location.search, navigate]);

  return (
    <>
      <HeaderHome />
      <div className="min-w-full min-h-screen absolute flex items-center justify-center bg-gray-100">
        <div className="w-full max-w-xl mx-auto flex flex-col items-center p-10 my-10 bg-white shadow-lg rounded-lg">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">{message}</h2>
        </div>
      </div>
    </>
  );
};

export default VerifyEmail;
