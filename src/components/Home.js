// src/components/Home.js

import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <>  
     <div class="navbar">
    <div class="logo">
      <span class="logo-text">POLITECH</span>
    </div>
    <div class="nav-links">
      <input type="text" placeholder="Buscar..."/>
      <button class="btn search-btn"> <img src="https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-ios7-search-strong-512.png" class="lupa-img" alt=""/></button>
      <button class="btn primary">Abre tu cuenta</button>
      <button class="btn secondary">Acceso Clientes</button>
    </div>
  </div>
  
  <div class="carousel">
    <div class="carousel-inner">
      <div class="carousel-item active">
        <img src="https://img.freepik.com/vector-gratis/fondo-azul-degradado_23-2149331354.jpg"/>
        <div class="carousel-caption">
          <h1>POLITECH</h1>
          <p>Construyendo confianza, juntos<br/>Disfruta de grandes beneficios.</p>
          <button class="btn primary">Ingresa a la Banca</button>
          <button class="btn secondary">Conoce Más...</button>
        </div>
      </div>
      <div class="carousel-item">
        <img src="https://st4.depositphotos.com/13324256/20097/i/450/depositphotos_200978284-stock-photo-blank-bright-blue-abstract-background.jpg"/>
        <div class="carousel-caption">
          <h1>POLITECH</h1>
          <p>Innovación y seguridad<br/>Para tu tranquilidad financiera.</p>
          <button class="btn primary">Ingresa a la Banca</button>
          <button class="btn secondary">Conoce Más...</button>
        </div>
      </div>
      <div class="carousel-item">
        <img src="https://png.pngtree.com/thumb_back/fh260/background/20231104/pngtree-captivating-watercolor-painting-azure-blue-background-texture-image_13711734.png"/>
        <div class="carousel-caption">
          <h1>POLITECH</h1>
          <p>Tu confianza, nuestro compromiso<br/>Beneficios sin igual.</p>
          <button class="btn primary">Ingresa a la Banca</button>
          <button class="btn secondary">Conoce Más...</button>
        </div>
      </div>
    </div>
    <button class="carousel-control-prev" > </button>
    <button class="carousel-control-next" ></button>
  </div>

  <div class="welcome-section">
    <h2>Bienvenido</h2>
    <p>¿Qué quieres hacer hoy?</p>
    <div class="action-cards">
      <div class="card">
        <img src="https://media.istockphoto.com/id/643578030/es/vector/icono-de-marca-de-verificaci%C3%B3n.jpg?s=612x612&w=0&k=20&c=T4aJx4Tiyd4U0GlZdF51skVa-1CRk57NJdq6c_AnKZI="  class="card-img"/>
        <p>Cuenta creada con éxito</p>
      </div>
      <div class="card">
        <img src="https://cdn-icons-png.freepik.com/512/82/82219.png"  class="card-img"/>
        <p>Descubrir mi tarjeta ideal</p>
      </div>
      <div class="card">
        <img src="https://previews.123rf.com/images/martialred/martialred1709/martialred170900043/85712048-una-pila-de-dinero-en-efectivo-o-billetes-de-d%C3%B3lares-icono-de-vector-de-l%C3%ADnea-de-arte-para.jpg" class="card-img"/>
        <p>Retira tu dinero</p>
      </div>
      <div class="card">
        <img src="https://cdn-icons-png.freepik.com/512/4703/4703487.png"  class="card-img"/>
        <p>Usa nuestros servicios digitales</p>
      </div>
    </div>
  </div>
    </>
  );
};

export default Home;
