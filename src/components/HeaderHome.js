// src/components/Header.js
import React from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import Logo from '../assets/images/neologo.png';

export const HeaderHome = () => {
  return (
    <div className="min-h-full">
      <Disclosure as="nav" className="bg-sky-950 fixed w-full top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex mx-auto h-16 items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <a href="/"><img alt="Your Company" src={Logo} className=" h-8 w-15" /></a>
              </div>
              {/* Otros elementos de navegación */}
            </div>
              <div className="hidden md:block">
                <div className="ml-4 flex items-center md:ml-6">
                  <Menu as="div" className="relative ml-3">
                    <div className="space-x-4">
                        <a
                            href="/login"
                            className="rounded-md bg-sky-800 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            Inicia sesión
                        </a>
                        <a
                            href="/signup"
                            className="rounded-md bg-sky-800 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            Abre tu cuenta
                        </a>
                    </div>
                    <Transition as={React.Fragment}>
                    </Transition>
                  </Menu>
                </div>
              </div>
            {/* Menú móvil */}
          </div>
        </div>
      </Disclosure>
    </div>
  );  
}
