import React, { useState, useEffect } from 'react';
import { FATE_WHEEL_CATEGORIES } from '../../features/reincarnation/fateWheelCatalogs';
import { FateWheelCategory } from '../../features/reincarnation/reincarnationTypes';
import { Button } from '../ui/Button';
import { Sparkles, Dices, RotateCcw, Check, X } from 'lucide-react';

export interface FateWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryKey?: FateWheelCategory;
  onSelectCategory?: (category: FateWheelCategory) => void;
  onOptionSelected?: (category: FateWheelCategory, option: any) => void;
  onApplyResult?: (categoryId: string, optionData: Record<string, any>) => void;
  onSpinAllUndecided?: () => void;
}

export const FateWheelModal: React.FC<FateWheelModalProps> = ({
  isOpen,
  onClose,
  categoryKey,
  onSelectCategory,
  onOptionSelected,
  onApplyResult,
  onSpinAllUndecided,
}) => {
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(() => {
    if (categoryKey) {
      const idx = FATE_WHEEL_CATEGORIES.findIndex((c: any) => c.id === categoryKey);
      return idx >= 0 ? idx : 0;
    }
    return 0;
  });

  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationDegrees, setRotationDegrees] = useState(0);
  const [selectedResult, setSelectedResult] = useState<{
    id?: string;
    categoryId: string;
    label: string;
    description: string;
    data: Record<string, any>;
  } | null>(null);

  useEffect(() => {
    if (categoryKey) {
      const idx = FATE_WHEEL_CATEGORIES.findIndex((c: any) => c.id === categoryKey);
      if (idx >= 0) setActiveCategoryIndex(idx);
    }
  }, [categoryKey]);

  if (!isOpen) return null;

  const currentCategory = FATE_WHEEL_CATEGORIES[activeCategoryIndex] || FATE_WHEEL_CATEGORIES[0];
  const options = currentCategory.options;
  const sliceAngle = 360 / options.length;

  const handleSelectCategoryTab = (index: number) => {
    if (isSpinning) return;
    setActiveCategoryIndex(index);
    setSelectedResult(null);
    if (onSelectCategory) {
      onSelectCategory(FATE_WHEEL_CATEGORIES[index].id as FateWheelCategory);
    }
  };

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setSelectedResult(null);

    // Pick random index
    const winningIndex = Math.floor(Math.random() * options.length);
    const extraSpins = 5 + Math.floor(Math.random() * 3); // 5 to 7 full rotations
    const targetAngle = 360 * extraSpins + (360 - (winningIndex * sliceAngle + sliceAngle / 2));

    setRotationDegrees((prev) => prev + targetAngle);

    setTimeout(() => {
      setIsSpinning(false);
      const chosen = options[winningIndex];
      setSelectedResult({
        id: chosen.id,
        categoryId: currentCategory.id,
        label: chosen.label,
        description: chosen.description,
        data: chosen.data,
      });
    }, 2800);
  };

  const handleAcceptResult = () => {
    if (selectedResult) {
      if (onOptionSelected) {
        onOptionSelected(selectedResult.categoryId as FateWheelCategory, selectedResult);
      }
      if (onApplyResult) {
        onApplyResult(selectedResult.categoryId, selectedResult.data);
      }
      setSelectedResult(null);
    }
  };

  const handleSpinAll = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setRotationDegrees((prev) => prev + 360 * 6);
    setTimeout(() => {
      setIsSpinning(false);
      if (onSpinAllUndecided) {
        onSpinAllUndecided();
      }
      onClose();
    }, 2000);
  };

  const sliceColors = [
    '#7c3aed', // violet
    '#0284c7', // sky
    '#059669', // emerald
    '#d97706', // amber
    '#e11d48', // rose
    '#4f46e5', // indigo
    '#9333ea', // purple
    '#0d9488', // teal
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none animate-[fadeIn_0.2s_ease-out]"
      role="dialog"
      aria-modal="true"
      aria-label="Wheel of Multiverse Fate"
    >
      <div className="relative w-full max-w-2xl bg-[#090514] border border-violet-500/40 rounded-3xl p-6 sm:p-8 text-white shadow-2xl flex flex-col items-center space-y-6 overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="w-full flex items-center justify-between border-b border-dark-border/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400/15 text-amber-300 border border-amber-400/30">
              <Dices className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-serif tracking-wide text-white">
                Wheel of Multiverse Fate
              </h2>
              <p className="text-[11px] text-dark-muted font-mono">
                Celestial Randomization of Undecided Threads
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-dark-muted hover:text-white hover:bg-dark-elevated transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="w-full flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {FATE_WHEEL_CATEGORIES.map((cat: any, idx: number) => (
            <button
              key={cat.id}
              disabled={isSpinning}
              onClick={() => handleSelectCategoryTab(idx)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategoryIndex === idx
                  ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20 font-bold scale-[1.02]'
                  : 'bg-dark-surface/80 text-dark-muted hover:text-white hover:bg-dark-elevated'
              }`}
            >
              {cat.name.split('&')[0].trim()}
            </button>
          ))}
        </div>

        {/* The Animated Spinning Wheel Component */}
        <div className="relative flex items-center justify-center py-2">
          {/* Outer Ring Ambient Glow */}
          <div className="absolute w-[304px] h-[304px] rounded-full border border-amber-400/30 shadow-[0_0_30px_rgba(245,158,11,0.25)] pointer-events-none animate-pulse" />

          {/* Golden Center Marker / Pointer Indicator */}
          <div className="absolute top-0 z-20 flex flex-col items-center -translate-y-2">
            <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.9)]" />
          </div>

          {/* SVG Wheel Disc */}
          <svg
            className="w-72 h-72 rounded-full overflow-hidden transition-transform ease-[cubic-bezier(0.15,0.9,0.25,1)]"
            style={{
              transform: `rotate(${rotationDegrees}deg)`,
              transitionDuration: isSpinning ? '2800ms' : '0ms',
            }}
            viewBox="0 0 100 100"
          >
            {options.map((opt: any, idx: number) => {
              const startAngle = idx * sliceAngle;
              const endAngle = startAngle + sliceAngle;

              const startRad = (startAngle - 90) * (Math.PI / 180);
              const endRad = (endAngle - 90) * (Math.PI / 180);

              const x1 = 50 + 50 * Math.cos(startRad);
              const y1 = 50 + 50 * Math.sin(startRad);
              const x2 = 50 + 50 * Math.cos(endRad);
              const y2 = 50 + 50 * Math.sin(endRad);

              const largeArcFlag = sliceAngle > 180 ? 1 : 0;
              const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

              const textRad = (startAngle + sliceAngle / 2 - 90) * (Math.PI / 180);
              const textX = 50 + 32 * Math.cos(textRad);
              const textY = 50 + 32 * Math.sin(textRad);

              return (
                <g key={opt.label}>
                  <path
                    d={pathData}
                    fill={sliceColors[idx % sliceColors.length]}
                    stroke="#090514"
                    strokeWidth="0.75"
                    className="opacity-90 hover:opacity-100 transition-opacity"
                  />
                  <text
                    x={textX}
                    y={textY}
                    fill="#ffffff"
                    fontSize="3.2"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${startAngle + sliceAngle / 2}, ${textX}, ${textY})`}
                    className="select-none pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                  >
                    {opt.label.length > 15 ? `${opt.label.slice(0, 14)}…` : opt.label}
                  </text>
                </g>
              );
            })}

            {/* Inner Hub Circle */}
            <circle cx="50" cy="50" r="13" fill="#090514" stroke="#fbbf24" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="6" fill="#fbbf24" />
          </svg>
        </div>

        {/* Spin Result Acceptance Card */}
        {selectedResult && (
          <div className="w-full p-4 rounded-2xl bg-amber-400/10 border border-amber-400/40 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-amber-300 font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Fate Decreed
              </div>
              <p className="text-base font-bold text-white font-serif">{selectedResult.label}</p>
              <p className="text-xs text-dark-muted max-w-md">{selectedResult.description}</p>
            </div>
            <Button
              variant="amber"
              size="sm"
              onClick={handleAcceptResult}
              className="shrink-0 font-bold shadow-lg shadow-amber-400/20"
            >
              <Check className="w-4 h-4 mr-1.5" />
              <span>Accept Fate</span>
            </Button>
          </div>
        )}

        {/* Modal Bottom Controls */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-dark-border/40">
          <p className="text-[11px] text-dark-muted text-center sm:text-left">
            Confirmed choices are sacred and will <span className="text-amber-300 font-semibold">never</span> be overwritten.
          </p>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {onSpinAllUndecided && (
              <Button
                variant="ghost"
                size="md"
                disabled={isSpinning}
                onClick={handleSpinAll}
                className="w-full sm:w-auto text-xs text-indigo-300 hover:text-white border border-indigo-400/30"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                <span>Spin All Undecided</span>
              </Button>
            )}

            <Button
              variant="amber"
              size="md"
              disabled={isSpinning}
              onClick={handleSpin}
              className="w-full sm:w-auto font-bold px-6 shadow-lg shadow-amber-400/20"
            >
              <RotateCcw className={`w-4 h-4 mr-1.5 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>{isSpinning ? 'Weaving Fate...' : `Spin ${currentCategory.name.split('&')[0].trim()}`}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
