import React, { useEffect, useState } from 'react';
import { BRANDING } from '../../config/branding';
import { BrandEmblem } from './BrandEmblem';
import { Sparkles } from 'lucide-react';

export interface SplashScreenProps {
  onComplete?: () => void;
  minDurationMs?: number;
  message?: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  minDurationMs = 1800,
  message = 'Awakening the multiverse...',
}) => {
  const [bgLoaded, setBgLoaded] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Preload background image
    const img = new Image();
    img.src = BRANDING.assets.splashArt;
    img.onload = () => setBgLoaded(true);
    img.onerror = () => setBgLoaded(false);

    // Timing guard ensuring smooth cinematic experience
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      const exitTimer = setTimeout(() => {
        onComplete?.();
      }, 400); // Wait for fade-out transition
      return () => clearTimeout(exitTimer);
    }, minDurationMs);

    return () => clearTimeout(timer);
  }, [minDurationMs, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-6 sm:p-10 bg-[#080511] text-white overflow-hidden select-none transition-opacity duration-400 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      role="status"
      aria-live="polite"
      aria-label="BranchVerse Splash Screen"
    >
      {/* Background Artwork with Vignette and Gradient Overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {bgLoaded && (
          <img
            src={BRANDING.assets.splashArt}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover object-center scale-105 animate-[pulse_6s_ease-in-out_infinite] opacity-35 filter blur-[0.5px]"
          />
        )}
        {/* Radial Dark Vignette */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#090514]/75 to-[#05020a]" />
        {/* Ambient colored lighting glows */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-violet-600/20 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-amber-500/15 blur-[100px] pointer-events-none" />
      </div>

      {/* Top Brand Decorative Star */}
      <div className="relative z-10 pt-4 flex items-center justify-center opacity-70">
        <div className="flex items-center gap-2 text-xs tracking-[0.3em] font-serif uppercase text-amber-300/80">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
          <span>Interactive Multiverse RPG</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
        </div>
      </div>

      {/* Central Brand Crest & Identity */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-6 max-w-sm mx-auto my-auto animate-[fadeIn_0.8s_ease-out]">
        {/* Emblem with Ethereal Glowing Ring */}
        <div className="relative group">
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-amber-400 opacity-40 blur-xl group-hover:opacity-75 transition-opacity duration-700 animate-pulse" />
          <BrandEmblem size="xl" variant="icon" showGlow={false} priority={true} />
        </div>

        {/* Brand Typography */}
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-5xl font-serif font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white via-indigo-100 to-amber-200 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
            {BRANDING.name.toUpperCase()}
          </h1>
          <p className="text-xs sm:text-sm font-medium tracking-[0.18em] text-indigo-200/90 font-serif">
            {BRANDING.tagline}
          </p>
        </div>
      </div>

      {/* Bottom Loading Status & Subtle Celestial Spinner */}
      <div className="relative z-10 pb-6 flex flex-col items-center space-y-3">
        {/* Branching Constellation Orbit Spinner */}
        <div className="relative w-8 h-8 flex items-center justify-center" aria-hidden="true">
          <div className="absolute inset-0 rounded-full border-2 border-violet-500/30 border-t-amber-400 border-r-indigo-400 animate-spin" />
          <div className="w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_8px_#fde047]" />
        </div>

        <p className="text-xs tracking-wider text-indigo-300/80 font-mono animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
};
