// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  useEffect(() => {
    const fetchUserData = async (firebaseUser) => {
      try {
        const cachedUser = localStorage.getItem('user');
        if (cachedUser) {
          setUser(JSON.parse(cachedUser));
          setLoading(false);
          return;
        }

        const userDoc = await getDoc(doc(db, 'clientes', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const fullUserData = { ...firebaseUser, ...userData };
          localStorage.setItem('user', JSON.stringify(fullUserData));
          setUser(fullUserData);
        } else {
          setUser(firebaseUser);
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
      setLoading(false);
    };

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        fetchUserData(firebaseUser);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
