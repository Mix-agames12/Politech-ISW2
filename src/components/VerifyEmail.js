import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { applyActionCode } from 'firebase/auth';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { HeaderHome } from './HeaderHome';

const VerifyEmail = () => {
  const [message, setMessage] = useState('Verificación de correo electrónico');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const oobCode = queryParams.get('oobCode');
    const uid = queryParams.get('uid');

    if (oobCode && uid) {
      applyActionCode(auth, oobCode)
        .then(async () => {
          // Get the user data from tempUsers collection
          const userDoc = await db.collection('tempUsers').doc(uid).get();
          if (userDoc.exists) {
            const userData = userDoc.data();

            // Save user data to final collections
            await setDoc(doc(db, 'users', uid), {
              id: uid,
              correo: userData.correo,
              contraseña: userData.contraseña,
              username: userData.username,
            });

            await setDoc(doc(db, 'clientes', uid), {
              id: uid,
              correo: userData.correo,
              cedula: userData.cedula,
              nombre: userData.nombre,
              apellido: userData.apellido,
              fechaNacimiento: userData.fechaNacimiento,
            });

            const accountNumber = generateAccountNumber();
            await setDoc(doc(db, 'cuentas', uid), {
              id: uid,
              accountBalance: 100,
              accountNumber: accountNumber,
              accountName: userData.username,
              tipoCuenta: 'ahorros',
            });

            // Delete temp user data
            await deleteDoc(doc(db, 'tempUsers', uid));

            setMessage('¡Correo electrónico verificado exitosamente! Redirigiendo al login...');
            setTimeout(() => {
              navigate('/login');
            }, 3000);
          } else {
            setMessage('Error al verificar el correo electrónico. Por favor, inténtalo de nuevo.');
          }
        })
        .catch((error) => {
          console.error('Error al verificar el correo electrónico:', error);
          setMessage('Error al verificar el correo electrónico. Por favor, inténtalo de nuevo.');
        });
    } else {
      setMessage('Código de verificación inválido. Por favor, inténtalo de nuevo.');
    }
  }, [location.search, navigate]);

  const generateAccountNumber = () => {
    let accountNumber = '22';
    while (accountNumber.length < 10) {
      accountNumber += Math.floor(Math.random() * 10);
    }
    return accountNumber;
  };

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
