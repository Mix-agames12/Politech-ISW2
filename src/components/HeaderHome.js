import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/Header.css';
import Logo from '../assets/images/neologo.png';

export const HeaderPrincipal2 = () => {
    const navigate = useNavigate();

    const handleLoginClick = () => {
        navigate('/login');
    };

    const handleSignUpClick = () => {
        navigate('/signup');
    };

    const handleContactClick = () => {
        navigate('');
    };

    return (
        <nav className="navbar navbar-expand-lg bg-body- fixed-top" style={{ backgroundColor: '#061f3e' }}>
            <div className="container-fluid d-flex justify-content-between align-items-center">
                <img src={Logo} alt="Logo Politech" width="130" height="35" style={{ padding: '0' }} />
                { <div className="d-flex">
                    <button className="btn btn-light me-2" onClick={handleContactClick}>
                        Contactenos
                    </button>
                    <button className="btn btn-light me-2" onClick={handleLoginClick}>
                        Iniciar Sesión
                    </button>
                    <button className="btn btn-primary" onClick={handleSignUpClick}>
                        Regístrate
                    </button>
                </div> }
            </div>
        </nav>
    );
};