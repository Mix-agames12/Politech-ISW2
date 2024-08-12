import React from 'react';
import Logo from '../assets/images/neologo.png';

export const HeaderLogin = () => {
  return (
    <div className="min-h-full">
      <nav className="bg-sky-950 fixed w-full top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex-1 flex items-center justify-center sm:justify-start">
              <a href="/" className="flex-shrink-0">
                <img alt="Your Company" src={Logo} className="h-8 w-auto" />
              </a>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6">
                {/* Puedes añadir botones adicionales aquí */}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
