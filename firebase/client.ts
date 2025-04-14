// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDsHxMZ10tU4iBYblc1Iolbd2YB6IyFhjE",
  authDomain: "preptime-4a082.firebaseapp.com",
  projectId: "preptime-4a082",
  storageBucket: "preptime-4a082.firebasestorage.app",
  messagingSenderId: "752569376688",
  appId: "1:752569376688:web:cdad4c4d9aa19916d44075",
  measurementId: "G-HKCZY6P80L",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
