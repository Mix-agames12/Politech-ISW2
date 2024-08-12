import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from './Home';

// Mock de los componentes que son importados dentro de Home
jest.mock('./HeaderHome', () => ({
  HeaderHome: () => <div>Mocked HeaderHome</div>,
}));
jest.mock('./Footer', () => () => <div>Mocked Footer</div>);
jest.mock('./WhatsAppWidget', () => () => <div>Mocked WhatsAppWidget</div>);

describe('Home Component', () => {
  it('renders Home component with correct content', () => {
    render(<Home />);

    // Verifica que los títulos principales se renderizan correctamente
    expect(screen.getByText('Soluciones en Línea')).toBeInTheDocument();
    expect(screen.getByText('¿Qué puedes hacer con Banco PoliTech?')).toBeInTheDocument();

    // Verifica la existencia de un enlace con el texto 'Inicia sesión'
    const loginLink = screen.getByText('Inicia sesión');
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');

    // Verifica la existencia de un enlace con el texto 'Abre una cuenta'
    const signupLink = screen.getByText('Abre una cuenta');
    expect(signupLink).toBeInTheDocument();
    expect(signupLink).toHaveAttribute('href', '/signup');

    // Verifica que los mocks de HeaderHome, Footer y WhatsAppWidget están presentes
    expect(screen.getByText('Mocked HeaderHome')).toBeInTheDocument();
    expect(screen.getByText('Mocked Footer')).toBeInTheDocument();
    expect(screen.getByText('Mocked WhatsAppWidget')).toBeInTheDocument();
  });

  it('checks links functionality', () => {
    render(<Home />);

    // Verifica el enlace 'Inicia sesión'
    const loginLink = screen.getByText('Inicia sesión');
    expect(loginLink).toHaveAttribute('href', '/login');

    // Simula un clic en el enlace 'Inicia sesión'
    fireEvent.click(loginLink);
    // Aquí podrías verificar algún comportamiento esperado después del clic si fuera relevante

    // Verifica el enlace 'Abre una cuenta'
    const signupLink = screen.getByText('Abre una cuenta');
    expect(signupLink).toHaveAttribute('href', '/signup');

    // Simula un clic en el enlace 'Abre una cuenta'
    fireEvent.click(signupLink);
    // Aquí también podrías verificar algún comportamiento esperado después del clic
  });

  it('renders images correctly', () => {
    render(<Home />);

    // Verifica que las imágenes se renderizan con los atributos correctos
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);

    images.forEach((image) => {
      expect(image).toHaveAttribute('src');
      expect(image).toHaveAttribute('alt');
    });
  });

  it('logs component content to console', () => {
    const component = render(<Home />);
    console.log(component);
  });
});
