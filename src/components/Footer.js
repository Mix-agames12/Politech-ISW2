import React from 'react';
import Logolargo from '../assets/images/logolargo.png';
import { FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
    return (
        <>
            <div className="bottom-0 min-w-full">
                <footer className="bg-gray-800 text-white py-6">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-8 lg:space-y-0">
                            {/* Columna izquierda: Logo y Sobre nosotros */}
                            <div className="flex flex-col items-center lg:items-start lg:w-1/3 text-center lg:text-left">
                                <img src={Logolargo} className="h-9 sm:h-16 lg:h-9 mb-4 lg:mb-8" alt="Logo largo" />
                                <h6 className="text-xl font-bold mb-2">Sobre nosotros</h6>
                                <p className="text-justify max-w-xs">
                                    Somos un banca web que te permite gestionar tus cuentas de manera fácil y segura. Con nosotros podrás realizar transferencias, pagos y mucho más. ¡Regístrate ya!
                                </p>
                            </div>

                            {/* Columna central: Mapa */}
                            <div className="flex flex-col items-center lg:items-center lg:w-1/3">
                                <h6 className="text-xl font-bold ">Encuentra tu banco</h6>
                                <div className="map-container mt-4 w-full max-w-xs">
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d997.4478614046518!2d-78.48927863748031!3d-0.21029711980716012!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91d59a107b70b7bd%3A0x54a537873ca87a03!2sFacultad%20de%20Ingenier%C3%ADa%20en%20Sistemas!5e0!3m2!1ses!2sec!4v1723061630191!5m2!1ses!2sec"
                                        style={{ border: 0 }}
                                        allowFullScreen=""
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        className="w-full h-36 sm:h-48 md:h-36 lg:h-48"
                                    ></iframe>
                                </div>
                            </div>

                            {/* Columna derecha: Para tu interés */}
                            <div className="flex flex-col items-center lg:items-start lg:w-1/3 text-center lg:text-left">
                                <h6 className="text-xl font-bold mb-2 md:-mt-28 sm:mt-6">Para tu interés</h6>
                                <ul className="space-y-2">
                                    <li><a href="http://scanfcode.com/about/" className="text-gray-400 hover:text-white">Nuestro equipo</a></li>
                                    <li><a href="http://scanfcode.com/contact/" className="text-gray-400 hover:text-white">Contáctanos</a></li>
                                    <li><a href="http://scanfcode.com/privacy-policy/" className="text-gray-400 hover:text-white">Políticas de privacidad</a></li>
                                </ul>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
                            <div className="w-full lg:w-auto text-center lg:text-left">
                                <p className="text-gray-400">
                                    &copy; 2024 Todos los derechos reservados a <a href="#" className="text-white">Banco PoliTech</a>.
                                </p>
                            </div>
                            <div className="w-full lg:w-auto text-center">
                                <ul className="flex space-x-4 justify-center">
                                    <li><a href="https://www.facebook.com/profile.php?id=61563716107806" className="text-gray-400 hover:text-white"><FaFacebook size={24} /></a></li>
                                    <li><a href="https://x.com/BPolitech" className="text-gray-400 hover:text-white"><FaTwitter size={24} /></a></li>
                                    <li><a href="https://www.linkedin.com/in/banco-politech-068463321/" className="text-gray-400 hover:text-white"><FaLinkedin size={24} /></a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

export default Footer;
