import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'amber' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  iconLeft,
  iconRight,
  disabled,
  className = '',
  ...props
}) => {
  const base = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-brand-primary/50';

  const sizeClasses = {
    sm: 'min-h-[36px] px-3 py-1.5 text-xs sm:text-sm gap-1.5',
    md: 'min-h-[44px] px-4 py-2.5 text-sm gap-2',
    lg: 'min-h-[50px] px-5 py-3 text-base gap-2.5 shadow-md'
  };

  const variants = {
    primary: 'bg-brand-primary hover:bg-brand-primary/90 text-white shadow-glow-sm border border-brand-primary/40',
    secondary: 'bg-dark-elevated hover:bg-dark-border text-dark-text border border-dark-border',
    amber: 'bg-amber-600 hover:bg-amber-500 text-white shadow-glow-amber border border-amber-500/40',
    ghost: 'bg-transparent hover:bg-dark-elevated text-dark-muted hover:text-dark-text',
    danger: 'bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30',
    outline: 'bg-transparent border border-dark-border hover:border-brand-primary/60 text-dark-text'
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${base} ${sizeClasses[size]} ${variants[variant]} ${widthClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        iconLeft
      )}
      <span>{children}</span>
      {!isLoading && iconRight}
    </button>
  );
};
