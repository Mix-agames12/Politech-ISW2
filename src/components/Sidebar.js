import React, { useState, useEffect } from 'react';
import { FiMenu } from 'react-icons/fi';
import { BiStore, BiTable } from "react-icons/bi";
import { GoArrowSwitch, GoHome } from "react-icons/go";

export const Sidebar = ({ isOpen = true, toggleSidebar }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsCollapsed(false);
      } else {
        setIsCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Inicializar el estado en base al tamaño de la ventana

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggle = () => {
    if (window.innerWidth >= 768) {
      setIsCollapsed(prev => !prev);
    } else {
      toggleSidebar();
    }
  };

  const renderMenuItem = (href, Icon, label) => (
    <li>
      <a
        href={href}
        className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-sky-200 dark:hover:bg-gray-700 group"
      >
        <Icon className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
        {!isCollapsed && <span className="ms-3">{label}</span>}
      </a>
    </li>
  );

  return (
    <>
      {/* Botón de menú para dispositivos móviles */}
      <button
        className="sm:hidden fixed top-16 left-4 z-50 p-2 bg-sky-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none mt-4"
        onClick={toggleSidebar}
      >
        <FiMenu className="w-6 h-6" />
      </button>

      {/* Sidebar */}
      <aside
        id="default-sidebar"
        className={`fixed top-16 left-0 z-40 h-full transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'
          } ${isCollapsed ? 'w-16' : 'w-60'} sm:translate-x-0 bg-sky-50 dark:bg-gray-800`}
        aria-label="Sidebar"
      >
        <div
          className={`h-full px-3 pt-6 mb-6 flex flex-col overflow-y-auto transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-60'
            }`}
        >
          <ul className="space-y-4 font-medium">
            <li>
              <button
                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-sky-200 dark:hover:bg-gray-700 group"
                onClick={handleToggle}
              >
                <FiMenu className="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                {!isCollapsed && <span className="ms-3">Menú</span>}
              </button>
            </li>
            {renderMenuItem('/manage-accounts', GoHome, 'Mis Productos')}
            {renderMenuItem('/transfer', GoArrowSwitch, 'Transferencias')}
            {renderMenuItem('/bills-payment', BiStore, 'Pago de servicios')}
            {renderMenuItem('/movements', BiTable, 'Movimientos')}
          </ul>
        </div>
      </aside>
    </>
  );
};
