// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA5vcRG0oZorhfzwcnWnxePxiysoBjoI-s",
  authDomain: "blockchain-contactlist.firebaseapp.com",
  projectId: "blockchain-contactlist",
  storageBucket: "blockchain-contactlist.firebasestorage.app",
  messagingSenderId: "376333311595",
  appId: "1:376333311595:web:364f10e11092a43731db2e",
  measurementId: "G-WN77441066"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup, signOut };