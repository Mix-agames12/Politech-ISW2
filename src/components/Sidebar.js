import React from 'react';
import '../components/Sidebar.css';
// import { neologo } from 'src\assets\images\neologo.png';

export const Sidebar = () => {
return  (
    <>
        <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'/>
        <div Class="area"></div>
        <nav Class="main-menu">
            <ul>
            <li>
                <a href="https://facebook.com">
                {/* <img src={neologo} alt="logo"/> */}
                </a>
            </li>
            <li>
                <a href="https://facebook.com">
                <i Class='bx bx-home'></i>
                <span Class="nav-text">
                    Dashboard
                </span>
                </a>
            </li>
            <li>
                <a href="https://jbfarrow.com">
                <i Class='bx bx-transfer'></i>
                <span Class="nav-text">
                    Transferencias
                </span>
                </a>
            </li>
            <li>
                <a href="https://jbfarrow.com">
                <i Class='bx bx-calendar'></i>
                <span Class="nav-text">
                    Movimientos
                </span>
                </a>
            </li>
            </ul>

            <ul Class="logout">
            <li>
                <a href="#">
                <i Class='bx bx-power-off'></i>
                <span Class="nav-text">
                    Logout
                </span>
                </a>
            </li>
            </ul>
        </nav>
    </>
    );
}