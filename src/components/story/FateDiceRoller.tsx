import React, { useState } from 'react';
import { Dices, Sparkles, CheckCircle2, AlertTriangle, ShieldAlert, Award } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface FateDiceRollerProps {
  heroName: string;
  powerLevel: number;
  onApplyToCustomAction?: (text: string) => void;
}

export type RollOutcome = {
  natural: number;
  bonus: number;
  total: number;
  tier: 'nat20' | 'heroic' | 'grit' | 'complication' | 'nat1';
  title: string;
  narrativeDescription: string;
};

export function evaluateD20Roll(heroName: string, powerLevel: number, rollOverride?: number): RollOutcome {
  const natural = rollOverride !== undefined ? rollOverride : Math.floor(Math.random() * 20) + 1;
  const bonus = Math.floor(powerLevel / 10);
  const total = natural + bonus;

  if (natural === 20) {
    return {
      natural,
      bonus,
      total,
      tier: 'nat20',
      title: 'CRITICAL TRIUMPH (Natural 20!)',
      narrativeDescription: `Fate smiles upon ${heroName}! An extraordinary surge of power turns the tide decisively.`
    };
  }

  if (natural === 1) {
    return {
      natural,
      bonus,
      total,
      tier: 'nat1',
      title: 'CRITICAL COMPLICATION (Natural 1)',
      narrativeDescription: `An abyssal tremor or unexpected tremor rattles ${heroName}'s footing, introducing a sudden trial.`
    };
  }

  if (total >= 16) {
    return {
      natural,
      bonus,
      total,
      tier: 'heroic',
      title: 'Heroic Success',
      narrativeDescription: `${heroName} moves with decisive precision, achieving the goal with minimal expenditure.`
    };
  }

  if (total >= 9) {
    return {
      natural,
      bonus,
      total,
      tier: 'grit',
      title: 'Hard-Fought Resolve',
      narrativeDescription: `Success secured through grit and determination, though vigilance remains essential.`
    };
  }

  return {
    natural,
    bonus,
    total,
    tier: 'complication',
    title: 'Perilous Resistance',
    narrativeDescription: `Adverse conditions resist ${heroName}'s action, requiring adaptation to unexpected danger.`
  };
}

export const FateDiceRoller: React.FC<FateDiceRollerProps> = ({
  heroName,
  powerLevel,
  onApplyToCustomAction
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [currentOutcome, setCurrentOutcome] = useState<RollOutcome | null>(null);

  const handleRoll = () => {
    setIsRolling(true);
    let rolls = 0;
    const interval = setInterval(() => {
      rolls++;
      if (rolls >= 10) {
        clearInterval(interval);
        const outcome = evaluateD20Roll(heroName, powerLevel);
        setCurrentOutcome(outcome);
        setIsRolling(false);
      }
    }, 50);
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (!currentOutcome) {
      handleRoll();
    }
  };

  const handleApply = () => {
    if (!currentOutcome || !onApplyToCustomAction) return;
    const appliedText = `[D20 Fate Roll: ${currentOutcome.total} (${currentOutcome.title})] ${heroName} takes action: `;
    onApplyToCustomAction(appliedText);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="p-2 rounded-xl bg-dark-elevated border border-dark-border text-amber-400 hover:text-white hover:border-amber-400/50 transition-all flex items-center gap-1.5 text-xs font-semibold active:scale-95 shadow-sm"
        title="Roll D20 Fate & Skill Check"
        aria-label="Roll D20 Fate"
      >
        <Dices className="w-4 h-4 text-amber-400" />
        <span className="hidden sm:inline">D20 Fate</span>
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="D20 Fate & Skill Check"
        maxWidth="sm"
        footer={
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              onClick={handleRoll}
              disabled={isRolling}
              className="flex-1 justify-center text-xs"
            >
              <Dices className="w-3.5 h-3.5 mr-1 text-amber-400" /> Reroll Fate
            </Button>
            {onApplyToCustomAction && currentOutcome && (
              <Button
                variant="primary"
                onClick={handleApply}
                disabled={isRolling}
                className="flex-1 justify-center text-xs"
              >
                Apply to Action
              </Button>
            )}
          </div>
        }
      >
        <div className="p-4 space-y-4 text-center">
          {/* Animated D20 Visual Display */}
          <div className="relative flex justify-center py-4">
            <div
              className={`w-28 h-28 rounded-3xl flex flex-col items-center justify-center border-2 shadow-2xl transition-all duration-300 ${
                isRolling
                  ? 'animate-spin border-amber-400 bg-amber-500/10'
                  : currentOutcome?.tier === 'nat20'
                  ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-emerald-500/30'
                  : currentOutcome?.tier === 'nat1'
                  ? 'border-red-500 bg-red-500/20 text-red-300 shadow-red-500/30'
                  : 'border-brand-primary bg-dark-elevated text-brand-glow'
              }`}
            >
              <span className="text-3xl font-extrabold font-mono tracking-tight">
                {isRolling ? '?' : currentOutcome?.natural}
              </span>
              <span className="text-[10px] font-semibold text-dark-muted mt-1">
                + {Math.floor(powerLevel / 10)} Bonus
              </span>
            </div>
          </div>

          {/* Outcome Details */}
          {currentOutcome && !isRolling && (
            <div className="space-y-2 text-left bg-dark-elevated/70 border border-dark-border p-3.5 rounded-2xl">
              <div className="flex items-center gap-2">
                {currentOutcome.tier === 'nat20' && <Award className="w-4 h-4 text-emerald-400 shrink-0" />}
                {currentOutcome.tier === 'heroic' && <CheckCircle2 className="w-4 h-4 text-brand-primary shrink-0" />}
                {currentOutcome.tier === 'grit' && <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />}
                {currentOutcome.tier === 'complication' && <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0" />}
                {currentOutcome.tier === 'nat1' && <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />}
                <span className="font-bold text-xs text-white">{currentOutcome.title}</span>
                <span className="ml-auto font-mono text-xs font-semibold text-amber-400">
                  Total: {currentOutcome.total}
                </span>
              </div>
              <p className="text-xs text-dark-muted leading-relaxed">
                {currentOutcome.narrativeDescription}
              </p>
            </div>
          )}

          <p className="text-[11px] text-dark-muted/80">
            Rolls add your Power Level modifier (+{Math.floor(powerLevel / 10)}). Use fate checks to decide risky moves!
          </p>
        </div>
      </Modal>
    </>
  );
};
