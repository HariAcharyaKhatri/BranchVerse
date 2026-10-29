import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { LoginPage } from '../pages/LoginPage';
import { App } from '../App';
import * as firebaseLib from '../lib/firebase/firebase';

describe('BranchVerse Google Authentication Flow', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Firebase Configuration Detection', () => {
    it('reports configuration status as a boolean safely', () => {
      const configured = firebaseLib.isFirebaseConfigured();
      expect(typeof configured).toBe('boolean');
    });
  });

  describe('LoginPage Component', () => {
    it('renders BranchVerse brand, tagline, and Google Sign-In button in configured mode', async () => {
      render(
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      );

      // Verify Brand name and tagline
      expect(screen.getByText('BranchVerse')).toBeInTheDocument();
      expect(screen.getByText('"Your Choices. Your World. Your Story."')).toBeInTheDocument();

      // Verify Google action button
      expect(await screen.findByText('Continue with Google')).toBeInTheDocument();

      // Verify authentication requirement notice
      expect(screen.getByText(/Authentication is strictly required to enter BranchVerse/i)).toBeInTheDocument();
    });

    it('displays configuration guidance banner when Firebase keys are not provided', () => {
      vi.spyOn(firebaseLib, 'getFirebaseStatus').mockReturnValue({
        isConfigured: false,
        isInitialized: false,
        initializationError: null
      });

      render(
        <AuthProvider>
          <LoginPage onDemoBypass={vi.fn()} />
        </AuthProvider>
      );

      // Verify unconfigured notice
      expect(screen.getByText(/Firebase Configuration Required/i)).toBeInTheDocument();
      expect(screen.getByText(/VITE_FIREBASE_API_KEY/i)).toBeInTheDocument();
      expect(screen.getByText(/Bypass for Local Developer Testing/i)).toBeInTheDocument();
    });

    it('triggers onDemoBypass when developer bypass button is clicked in unconfigured mode', () => {
      vi.spyOn(firebaseLib, 'getFirebaseStatus').mockReturnValue({
        isConfigured: false,
        isInitialized: false,
        initializationError: null
      });

      const onDemoBypass = vi.fn();
      render(
        <AuthProvider>
          <LoginPage onDemoBypass={onDemoBypass} />
        </AuthProvider>
      );

      const bypassBtn = screen.getByText(/Bypass for Local Developer Testing/i);
      fireEvent.click(bypassBtn);
      expect(onDemoBypass).toHaveBeenCalled();
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
    });

    it('unlocks the full application when demo bypass is triggered in unconfigured mode', async () => {
      vi.spyOn(firebaseLib, 'getFirebaseStatus').mockReturnValue({
        isConfigured: false,
        isInitialized: false,
        initializationError: null
      });

      render(<App />);

      const bypassBtn = await screen.findByText(/Bypass for Local Developer Testing/i);
      fireEvent.click(bypassBtn);

      // Now the app is unlocked: Home features and BottomNav become visible
      expect(await screen.findByLabelText('Create')).toBeInTheDocument();
      expect(screen.getByText('New Hero')).toBeInTheDocument();
      expect(screen.getByText('Quick Play')).toBeInTheDocument();
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
      // Suppress console.error for expected thrown error
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => render(<TestConsumer />)).toThrow('useAuth must be used within an AuthProvider');
      consoleError.mockRestore();
    });

    it('allows entering as Guest and persists guest state', async () => {
      const GuestConsumer: React.FC = () => {
        const { user, signInAsGuest, signOut } = useAuth();
        return (
          <div>
            <span data-testid="guest-name">{user ? user.displayName : 'none'}</span>
            <button onClick={signInAsGuest}>Enter Guest</button>
            <button onClick={signOut}>Exit</button>
          </div>
        );
      };

      render(
        <AuthProvider>
          <GuestConsumer />
        </AuthProvider>
      );

      expect(screen.getByTestId('guest-name')).toHaveTextContent('none');

      fireEvent.click(screen.getByText('Enter Guest'));
      expect(screen.getByTestId('guest-name')).toHaveTextContent('Guest Hero');
      expect(localStorage.getItem('bv_guest_user')).toBe('true');

      fireEvent.click(screen.getByText('Exit'));
      await waitFor(() => {
        expect(screen.getByTestId('guest-name')).toHaveTextContent('none');
      });
      expect(localStorage.getItem('bv_guest_user')).toBeNull();
    });
  });

  describe('LoginPage Auto-Navigation & Guest Access', () => {
    it('always renders "Continue as Guest" so users are never locked out', () => {
      render(
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      );

      expect(screen.getByText(/Continue as Guest/i)).toBeInTheDocument();
    });

    it('calls onSuccess when Continue as Guest is clicked', () => {
      const onSuccess = vi.fn();
      render(
        <AuthProvider>
          <LoginPage onSuccess={onSuccess} />
        </AuthProvider>
      );

      const guestBtn = screen.getByText(/Continue as Guest/i);
      fireEvent.click(guestBtn);
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
