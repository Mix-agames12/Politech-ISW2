import React, { useContext } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Logo from '../assets/images/neologo.png';

const userNavigation = [
  { name: 'Actualizar perfil', href: '/update-profile' },
  { name: 'Cerrar sesión', href: '#' },
];

export const HeaderDashboard = () => {
  const { user, loading, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async (e) => {
    e.preventDefault();
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-full">
      <Disclosure as="nav" className="bg-sky-950 fixed w-full top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              <a href="/" className="flex items-center">
                <img alt="Your Company" src={Logo} className="h-8 w-15" />
              </a>
            </div>
            {/* Centered Profile Icon and Name */}
            <div className="flex-grow flex items-center justify-center md:justify-end">
              {!loading && user && (
                <span className="text-white flex items-center space-x-2 ml-4 sm:ml-6">
                  <div className="relative w-8 h-8 overflow-hidden ">
                  </div>
                  <span>Hola, {user.nombre} {user.apellido}</span>
                </span>
              )}
            </div>
            {/* Dropdown Menu for all screen sizes */}
            <Menu as="div" className="relative ml-4 mr-4 sm:ml-2 mr-2">
              <Menu.Button className="flex text-sm focus:outline-none focus:ring-2 focus:ring-white">
                <span className="sr-only">Abrir menú de usuario</span>
                <div className="relative w-8 h-8 overflow-hidden bg-gray-100 rounded-full dark:bg-gray-600">
                  <svg className="absolute w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                  </svg>
                </div>
              </Menu.Button>
              <Transition
                as={React.Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-48 bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  {userNavigation.map((item) => (
                    <Menu.Item key={item.name}>
                      {({ active }) => (
                        <a
                          href={item.href}
                          className={`block px-4 py-2 text-sm text-gray-700 ${active ? 'bg-gray-100' : ''}`}
                          onClick={item.name === 'Cerrar sesión' ? handleLogout : undefined}
                        >
                          {item.name}
                        </a>
                      )}
                    </Menu.Item>
                  ))}
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </Disclosure>
    </div>
  );
};
