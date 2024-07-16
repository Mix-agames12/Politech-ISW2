// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };