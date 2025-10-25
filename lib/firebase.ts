import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDPVFdQYnG00eSh3EZXsRyNW4iXX1gGG4o",
  authDomain: "studentloan-54a93.firebaseapp.com",
  projectId: "studentloan-54a93",
  storageBucket: "studentloan-54a93.firebasestorage.app",
  messagingSenderId: "415857355619",
  appId: "1:415857355619:web:dc97f4877a103f6ed40156",
  measurementId: "G-2VC9YP966D",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

export { app, db, auth }
