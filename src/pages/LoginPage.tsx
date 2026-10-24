import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../i18n';
import { Button } from '../components/ui/Button';
import {
  Sparkles,
  ChevronLeft,
  AlertCircle,
  ShieldCheck,
  BookOpen,
  Zap,
  LogOut,
  UserCheck,
  Key,
  Lock
} from 'lucide-react';

interface LoginPageProps {
  onBack?: () => void;
  onSuccess?: () => void;
  onDemoBypass?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onBack, onSuccess, onDemoBypass }) => {
  const { t } = useI18n();
  const {
    user,
    loading,
    isConfigured,
    isInitialized,
    initializationError,
    error,
    signInWithGoogle,
    signOut,
    clearError
  } = useAuth();

  const handleGoogleSignIn = async () => {
    clearError();
    await signInWithGoogle();
    if (onSuccess && user) {
      onSuccess();
    }
  };

  const handleReturn = () => {
    if (onSuccess) {
      onSuccess();
    } else if (onBack) {
      onBack();
    } else {
      window.location.hash = '#/';
    }
  };

  const isReady = isConfigured && isInitialized;

  return (
    <div className="relative flex flex-col h-full bg-dark-bg text-dark-text overflow-y-auto overscroll-contain safe-area-bottom">
      {/* Ambient background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-brand-primary/15 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-20 left-10 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      {/* Top Header */}
      <header className="sticky top-0 z-20 bg-dark-bg/85 backdrop-blur-md border-b border-dark-border/60 safe-area-top">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          {onBack ? (
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-xl text-dark-muted hover:text-dark-text hover:bg-dark-elevated active:scale-95 transition-all"
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-brand-glow font-semibold">
              <Lock className="w-3.5 h-3.5 text-brand-primary" />
              <span>{t.login.portalGate}</span>
            </div>
          )}
          <span className="text-xs font-semibold text-dark-muted tracking-wider uppercase">
            {t.login.authRequired}
          </span>
          <div className="w-8" />
        </div>
      </header>

      {/* Main Content Container */}
      <main className="relative z-10 flex-1 flex flex-col justify-center max-w-md mx-auto w-full px-5 py-6 space-y-6">
        {/* Brand Emblem & Tagline */}
        <div className="text-center space-y-3">
          <div className="inline-flex relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-primary via-indigo-500 to-brand-accent p-0.5 shadow-xl shadow-brand-primary/25">
              <div className="w-full h-full bg-dark-surface rounded-[14px] flex items-center justify-center">
                <span className="text-2xl font-black bg-gradient-to-r from-brand-glow via-indigo-300 to-amber-300 bg-clip-text text-transparent">
                  BV
                </span>
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 p-1 bg-brand-accent rounded-full text-dark-bg">
              <Sparkles className="w-3 h-3" />
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {t.common.appName}
            </h1>
            <p className="text-sm font-medium text-indigo-300/90 tracking-wide">
              "{t.common.tagline}"
            </p>
          </div>

          <p className="text-xs text-dark-muted max-w-xs mx-auto leading-relaxed">
            {t.login.authDescription}
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-3 gap-2 py-1">
          <div className="p-2.5 rounded-xl bg-dark-surface/80 border border-dark-border/80 text-center space-y-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto" />
            <div className="text-[11px] font-semibold text-dark-text">{t.login.verifiedIdentity}</div>
            <div className="text-[9px] text-dark-muted leading-tight">Google Identity</div>
          </div>
          <div className="p-2.5 rounded-xl bg-dark-surface/80 border border-dark-border/80 text-center space-y-1">
            <BookOpen className="w-4 h-4 text-brand-primary mx-auto" />
            <div className="text-[11px] font-semibold text-dark-text">{t.login.heroChronicles}</div>
            <div className="text-[9px] text-dark-muted leading-tight">Hero Legacy</div>
          </div>
          <div className="p-2.5 rounded-xl bg-dark-surface/80 border border-dark-border/80 text-center space-y-1">
            <Zap className="w-4 h-4 text-amber-400 mx-auto" />
            <div className="text-[11px] font-semibold text-dark-text">{t.login.instantAccess}</div>
            <div className="text-[9px] text-dark-muted leading-tight">Continuous</div>
          </div>
        </div>

        {/* State A: User is already signed in */}
        {user ? (
          <div className="p-5 rounded-2xl bg-dark-surface border border-brand-primary/30 shadow-lg space-y-4 text-center">
            <div className="flex flex-col items-center space-y-2">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Hero'}
                  className="w-16 h-16 rounded-full border-2 border-brand-primary shadow-md object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-brand-primary/20 text-brand-primary flex items-center justify-center font-bold text-xl border-2 border-brand-primary">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'H'}
                </div>
              )}
              <div>
                <h3 className="font-bold text-base text-white">
                  {user.displayName || 'Valiant Hero'}
                </h3>
                <p className="text-xs text-dark-muted">{user.email}</p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold">
                <UserCheck className="w-3 h-3" /> Signed in with Google
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                variant="primary"
                onClick={handleReturn}
                className="w-full justify-center"
              >
                {t.login.enterApp}
              </Button>
              <Button
                variant="outline"
                onClick={signOut}
                disabled={loading}
                className="w-full justify-center text-xs text-red-400 border-red-500/20 hover:bg-red-500/10"
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" /> {t.login.signOut}
              </Button>
            </div>
          </div>
        ) : (
          /* State B: User is not signed in */
          <div className="space-y-4">
            {/* Operational Error Banner */}
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="font-medium">{error}</p>
                  <button
                    onClick={clearError}
                    className="text-[11px] underline text-red-200 hover:text-white"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Missing Configuration Notice Banner */}
            {!isConfigured && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-semibold text-amber-300">
                  <Key className="w-4 h-4" /> Firebase Configuration Required
                </div>
                <p className="text-[11px] leading-relaxed text-amber-200/90">
                  Google Authentication must be configured to enter BranchVerse. Provide your Firebase Web App credentials in{' '}
                  <code className="bg-dark-bg/60 px-1 py-0.5 rounded text-amber-300">.env.local</code>.
                  Required: <code className="text-amber-300">VITE_FIREBASE_API_KEY</code> and{' '}
                  <code className="text-amber-300">VITE_FIREBASE_PROJECT_ID</code>.
                </p>
                {onDemoBypass && (
                  <div className="pt-1">
                    <Button
                      variant="outline"
                      onClick={onDemoBypass}
                      className="w-full justify-center text-xs border-amber-500/40 text-amber-300 hover:bg-amber-500/10"
                    >
                      Bypass for Local Developer Testing (Firebase Unconfigured)
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Initialization Error Notice Banner (Configured, but SDK failed to initialize) */}
            {isConfigured && !isInitialized && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-semibold text-red-300">
                  <AlertCircle className="w-4 h-4" /> Firebase Initialization Error
                </div>
                <p className="text-[11px] leading-relaxed text-red-200/90">
                  {initializationError || 'Firebase Web SDK failed to initialize with the configured credentials. Please check console diagnostics.'}
                </p>
                {onDemoBypass && (
                  <div className="pt-1">
                    <Button
                      variant="outline"
                      onClick={onDemoBypass}
                      className="w-full justify-center text-xs border-red-500/40 text-red-300 hover:bg-red-500/10"
                    >
                      Bypass for Local Developer Testing
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Google Sign-In Action Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading || !isReady}
              className={`w-full h-13 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-3 transition-all shadow-md focus:outline-none select-none ${
                isReady
                  ? 'bg-white text-gray-800 hover:bg-gray-100 active:scale-[0.98] shadow-white/5 cursor-pointer'
                  : 'bg-dark-elevated text-dark-muted border border-dark-border cursor-not-allowed opacity-60'
              }`}
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{t.login.googleSignIn}</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Security & Privacy Footer Note */}
        <div className="text-center pt-4">
          <p className="text-[10px] text-dark-muted/70 leading-relaxed max-w-xs mx-auto">
            Google Authentication is required to enter BranchVerse. Your profile and story chronicles are authenticated under your Google identity.
          </p>
        </div>
      </main>
    </div>
  );
};
