import React from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  sublabel?: string;
  variant?: 'indigo' | 'amber' | 'emerald' | 'red' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  sublabel,
  variant = 'indigo',
  size = 'md',
  className = ''
}) => {
  const percentage = Math.max(0, Math.min(100, Math.round((value / max) * 100)));

  const heightClass = size === 'sm' ? 'h-1.5' : 'h-2.5';

  const variants = {
    indigo: 'bg-brand-primary shadow-[0_0_10px_rgba(99,102,241,0.5)]',
    amber: 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]',
    emerald: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]',
    red: 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]',
    purple: 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]'
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || sublabel) && (
        <div className="flex justify-between items-center text-xs mb-1">
          {label && <span className="font-medium text-dark-muted">{label}</span>}
          {sublabel && <span className="font-semibold text-dark-text">{sublabel}</span>}
        </div>
      )}
      <div className={`w-full bg-dark-elevated rounded-full overflow-hidden border border-dark-border ${heightClass}`}>
        <div
          className={`${variants[variant]} h-full transition-all duration-300 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
