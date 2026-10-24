import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  showLogo?: boolean;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  onBack,
  rightAction,
  showLogo = false
}) => {
  return (
    <header className="sticky top-0 z-30 bg-dark-bg/90 backdrop-blur-md border-b border-dark-border/60 safe-area-top">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-xl text-dark-muted hover:text-dark-text hover:bg-dark-elevated active:scale-95 transition-all"
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {showLogo ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-primary to-amber-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                BV
              </div>
              <div>
                <h1 className="font-bold text-base text-dark-text tracking-tight flex items-center gap-1.5">
                  BranchVerse
                </h1>
                <p className="text-[10px] text-dark-muted leading-none -mt-0.5">Your Choices. Your World. Your Story.</p>
              </div>
            </div>
          ) : (
            <div className="truncate">
              <h1 className="font-semibold text-base text-dark-text truncate tracking-tight">{title}</h1>
              {subtitle && <p className="text-[11px] text-dark-muted truncate leading-none mt-0.5">{subtitle}</p>}
            </div>
          )}
        </div>

        {rightAction && (
          <div className="flex items-center gap-2 shrink-0">
            {rightAction}
          </div>
        )}
      </div>
    </header>
  );
};
