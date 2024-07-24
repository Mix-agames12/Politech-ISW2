import React from 'react';
import { Link } from 'react-router-dom';
import '../components/Sidebar.css';
import { Header } from './Header';

export const Sidebar = () => {
  return (
    <>
      <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet' />
      <Header />
      <div className="area"></div>
      <nav className="main-menu">
        <ul>
          <li>
            <Link to="/gestionar-cuentas">
              <i className='bx bx-home'></i>
              <span className="nav-text">
                Dashboard
              </span>
            </Link>
          </li>
          <li>
            <Link to="/transaction">
              <i className='bx bx-transfer'></i>
              <span className="nav-text">
                Transferencias
              </span>
            </Link>
          </li>
          <li>
            <Link to="/movimientos">
              <i className='bx bx-calendar'></i>
              <span className="nav-text">
                Movimientos
              </span>
            </Link>
          </li>
        </ul>
        <ul className="logout">
          <li>
            <Link to="/login">
              <i className='bx bx-power-off'></i>
              <span className="nav-text">
                Logout
              </span>
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}