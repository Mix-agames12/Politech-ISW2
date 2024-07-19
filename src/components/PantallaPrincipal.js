import React from 'react';
import '../components/PantallaPrincipal.css';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Carusel } from './Carusel';
import { SignUp } from './components/SignUp';
import { Login } from './components/Login';
// Revisar el contenido de esta vista, algunas cosas se pueden implementar en el Home.js

export const pantallaPrincipal = () => {
  return (
    <Router> 
    <>
    <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'/>

    <div class="navbar">
    <div class="logo">
      <img src="assets/images/neologo.png" alt=""/>
    </div>
    <div class="nav-links">
      <input type="text" placeholder="Buscar..."/>
      <button class="btn search-btn"> <img src="https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-ios7-search-strong-512.png" class="lupa-img" alt=""/></button>
      <Link className="nav-link" to="/SignUp">Abre tu cuenta</Link>
      <button class="btn primary">Abre tu cuenta</button>
      <button class="btn secondary">Acceso Clientes</button>
    </div>
    </div>

    <div class="carousel">
    <div class="carousel-inner">
      <div class="carousel-item active">
        <img src="https://www.elfinanciero.com.mx/resizer/HYoBS20sywVDfQ4yynabgcUauH4=/1440x810/filters:format(jpg):quality(70)/cloudfront-us-east-1.images.arcpublishing.com/elfinanciero/ZV6CXMK46ZE4LN2EZSDRTHFZCU.jpg"/>
        <div class="carousel-caption">
          <h1>PoliTech</h1>
          <p>Construyendo confianza, juntos Disfruta de grandes beneficios.</p>
          <button class="btn primary">Ingresa a la Banca</button>
          <button class="btn secondary">Conoce Más...</button>
        </div>
      </div>
      <div class="carousel-item">
        <img src="https://concepto.de/wp-content/uploads/2015/08/familia-extensa-e1591818033557.jpg"/>
        <div class="carousel-caption">
          <h1>Confianza y Seguridad para Tu Dinero</h1>
          <p>Descubre por qué miles de clientes confían en nosotros.</p>
          <button class="btn primary">Ingresa a la Banca</button>
          <button class="btn secondary">Conoce Más...</button>
        </div>
      </div>
      <div class="carousel-item">
        <img src="https://png.pngtree.com/thumb_back/fh260/background/20231104/pngtree-captivating-watercolor-painting-azure-blue-background-texture-image_13711734.png"/>
        <div class="carousel-caption">
          <h1>Banca Digital de Primera</h1>
          <p>Accede a tu cuenta desde cualquier lugar, en cualquier momento.</p>
          <button class="btn primary">Ingresa a la Banca</button>
          <button class="btn secondary">Conoce Más...</button>
        </div>
      </div>
    </div> 
    </div>

    <Carusel/>

    <div class="welcome-section">
    <h2>Bienvenido</h2>
    <p>¿Qué quieres hacer hoy?</p>
    <div class="action-cards">
      <div class="card">
        <i class='bx bx-transfer-alt' style={{color:"#5eead4"}}></i>        
        <p>Crea tu cuenta transaccional</p>
      </div>
      <div class="card">
        <i class='bx bx-credit-card' style={{color:"#5eead4"}}></i>
        <p>Descubrir mi tarjeta ideal</p>
      </div>
      <div class="card">
        <i class='bx bxs-coin' style={{color:"#5eead4"}}></i>        
        <p>Retira tu dinero</p>
      </div>
      <div class="card">
        <i class='bx bx-laptop' style={{color:"#5eead4"}}></i>        
        <p>Usa nuestros servicios digitales</p>
      </div>
    </div>
    </div>

    <Routes>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
    </Routes>
    </>
    </Router>
  );
}