import React from 'react';
import { ChoiceOption } from '../../types/story';
import { Badge } from '../ui/Badge';
import { ShieldCheck, AlertTriangle, Skull, ArrowRight } from 'lucide-react';

interface ChoiceListProps {
  choices: ChoiceOption[];
  onSelectChoice: (choiceId: string) => void;
  isLoading?: boolean;
}

export const ChoiceList: React.FC<ChoiceListProps> = ({
  choices,
  onSelectChoice,
  isLoading = false
}) => {
  if (!choices || choices.length === 0) return null;

  const getRiskBadge = (risk?: ChoiceOption['riskLevel']) => {
    switch (risk) {
      case 'safe':
        return (
          <Badge variant="emerald" size="sm" className="gap-1">
            <ShieldCheck className="w-3 h-3" /> Safe
          </Badge>
        );
      case 'perilous':
        return (
          <Badge variant="danger" size="sm" className="gap-1">
            <Skull className="w-3 h-3" /> Perilous
          </Badge>
        );
      case 'moderate':
      default:
        return (
          <Badge variant="amber" size="sm" className="gap-1">
            <AlertTriangle className="w-3 h-3" /> Moderate
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-2.5 my-4">
      <div className="text-xs font-bold uppercase tracking-wider text-dark-muted px-1">
        Available Choices
      </div>
      <div className="space-y-2.5">
        {choices.map((choice) => {
          const riskBorderHover =
            choice.riskLevel === 'safe'
              ? 'hover:border-emerald-500/60 hover:shadow-[0_0_18px_rgba(16,185,129,0.18)]'
              : choice.riskLevel === 'perilous'
              ? 'hover:border-rose-500/60 hover:shadow-[0_0_18px_rgba(244,63,94,0.18)]'
              : 'hover:border-amber-500/60 hover:shadow-[0_0_18px_rgba(245,158,11,0.18)]';

          return (
            <button
              key={choice.choiceId}
              onClick={() => onSelectChoice(choice.choiceId)}
              disabled={isLoading}
              className={`w-full text-left p-4 rounded-2xl bg-gradient-to-r from-dark-surface/95 via-dark-surface/90 to-dark-elevated/80 border border-dark-border/80 ${riskBorderHover} transition-all duration-200 active:scale-[0.99] group shadow-md disabled:opacity-50 backdrop-blur-md relative overflow-hidden`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    {getRiskBadge(choice.riskLevel)}
                    {choice.requiredItem && (
                      <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 font-medium">
                        Requires: {choice.requiredItem}
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-semibold text-dark-text group-hover:text-white transition-colors leading-snug">
                    {choice.text}
                  </div>
                  {choice.consequenceHint && (
                    <p className="text-xs text-dark-muted/90 group-hover:text-dark-muted mt-1 leading-relaxed">
                      {choice.consequenceHint}
                    </p>
                  )}
                </div>
                <ArrowRight className="w-4 h-4 text-dark-muted group-hover:text-amber-400 shrink-0 mt-1 transition-all group-hover:translate-x-1" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
