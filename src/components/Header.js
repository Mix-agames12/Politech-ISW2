import React from 'react';
import '../components/Header.css';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Logo from '../assets/images/neologo.png';
import { verifyPasswordResetCode } from 'firebase/auth';

export const Header = () => {
    return (
        <>
            <nav className="navbar navbar-expand-lg bg-body- fixed-top" style={{ backgroundColor: '#061f3e', justifyContent: 'flex-end' }}>
                <div className="container-fluid">
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarTogglerDemo03" aria-controls="navbarTogglerDemo03" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    {/* <a className="navbar-brand" href="#">BANCO POLITECH</a> */}
                    <img src={Logo} alt="Logo Politech" width="120" height="35" style={{ padding: '3px' }} />
                    <div className="collapse navbar-collapse justify-content-end" id="navbarTogglerDemo03">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <button className="nav-link active btn btn-link" aria-current="page" style={{ color: 'white' }}>Acceso a clientes</button>
                            </li>
                            <li className="nav-item">
                                <button className="nav-link btn btn-link" style={{ color: 'white' }}>Abre una cuenta</button>
                            </li>
                        </ul>
                        {/* <form className="d-flex" role="search">
                            <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search" />
                            <button className="btn btn-outline-success" type="submit" style={{ color: 'white' }}>Search</button>
                        </form> */}
                    </div>
                </div>
            </nav>
        </>
    );
}