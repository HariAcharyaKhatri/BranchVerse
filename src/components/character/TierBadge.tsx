import React from 'react';
import { getPowerTier, PowerTierCode, PowerTierInfo } from '../../features/character/tierSystem';

export interface TierBadgeProps {
  tier: PowerTierCode | number | string | undefined | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'pill' | 'badge' | 'crest';
  showTitle?: boolean;
  showLevel?: boolean;
  className?: string;
  onClick?: () => void;
}

export const TierBadge: React.FC<TierBadgeProps> = ({
  tier,
  size = 'sm',
  variant = 'pill',
  showTitle = false,
  showLevel = false,
  className = '',
  onClick,
}) => {
  const tierInfo: PowerTierInfo = getPowerTier(tier);

  // Size styling maps
  const sizeStyles = {
    xs: {
      pill: 'text-[9px] px-2 py-0.5 gap-1',
      badge: 'text-[10px] px-2 py-1 gap-1',
      crest: 'text-xs p-1.5',
      iconSize: 'text-[10px]',
    },
    sm: {
      pill: 'text-[11px] px-2.5 py-0.5 gap-1.5',
      badge: 'text-xs px-2.5 py-1 gap-1.5',
      crest: 'text-sm p-2',
      iconSize: 'text-xs',
    },
    md: {
      pill: 'text-xs px-3 py-1 gap-1.5 font-bold',
      badge: 'text-sm px-3.5 py-1.5 gap-2 font-bold',
      crest: 'text-base p-2.5 font-bold',
      iconSize: 'text-sm',
    },
    lg: {
      pill: 'text-sm px-4 py-1.5 gap-2 font-black',
      badge: 'text-base px-4 py-2 gap-2.5 font-black',
      crest: 'text-lg p-3.5 font-black',
      iconSize: 'text-base',
    },
  }[size];

  // Animated celestial treatment for S, SS, SSS, and GOD
  const isHighTier = ['S', 'SS', 'SSS', 'GOD'].includes(tierInfo.code);
  const animationClass = tierInfo.isGodTier
    ? 'animate-pulse hover:brightness-125'
    : isHighTier
    ? 'hover:brightness-110'
    : '';

  const Component = onClick ? 'button' : 'span';

  if (variant === 'crest') {
    return (
      <Component
        onClick={onClick}
        title={`${tierInfo.name} • ${tierInfo.title} (${tierInfo.description})`}
        className={`inline-flex flex-col items-center justify-center rounded-2xl border backdrop-blur-md transition-all ${
          tierInfo.bgClass
        } ${tierInfo.borderClass} ${tierInfo.glowClass} ${sizeStyles.crest} ${animationClass} ${
          onClick ? 'cursor-pointer active:scale-95' : ''
        } ${className}`}
      >
        <span className={sizeStyles.iconSize}>{tierInfo.icon}</span>
        <span className={`font-serif font-black tracking-wider ${tierInfo.color}`}>
          {tierInfo.code === 'GOD' ? 'GOD' : `TIER ${tierInfo.code}`}
        </span>
        {showTitle && (
          <span className="text-[9px] text-dark-muted font-sans font-medium">{tierInfo.rankName}</span>
        )}
      </Component>
    );
  }

  if (variant === 'badge') {
    return (
      <Component
        onClick={onClick}
        title={`${tierInfo.name} • ${tierInfo.title}`}
        className={`inline-flex items-center rounded-xl border backdrop-blur-md font-serif font-bold transition-all ${
          tierInfo.bgClass
        } ${tierInfo.borderClass} ${tierInfo.glowClass} ${sizeStyles.badge} ${animationClass} ${
          onClick ? 'cursor-pointer hover:border-amber-400 active:scale-95' : ''
        } ${className}`}
      >
        <span className={sizeStyles.iconSize}>{tierInfo.icon}</span>
        <span className={`tracking-wide ${tierInfo.color}`}>
          {tierInfo.name}
        </span>
        {showTitle && (
          <span className="text-dark-muted font-sans font-normal text-[10px] hidden sm:inline">
            • {tierInfo.title}
          </span>
        )}
        {showLevel && typeof tier === 'number' && (
          <span className="text-dark-muted font-mono font-medium text-[9px] px-1 py-0.5 rounded bg-dark-bg/60 ml-0.5">
            Lvl {tier}
          </span>
        )}
      </Component>
    );
  }

  // Default: Sleek, high-polish Pill format
  return (
    <Component
      onClick={onClick}
      title={`${tierInfo.name}: ${tierInfo.title} — ${tierInfo.description}`}
      className={`inline-flex items-center rounded-full border backdrop-blur-md font-serif font-bold transition-all ${
        tierInfo.bgClass
      } ${tierInfo.borderClass} ${tierInfo.glowClass} ${sizeStyles.pill} ${animationClass} ${
        onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
      } ${className}`}
    >
      <span className={sizeStyles.iconSize}>{tierInfo.icon}</span>
      <span className={`tracking-wider ${tierInfo.color}`}>
        {tierInfo.name}
      </span>
      {showTitle && (
        <span className="text-[10px] font-sans font-medium text-dark-muted truncate max-w-[90px]">
          {tierInfo.rankName}
        </span>
      )}
      {showLevel && typeof tier === 'number' && (
        <span className="text-[9px] font-mono text-dark-muted opacity-80">
          (Lvl {tier})
        </span>
      )}
    </Component>
  );
};
