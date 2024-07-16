// src/components/PasswordReset.js
import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';

const PasswordReset = () => {
    const [email, setEmail] = useState('');

    const handlePasswordReset = async () => {
        try {
            await sendPasswordResetEmail(auth, email);
            console.log('Password reset email sent');
        } catch (error) {
            console.error('Error sending password reset email:', error);
        }
    };

    return (
        <div className="container">
            <h2>Reset Password</h2>
            <div className="form-group">
                <label>Email</label>
                <input
                    type="email"
                    className="form-control"
                    placeholder="Email"
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <button className="btn btn-primary" onClick={handlePasswordReset}>Reset Password</button>
        </div>
    );
};

export default PasswordReset;
