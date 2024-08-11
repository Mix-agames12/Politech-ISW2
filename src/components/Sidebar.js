import React from 'react';
import { FiMenu } from 'react-icons/fi';
import { BiStore } from "react-icons/bi";
import { GoArrowSwitch } from "react-icons/go";
import { GoHome } from "react-icons/go";
import { BiTable } from "react-icons/bi";


export const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <>
      {/* Botón de menú para dispositivos móviles */}
      <button
        className="sm:hidden fixed top-4 left-4 z-50 p-2 bg-sky-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none"
        onClick={toggleSidebar}
      >
        <FiMenu className="w-6 h-6" />
      </button>

      {/* Sidebar */}
      <aside
        id="default-sidebar"
        className={`fixed top-0 sm:top-16 left-0 z-40 h-full transition-transform transform bg-sky-50 dark:bg-gray-800 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          } sm:translate-x-0 sm:w-60 w-64 sm:block`}
        aria-label="Sidebar"
      >
        <div
          className={`h-full px-3 pt-6 mb-6 flex flex-col overflow-y-auto ${isOpen ? 'w-64' : 'w-16'
            } sm:w-full transition-all duration-300`}
        >
          <ul className="space-y-4 font-medium">
            <li>
              <button
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-sky-200 dark:hover:bg-gray-700 group sm:hidden"
                onClick={toggleSidebar}
              >
                <FiMenu className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
              </button>
            </li>
            <li>
              <a
                href="/gestionar-cuentas"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-sky-200 dark:hover:bg-gray-700 group"
              >
                <svg
                  className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 22 21"
                >
                  <path d="M16.975 11H10V4.025a1 1 0 0 0-1.066-.998 8.5 8.5 0 1 0 9.039 9.039.999.999 0 0 0-1-1.066h.002Z" />
                  <path d="M12.5 0c-.157 0-.311.01-.565.027A1 1 0 0 0 11 1.02V10h8.975a1 1 0 0 0 1-.935c.013-.188.028-.374.028-.565A8.51 8.51 0 0 0 12.5 0Z" />
                </svg>
                {isOpen && <span className="ms-3">Mis Productos</span>}
              </a>
            </li>
            <li>
              <a
                href="/transaction"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-sky-200 dark:hover:bg-gray-700 group"
              >
                <svg
                  className="w-5 h-6 text-gray-500 dark:text-white group-hover:text-gray-900"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 18"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 14 3-3m-3 3 3 3m-3-3h16v-3m2-7-3 3m3-3-3-3m3 3H3v3"
                  />
                </svg>
                {isOpen && (
                  <span className="flex-1 ms-3 whitespace-nowrap">Transferencias</span>
                )}
              </a>
            </li>
            <li>
              <a
                href="/pago-servicios"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-sky-200 dark:hover:bg-gray-700 group"
              >
                <svg
                  className="w-5 h-6 text-gray-500 dark:text-white group-hover:text-gray-900"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 18"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4h16v14.5a1.5 1.5 0 0 1-2.7 1l-1.3-.75a1.5 1.5 0 0 0-1.4 0L12 20.25a1.5 1.5 0 0 1-1.4 0l-1.3-.75a1.5 1.5 0 0 0-1.4 0l-1.3.75A1.5 1.5 0 0 1 4 18.5V4zm4 4h8m-8 4h8m-8 4h5"
                  />
                </svg>
                {isOpen && (
                  <span className="flex-1 ms-3 whitespace-nowrap">Pago de servicios</span>
                )}
              </a>
            </li>
            <li>
              <a
                href="/movimientos"
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-sky-200 dark:hover:bg-gray-700 group"
              >
                <svg
                  className="flex-shrink-0 w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M5 5V.13a2.96 2.96 0 0 0-1.293.749L.879 3.707A2.96 2.96 0 0 0 .13 5H5Z" />
                  <path d="M6.737 11.061a2.961 2.961 0 0 1 .81-1.515l6.117-6.116A4.839 4.839 0 0 1 16 2.141V2a1.97 1.97 0 0 0-1.933-2H7v5a2 2 0 0 1-2 2H0v11a1.969 1.969 0 0 0 1.933 2h12.134A1.97 1.97 0 0 0 16 18v-3.093l-1.546 1.546c-.413.413-.94.695-1.513.81l-3.4.679a2.947 2.947 0 0 1-1.85-.227 2.96 2.96 0 0 1-1.635-3.257l.681-3.397Z" />
                  <path d="M8.961 16a.93.93 0 0 0 .189-.019l3.4-.679a.961.961 0 0 0 .49-.263l6.118-6.117a2.884 2.884 0 0 0-4.079-4.078l-6.117 6.117a.96.96 0 0 0-.263.491l-.679 3.4A.961.961 0 0 0 8.961 16Zm7.477-9.8a.958.958 0 0 1 .68-.281.961.961 0 0 1 .682 1.644l-.315.315-1.36-1.36.313-.318Zm-5.911 5.911 4.236-4.236 1.359 1.359-4.236 4.237-1.7.339.341-1.699Z" />
                </svg>
                {isOpen && (
                  <span className="flex-1 ms-3 whitespace-nowrap">Movimientos</span>
                )}
              </a>
            </li>
          </ul>
        </div>
      </aside>
    </>
  );
};
