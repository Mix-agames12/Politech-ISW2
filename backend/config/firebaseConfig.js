// src/firebaseConfig.js
const { initializeApp } = require("firebase/app");
const { getAuth, setPersistence, browserLocalPersistence } = require("firebase/auth");
const { getFirestore } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyDKDm9I2Y917UuKWKzs7_Vp13wu_cUQiX0",
  authDomain: "politechsw.firebaseapp.com",
  projectId: "politechsw",
  storageBucket: "politechsw.appspot.com",
  messagingSenderId: "515805507957",
  appId: "1:515805507957:web:62f2c5875a3617e59ba33c",
  measurementId: "G-ECED6L38KS"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

module.exports = { auth, db };
