// src/Home.js
import React, { useState, useEffect } from 'react';
import './Home.css';
import Logo from '../assets/images/neologo.png';
import Carrusel from '../assets/images/carrusel.png';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const images = [
    Carrusel,
    "https://via.placeholder.com/799x400.png",
    "https://via.placeholder.com/802x400.png"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-logo">
          <img src={Logo} alt="Logo Politech" />
        </div>
        <ul className="navbar-links">
          <li><a href="#">Contactenos</a></li>
          <li><a href="/login">Ingresar</a></li>
          <li><a href="/signup">Registrarse</a></li>
        </ul>
      </nav>
      {/* Carousel */}
      <div className="carousel">
        <div className="carousel-inner" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {images.map((image, index) => (
            <img key={index} src={image} alt={`foto ${index + 1}`} />
          ))}
        </div>
      </div>
      {/* Content */}
      <hr />
      <main className='content'>
        <div className='content-title'>
          <h1>Soluciones en Linea</h1>
          <h3>Todo lo que necesitas sin salir de casa</h3>
        </div>
        <div className='content-body'>
          {/* Cards */}
          <div className='content-cards'>
            <div className="card">
              <div className="card-icon">
                <img src="https://placehold.co/50x50.png" alt="Icono de ahorro" />
              </div>
              <div className="card-content">
                <h2>Ahorro Flexible</h2>
                <p>Gana <span className="highlight">5%</span> de interés y ten tu dinero siempre disponible.</p>
              </div>
              <a href="#" className="card-link">Abrir cuenta</a>
            </div>
            <div className="card">
              <div className="card-icon">
                <img src="https://placehold.co/50x50.png" alt="Icono de ahorro" />
              </div>
              <div className="card-content">
                <h2>Ahorro Inteligente</h2>
                <p>Obtén hasta un <span className="highlight">5%</span> de interés anual. ¡Disponibilidad inmediata!</p>
              </div>
              <a href="#" className="card-link">Empieza ahora</a>
            </div>
            <div className="card">
              <div className="card-icon">
                <img src="https://placehold.co/50x50.png" alt="Icono de ahorro" />
              </div>
              <div className="card-content">
                <h2>Ahorro Seguro</h2>
                <p>Disfruta de un <span className="highlight">5%</span> de interés y acceso a tu dinero en cualquier momento.</p>
              </div>
              <a href="#" className="card-link">Únete hoy</a>
            </div>
            <div className="card">
              <div className="card-icon">
                <img src="https://placehold.co/50x50.png" alt="Icono de ahorro" />
              </div>
              <div className="card-content">
                <h2>Ahorro Dinámico</h2>
                <p>Gana un <span className="highlight">5%</span> de interés con la flexibilidad que necesitas.</p>
              </div>
              <a href="#" className="card-link">Descubre más</a>
            </div>
            {/* Repetir las tarjetas según sea necesario */}
          </div>
        </div>
      </main>
      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <ul className="footer-links">
            <li><a href="#">Sobre Nosotros</a></li>
            <li><a href="#">Terminos de Servicio</a></li>
            <li><a href="#">Contactenos</a></li>
          </ul>
          <hr />
          <p>&copy; 2024 PoliTech. Todos los Derechos Reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
