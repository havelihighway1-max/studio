// This file is the main entry point for firebase-related modules.
// It is intended for client-side use.

// IMPORTANT: DO NOT EXPORT `initializeFirebase` or `getSdks` from here
// to prevent re-initialization. Import services from `firebase/client`.

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './errors';
export * from './error-emitter';
