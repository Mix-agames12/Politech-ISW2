import React from 'react';
import Logolargo from '../assets/images/logolargo.png';
import { FaFacebook, FaTwitter, FaDribbble, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
    return (
        <>
            <div className="bottom-0 min-w-full">
                <footer className="bg-gray-800 text-white py-6">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-wrap">
                            <div className="w-auto mb-6 md:mb-0 text-center">
                                <img src={Logolargo} className="h-40 sm:h-60 md:h-40 lg:h-60 mr-auto" />
                            </div>
                            
                            <div className="w-auto md:w-1/2 mb-6 md:mb-0">
                                <h6 className="text-xl font-bold mb-2">Sobre nosotros</h6>
                                <p className="text-justify pr-24">
                                    Somos un banca web que te permite gestionar tus cuentas de manera fácil y segura. Con nosotros podrás realizar transferencias, pagos y mucho más. ¡Regístrate ya!
                                </p>
                            </div>
                            <div className="w-full flex flex-wrap md:w-1/2">
                                <div className="w-full sm:w-1/2 md:w-1/2 mb-6 sm:mb-0">
                                    <h6 className="text-xl font-bold mb-2">Encuentra tu banco</h6>
                                    {/* Agrega el mapa aquí */}
                                    <div className="map-container mt-4">
                                        <iframe
                                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d997.4478614046518!2d-78.48927863748031!3d-0.21029711980716012!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91d59a107b70b7bd%3A0x54a537873ca87a03!2sFacultad%20de%20Ingenier%C3%ADa%20en%20Sistemas!5e0!3m2!1ses!2sec!4v1723061630191!5m2!1ses!2sec"
                                            style={{ border: 0 }}
                                            allowFullScreen=""
                                            loading="lazy"
                                            referrerPolicy="no-referrer-when-downgrade"
                                            className="w-full h-40 sm:h-60 md:h-40 lg:h-60"
                                        ></iframe>
                                    </div>
                                </div>
                                <div className="w-full pl-10 sm:w-1/2 md:w-1/2">
                                    <h6 className="text-xl font-bold mb-2">Para tu interés</h6>
                                    <ul className="space-y-2">
                                        <li><a href="http://scanfcode.com/about/" className="text-gray-400 hover:text-white">Nuestro equipo</a></li>
                                        <li><a href="http://scanfcode.com/contact/" className="text-gray-400 hover:text-white">Contáctanos</a></li>
                                        <li><a href="http://scanfcode.com/privacy-policy/" className="text-gray-400 hover:text-white">Políticas de privacidad</a></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex flex-wrap justify-between items-center">
                            <div className="w-full md:w-auto text-center md:text-left mb-4 md:mb-0">
                                <p className="text-gray-400">
                                    &copy; 2024 Todos los derechos reservados a <a href="#" className="text-white">Banco PoliTech</a>.
                                </p>
                            </div>
                            <div className="w-full md:w-auto text-center">
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
