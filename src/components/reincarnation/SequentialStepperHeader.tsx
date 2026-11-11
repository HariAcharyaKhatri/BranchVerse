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
    <header className="sticky top-0 z-20 bg-dark-bg/95 backdrop-blur-md border-b border-dark-border/60 safe-area-top">
      <div className="max-w-5xl mx-auto px-3 sm:px-5 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Back button or Step Indicator */}
        <div className="flex items-center gap-2">
          {canGoBack && onBack ? (
            <button
              onClick={onBack}
              className="p-1.5 -ml-1 rounded-xl text-dark-muted hover:text-white hover:bg-dark-elevated transition-colors"
              aria-label="Go to previous step"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-violet-950/40 border border-violet-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-400/15 px-2 py-0.5 rounded-full border border-amber-400/30">
                Step {currentStep} of {totalSteps}
              </span>
              <h2 className="text-xs sm:text-sm font-bold text-white font-serif tracking-wide truncate max-w-[180px] sm:max-w-xs">
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
        <div className="flex items-center gap-2">
          {onSkipToReview && (
            <button
              onClick={onSkipToReview}
              className="text-[11px] font-semibold text-amber-300 hover:text-amber-200 transition-colors px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30"
            >
              Proceed to Final Review
            </button>
          )}

          <div className="w-16 sm:w-24 h-1.5 bg-dark-border/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-amber-400 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </header>
  );
};