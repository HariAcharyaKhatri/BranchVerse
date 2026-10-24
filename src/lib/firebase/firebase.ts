import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  Auth,
  browserLocalPersistence,
  setPersistence
} from 'firebase/auth';

/**
 * Validates whether the required Firebase environment variables are present and non-placeholder.
 * Required by Firebase SDK for Web Auth: apiKey and projectId.
 */
export function isFirebaseConfigured(): boolean {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') return false;
  if (!projectId || typeof projectId !== 'string' || projectId.trim() === '') return false;

  if (apiKey.includes('YOUR_') || apiKey === 'undefined') return false;
  if (projectId.includes('YOUR_') || projectId === 'undefined') return false;

  return true;
}

/**
 * Safe diagnostic logging that reports strictly whether each variable is present (booleans only).
 * Never logs or prints sensitive keys or secret values.
 */
export function logFirebaseDiagnostics(): void {
  const diagnostic = {
    apiKeyPresent: Boolean(import.meta.env.VITE_FIREBASE_API_KEY?.trim()),
    authDomainPresent: Boolean(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim()),
    projectIdPresent: Boolean(import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim()),
    storageBucketPresent: Boolean(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim()),
    messagingSenderIdPresent: Boolean(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim()),
    appIdPresent: Boolean(import.meta.env.VITE_FIREBASE_APP_ID?.trim()),
    isConfigured: isFirebaseConfigured(),
    isInitialized: auth !== null,
    hasInitializationError: initializationError !== null,
  };

  console.info('[BranchVerse Firebase Diagnostic]', diagnostic);
}

const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim() || '';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.trim() || '',
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim() ||
    (projectId ? `${projectId}.firebaseapp.com` : ''),
  projectId,
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim() ||
    (projectId ? `${projectId}.firebasestorage.app` : ''),
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim() || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID?.trim() || '',
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let initializationError: string | null = null;

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Guard against duplicate initialization: reuse existing instance if already created
if (isFirebaseConfigured()) {
  try {
    const existingApps = getApps();
    if (existingApps.length > 0) {
      app = getApp();
    } else {
      app = initializeApp(firebaseConfig);
    }

    auth = getAuth(app);

    // Persist session across mobile browser reloads
    setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.warn('[BranchVerse Firebase] Session persistence warning:', err?.message || err);
    });
  } catch (error: any) {
    initializationError = error?.message || 'Failed to initialize Firebase App.';
    console.error('[BranchVerse Firebase] Initialization error:', error);
  }
}

// Run safe diagnostic log on startup (reports booleans only)
logFirebaseDiagnostics();

export function getFirebaseStatus(): {
  isConfigured: boolean;
  isInitialized: boolean;
  initializationError: string | null;
} {
  return {
    isConfigured: isFirebaseConfigured(),
    isInitialized: auth !== null,
    initializationError,
  };
}

export { app, auth, googleProvider, initializationError };
