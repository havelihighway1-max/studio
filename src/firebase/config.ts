
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

export const firebaseConfig = {
  "apiKey": "AIzaSyAAyTI-aCJBlGy5nZoui0IT5DTFlyCOqgI",
  "authDomain": "studio-8417762391-4ab81.firebaseapp.com",
  "projectId": "studio-8417762391-4ab81",
  "storageBucket": "studio-8417762391-4ab81.firebasestorage.app",
  "messagingSenderId": "306828239267",
  "appId": "1:306828239267:web:74881c9436e9869463fa16"
};

// Singleton pattern to initialize and get Firebase instances
let app: FirebaseApp;
let db: Firestore;

function initializeServerApp() {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } else {
    app = getApp();
    db = getFirestore(app);
  }
}

// Call initialization
initializeServerApp();

/**
 * Returns the Firestore database instance for server-side usage.
 * This ensures a single instance is used across the server.
 */
export const getDb = (): Firestore => {
  return db;
};
