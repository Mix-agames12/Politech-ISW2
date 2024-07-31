// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCR07ZMbzcqOWwyhoCKIOCBUnsjjOVvrMY",
    authDomain: "bankalao-ed14b.firebaseapp.com",
    databaseURL: "https://bankalao-ed14b-default-rtdb.firebaseio.com",
    projectId: "bankalao-ed14b",
    storageBucket: "bankalao-ed14b.appspot.com",
    messagingSenderId: "888383840547",
    appId: "1:888383840547:web:516e021234315947852c96",
    measurementId: "G-NG11S4S6Y0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Persistence set to browserLocalPersistence");
  })
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });

export { auth, db };
