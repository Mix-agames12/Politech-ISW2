import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { updateEmail, updatePassword, updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate
import './UpdateProfile.css';
import edit from '../assets/images/edit.png'; // Ruta a tu imagen

const UpdateProfile = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Usar useNavigate
  const [editableUsername, setEditableUsername] = useState(true); // Estado para editar nombre de usuario
  const [editableMail, setEditableMail] = useState(true); // Estado para editar correo electrónico


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
          setUser(userData);
          setName(userData.nombre || '');
          setEmail(userData.correo || '');
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
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        if (email) {
          await updateEmail(currentUser, email);
          await updateDoc(doc(db, 'clientes', currentUser.uid), { correo: email });
        }
        if (password) {
          await updatePassword(currentUser, password);
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
    <div className="mainContainer">
      {user && (
        <Header firstName={user.nombre} lastName={user.apellido} />
      )}
      <div className='sidebar'>
        <Sidebar />
      </div>
      <div className="titleContainer">
        <h2>DATOS PERSONALES</h2>
      </div>
      <div className="inputContainer">
        <label>Nombre</label>
        <input
          type="text"
          className="inputBox"
          disabled="true"
          value={user.nombre}
        />
      </div>
      <div className="inputContainer">
        <label>Apellido</label>
        <input
          type="text"
          className="inputBox"
          disabled="true"
          value={user.apellido}
        />
      </div>
      <div className="inputContainer">
        <label>Cédula</label>
        <input
          type="text"
          className="inputBox"
          disabled="true"
          value={user.cedula}
        />
      </div>
      <div className="inputContainer">
        <label>Fecha de nacimiento</label>
        <input
          type="date"
          className="inputBox"
          disabled="true"
          value={user.fechaNacimiento}
        />
      </div>
      <div className="inputContainer">
        <label>Nombre de usuario</label>
        <input
          type="text"
          className="inputBox"
          disabled={editableUsername}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={() => setEditableUsername(!editableUsername)}>
          <img src={edit} alt="Edit"/>
        </button>
      </div>
      <div className="inputContainer">
        <label>Correo Electrónico</label>
        <input
          type="email"
          className="inputBox"
          placeholder={user.correo}
          disabled={editableMail}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={() => setEditableMail(!editableMail)}>
          <img src={edit} />
        </button>
      </div>
      {error && <label className="errorLabel">{error}</label>}
      {success && <label className="successLabel">{success}</label>}
      <div className="buttonContainer">
        <input className="inputButton" type="button" onClick={handleUpdate} value="Actualizar Perfil" />
      </div>
    </div>
  );
};

export default UpdateProfile;
