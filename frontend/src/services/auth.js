// src/services/auth.js
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged 
  } from "firebase/auth";
  import { app } from "./firebase";
  
  // Initialize Firebase Authentication
  const auth = getAuth(app);
  
  // Function to login with email and password
  export const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Store token in localStorage for session management
      const token = await userCredential.user.getIdToken();
      localStorage.setItem('token', token);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Login error:', error.message);
      throw error;
    }
  };
  
  // Function to register a new user
  export const register = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Registration error:', error.message);
      throw error;
    }
  };
  
  // Function to log out
  export const logout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('token');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error.message);
      throw error;
    }
  };
  
  // Function to get the current authenticated user
  export const getCurrentUser = () => {
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(auth, 
        (user) => {
          unsubscribe();
          resolve(user);
        },
        (error) => {
          reject(error);
        }
      );
    });
  };
  
  export { auth };