
'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';
import { Auth, getAuth } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { firebaseConfig } from './config';

// Define a shape for the core SDKs
interface FirebaseSDKs {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

// Combined state for the Firebase context
export interface FirebaseContextState {
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
}

// Return type for useFirebase()
export interface FirebaseServices {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

// React Context
export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

/**
 * FirebaseProvider manages and provides Firebase services.
 */
export const FirebaseProvider: React.FC<{children: ReactNode}> = ({
  children
}) => {
  const [sdks, setSdks] = useState<FirebaseSDKs | null>(null);

  // Effect to initialize Firebase services once.
  useEffect(() => {
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    setSdks({ app, auth, firestore });
  }, []);


  // Memoize the context value
  const contextValue = useMemo((): FirebaseContextState => {
    return {
      firebaseApp: sdks?.app || null,
      firestore: sdks?.firestore || null,
      auth: sdks?.auth || null,
    };
  }, [sdks]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

/**
 * Hook to access core Firebase services.
 * Can return null for services that are not yet available.
 */
export const useFirebase = (): Partial<FirebaseServices> => {
  const context = useContext(FirebaseContext);

  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }
  
  return {
    firebaseApp: context.firebaseApp || undefined,
    firestore: context.firestore || undefined,
    auth: context.auth || undefined,
  };
};

/** Hook to access Firebase Auth instance. Returns null if not yet available. */
export const useAuth = (): Auth | null => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a FirebaseProvider.');
  }
  return context.auth;
};

/** Hook to access Firestore instance. Returns null if not yet available. */
export const useFirestore = (): Firestore | null => {
  const context = useContext(FirebaseContext);
   if (context === undefined) {
    throw new Error('useFirestore must be used within a FirebaseProvider.');
  }
  return context.firestore;
};

/** Hook to access Firebase App instance. Returns null if not available */
export const useFirebaseApp = (): FirebaseApp | null => {
  const context = useContext(FirebaseContext);
   if (context === undefined) {
    throw new Error('useFirebaseApp must be used within a FirebaseProvider.');
  }
  return context.firebaseApp;
};

type MemoFirebase <T> = T & {__memo?: boolean};

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoized = useMemo(factory, deps);
  
  if(typeof memoized !== 'object' || memoized === null) return memoized;
  
  if (!('__memo' in memoized)) {
    try {
      (memoized as MemoFirebase<T>).__memo = true;
    } catch (e) {
      // Object is not extensible, cannot add property.
      // This is fine, we just can't track it.
    }
  }
  
  return memoized;
}

    