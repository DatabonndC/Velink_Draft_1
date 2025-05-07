// src/services/api.js
import { auth, db } from './firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

// Authentication function
export const login = async (email, password) => {
  try {
    // For testing purposes - allow login with username "admin" and password "1234"
    if (email === "admin" && password === "1234") {
      // Use the pre-created test account
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        "admin@velink-test.com", 
        "1234"
      );
      
      // Store token in localStorage for persistence
      localStorage.setItem('token', await userCredential.user.getIdToken());
      localStorage.setItem('user', JSON.stringify({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: "Admin User",
        role: "admin"
      }));
      
      return userCredential.user;
    } else {
      // For real users, use their email and password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Store token in localStorage for persistence
      localStorage.setItem('token', await userCredential.user.getIdToken());
      
      return userCredential.user;
    }
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

// Network capture API functions
export const startCapture = async () => {
  // In a real app, this would call your backend API
  // For the prototype, we'll simulate a successful response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ status: "started", message: "Capture started successfully" });
    }, 1000);
  });
};

export const stopCapture = async () => {
  // In a real app, this would call your backend API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ status: "stopped", message: "Capture stopped successfully" });
    }, 1000);
  });
};

// Get all detected URLs
export const getDetectedUrls = async () => {
  try {
    // In a real app, this would fetch from Firestore
    // For the prototype, we'll return simulated data
    return {
      urls: [
        {
          url: "https://example.com/login",
          suspicious: false,
          protocol: "HTTPS",
          timestamp: new Date().toISOString(),
          source_ip: "192.168.1.5"
        },
        {
          url: "http://malware-example.net/download",
          suspicious: true,
          protocol: "HTTP",
          timestamp: new Date().toISOString(),
          source_ip: "192.168.1.5"
        },
        {
          url: "https://banking-secure.com",
          suspicious: false,
          protocol: "HTTPS",
          timestamp: new Date().toISOString(),
          source_ip: "192.168.1.5"
        },
        {
          url: "http://phishing-example.com",
          suspicious: true,
          protocol: "HTTP",
          timestamp: new Date().toISOString(),
          source_ip: "192.168.1.5"
        }
      ]
    };
  } catch (error) {
    console.error("Error fetching URLs:", error);
    throw error;
  }
};

// Get suspicious connections
export const getSuspiciousConnections = async () => {
  try {
    // In a real app, this would fetch from Firestore
    return {
      connections: [
        {
          url: "http://suspicious-domain.com",
          threat_level: "high",
          protocol: "HTTP",
          source_ip: "192.168.1.5",
          timestamp: new Date().toISOString(),
          details: "Suspicious domain with known malware distribution"
        },
        {
          url: "https://unusual-port-connection.com:8080",
          threat_level: "medium",
          protocol: "HTTPS",
          source_ip: "192.168.1.5",
          timestamp: new Date().toISOString(),
          details: "Connection on unusual port 8080"
        }
      ]
    };
  } catch (error) {
    console.error("Error fetching suspicious connections:", error);
    throw error;
  }
};

// Additional API functions
export const logout = async () => {
  try {
    await auth.signOut();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return true;
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};