import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../components/Sidebar.css';

export const Sidebar = () => {
    const navigate = useNavigate();

    return (
        <>
            <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'/>
            <div className="area"></div>
            <nav className="main-menu">
                <ul>
                    <li>
                        <a href="https://facebook.com">
                            {/* <img src={neologo} alt="logo"/> */}
                        </a>
                    </li>
                    <li>
                        <a onClick={() => navigate('/gestionar-cuentas')}>
                            <i className='bx bx-home'></i>
                            <span className="nav-text">
                                Dashboard
                            </span>
                        </a>
                    </li>
                    <li>
                        <a href="https://jbfarrow.com">
                            <i className='bx bx-transfer'></i>
                            <span className="nav-text">
                                Transferencias
                            </span>
                        </a>
                    </li>
                    <li>
                        <a href="https://jbfarrow.com">
                            <i className='bx bx-calendar'></i>
                            <span className="nav-text">
                                Movimientos
                            </span>
                        </a>
                    </li>
                </ul>

                <ul className="logout">
                    <li>
                        <a onClick={() => navigate('/login')}>
                            <i className='bx bx-power-off'></i>
                            <span className="nav-text">
                                Logout
                            </span>
                        </a>
                    </li>
                </ul>
            </nav>
        </>
    );
}
