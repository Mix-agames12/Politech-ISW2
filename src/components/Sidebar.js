import React from 'react';
import '../components/Sidebar.css';
// import { neologo } from 'src\assets\images\neologo.png';

export const Sidebar = () => {
return  (
    <>
        <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'/>
        <div class="area"></div>
        <nav class="main-menu">
            <ul>
            <li>
                <a href="https://facebook.com">
                {/* <img src={neologo} alt="logo"/> */}
                </a>
            </li>
            <li>
                <a href="https://facebook.com">
                <i class='bx bx-home'></i>
                <span class="nav-text">
                    Dashboard
                </span>
                </a>
            </li>
            <li>
                <a href="https://jbfarrow.com">
                <i class='bx bx-transfer'></i>
                <span class="nav-text">
                    Transferencias
                </span>
                </a>
            </li>
            <li>
                <a href="https://jbfarrow.com">
                <i class='bx bx-calendar'></i>
                <span class="nav-text">
                    Movimientos
                </span>
                </a>
            </li>
            </ul>

            <ul class="logout">
            <li>
                <a href="#">
                <i class='bx bx-power-off'></i>
                <span class="nav-text">
                    Logout
                </span>
                </a>
            </li>
            </ul>
        </nav>
    </>
    );
}