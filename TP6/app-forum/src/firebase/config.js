// src/firebase.js
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD-p7m3vJdEIGu6epNi59EUJtPHiurCRds",
  authDomain: "forum-vue-7d07b.firebaseapp.com",
  projectId: "forum-vue-7d07b",
  storageBucket: "forum-vue-7d07b.firebasestorage.app",
  messagingSenderId: "960702561224",
  appId: "1:960702561224:web:aac589da0ab56efd0d9efd",
  measurementId: "G-YDL2GMLN6X"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig)

// Exporter auth et firestore
export const auth = getAuth(app)
export const db = getFirestore(app)