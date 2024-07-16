import React from "react";
import '../components/GestionarCuentas.css';
import { Sidebar } from "./Sidebar";

export const GestionarCuentas = () => {
    return (
        <>
            {/* <div class="navbar">
                <div class="logo">
                    <img src="assets/images/neologo.png" alt="logo" id="logo-img"/>
                        <span class="logo-text"></span>
                </div>
            </div> */}
            <div className="Sidebar">
                <Sidebar />
            </div>
            <div class="main-content">
                <h2>Mis Productos</h2>
                <h3>Cuentas de ahorros</h3>
                <div class="account-cards">
                    <div class="account-card">
                        <h4>AHO458</h4>
                        <p>2215433658</p>
                        <p>Disponible: $100</p>
                        <p>Contable: $100</p>
                    </div>
                    <div class="account-card">
                        <h4>AHO236</h4>
                        <p>22154342123</p>
                        <p>Disponible: $100</p>
                        <p>Contable: $100</p>
                    </div>
                    <div class="anadir-cuenta">
                        <h4>+</h4>
                        <button>Añadir una cuenta</button>
                    </div>

                </div>
            </div>
        </>
    );
}