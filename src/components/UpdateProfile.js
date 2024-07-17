// src/components/UpdateProfile.js
import React, { useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { updateEmail, updatePassword, updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { Sidebar } from '../components/Sidebar';
import './UpdateProfile.css';

const UpdateProfile = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleUpdate = async () => {
        setError('');
        setSuccess('');
        const user = auth.currentUser;
        if (user) {
            try {
                if (name) {
                    await updateProfile(user, { displayName: name });
                    await updateDoc(doc(db, 'users', user.uid), { name: name });
                }
                if (email) {
                    await updateEmail(user, email);
                    await updateDoc(doc(db, 'users', user.uid), { email: email });
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

    return (
        <div className="mainContainer">
            <div className='sidebar'>
                <Sidebar />
            </div>
            <div className="titleContainer">
                <h2>Actualizar Perfil</h2>
            </div>
            <div className="inputContainer">
                <label>Nombre</label>
                <input
                    type="text"
                    className="inputBox"
                    placeholder="Nombre"
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            <div className="inputContainer">
                <label>Correo Electrónico</label>
                <input
                    type="email"
                    className="inputBox"
                    placeholder="Correo Electrónico"
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="inputContainer">
                <label>Contraseña</label>
                <input
                    type="password"
                    className="inputBox"
                    placeholder="Contraseña"
                    onChange={(e) => setPassword(e.target.value)}
                />
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
