import React from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import Logo from '../assets/images/neologo.png';

export const HeaderHome = () => {
  return (
    <div className="min-h-full">
      <Disclosure as="nav" className="bg-sky-950 fixed w-full top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex-1 flex items-center justify-center sm:justify-start">
              <a href="/" className="flex-shrink-0">
                <img alt="Your Company" src={Logo} className="h-8 w-auto" />
              </a>
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
            <div className="flex md:hidden">
              <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                <span className="sr-only">Open main menu</span>
                {/* Icono del menú hamburguesa */}
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
                <svg className="hidden h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Disclosure.Button>
            </div>
          </div>
        </div>

        <Disclosure.Panel className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Disclosure.Button
              as="a"
              href="/login"
              className="block px-3 py-2 rounded-md text-base font-medium text-white bg-sky-800"
            >
              Inicia sesión
            </Disclosure.Button>
            <Disclosure.Button
              as="a"
              href="/signup"
              className="block px-3 py-2 rounded-md text-base font-medium text-white bg-sky-800"
            >
              Abre tu cuenta
            </Disclosure.Button>
          </div>
        </Disclosure.Panel>
      </Disclosure>
    </div>
  );
};
