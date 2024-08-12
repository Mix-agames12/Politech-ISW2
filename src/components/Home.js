// src/Home.js
import React from 'react';
import { HeaderHome } from './HeaderHome';
import Footer from './Footer';
import WhatsAppWidget from './WhatsAppWidget';

const Home = () => {
  return (
    <>
      <HeaderHome />
      <div className="min-w-full min-h-screen absolute bg-cover bg-center brightness-50" style={{ backgroundImage: `url('https://img.freepik.com/fotos-premium/increible-fondo-pantalla-viaje-4k-fondo_839182-1726.jpg')` }} />
      <main className="min-w-full min-h-screen absolute flex flex-col items-center justify-center">
        <HeroSection />
        <FeaturesSection />
        <CardsSection />
        <Footer />
      </main>
      <WhatsAppWidget />
    </>
  );
};

const HeroSection = () => (
  <div className="h-screen mx-auto py-20 sm:py-32 lg:py-40">
    <div className="text-center pt-36">
      <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
        Soluciones en Línea
      </h1>
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-x-6">
        <a
          href="/login"
          className="mb-4 sm:mb-0 rounded-md bg-sky-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
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
);

const FeaturesSection = () => (
  <div className="content-body py-14 bg-gray-100">
    <div className="py-8">
      <h2 className="text-3xl font-semibold text-center">¿Qué puedes hacer con Banco PoliTech?</h2>
      <p className="text-center mt-4 text-gray-600">
        Con Banco PoliTech puedes realizar una gran cantidad de operaciones financieras sin salir de casa.
      </p>
    </div>
    <div className="content-cards grid mx-5 sm:mx-10 grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {featureCards.map((card, index) => (
        <FeatureCard key={index} {...card} />
      ))}
    </div>
  </div>
);

const FeatureCard = ({ imageSrc, title, description, link, linkText }) => (
  <div className="card p-8 flex flex-col bg-white shadow rounded-lg hover:scale-105 transition-transform duration-300">
    <div className="card-icon flex justify-center">
      <img src={imageSrc} alt={title} className="h-40 w-auto object-cover" />
    </div>
    <div className="card-content mt-4 text-center">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-gray-600 text-left">{description}</p>
    </div>
    <a href={link} className="card-link justify-end mt-auto inline-block text-sky-600 hover:underline">
      {linkText}
    </a>
  </div>
);

const CardsSection = () => (
  <div className="bg-gray-100">
    <div className="content-targets mx-5 sm:mx-10 lg:mx-20 py-20 space-y-8">
      {detailedCards.map((card, index) => (
        <DetailedCard key={index} {...card} />
      ))}
    </div>
  </div>
);

const DetailedCard = ({ imageSrc, title, description, link, linkText, reverseOrder }) => (
  <div className={`flex flex-col lg:flex-row bg-white p-8 shadow-md transition-transform duration-300 rounded-lg ${reverseOrder ? 'lg:flex-row-reverse' : ''}`}>
    <div className="flex-1 order-2 lg:order-1 lg:px-9">
      <h2 className="text-3xl sm:text-4xl font-semibold text-left pt-10 lg:pt-20 text-gray-800">
        {title}
      </h2>
      <p className="text-gray-600 my-6 text-justify">
        {description}
      </p>
      <a
        href={link}
        className="rounded-md bg-sky-900 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        {linkText}
      </a>
    </div>
    <div className="flex-shrink-0 lg:px-9 order-1 lg:order-2 mb-8 lg:mb-0 flex justify-center">
      <img src={imageSrc} className="h-64 lg:h-96 w-auto object-cover rounded-lg" alt={title} />
    </div>
  </div>
);

// Data
const featureCards = [
  {
    imageSrc: 'https://static.wixstatic.com/media/8c779e_73cb981de348407cab12a95ef7f08ad2~mv2.png/v1/fill/w_712,h_466,al_c,lg_1,q_85/8c779e_73cb981de348407cab12a95ef7f08ad2~mv2.png',
    title: 'Cuenta de ahorros transaccional',
    description: 'Crea tu cuenta de ahorros y disfruta de todos los beneficios que Banco PoliTech tiene para ti.',
    link: '#tajeta1',
    linkText: 'Descubre más',
  },
  {
    imageSrc: 'https://cloudfront-us-east-1.images.arcpublishing.com/eluniverso/LLYPZWDXTVE3BMXOPZGMPBGZSU.jpg',
    title: 'Descubre tu tarjeta ideal!',
    description: 'Con tu cuenta transaccional puedes pagar donde quieras con cualquiera de nuestras tarjetas.',
    link: '#tajeta2',
    linkText: 'Descubre más',
  },
  {
    imageSrc: 'https://e.rpp-noticias.io/xlarge/2016/11/23/523352_294820.png',
    title: 'Retira tu dinero',
    description: 'Retira y ten acceso a tu dinero en cualquier momento.',
    link: '#tajeta3',
    linkText: 'Descubre más',
  },
  {
    imageSrc: 'https://blog.cobistopaz.com/hubfs/tecnolog%C3%ADas%20financieras.jpg',
    title: 'Usa nuestros servicios digitales',
    description: 'Utiliza todos nuestros servicios, como nuestra banca web totalmente gratis.',
    link: '#tajeta4',
    linkText: 'Descubre más',
  },
];

const detailedCards = [
  {
    imageSrc: 'https://www.bancodelpacifico.com/BancoPacifico/media/Personas/Cuentas%20y%20Tarjetas/cuenta-ninos-adolescentes.jpg',
    title: 'Cuenta de Ahorros Transaccional',
    description: 'Crea tu cuenta de ahorros y disfruta de todos los beneficios que Banco PoliTech tiene para ti. Además, con nuestra cuenta de ahorros transaccional, podrás realizar transacciones rápidas y seguras, obtener tasas de interés competitivas y tener acceso a una amplia gama de servicios bancarios en línea.',
    link: '/signup',
    linkText: 'Abre tu cuenta ahora',
    reverseOrder: false,
  },
  {
    imageSrc: 'https://www.elfinanciero.com.mx/resizer/jp5_3K8Yzg2HblhddQp0t7Fc49c=/1440x810/filters:format(jpg):quality(70)/cloudfront-us-east-1.images.arcpublishing.com/elfinanciero/5Y55DQ2BSRGW7BGO3BIMEBLOCE.jpeg',
    title: 'Descubre tu tarjeta ideal',
    description: 'Con nuestra cuenta transaccional, tienes acceso a una variedad de tarjetas diseñadas para facilitar tus pagos en cualquier lugar. Encuentra la tarjeta que mejor se adapte a tu estilo de vida y disfruta de los beneficios que cada una ofrece, incluyendo recompensas y promociones especiales.',
    link: '#',
    linkText: 'Descubre más',
    reverseOrder: true,
  },
  {
    imageSrc: 'https://www.lahora.com.ec/wp-content/uploads/2022/03/bankMoney.jpg',
    title: 'Retira tu dinero',
    description: 'En Banco PoliTech, entendemos la importancia de tener acceso inmediato a tus fondos. Con nuestras múltiples opciones de retiro, puedes acceder a tu dinero en cualquier momento y lugar.',
    link: '/login',
    linkText: 'Inicia Sesión',
    reverseOrder: false,
  },
  {
    imageSrc: 'https://blog.cobistopaz.com/hubfs/01.png',
    title: 'Usa nuestros servicios digitales',
    description: 'Aprovecha la tecnología de punta con los servicios digitales de Banco PoliTech. Nuestra plataforma de banca web te permite gestionar tus finanzas de manera eficiente y segura, desde cualquier dispositivo con acceso a internet.',
    link: '/login',
    linkText: 'Descubre más',
    reverseOrder: true,
  },
];

export default Home;
