import React from 'react';
import { HeroProfile, MoralAlignment } from '../../types/character';
import { ALIGNMENT_OPTIONS } from '../../catalogs/powers';

interface PersonaStepProps {
  hero: Partial<HeroProfile>;
  onChange: (updates: Partial<HeroProfile>) => void;
}

const TRAIT_SUGGESTIONS = [
  'Calm', 'Stoic', 'Reckless', 'Kind-hearted', 'Mysterious',
  'Strategic', 'Prideful', 'Fierce', 'Cunning', 'Protective'
];

export const PersonaStep: React.FC<PersonaStepProps> = ({ hero, onChange }) => {
  const currentTraits = hero.personality || [];

  const toggleTrait = (trait: string) => {
    if (currentTraits.includes(trait)) {
      onChange({ personality: currentTraits.filter(t => t !== trait) });
    } else {
      if (currentTraits.length < 4) {
        onChange({ personality: [...currentTraits, trait] });
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Personality traits */}
      <div>
        <label className="block text-xs font-semibold text-dark-muted mb-1.5">
          Personality Traits <span className="text-[10px] text-dark-muted font-normal">(Select up to 4)</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {TRAIT_SUGGESTIONS.map((trait) => {
            const isSelected = currentTraits.includes(trait);
            return (
              <button
                key={trait}
                type="button"
                onClick={() => toggleTrait(trait)}
                className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-brand-primary border-brand-primary text-white font-medium shadow-sm'
                    : 'bg-dark-elevated border-dark-border text-dark-muted hover:border-dark-muted'
                }`}
              >
                {trait}
              </button>
            );
          })}
        </div>
      </div>

      {/* Moral Alignment */}
      <div>
        <label className="block text-xs font-semibold text-dark-muted mb-1.5">Moral Alignment</label>
        <div className="grid grid-cols-3 gap-1.5">
          {ALIGNMENT_OPTIONS.map((al) => (
            <button
              key={al}
              type="button"
              onClick={() => onChange({ alignment: al as MoralAlignment })}
              className={`py-1.5 px-2 text-[11px] font-medium rounded-lg border text-center transition-all truncate ${
                hero.alignment === al
                  ? 'bg-brand-primary/20 border-brand-primary text-white font-bold'
                  : 'bg-dark-elevated border-dark-border text-dark-muted hover:border-dark-muted'
              }`}
            >
              {al}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Goal */}
      <div>
        <label className="block text-xs font-semibold text-dark-muted mb-1">Primary Ambition / Goal</label>
        <input
          type="text"
          value={hero.goals?.[0] || ''}
          onChange={(e) => onChange({ goals: [e.target.value] })}
          placeholder="e.g. Master the God-Slaying Sword, Protect my clan"
          className="w-full bg-dark-elevated border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-dark-text placeholder:text-dark-muted/50 focus:outline-none focus:border-brand-primary"
        />
      </div>

      {/* Secret or Dark Past */}
      <div>
        <label className="block text-xs font-semibold text-dark-muted mb-1">Dark Secret or Burden</label>
        <input
          type="text"
          value={hero.secrets?.[0] || ''}
          onChange={(e) => onChange({ secrets: [e.target.value] })}
          placeholder="e.g. Survived the forbidden void ritual that destroyed his hometown"
          className="w-full bg-dark-elevated border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-dark-text placeholder:text-dark-muted/50 focus:outline-none focus:border-brand-primary"
        />
      </div>
    </div>
  );
};
