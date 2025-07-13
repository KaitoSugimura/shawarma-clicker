// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAKDRAJZyu2OT2A1jMi2LFTUdSE5mb4Px4",
  authDomain: "shawarma-clicker.firebaseapp.com",
  projectId: "shawarma-clicker",
  storageBucket: "shawarma-clicker.firebasestorage.app",
  messagingSenderId: "445304261690",
  appId: "1:445304261690:web:69b17e4cbefd23482bb903",
  measurementId: "G-EXE12BM5BQ",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
