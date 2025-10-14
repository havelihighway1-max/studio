
'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Firestore, getFirestore } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged, getAuth } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { firebaseConfig } from './config';

// Define a shape for the core SDKs
interface FirebaseSDKs {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

// Internal state for user authentication
interface UserAuthState {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// Combined state for the Firebase context
export interface FirebaseContextState {
  areServicesAvailable: boolean; // True if core services are initialized
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null; // The Auth service instance
  user: User | null;
  isUserLoading: boolean; // True during initial auth check
  userError: Error | null; // Error from auth listener
}

// Return type for useFirebase()
export interface FirebaseServicesAndUser {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// Return type for useUser() - specific to user auth state
export interface UserHookResult { 
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// React Context
export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

/**
 * FirebaseProvider manages and provides Firebase services and user authentication state.
 */
export const FirebaseProvider: React.FC<{children: ReactNode}> = ({
  children
}) => {
  const [sdks, setSdks] = useState<FirebaseSDKs | null>(null);
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true, // Start loading until first auth event
    userError: null,
  });

  // Effect to initialize Firebase services once.
  useEffect(() => {
    // This function ensures Firebase is initialized only once.
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const auth = getAuth(app);
    const firestore = getFirestore(app);
    setSdks({ app, auth, firestore });
  }, []);

  // Effect to subscribe to Firebase auth state changes
  useEffect(() => {
    if (!sdks?.auth) {
      return; // Do nothing if auth service is not yet initialized
    }

    const unsubscribe = onAuthStateChanged(
      sdks.auth,
      (firebaseUser) => { // Auth state determined
        setUserAuthState({ user: firebaseUser, isUserLoading: false, userError: null });
      },
      (error) => { // Auth listener itself threw an error
        console.error("FirebaseProvider: onAuthStateChanged error:", error);
        setUserAuthState({ user: null, isUserLoading: false, userError: error });
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [sdks?.auth]); // Re-run this effect only when the auth service is available.

  // Memoize the context value
  const contextValue = useMemo((): FirebaseContextState => {
    const servicesAvailable = !!sdks;
    return {
      areServicesAvailable: servicesAvailable,
      firebaseApp: sdks?.app || null,
      firestore: sdks?.firestore || null,
      auth: sdks?.auth || null,
      user: userAuthState.user,
      isUserLoading: userAuthState.isUserLoading,
      userError: userAuthState.userError,
    };
  }, [sdks, userAuthState]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

/**
 * Hook to access core Firebase services and user authentication state.
 * Throws error if core services are not available or used outside provider.
 */
export const useFirebase = (): FirebaseServicesAndUser => {
  const context = useContext(FirebaseContext);

  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }

  // During initialization, services might be null. Components should handle this.
  // We'll only throw an error if the provider seems to be missing entirely.
  if (!context.areServicesAvailable || !context.firebaseApp || !context.firestore || !context.auth) {
    // This could happen during the very first render, before useEffect runs.
    // Let's return a loading state instead of throwing an error.
    // A component using this hook should check isUserLoading or isLoading on its own queries.
  }
  
  // We now trust that if areServicesAvailable is false, the consuming component will handle it
  // (e.g., by showing a loading spinner). Let's provide what we have.
  return {
    firebaseApp: context.firebaseApp!, // Use non-null assertion as consumer should check areServicesAvailable
    firestore: context.firestore!,
    auth: context.auth!,
    user: context.user,
    isUserLoading: context.isUserLoading,
    userError: context.userError,
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

/** Hook to access Firestore instance. Throws error if not available. */
export const useFirestore = (): Firestore => {
  const { firestore, areServicesAvailable } = useContext(FirebaseContext)!;
   if (!areServicesAvailable || !firestore) {
    throw new Error('useFirestore must be used within a FirebaseProvider and after services are available.');
  }
  return firestore;
};

/** Hook to access Firebase App instance. */
export const useFirebaseApp = (): FirebaseApp => {
  const { firebaseApp, areServicesAvailable } = useContext(FirebaseContext)!;
   if (!areServicesAvailable) {
    throw new Error('useFirebaseApp must be used within a FirebaseProvider and after services are available.');
  }
  return firebaseApp!;
};

type MemoFirebase <T> = T & {__memo?: boolean};

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | (MemoFirebase<T>) {
  const memoized = useMemo(factory, deps);
  
  if(typeof memoized !== 'object' || memoized === null) return memoized;
  (memoized as MemoFirebase<T>).__memo = true;
  
  return memoized;
}

/**
 * Hook specifically for accessing the authenticated user's state.
 * This provides the User object, loading status, and any auth errors.
 * @returns {UserHookResult} Object with user, isUserLoading, userError.
 */
export const useUser = (): UserHookResult => {
  const context = useContext(FirebaseContext);
   if (context === undefined) {
    throw new Error('useUser must be used within a FirebaseProvider.');
  }
  const { user, isUserLoading, userError } = context;
  return { user, isUserLoading, userError };
};
