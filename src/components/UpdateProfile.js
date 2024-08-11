import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';

import { updateEmail, updatePassword, updateProfile, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';

import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Sidebar } from '../components/Sidebar';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate
import { HeaderDashboard } from './HeaderDashboard';

const UpdateProfile = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [client, setClient] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Usar useNavigate
  const [passwordConditions, setPasswordConditions] = useState({
    length: false,
    uppercase: false,
    number: false,
    specialChar: false,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        navigate('/login');
        return;
      }

      try {
        const clientDoc = await getDoc(doc(db, 'clientes', currentUser.uid));
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));

        if (clientDoc.exists() && userDoc.exists()) {
          const clientData = clientDoc.data();
          const userData = userDoc.data();

          setClient(clientData);
          setUser(userData);
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const validatePassword = (password) => {
    const length = password.length >= 8;
    const uppercase = /[A-Z]/.test(password);
    const number = /[0-9]/.test(password);
    const specialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const isValid = length && uppercase && number && specialChar;

    setPasswordConditions({ length, uppercase, number, specialChar });
    setPassword(password);
    return isValid;
  };

  const reauthenticateUser = async (currentUser, password) => {
    const credential = EmailAuthProvider.credential(currentUser.email, password);
    try {
      await reauthenticateWithCredential(currentUser, credential);
    } catch (error) {
      setError('Reautenticación fallida. Por favor, intenta de nuevo.');
    }
  };

  const handleUpdate = async () => {
    setError('');
    setSuccess('');
    const currentUser = auth.currentUser;

    let changesMade = false;

    if (currentUser) {
      try {
        if (email && email !== user.correo) {
          await reauthenticateUser(currentUser, password);
          await updateEmail(currentUser, email);
          await updateDoc(doc(db, 'clientes', currentUser.uid), { correo: email });
          await updateDoc(doc(db, 'users', currentUser.uid), { correo: email });
          changesMade = true;
        }
        if (username && username !== user.username) {
          await updateProfile(currentUser, { displayName: username });
          await updateDoc(doc(db, 'users', currentUser.uid), { username });
          changesMade = true;
        }
        if (password) {
          if (!validatePassword(password)) {
            setError('La contraseña no cumple con los requisitos.');
            return;
          }
          await updatePassword(currentUser, password);
          changesMade = true;
        }
        if (changesMade) {
          setSuccess('Perfil actualizado correctamente');
        }
      } catch (error) {
        setError('Error al actualizar el perfil. Por favor, intenta de nuevo.');
        console.error('Error updating profile:', error);
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen flex">
      <HeaderDashboard/>
      <div className="flex flex-grow w-full">
        <div className="w-1/4">
          <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        </div>
        <div className="mx-auto flex flex-col items-center justify-end w-2/5 bg-gray-100">
            <div className="w-full p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">MI PERFIL</h2>
              </div>
              <h2 className="mb-4 text-black font-bold text-lg">Información personal</h2>
              <div className="border border-gray-300 rounded-md p-4 mb-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                <h3 className="w-full px-4 py-2">{ client.nombre } { client.apellido }</h3>
                </div>
                <div className="mb-4">
                  <label className="block text-sm fclientmedium text-gray-700 mb-2">Cédula</label>
                <h3 className="w-full px-4 py-2">{ client.cedula }</h3>
                </div>
                <div>
                  <label className="block text-sm fclientmedium text-gray-700 mb-2">Fecha de nacimiento</label>
                <h3 className="w-full px-4 py-2">{ client.fechaNacimiento }</h3>
                </div>
              </div>

              <h2 className="mb-4 text-black font-bold text-lg">Mantén actualizada tu información</h2>
              <div className="border border-gray-300 rounded-md p-4 mb-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de usuario</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder = { user.username }
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder = { user.correo }
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder = "Ingresa una nueva contraseña"
                    onChange={(e) => validatePassword(e.target.value)}
                  />
                </div>
                {error && <label className="block text-red-600 mb-4">{error}</label>}
                {success && <label className="block text-green-600 mb-4 text-center">{success}</label>}
                <div className="text-center">
                  <input
                    className="bg-sky-900 text-white px-4 py-2 rounded-md shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    type="button"
                    onClick={handleUpdate}
                    value="Actualizar datos"
                  />
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;
