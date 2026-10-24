import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'amber' | 'emerald' | 'danger' | 'purple' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
  onClick?: () => void;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'secondary',
  size = 'sm',
  className = '',
  onClick
}) => {
  const base = 'inline-flex items-center justify-center font-medium rounded-full transition-colors';
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs sm:text-sm';

  const variants = {
    primary: 'bg-brand-primary/15 text-indigo-400 border border-brand-primary/30',
    secondary: 'bg-dark-elevated text-dark-muted border border-dark-border',
    amber: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    emerald: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
    danger: 'bg-red-500/15 text-red-400 border border-red-500/30',
    purple: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
    outline: 'border border-dark-border text-dark-muted hover:border-brand-primary hover:text-dark-text'
  };

  const clickable = onClick ? 'cursor-pointer active:scale-95' : '';

  return (
    <span
      onClick={onClick}
      className={`${base} ${sizeClasses} ${variants[variant]} ${clickable} ${className}`}
    >
      {children}
    </span>
  );
};
