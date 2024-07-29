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
  const [editableUsername, editUsername] = useState(true); // Estado para editar nombre de usuario
  const [editableMail, editMail] = useState(true); // Estado para editar correo electronico


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
          setName(userData. || '');
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
          placeholder="Nombre"
          disabled="true"
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="inputContainer">
        <label>Apellido</label>
        <input
          type="text"
          className="inputBox"
          placeholder="Nombre"
          disabled="true"
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="inputContainer">
        <label>Cédula</label>
        <input
          type="text"
          className="inputBox"
          placeholder="Cédula"
          disabled="true"
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="inputContainer">
        <label>Fecha de nacimiento</label>
        <input
          type="text"
          className="inputBox"
          placeholder="Fecha de nacimiento"
          disabled="true"
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="inputContainer">
        <label>Nombre de usuario</label>
        <input
          type="text"
          className="inputBox"
          placeholder="Nombre de usuario"
          disabled={editableUsername}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={() => editUsername(!editableUsername)}>
          <img src={edit} />
        </button>
      </div>
      <div className="inputContainer">
        <label>Correo Electrónico</label>
        <input
          type="email"
          className="inputBox"
          placeholder="Correo Electrónico"
          disabled={editableMail}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={() => editMail(!editableMail)}>
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
