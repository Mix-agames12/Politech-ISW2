import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { updatePassword, updateProfile } from 'firebase/auth';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Sidebar } from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { HeaderDashboard } from './HeaderDashboard';

const UpdateProfile = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [client, setClient] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const navigate = useNavigate();
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
          setClient(clientDoc.data());
          setUser(userDoc.data());
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const validatePassword = (password) => {
    const conditions = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    setPasswordConditions(conditions);
    setPassword(password);
  };

  const handleConfirmPassword = (value) => {
    setConfirmPassword(value);
    setPasswordsMatch(value === password);
  };

  const handleUpdate = async () => {
    setError('');
    setSuccess('');

    if (!auth.currentUser) return;

    try {
      let updated = false;

      if (username && username !== user.username) {
        await updateProfile(auth.currentUser, { displayName: username });
        await updateDoc(doc(db, 'users', auth.currentUser.uid), { username });
        setSuccess((prev) => prev ? `${prev}, nombre de usuario actualizado` : 'Nombre de usuario actualizado');
        updated = true;
      }

      if (password && passwordsMatch) {
        await updatePassword(auth.currentUser, password);
        setSuccess((prev) => prev ? `${prev}, contraseña actualizada` : 'Contraseña actualizada');
        updated = true;
      } else if (!passwordsMatch) {
        setError('Las contraseñas no coinciden');
      }

      if (updated) {
        setSuccess('Datos actualizados correctamente');
      }
    } catch (error) {
      setError('Error al actualizar el perfil. Por favor, intenta de nuevo.');
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col mt-16">
      <HeaderDashboard />
      <div className="flex flex-grow">
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <main className="flex flex-col flex-grow items-center justify-center p-6 sm:p-10">
          {loading ? (
            <div>Cargando información del perfil...</div>
          ) : (
            <div className="w-full max-w-3xl">
              <h2 className="text-3xl font-bold text-center mb-8">MI PERFIL</h2>

              <section className="bg-white shadow-md rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4">Información personal</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <p className="px-4 py-2">{client.nombre} {client.apellido}</p>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Cédula</label>
                  <p className="px-4 py-2">{client.cedula}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha de nacimiento</label>
                  <p className="px-4 py-2">{client.fechaNacimiento}</p>
                </div>
              </section>

              <section className="bg-white shadow-md rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Mantén actualizada tu información</h3>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Nombre de usuario</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder={user.username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700">Nueva contraseña</label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => validatePassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Contraseña"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-9 transform -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                    </button>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700">Repetir contraseña</label>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => handleConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Repetir contraseña"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-9 transform -translate-y-1/2"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FaRegEye /> : <FaRegEyeSlash />}
                    </button>
                  </div>
                </div>

                <div className="my-4 text-sm text-gray-600">
                  <ul>
                    <li className={`${passwordConditions.length ? 'text-green-600' : ''}`}>
                      {passwordConditions.length ? '✔' : '✘'} Al menos 8 caracteres
                    </li>
                    <li className={`${passwordConditions.uppercase ? 'text-green-600' : ''}`}>
                      {passwordConditions.uppercase ? '✔' : '✘'} Contiene mayúsculas
                    </li>
                    <li className={`${passwordConditions.number ? 'text-green-600' : ''}`}>
                      {passwordConditions.number ? '✔' : '✘'} Contiene números
                    </li>
                    <li className={`${passwordConditions.specialChar ? 'text-green-600' : ''}`}>
                      {passwordConditions.specialChar ? '✔' : '✘'} Contiene caracteres especiales
                    </li>
                  </ul>
                </div>

                {!passwordsMatch && <p className="text-red-600">Las contraseñas no coinciden</p>}
                {error && <p className="text-red-600">{error}</p>}
                {success && <p className="text-green-600 text-center">{success}</p>}

                <div className="text-center">
                  <button
                    className="bg-sky-900 text-white px-4 py-2 rounded-md shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onClick={handleUpdate}
                  >
                    Actualizar datos
                  </button>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default UpdateProfile;
