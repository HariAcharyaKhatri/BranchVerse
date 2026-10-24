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
      <div className="space-y-2">
        {choices.map((choice) => (
          <button
            key={choice.choiceId}
            onClick={() => onSelectChoice(choice.choiceId)}
            disabled={isLoading}
            className="w-full text-left p-3.5 rounded-2xl bg-dark-surface hover:bg-dark-elevated border border-dark-border hover:border-brand-primary/60 transition-all duration-150 active:scale-[0.99] group shadow-sm disabled:opacity-50"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {getRiskBadge(choice.riskLevel)}
                  {choice.requiredItem && (
                    <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                      Req: {choice.requiredItem}
                    </span>
                  )}
                </div>
                <div className="text-sm font-semibold text-dark-text group-hover:text-brand-glow transition-colors leading-snug">
                  {choice.text}
                </div>
                {choice.consequenceHint && (
                  <p className="text-xs text-dark-muted mt-1 leading-relaxed">
                    {choice.consequenceHint}
                  </p>
                )}
              </div>
              <ArrowRight className="w-4 h-4 text-dark-muted group-hover:text-brand-primary shrink-0 mt-1 transition-transform group-hover:translate-x-0.5" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
