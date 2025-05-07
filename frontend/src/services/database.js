// src/services/database.js
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, limit, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { app } from "./firebase";

// Initialize Firestore
const db = getFirestore(app);

// URLs Collection
const urlsCollection = collection(db, "urls");
const connectionsCollection = collection(db, "connections");
const captureSessionsCollection = collection(db, "captureSessions");

// Add a detected URL to the database
export const addDetectedUrl = async (urlData) => {
  try {
    const docRef = await addDoc(urlsCollection, {
      ...urlData,
      timestamp: new Date().toISOString()
    });
    return { id: docRef.id, ...urlData };
  } catch (error) {
    console.error("Error adding URL: ", error);
    throw error;
  }
};

// Get all detected URLs
export const getDetectedUrls = async () => {
  try {
    const q = query(urlsCollection, orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    const urls = [];
    querySnapshot.forEach((doc) => {
      urls.push({ id: doc.id, ...doc.data() });
    });
    return { urls };
  } catch (error) {
    console.error("Error getting URLs: ", error);
    throw error;
  }
};

// Add a suspicious connection to the database
export const addSuspiciousConnection = async (connectionData) => {
  try {
    const docRef = await addDoc(connectionsCollection, {
      ...connectionData,
      timestamp: new Date().toISOString()
    });
    return { id: docRef.id, ...connectionData };
  } catch (error) {
    console.error("Error adding connection: ", error);
    throw error;
  }
};

// Get all suspicious connections
export const getSuspiciousConnections = async () => {
  try {
    const q = query(connectionsCollection, orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    const connections = [];
    querySnapshot.forEach((doc) => {
      connections.push({ id: doc.id, ...doc.data() });
    });
    return { connections };
  } catch (error) {
    console.error("Error getting connections: ", error);
    throw error;
  }
};

// Create a new capture session
export const startCapture = async (captureData) => {
  try {
    const docRef = await addDoc(captureSessionsCollection, {
      ...captureData,
      startTime: new Date().toISOString(),
      status: "running"
    });
    return { status: "started", sessionId: docRef.id };
  } catch (error) {
    console.error("Error starting capture: ", error);
    throw error;
  }
};

// Update a capture session to stopped status
export const stopCapture = async (sessionId) => {
  try {
    const sessionRef = doc(db, "captureSessions", sessionId);
    await updateDoc(sessionRef, {
      endTime: new Date().toISOString(),
      status: "completed"
    });
    return { status: "stopped" };
  } catch (error) {
    console.error("Error stopping capture: ", error);
    throw error;
  }
};

export { db };