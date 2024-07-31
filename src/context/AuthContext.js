// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { auth } from '../firebaseConfig'; // Importar configuración de Firebase

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        // Aquí puedes agregar lógica para obtener más datos del usuario si es necesario
        setUser(firebaseUser);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
