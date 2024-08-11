import React from 'react';
import { FiMenu } from 'react-icons/fi';
import { BiStore } from "react-icons/bi";
import { GoArrowSwitch } from "react-icons/go";
import { GoHome } from "react-icons/go";
import { BiTable } from "react-icons/bi";


export const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <>
      <aside id="default-sidebar" className={`fixed top-16 left-0 z-40 h-full transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} sm:translate-x-0`} aria-label="Sidebar">
        <div className={`h-full px-3 pt-6 mb-6 flex flex-col overflow-y-auto bg-sky-50 dark:bg-gray-800 ${isOpen ? 'w-60' : 'w-16'}`}>
          <ul className="space-y-4 font-medium">
          <li>
            <button
              className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-sky-200 dark:hover:bg-gray-700 group"
              onClick={toggleSidebar}
            >
              <FiMenu className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 21" />
            </button>
            </li>
            <li>
              <a href="/gestionar-cuentas" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-sky-200 dark:hover:bg-gray-700 group">
                <GoHome className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 21" />
                {isOpen && <span className="ms-3">Mis Productos</span>}
              </a>
            </li>
            <li>
              <a href="/transaction" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-sky-200 dark:hover:bg-gray-700 group">
                <GoArrowSwitch className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 21" />
                {isOpen && <span className="flex-1 ms-3 whitespace-nowrap">Transferencias</span>}
              </a>
            </li>
            <li>
              <a href="/pago-servicios" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-sky-200 dark:hover:bg-gray-700 group">
                <BiStore className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 21" />
                {isOpen && <span className="flex-1 ms-3 whitespace-nowrap">Pago de servicios</span>}
              </a>
            </li>
            <li>
              <a href="/movimientos" className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-sky-200 dark:hover:bg-gray-700 group">
                <BiTable className="w-6 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 21" />
                {isOpen && <span className="flex-1 ms-3 whitespace-nowrap">Movimientos</span>}
              </a>
            </li>
          </ul>
        </div>
      </aside>
    </>
  );
};