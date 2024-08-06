import React from 'react';
import { FaFacebook, FaTwitter, FaDribbble, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
    return (
        <>
            <div className="bottom-0 min-w-full">
                <footer className="bg-gray-800 text-white py-6">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-wrap">
                            <div className="w-full md:w-1/2 mb-6 md:mb-0">
                                <h6 className="text-xl font-bold mb-2">Sobre nosotros</h6>
                                <p className="text-justify pr-16">
                                    Somos un banca web que te permite gestionar tus cuentas de manera fácil y segura. Con nosotros podrás realizar transferencias, pagos y mucho más. ¡Regístrate ya!
                                </p>
                            </div>

                            <div className="w-full sm:w-1/2 md:w-1/4 mb-6 sm:mb-0">
                                <h6 className="text-xl font-bold mb-2">Categorías</h6>
                                <ul className="space-y-2">
                                    <li><a href="http://scanfcode.com/category/c-language/" className="text-gray-400 hover:text-white">C</a></li>
                                    <li><a href="http://scanfcode.com/category/front-end-development/" className="text-gray-400 hover:text-white">UI Design</a></li>
                                    <li><a href="http://scanfcode.com/category/back-end-development/" className="text-gray-400 hover:text-white">PHP</a></li>
                                </ul>
                            </div>

                            <div className="w-full sm:w-1/2 md:w-1/4">
                                <h6 className="text-xl font-bold mb-2">Enlaces rápidos</h6>
                                <ul className="space-y-2">
                                    <li><a href="http://scanfcode.com/about/" className="text-gray-400 hover:text-white">Nuestro equipo</a></li>
                                    <li><a href="http://scanfcode.com/contact/" className="text-gray-400 hover:text-white">Contáctanos</a></li>
                                    <li><a href="http://scanfcode.com/contribute-at-scanfcode/" className="text-gray-400 hover:text-white"></a></li>
                                    <li><a href="http://scanfcode.com/privacy-policy/" className="text-gray-400 hover:text-white">Políticas de privacidad</a></li>
                                </ul>
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
