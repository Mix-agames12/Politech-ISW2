// src/Home.js
import React from 'react';
import { HeaderHome } from './HeaderHome';
import Fondo from '../assets/images/carrusel.png';

const Home = () => {
  return (
    <>
      <div className="min-w-full min-h-screen absolute bg-cover bg-center brightness-50 " style={{ backgroundImage: `url(${Fondo})` }}/>
      <main className="min-w-full min-h-screen absolute flex-col items-center justify-center ">
      <HeaderHome/>
        <div className="h-screen mx-auto py-32 sm:py-48 lg:py-56">
          <div className="text-center pt-14">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Soluciones en Línea
            </h1>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="/login"
                className="rounded-md bg-sky-900 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Inicia sesión
              </a>
              <a href="/signup" className="text-sm font-semibold leading-6 text-white">
                Abre una cuenta <span aria-hidden="true">→</span>
              </a>
            </div>
            <p className="mt-6 text-lg leading-8 text-white">
              Todo lo que necesitas sin salir de casa.
            </p>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        >
        </div>
        {/* tarjetas */}
        <div className="content-body py-14 bg-gray-100">
        <div className="py-8">
              <h2 className="text-3xl font-semibold text-center">¿Qué puedes hacer con Banco PoliTech?</h2>
              <p className="text-center mt-4 text-gray-600">Con Banco PoliTech puedes realizar una gran cantidad de operaciones financieras sin salir de casa.</p>
        </div>
          <div className="content-cards grid mx-10 grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card p-8 flex flex-col bg-white shadow rounded-lg hover:scale-105">
              <div className="card-icon">
                <img src="https://static.wixstatic.com/media/8c779e_73cb981de348407cab12a95ef7f08ad2~mv2.png/v1/fill/w_712,h_466,al_c,lg_1,q_85/8c779e_73cb981de348407cab12a95ef7f08ad2~mv2.png" alt="Icono de ahorro" className="h-40 w-fit items-center"/>
              </div>
              <div className="card-content mt-4">
                <h2 className="text-xl font-semibold">Cuenta de ahorros transaccional</h2>
                <p className="mt-2 text-gray-600">Crea tu cuenta de ahorros y disfruta de todos los beneficios que Banco PoliTech tiene para ti.</p>
              </div>
              <a href="#tajeta1" className="card-link justify-end mt-auto inline-block text-sky-600 hover:underline">Descubre más</a>
            </div>
            <div className="card p-8 flex flex-col bg-white shadow rounded-lg hover:scale-105">
              <div className="card-icon ">
                <img src="https://cloudfront-us-east-1.images.arcpublishing.com/eluniverso/LLYPZWDXTVE3BMXOPZGMPBGZSU.jpg" alt="Icono de ahorro" className="h-40 w-fit items-center" />
              </div>
              <div className="card-content mt-4">
                <h2 className="text-xl font-semibold">Descubre tu tarjeta ideal!</h2>
                <p className="mt-2 text-gray-600">Con tu cuenta transaccional puedes pagar donde quieras con cualquiera de nuestras tarjetas</p>
              </div>
              <a href="#tajeta2" className="card-link justify-end mt-auto inline-block text-sky-600 hover:underline">Descubre más</a>
            </div>
            <div className="card p-8 flex flex-col bg-white shadow rounded-lg hover:scale-105">
              <div className="card-icon">
                <img src="https://e.rpp-noticias.io/xlarge/2016/11/23/523352_294820.png" alt="Icono de ahorro" className="h-40 w-fit items-center" />
              </div>
              <div className="card-content mt-4">
                <h2 className="text-xl font-semibold">Retira tu dinero</h2>
                <p className="mt-2 text-gray-600">Retira y ten acceso a tu dinero en cualquier momento.</p>
              </div>
              <a href="#tajeta3" className="card-link justify-end mt-auto inline-block text-sky-600 hover:underline">Descubre más</a>
            </div>
            <div className="card p-8 flex flex-col bg-white shadow rounded-lg hover:scale-105">
              <div className="card-icon">
                <img src="https://blog.cobistopaz.com/hubfs/tecnolog%C3%ADas%20financieras.jpg" alt="Icono de ahorro" className="h-40 w-fit items-center" />
              </div>
              <div className="card-content mt-4">
                <h2 className="text-xl font-semibold">Usa nuestros servicios digitales</h2>
                <p className="mt-2 text-gray-600">Utiliza todos nuestros servicios,como nuestra banca web totalmente gratis.</p>
              </div>
              <a href="#tajeta4" className="card-link justify-end mt-auto inline-block text-sky-600 hover:underline">Descubre más</a>
            </div>
            {/* Repetir las tarjetas según sea necesario */}
          </div>
        </div>
        {/* contenido de las tarjetas */}
        <div className="bg-gray-100">
            <div className="content-targets mx-40 py-20 space-y-8" >
              {/* Tarjeta 1 */}
                <div className="flex bg-white p-8 shadow-md hover:scale-105" id="tajeta1" >
                  <div className="flex-1">
                    <h2 className="text-4xl font-semibold pl-9 text-left pt-20 text-gray-800">
                      Cuenta de Ahorros Transaccional
                    </h2>
                    <p className="text-gray-600 my-6 mr-32 pl-9 text-justify">
                      Crea tu cuenta de ahorros y disfruta de todos los beneficios que Banco PoliTech tiene para ti. Además, con nuestra cuenta de ahorros transaccional, podrás realizar transacciones rápidas y seguras, obtener tasas de interés competitivas y tener acceso a una amplia gama de servicios bancarios en línea.
                    </p>
                    <div className="pl-9">
                    <a
                      href="/signup"
                      className="rounded-md bg-sky-900 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      Abre tu cuenta ahora
                    </a>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-8 pr-9">
                    <img src="https://www.bancointernacional.com.ec/wp-content/uploads/2020/11/sugerencias-y-reclamos-.jpg" className="h-96 w-auto object-cover rounded-lg" alt="Cuenta de Ahorros Transaccional " />
                  </div>
                </div>

              {/* Tarjeta 2 */}
              <div className="flex bg-white p-8 shadow-md hover:scale-105" id="tajeta2">
                <div className="flex-shrink-0 mr-8">
                  <img src="https://www.bancointernacional.com.ec/wp-content/uploads/2020/11/sugerencias-y-reclamos-.jpg" className="h-96 w-auto object-cover rounded-lg" alt="Cuenta de Ahorros Transaccional" />
                </div>
                <div className="flex-1">
                  <h2 className="text-4xl font-semibold text-right pt-20 pr-9 text-gray-800">
                    Descubre tu tarjeta ideal
                  </h2>
                  <p className="text-gray-600 my-6 ml-20 pr-9 text-justify">
                    Crea tu cuenta de ahorros y disfruta de todos los beneficios que Banco PoliTech tiene para ti. Además, con nuestra cuenta de ahorros transaccional, podrás realizar transacciones rápidas y seguras, obtener tasas de interés competitivas y tener acceso a una amplia gama de servicios bancarios en línea.
                  </p>
                  {/* <a
                    href="/signup"
                    className="rounded-md bg-sky-900 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Abre tu cuenta ahora
                  </a> */}
                </div>
              </div>

              {/* Tarjeta 3 */}
              <div className="flex bg-white p-8 shadow-md hover:scale-105" id="tajeta3" >
                  <div className="flex-1">
                    <h2 className="text-4xl font-semibold pl-9 text-left pt-20 text-gray-800">
                      Cuenta de Ahorros Transaccional
                    </h2>
                    <p className="text-gray-600 my-6 mr-32 pl-9 text-justify">
                      Crea tu cuenta de ahorros y disfruta de todos los beneficios que Banco PoliTech tiene para ti. Además, con nuestra cuenta de ahorros transaccional, podrás realizar transacciones rápidas y seguras, obtener tasas de interés competitivas y tener acceso a una amplia gama de servicios bancarios en línea.
                    </p>
                    <div className="pl-9">
                    <a
                      href="/signup"
                      className="rounded-md bg-sky-900 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                      Abre tu cuenta ahora
                    </a>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-8 pr-9">
                    <img src="https://www.bancointernacional.com.ec/wp-content/uploads/2020/11/sugerencias-y-reclamos-.jpg" className="h-96 w-auto object-cover rounded-lg" alt="Cuenta de Ahorros Transaccional " />
                  </div>
                </div>

              {/* Tarjeta 4 */}
              <div className="flex bg-white p-8 shadow-md hover:scale-105" id="tajeta">
                <div className="flex-shrink-0 mr-8">
                  <img src="https://www.bancointernacional.com.ec/wp-content/uploads/2020/11/sugerencias-y-reclamos-.jpg" className="h-96 w-auto object-cover rounded-lg" alt="Cuenta de Ahorros Transaccional" />
                </div>
                <div className="flex-1">
                  <h2 className="text-4xl font-semibold text-right pt-20 pr-9 text-gray-800">
                    Descubre tu tarjeta ideal
                  </h2>
                  <p className="text-gray-600 my-6 ml-20 pr-9 text-justify">
                    Crea tu cuenta de ahorros y disfruta de todos los beneficios que Banco PoliTech tiene para ti. Además, con nuestra cuenta de ahorros transaccional, podrás realizar transacciones rápidas y seguras, obtener tasas de interés competitivas y tener acceso a una amplia gama de servicios bancarios en línea.
                  </p>
                  {/* <a
                    href="/signup"
                    className="rounded-md bg-sky-900 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Abre tu cuenta ahora
                  </a> */}
                </div>
              </div>
            </div>
        </div>
        <footer className="bg-sky-950 text-white py-6">
        <p className="text-center">© 2021 Banco PoliTech. Todos los derechos reservados.</p>
        </footer>
      </main>

    </>
  );
};

export default Home;
