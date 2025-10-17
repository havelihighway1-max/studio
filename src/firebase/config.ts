
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, enableIndexedDbPersistence } from 'firebase/firestore';

export const firebaseConfig = {
  "apiKey": "AIzaSyAAyTI-aCJBlGy5nZoui0IT5DTFlyCOqgI",
  "authDomain": "studio-8417762391-4ab81.firebaseapp.com",
  "projectId": "studio-8417762391-4ab81",
  "storageBucket": "studio-8417762391-4ab81.firebasestorage.app",
  "messagingSenderId": "306828239267",
  "appId": "1:306828239267:web:74881c9436e9869463fa16"
};

// This is a temporary type to augment the global object for caching.
type GlobalWithFirebase = typeof globalThis & {
  firebaseApp?: FirebaseApp;
  firestore?: Firestore;
};

/**
 * Creates and caches a single Firebase App instance for the server.
 * This prevents re-initialization on every server-side render in Next.js.
 * @returns The singleton FirebaseApp instance.
 */
function getFirebaseApp(): FirebaseApp {
  if (typeof window === 'undefined') { // Server-side
    const g = global as GlobalWithFirebase;
    if (!g.firebaseApp) {
      g.firebaseApp = initializeApp(firebaseConfig);
    }
    return g.firebaseApp;
  }
  // Client-side
  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

/**
 * Creates and caches a single Firestore instance for the server.
 * @returns The singleton Firestore instance.
 */
export function getDb(): Firestore {
    const app = getFirebaseApp();
    const db = getFirestore(app);
    if (typeof window !== 'undefined') {
        enableIndexedDbPersistence(db).catch((err) => {
            if (err.code == 'failed-precondition') {
                console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
            } else if (err.code == 'unimplemented') {
                console.warn('The current browser does not support all of the features required to enable persistence.');
            }
        });
    }
    return db;
}
