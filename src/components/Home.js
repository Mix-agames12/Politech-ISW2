// src/Home.js
import React, { useState } from 'react';
import { Header } from './Header';

const Home = () => {
  return (
    <>
    <Header/>
    <div className="bg-white">
      <main className="relative isolate px-6 pt-14 lg:px-8">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        >
          <div
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          />
        </div>
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Soluciones en Línea
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Todo lo que necesitas sin salir de casa.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="#"
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Get started
              </a>
              <a href="#" className="text-sm font-semibold leading-6 text-gray-900">
                Learn more <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        >
          <div
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          />
        </div>
        <div className="content-body py-16">
          <div className="content-cards grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card p-6 bg-white shadow rounded-lg">
              <div className="card-icon">
                <img src="https://placehold.co/50x50.png" alt="Icono de ahorro" />
              </div>
              <div className="card-content mt-4">
                <h2 className="text-xl font-semibold">Ahorro Flexible</h2>
                <p className="mt-2 text-gray-600">Gana <span className="highlight text-indigo-600">5%</span> de interés y ten tu dinero siempre disponible.</p>
              </div>
              <a href="#" className="card-link mt-4 inline-block text-indigo-600 hover:underline">Abrir cuenta</a>
            </div>
            <div className="card p-6 bg-white shadow rounded-lg">
              <div className="card-icon">
                <img src="https://placehold.co/50x50.png" alt="Icono de ahorro" />
              </div>
              <div className="card-content mt-4">
                <h2 className="text-xl font-semibold">Ahorro Inteligente</h2>
                <p className="mt-2 text-gray-600">Obtén hasta un <span className="highlight text-indigo-600">5%</span> de interés anual. ¡Disponibilidad inmediata!</p>
              </div>
              <a href="#" className="card-link mt-4 inline-block text-indigo-600 hover:underline">Empieza ahora</a>
            </div>
            <div className="card p-6 bg-white shadow rounded-lg">
              <div className="card-icon">
                <img src="https://placehold.co/50x50.png" alt="Icono de ahorro" />
              </div>
              <div className="card-content mt-4">
                <h2 className="text-xl font-semibold">Ahorro Seguro</h2>
                <p className="mt-2 text-gray-600">Disfruta de un <span className="highlight text-indigo-600">5%</span> de interés y acceso a tu dinero en cualquier momento.</p>
              </div>
              <a href="#" className="card-link mt-4 inline-block text-indigo-600 hover:underline">Únete hoy</a>
            </div>
            <div className="card p-6 bg-white shadow rounded-lg">
              <div className="card-icon">
                <img src="https://placehold.co/50x50.png" alt="Icono de ahorro" />
              </div>
              <div className="card-content mt-4">
                <h2 className="text-xl font-semibold">Ahorro Dinámico</h2>
                <p className="mt-2 text-gray-600">Gana un <span className="highlight text-indigo-600">5%</span> de interés con la flexibilidad que necesitas.</p>
              </div>
              <a href="#" className="card-link mt-4 inline-block text-indigo-600 hover:underline">Descubre más</a>
            </div>
            {/* Repetir las tarjetas según sea necesario */}
          </div>
        </div>
      </main>
      <footer className="footer bg-gray-100 py-8">
        <div className="footer-content container mx-auto text-center">
          <ul className="footer-links flex justify-center space-x-6">
            <li><a href="#" className="text-gray-600 hover:underline">Sobre Nosotros</a></li>
            <li><a href="#" className="text-gray-600 hover:underline">Terminos de Servicio</a></li>
            <li><a href="#" className="text-gray-600 hover:underline">Contactenos</a></li>
          </ul>
          <hr className="my-4 border-gray-200" />
          <p className="text-gray-600">&copy; 2024 PoliTech. Todos los Derechos Reservados.</p>
        </div>
      </footer>
    </div>
    </>
    
  );
};

export default Home;
