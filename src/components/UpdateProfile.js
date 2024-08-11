import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';

import { updatePassword, updateProfile } from 'firebase/auth';
import { FaRegEye, FaRegEyeSlash, FaArrowLeft } from 'react-icons/fa';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Sidebar } from '../components/Sidebar';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate
import { HeaderDashboard } from './HeaderDashboard';

const UpdateProfile = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [client, setClient] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(true);
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

    setPasswordConditions({ length, uppercase, number, specialChar });
    setPassword(password);
  };

  const handleConfirmPassword = (value) => {
    setConfirmPassword(value);
    setPasswordsMatch(value === password);
  };

  const handleUpdate = async () => {
    setError('');
    setSuccess('');
    const currentUser = auth.currentUser;

    let usernameChanged = false;
    let passwordChanged = false;

    if (currentUser) {
      try {
        if (username && username !== user.username) {
          await updateProfile(currentUser, { displayName: username });
          await updateDoc(doc(db, 'users', currentUser.uid), { username });
          usernameChanged = true;
          setSuccess('Nombre de usuario actualizado correctamente');
        }
        if (password) {
          if (password !== confirmPassword) {
            setError('Debes colocar la misma contraseña en ambos campos')
            return;
          }
          await updatePassword(currentUser, password);
          passwordChanged = true;
          setSuccess('Contraseña actualizada correctamente');
        }
        if (usernameChanged && passwordChanged) {
          setSuccess('Datos actualizados correctamente');
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
      <HeaderDashboard />
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
                <h3 className="w-full px-4 py-2">{client.nombre} {client.apellido}</h3>
              </div>
              <div className="mb-4">
                <label className="block text-sm fclientmedium text-gray-700 mb-2">Cédula</label>
                <h3 className="w-full px-4 py-2">{client.cedula}</h3>
              </div>
              <div>
                <label className="block text-sm fclientmedium text-gray-700 mb-2">Fecha de nacimiento</label>
                <h3 className="w-full px-4 py-2">{client.fechaNacimiento}</h3>
              </div>
            </div>

            <h2 className="mb-4 text-black font-bold text-lg">Mantén actualizada tu información</h2>
            <div className="border border-gray-300 rounded-md p-4 mb-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de usuario</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder={user.username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2  gap-3 ">
                <label className=" block text-sm font-medium text-gray-700">Nueva contraseña</label>
                <label className=" block text-sm font-medium text-gray-700">Nueva contraseña</label>
                <div className="flex items-center relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => validatePassword(e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Contraseña"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-0 pr-3 flex items-center top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                  </button>
                </div>
                
                <div className="flex items-center relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => handleConfirmPassword(e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="Repetir contraseña"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-0 pr-3 flex items-center top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                  </button>
                </div>
                <div className="col-span-2 mt-2 mb-4">
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

              </div>
              {!passwordsMatch && <p className="my-2 text-sm text-red-600">Las contraseñas no coinciden</p>}
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
