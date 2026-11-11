import React from 'react';
import { Button } from '../ui/Button';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface SequentialStepFooterProps {
  onBack?: () => void;
  onNext: () => void;
  canGoBack?: boolean;
  nextDisabled?: boolean;
  nextLabel?: string;
  backLabel?: string;
  isFinalStep?: boolean;
}

export const SequentialStepFooter: React.FC<SequentialStepFooterProps> = ({
  onBack,
  onNext,
  canGoBack = true,
  nextDisabled = false,
  nextLabel = 'Continue',
  backLabel = 'Back',
  isFinalStep = false,
}) => {
  return (
    <footer className="sticky bottom-0 z-20 bg-dark-bg/95 backdrop-blur-md border-t border-dark-border/60 safe-area-bottom shrink-0">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Left: Back button */}
        {canGoBack && onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="min-h-[44px] px-4 rounded-xl text-xs font-semibold text-dark-muted hover:text-white hover:bg-dark-elevated border border-transparent hover:border-dark-border transition-all flex items-center gap-1 active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{backLabel}</span>
          </button>
        ) : (
          <div className="w-16" />
        )}

        {/* Right: Primary Continue button */}
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={onNext}
          disabled={nextDisabled}
          className={`min-h-[44px] px-6 sm:px-8 text-xs sm:text-sm font-bold shadow-lg flex items-center gap-1.5 transition-all active:scale-[0.98] ${
            isFinalStep
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-amber-500/25'
              : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-violet-900/30'
          }`}
        >
          <span>{nextLabel}</span>
          {isFinalStep ? (
            <Check className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </Button>
      </div>
    </footer>
  );
};