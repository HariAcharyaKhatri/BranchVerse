import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, googleProvider, getFirebaseStatus } from '../lib/firebase/firebase';

export interface AuthUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  providerId: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isConfigured: boolean;
  isInitialized: boolean;
  initializationError: string | null;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const status = getFirebaseStatus();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(status.isConfigured && status.isInitialized);
  const [error, setError] = useState<string | null>(null);

  const mapFirebaseUser = (firebaseUser: FirebaseUser | null): AuthUser | null => {
    if (!firebaseUser) return null;
    return {
      uid: firebaseUser.uid,
      displayName: firebaseUser.displayName,
      email: firebaseUser.email,
      photoURL: firebaseUser.photoURL,
      providerId: firebaseUser.providerData[0]?.providerId || 'google.com'
    };
  };

  const formatAuthError = (err: any): string => {
    const code = err?.code || '';
    switch (code) {
      case 'auth/unauthorized-domain':
        return "This domain is not authorized for Google Sign-In. Add 'localhost' to Authorized Domains in Firebase Console (Authentication > Settings > Authorized domains).";
      case 'auth/popup-closed-by-user':
        return 'Sign-in was cancelled before completion.';
      case 'auth/popup-blocked':
        return 'Sign-in popup was blocked by your browser. Attempting redirect sign-in...';
      case 'auth/cancelled-popup-request':
        return 'Sign-in window was closed by a newer request.';
      case 'auth/network-request-failed':
        return 'Network connection issue. Please check your internet connection.';
      case 'auth/operation-not-allowed':
        return 'Google Sign-In is not enabled. Go to Firebase Console > Authentication > Sign-in method and enable Google.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      default:
        return err?.message || 'Failed to sign in with Google. Please try again.';
    }
  };

  useEffect(() => {
    if (!status.isConfigured || !auth) {
      return;
    }

    let isMounted = true;

    // Check for redirect result on return from mobile redirect auth
    getRedirectResult(auth)
      .then((result) => {
        if (!isMounted) return;
        if (result?.user) {
          setUser(mapFirebaseUser(result.user));
          setError(null);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        // Suppress expected environment error in Node/JSDOM test runners
        if (err?.code !== 'auth/operation-not-supported-in-this-environment') {
          console.error('Redirect sign-in error:', err);
          setError(formatAuthError(err));
        }
      });

    // Listen to continuous auth state changes
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        if (!isMounted) return;
        setUser(mapFirebaseUser(firebaseUser));
        setLoading(false);
      },
      (err) => {
        if (!isMounted) return;
        console.error('Auth state change error:', err);
        setError(formatAuthError(err));
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [status.isConfigured, status.isInitialized]);

  const signInWithGoogle = async (): Promise<void> => {
    if (!status.isConfigured) {
      setError(
        'Firebase Authentication configuration is missing. Please supply VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID in .env.local.'
      );
      return;
    }

    if (!auth) {
      setError(
        status.initializationError ||
        'Firebase Authentication failed to initialize. Please check console diagnostics.'
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First attempt: popup sign-in
      const result = await signInWithPopup(auth, googleProvider);
      setUser(mapFirebaseUser(result.user));
      setError(null);
    } catch (err: any) {
      // If mobile browser blocks popups, fallback to redirect flow
      if (err?.code === 'auth/popup-blocked') {
        try {
          await signInWithRedirect(auth, googleProvider);
          return; // Redirecting away from page
        } catch (redirectErr: any) {
          console.error('Redirect fallback error:', redirectErr);
          setError(formatAuthError(redirectErr));
        }
      } else {
        console.error('Google sign-in error:', err);
        setError(formatAuthError(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    if (!auth) {
      setUser(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (err: any) {
      console.error('Sign-out error:', err);
      setError(err?.message || 'Failed to sign out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isConfigured: status.isConfigured,
        isInitialized: status.isInitialized,
        initializationError: status.initializationError,
        error,
        signInWithGoogle,
        signOut,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
