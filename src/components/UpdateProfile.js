import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { updateEmail, updatePassword, updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Sidebar } from '../components/Sidebar';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate
import { HeaderDashboard } from './HeaderDashboard';

const UpdateProfile = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Usar useNavigate

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        navigate('/login');
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'clientes', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleUpdate = async () => {
    setError('');
    setSuccess('');
    const user = auth.currentUser;
    if (user) {
      try {
        if (name) {
          await updateProfile(user, { displayName: name });
          await updateDoc(doc(db, 'clientes', user.uid), { nombre: name });
        }
        if (email) {
          await updateEmail(user, email);
          await updateDoc(doc(db, 'clientes', user.uid), { correo: email });
        }
        if (password) {
          await updatePassword(user, password);
        }
        setSuccess('Perfil actualizado correctamente');
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
    <div className="min-h-screen flex flex-col">
      <HeaderDashboard />
      <Sidebar />
      <div className="flex flex-grow">
        <div className="w-1/4 bg-gray-100"></div>
        <div className="w-3/4 p-8 bg-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Actualizar Perfil</h2>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Nombre"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Correo Electrónico"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Contraseña"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <label className="block text-red-600 mb-4">{error}</label>}
          {success && <label className="block text-green-600 mb-4">{success}</label>}
          <div className="text-center">
            <input
              className="bg-indigo-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              type="button"
              onClick={handleUpdate}
              value="Actualizar Perfil"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;
