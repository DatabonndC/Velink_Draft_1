// src/services/firebase.js
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB-qWv3euQkMhRfuQSOZgHpbZLU27_PFIg",
  authDomain: "velink-cf74c.firebaseapp.com",
  projectId: "velink-cf74c",
  storageBucket: "velink-cf74c.firebasestorage.app",
  messagingSenderId: "498032811013",
  appId: "1:498032811013:web:a3e2ed26beee639b12106c",
  measurementId: "G-WH6CJMHP0V",
  // Updated databaseURL to use your actual Realtime Database URL from Firebase console
  databaseURL: "https://velink-cf74c-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase - Singleton pattern
let app;

// Check if we're in the browser environment
if (typeof window !== 'undefined') {
  if (!getApps().length) {
    try {
      // Initialize the Firebase app
      app = initializeApp(firebaseConfig);
      console.log("Firebase initialized successfully");
    } catch (error) {
      console.error("Error initializing Firebase:", error);
    }
  } else {
    app = getApps()[0];
  }
} else {
  // Server-side initialization
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
}

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);

// Export all needed Firebase instances
export { app, auth, db, rtdb };