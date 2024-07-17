import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';
import './PasswordReset.css';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { useNavigate } from 'react-router-dom';

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const PasswordReset = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const handlePasswordReset = async () => {
        setError('');
        try {
            await sendPasswordResetEmail(auth, email);
            console.log('Password reset email sent');
            setOpen(true);
            setTimeout(() => {
                navigate('/login');
            }, 2000); // Espera 3 segundos antes de redirigir al login
        } catch (error) {
            console.error('Error sending password reset email:', error);
            setError('Error sending password reset email. Please try again.');
        }
    };

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };

    return (
        <div className="mainContainer">
            <div className="titleContainer">
                <h2>Reset Password</h2>
            </div>
            <div className="inputContainer">
                <label>Email</label>
                <input
                    type="email"
                    className="inputBox"
                    placeholder="Email"
                    onChange={(e) => setEmail(e.target.value)}
                />
                {error && <label className="errorLabel">{error}</label>}
            </div>
            <div className="buttonContainer">
                <input className="inputButton" type="button" onClick={handlePasswordReset} value="Reset Password" />
            </div>
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
                <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
                    Password reset email sent successfully!
                </Alert>
            </Snackbar>
        </div>
    );
};

export default PasswordReset;
