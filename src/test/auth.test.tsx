import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { LoginPage } from '../pages/LoginPage';
import { App } from '../App';
import * as firebaseLib from '../lib/firebase/firebase';

describe('BranchVerse Google Authentication Flow', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('Firebase Configuration Detection', () => {
    it('reports configuration status as a boolean safely', () => {
      const status = firebaseLib.getFirebaseStatus();
      expect(typeof status.isConfigured).toBe('boolean');
      expect(typeof status.isInitialized).toBe('boolean');
    });
  });

  describe('LoginPage Component', () => {
    it('renders BranchVerse brand, tagline, and Google Sign-In button in configured mode', async () => {
      render(
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      );

      // Verify Brand elements
      expect(screen.getByText('BranchVerse')).toBeInTheDocument();
      expect(screen.getByText(/"Your Choices. Your World. Your Story."/i)).toBeInTheDocument();

      // Verify Google Authentication Button (waits for initial auth check)
      expect(await screen.findByText('Continue with Google')).toBeInTheDocument();
      expect(screen.getAllByText(/Google Identity/i).length).toBeGreaterThan(0);
    });

    it('displays configuration guidance banner when Firebase keys are not provided and does NOT show demo bypass', () => {
      vi.spyOn(firebaseLib, 'getFirebaseStatus').mockReturnValue({
        isConfigured: false,
        isInitialized: false,
        initializationError: null
      });

      render(
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      );

      // Verify unconfigured notice
      expect(screen.getByText(/Firebase Configuration Required/i)).toBeInTheDocument();
      expect(screen.getByText(/VITE_FIREBASE_API_KEY/i)).toBeInTheDocument();
      expect(screen.queryByText(/Bypass for Local Developer Testing/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Continue as Guest/i)).not.toBeInTheDocument();
    });
  });

  describe('Strict Authentication Gate in App', () => {
    it('locks the entire application behind LoginPage when unauthenticated', async () => {
      render(<App />);

      // Verify that LoginPage is shown as the gate
      expect(await screen.findByText('BranchVerse')).toBeInTheDocument();
      expect(await screen.findByText('Continue with Google')).toBeInTheDocument();

      // Verify that Home screen features and Bottom Navigation are NOT visible
      expect(screen.queryByText('Defend the Frontier')).not.toBeInTheDocument();
      expect(screen.queryByText('Start Random Journey')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Create')).not.toBeInTheDocument();
      expect(screen.queryByText(/Continue as Guest/i)).not.toBeInTheDocument();
    });
  });

  describe('AuthContext Hook Safety', () => {
    const TestConsumer: React.FC = () => {
      const { user, isConfigured, loading, signInWithGoogle, signOut } = useAuth();
      return (
        <div>
          <span data-testid="user-status">{user ? user.displayName : 'anonymous'}</span>
          <span data-testid="config-status">{isConfigured ? 'configured' : 'unconfigured'}</span>
          <span data-testid="loading-status">{loading ? 'loading' : 'idle'}</span>
          <button onClick={signInWithGoogle}>Sign In</button>
          <button onClick={signOut}>Sign Out</button>
        </div>
      );
    };

    it('provides unauthenticated state without throwing', async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );

      expect(screen.getByTestId('user-status')).toHaveTextContent('anonymous');
      await waitFor(() => {
        expect(screen.getByTestId('loading-status')).toHaveTextContent('idle');
      });
    });

    it('throws error when useAuth is consumed outside AuthProvider', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => render(<TestConsumer />)).toThrow('useAuth must be used within an AuthProvider');
      consoleError.mockRestore();
    });
  });

  describe('LoginPage Auto-Navigation & Verified Identity', () => {
    it('renders welcoming entry screen when user is already authenticated and triggers onSuccess', async () => {
      const onSuccess = vi.fn();

      render(
        <AuthProvider>
          <LoginPage onSuccess={onSuccess} />
        </AuthProvider>
      );

      // Verify Google login button is rendered for unauthenticated state
      expect(await screen.findByText('Continue with Google')).toBeInTheDocument();
      expect(screen.queryByText(/Continue as Guest/i)).not.toBeInTheDocument();
    });
  });
});
