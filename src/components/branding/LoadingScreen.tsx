import React, { useEffect, useState } from 'react';
import {
  BRANDING,
  LoadingContextType,
  CONTEXTUAL_LOADING_MESSAGES,
} from '../../config/branding';
import { BrandEmblem } from './BrandEmblem';
import { Button } from '../ui/Button';
import { AlertCircle, RefreshCw, XCircle } from 'lucide-react';

export interface LoadingScreenProps {
  context?: LoadingContextType;
  title?: string;
  message?: string;
  submessage?: string;
  progress?: number; // 0 to 100, only displayed if provided
  fullscreen?: boolean;
  error?: {
    title: string;
    message: string;
    onRetry?: () => void;
    onCancel?: () => void;
    retryable?: boolean;
  } | null;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  context = 'startup',
  title,
  message,
  submessage,
  progress,
  fullscreen = true,
  error = null,
}) => {
  const messagesList = CONTEXTUAL_LOADING_MESSAGES[context] || CONTEXTUAL_LOADING_MESSAGES.startup;
  const [messageIndex, setMessageIndex] = useState(0);

  // Rotate atmospheric loading messages every 3.5 seconds
  useEffect(() => {
    if (message || error) return;
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messagesList.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [message, messagesList.length, error]);

  const activeMessage = message || messagesList[messageIndex];

  const containerClasses = fullscreen
    ? 'fixed inset-0 z-50 flex flex-col items-center justify-center p-6 bg-[#080511] text-white select-none'
    : 'relative w-full min-h-[340px] flex flex-col items-center justify-center p-6 bg-dark-surface/90 rounded-2xl border border-dark-border text-white select-none';

  return (
    <div
      className={containerClasses}
      role="status"
      aria-live="polite"
      aria-label="Loading BranchVerse"
    >
      {/* Background ambient lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-violet-600/15 blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-indigo-500/10 blur-[80px]" />
      </div>

      {error ? (
        /* Error Recovery State */
        <div className="relative z-10 max-w-sm w-full mx-auto p-6 rounded-2xl bg-dark-elevated/95 border border-red-500/40 text-center space-y-4 shadow-2xl backdrop-blur-md">
          <div className="w-12 h-12 mx-auto rounded-full bg-red-500/20 text-red-400 flex items-center justify-center border border-red-500/30">
            <AlertCircle className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white font-serif tracking-wide">
              {error.title || 'Dimensional Resonance Interrupted'}
            </h3>
            <p className="text-xs text-dark-muted leading-relaxed">
              {error.message || 'Unable to establish link to the realm. Please retry or continue offline.'}
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            {error.onRetry && (
              <Button
                variant="primary"
                onClick={error.onRetry}
                className="w-full justify-center text-xs font-semibold py-2.5"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Retry Connection
              </Button>
            )}
            {error.onCancel && (
              <Button
                variant="ghost"
                onClick={error.onCancel}
                className="w-full justify-center text-xs text-dark-muted hover:text-white"
              >
                <XCircle className="w-3.5 h-3.5 mr-1.5" /> Return to Safe Realm
              </Button>
            )}
          </div>
        </div>
      ) : (
        /* Cinematic Animated Loading State */
        <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-sm mx-auto">
          {/* Central Logo Emblem with Orbital Portal Rings */}
          <div className="relative flex items-center justify-center">
            {/* Outer Orbiting Celestial Rune Ring */}
            <div
              className="absolute -inset-5 rounded-full border border-dashed border-violet-400/30 animate-spin pointer-events-none"
              style={{ animationDuration: '24s' }}
            />
            {/* Inner Concentric Glow Ring */}
            <div
              className="absolute -inset-2.5 rounded-full border border-amber-400/40 border-t-transparent animate-spin pointer-events-none"
              style={{ animationDuration: '4s' }}
            />
            {/* Brand Icon */}
            <BrandEmblem size="lg" variant="icon" showGlow={true} priority={true} />
          </div>

          {/* Loading Headline & Context Messages */}
          <div className="space-y-2">
            {title && (
              <h2 className="text-lg sm:text-xl font-serif font-bold text-white tracking-wide">
                {title}
              </h2>
            )}
            <div className="min-h-[40px] flex items-center justify-center">
              <p
                key={activeMessage}
                className="text-xs sm:text-sm text-indigo-200/90 font-mono tracking-wide animate-[fadeIn_0.4s_ease-out]"
              >
                {activeMessage}
              </p>
            </div>
            {submessage && (
              <p className="text-[11px] text-dark-muted font-sans">
                {submessage}
              </p>
            )}
          </div>

          {/* Progress Indicator (if accurate percentage available) */}
          {typeof progress === 'number' && !isNaN(progress) ? (
            <div className="w-48 space-y-1">
              <div className="w-full h-1.5 rounded-full bg-dark-surface border border-dark-border overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-amber-400 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                />
              </div>
              <span className="text-[10px] text-dark-muted font-mono">{Math.round(progress)}%</span>
            </div>
          ) : (
            /* Indeterminate Celestial Loader Pulse */
            <div className="flex items-center gap-1.5" aria-hidden="true">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-ping" style={{ animationDuration: '1.2s' }} />
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" style={{ animationDuration: '1.2s', animationDelay: '0.2s' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" style={{ animationDuration: '1.2s', animationDelay: '0.4s' }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
