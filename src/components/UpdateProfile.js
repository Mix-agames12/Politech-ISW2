// src/components/UpdateProfile.js
import React, { useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { updateEmail, updatePassword, updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';

const UpdateProfile = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleUpdate = async () => {
        const user = auth.currentUser;
        if (user) {
            if (name) {
                await updateProfile(user, { displayName: name });
                await updateDoc(doc(db, 'clientes', user.uid), { nombre: name });
            }
            if (email) {
                await updateEmail(user, email);
                await updateDoc(doc(db, 'clientes', user.uid), { correo_electronico: email });
            }
            if (password) {
                await updatePassword(user, password);
            }
            console.log('Profile updated');
        }
    };

    return (
        <div className="container">
            <h2>Update Profile</h2>
            <div className="form-group">
                <label>Name</label>
                <input
                    type="text"
                    className="form-control"
                    placeholder="Name"
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            <div className="form-group">
                <label>Email</label>
                <input
                    type="email"
                    className="form-control"
                    placeholder="Email"
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div className="form-group">
                <label>Password</label>
                <input
                    type="password"
                    className="form-control"
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            <button className="btn btn-primary" onClick={handleUpdate}>Update Profile</button>
        </div>
    );
};

export default UpdateProfile;
