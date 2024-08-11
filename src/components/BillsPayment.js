import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { HeaderDashboard } from './HeaderDashboard';
import { useNavigate } from 'react-router-dom';
import { MdElectricBolt, MdWaterDrop, MdLocalPhone } from "react-icons/md";
import { TbNetwork } from "react-icons/tb";

const BillsPayment = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate(); //Para ir al componente del servicio

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handlePayment = (service, amount) => {
    navigate('/generar-pago', { state: { service, amount } }); // Navegación a una página para proceder al pago
  };

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderDashboard />
      <div className="flex flex-grow">
        <div className="w-1/4">
          <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        </div>

        <div className={`main-content p-6 mx-auto flex flex-col items-center justify-center w-full pt-16 ${isSidebarOpen ? 'sm:ml-0 md:ml-16 lg:ml-32' : 'sm:ml-0 md:ml-16 lg:ml-32'}`}>
          <h2 className="text-2xl font-bold mb-4">Pago de servicios</h2>
          <div className="w-full mb-6">
            <h3 className="text-xl font-semibold mb-4 text-left">Servicios disponibles</h3>
            <label className="block text-sm font-medium text-gray-700 mb-3">Selecciona el servicio que deseas pagar</label>
            <div className="account-cards grid gap-7 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <div
                className="account-card bg-sky-50 shadow-md rounded-lg p-6 lg:p-5 xl:p-7 hover:scale-105 transition-transform duration-300 cursor-pointer border border-gray-300 w-full max-w-xs"
                onClick={() => handlePayment('AGUA POTABLE', 8.25)}
              >
                <h4 className="account-number font-bold text-lg text-center">Agua potable</h4>
                <MdWaterDrop className="w-8 h-8 mx-auto mb-4" />
                <p>Realiza tu pago con tu número de cédula</p>
              </div>
              <div
                className="account-card bg-sky-50 shadow-md rounded-lg p-6 lg:p-5 xl:p-7 hover:scale-105 transition-transform duration-300 cursor-pointer border border-gray-300 w-full max-w-xs"
                onClick={() => handlePayment('ELECTRICIDAD', 40.35)}
              >
                <h4 className="account-number font-bold text-lg text-center">Electricidad</h4>
                <MdElectricBolt className="w-8 h-8 mx-auto mb-4" />
                <p>Realiza tu pago con tu número de cédula</p>
              </div>
              <div
                className="account-card bg-sky-50 shadow-md rounded-lg p-6 lg:p-5 xl:p-7 hover:scale-105 transition-transform duration-300 cursor-pointer border border-gray-300 w-full max-w-xs"
                onClick={() => handlePayment('TELÉFONO', 5.25)}
              >
                <h4 className="account-number font-bold text-lg text-center">Teléfono</h4>
                <MdLocalPhone className="w-8 h-8 mx-auto mb-4" />
                <p>Realiza tu pago con tu número de cédula</p>
              </div>
              <div
                className="account-card bg-sky-50 shadow-md rounded-lg p-6 lg:p-5 xl:p-7 hover:scale-105 transition-transform duration-300 cursor-pointer border border-gray-300 w-full max-w-xs"
                onClick={() => handlePayment('INTERNET', 33.94)}
              >
                <h4 className="account-number font-bold text-lg text-center">Servicio de internet</h4>
                <TbNetwork className="w-8 h-8 mx-auto mb-4" />
                <p>Realiza tu pago con tu número de cédula</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillsPayment;
