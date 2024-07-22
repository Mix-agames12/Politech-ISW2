import React, { useState } from 'react';
import { Menu, MenuItem, IconButton } from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import '../components/Header.css';
import Logo from '../assets/images/neologo.png';

export const Header = ({ firstName, lastName }) => {
    console.log('Header firstName:', firstName); // Verificar que las props se reciben
    console.log('Header lastName:', lastName);

    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate();
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleChangePassword = () => {
        navigate('/cambio-contrasena');
        handleClose();
    };

    const handleUpdateProfile = () => {
        navigate('/update-profile');
        handleClose();
    };

    if (!firstName || !lastName) {
        return null; // No renderizar el Header si los datos no están completos
    }

    return (
        <nav className="navbar navbar-expand-lg bg-body- fixed-top" style={{ backgroundColor: '#061f3e' }}>
            <div className="container-fluid d-flex justify-content-between align-items-center">
                <img src={Logo} alt="Logo Politech" width="130" height="35" style={{ padding: '0' }} />
                <div className="d-flex align-items-center">
                    <span className="navbar-text" style={{ color: 'white', marginRight: '10px' }}>
                        ¡Hola, {firstName} {lastName}!
                    </span>
                    <IconButton
                        aria-controls="simple-menu"
                        aria-haspopup="true"
                        onClick={handleClick}
                        style={{ color: 'white' }}
                    >
                        <AccountCircle />
                    </IconButton>
                    <Menu
                        id="simple-menu"
                        anchorEl={anchorEl}
                        keepMounted
                        open={open}
                        onClose={handleClose}
                    >
                        <MenuItem onClick={handleChangePassword}>Cambiar contraseña</MenuItem>
                        <MenuItem onClick={handleUpdateProfile}>Actualizar perfil</MenuItem>
                    </Menu>
                </div>
            </div>
        </nav>
    );
};
