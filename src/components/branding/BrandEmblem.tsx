import React, { useState } from 'react';
import { BRANDING } from '../../config/branding';

export interface BrandEmblemProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  variant?: 'icon' | 'logo' | 'symbol';
  className?: string;
  showGlow?: boolean;
  glow?: boolean;
  priority?: boolean;
}

const SIZE_CLASSES = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24',
  custom: '',
};

/**
 * High-fidelity Vector Fallback rendered when image asset is unavailable or loading.
 * Depicts the iconic BranchVerse crescent arc, 4-point star, and branching dimensional portal.
 */
export const SvgBrandEmblemFallback: React.FC<{ className?: string; showGlow?: boolean }> = ({
  className = 'w-full h-full',
  showGlow = true,
}) => {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {showGlow && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-violet-600/30 via-indigo-500/20 to-amber-400/20 blur-xl pointer-events-none" />
      )}
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_4px_16px_rgba(124,58,237,0.4)]"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="bvBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
          <linearGradient id="bvBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a0b2e" />
            <stop offset="50%" stopColor="#090514" />
            <stop offset="100%" stopColor="#04020a" />
          </linearGradient>
          <linearGradient id="bvGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="40%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id="bvPathGradA" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="bvPathGradB" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#c084fc" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* Rounded Container Frame */}
        <rect
          x="6"
          y="6"
          width="188"
          height="188"
          rx="42"
          fill="url(#bvBgGrad)"
          stroke="url(#bvBorderGrad)"
          strokeWidth="3.5"
        />

        {/* Celestial Star at Crest */}
        <path
          d="M100 18 L104 34 L120 38 L104 42 L100 58 L96 42 L80 38 L96 34 Z"
          fill="url(#bvGoldGrad)"
        />

        {/* Crescent Halo Arc */}
        <path
          d="M 46 88 A 62 62 0 1 1 154 88"
          fill="none"
          stroke="url(#bvGoldGrad)"
          strokeWidth="2.5"
          strokeDasharray="4 2"
          opacity="0.85"
        />

        {/* Castle & Mountain Silhouette Backdrop */}
        <path
          d="M 32 108 L 42 98 L 46 102 L 52 92 L 56 104 L 70 96 L 78 116 Z"
          fill="#3b0764"
          opacity="0.6"
        />
        <path
          d="M 124 116 L 138 98 L 148 106 L 160 92 L 172 112 Z"
          fill="#311042"
          opacity="0.6"
        />

        {/* Branching Roads of Fate */}
        <path
          d="M 44 128 C 70 124, 88 142, 100 156 C 88 148, 62 142, 44 148 Z"
          fill="url(#bvPathGradA)"
        />
        <path
          d="M 156 128 C 130 124, 112 142, 100 156 C 112 148, 138 142, 156 148 Z"
          fill="url(#bvPathGradB)"
        />

        {/* Central Majestic "B" Emblem */}
        <path
          d="M 78 52 C 96 50, 126 54, 126 78 C 126 94, 110 102, 100 104 C 116 108, 132 118, 132 138 C 132 162, 102 166, 78 164 Z M 92 68 L 92 98 C 102 98, 114 96, 114 82 C 114 70, 102 68, 92 68 Z M 92 112 L 92 148 C 104 148, 118 144, 118 130 C 118 114, 104 112, 92 112 Z"
          fill="url(#bvGoldGrad)"
        />

        {/* Hero Silhouette at the Gateway Threshold */}
        <path
          d="M 98 136 C 98 132, 102 132, 102 136 C 102 140, 98 140, 98 136 Z M 95 142 C 97 140, 103 140, 105 142 L 108 160 L 92 160 Z"
          fill="#0f0728"
        />
      </svg>
    </div>
  );
};

export const BrandEmblem: React.FC<BrandEmblemProps> = ({
  size = 'md',
  variant = 'icon',
  className = '',
  showGlow = true,
  glow,
  priority = false,
}) => {
  const [imageError, setImageError] = useState(false);
  const sizeClass = SIZE_CLASSES[size];
  const activeGlow = glow !== undefined ? glow : showGlow;

  const imageSrc =
    variant === 'icon'
      ? BRANDING.assets.appIcon
      : variant === 'logo'
        ? BRANDING.assets.logo
        : BRANDING.assets.appIcon;

  if (imageError) {
    return (
      <div className={`relative shrink-0 ${sizeClass} ${className}`}>
        <SvgBrandEmblemFallback showGlow={activeGlow} />
      </div>
    );
  }

  return (
    <div className={`relative shrink-0 ${sizeClass} ${className}`}>
      {activeGlow && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-brand-primary/40 via-indigo-500/20 to-amber-400/20 blur-lg pointer-events-none transform scale-105" />
      )}
      <img
        src={imageSrc}
        alt={BRANDING.name}
        loading={priority ? 'eager' : 'lazy'}
        onError={() => setImageError(true)}
        className="w-full h-full object-cover rounded-2xl shadow-xl shadow-brand-primary/20 border border-brand-primary/30 relative z-10 transition-transform duration-300"
      />
    </div>
  );
};
