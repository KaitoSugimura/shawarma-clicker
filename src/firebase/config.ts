import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAKDRAJZyu2OT2A1jMi2LFTUdSE5mb4Px4",
  authDomain: "shawarma-clicker.firebaseapp.com",
  projectId: "shawarma-clicker",
  storageBucket: "shawarma-clicker.firebasestorage.app",
  messagingSenderId: "445304261690",
  appId: "1:445304261690:web:69b17e4cbefd23482bb903",
  measurementId: "G-EXE12BM5BQ",
};

export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
