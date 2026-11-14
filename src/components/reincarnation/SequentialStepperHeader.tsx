import React from 'react';
import { ChevronLeft, Sparkles, BookOpen } from 'lucide-react';

interface SequentialStepperHeaderProps {
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  stepSubtitle?: string;
  onBack?: () => void;
  canGoBack?: boolean;
  onSkipToReview?: () => void;
}

export const SequentialStepperHeader: React.FC<SequentialStepperHeaderProps> = ({
  currentStep,
  totalSteps,
  stepTitle,
  stepSubtitle,
  onBack,
  canGoBack = true,
  onSkipToReview,
}) => {
  const progressPercent = Math.min(100, Math.round((currentStep / totalSteps) * 100));

  return (
    <header className="sticky top-0 z-20 bg-dark-bg/95 backdrop-blur-md border-b border-dark-border/60 safe-area-top shrink-0">
      <div className="max-w-7xl mx-auto px-3 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between gap-2 sm:gap-3">
        {/* Left: Back button or Step Indicator */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          {canGoBack && onBack ? (
            <button
              onClick={onBack}
              className="p-1.5 -ml-1 rounded-xl text-dark-muted hover:text-white hover:bg-dark-elevated transition-colors shrink-0"
              aria-label="Go to previous step"
            >
              <ChevronLeft className="w-5 h-5 text-amber-300" />
            </button>
          ) : (
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-violet-950/40 border border-violet-500/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300" />
            </div>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[9px] sm:text-[10px] font-mono font-bold text-amber-300 bg-amber-400/15 px-2 py-0.5 rounded-full border border-amber-400/30 whitespace-nowrap shrink-0">
                Step {currentStep} of {totalSteps}
              </span>
              <h2 className="text-xs sm:text-sm font-bold text-white font-serif tracking-wide truncate max-w-[120px] xs:max-w-[180px] sm:max-w-xs md:max-w-md">
                {stepTitle}
              </h2>
            </div>
            {stepSubtitle && (
              <p className="text-[10px] text-dark-muted hidden sm:block truncate">
                {stepSubtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: Quick Review shortcut or progress indicator */}
        <div className="flex items-center gap-2 shrink-0">
          {onSkipToReview && (
            <button
              onClick={onSkipToReview}
              className="text-[10px] sm:text-[11px] font-bold text-amber-300 hover:text-amber-200 transition-all px-2 sm:px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 whitespace-nowrap active:scale-95 shadow-sm"
              aria-label="Proceed to Final Review"
            >
              <span className="hidden sm:inline">Proceed to Final Review</span>
              <span className="sm:hidden">Review</span>
            </button>
          )}

          <div className="w-12 sm:w-24 h-1.5 bg-dark-border/60 rounded-full overflow-hidden shrink-0">
            <div
              className="h-full bg-gradient-to-r from-violet-500 via-amber-400 to-amber-300 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </header>
  );
};