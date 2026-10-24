import React from 'react';
import { HeroProfile } from '../../types/character';
import { CLASS_OPTIONS, WEAPON_OPTIONS, POWER_OPTIONS, WEAKNESS_OPTIONS } from '../../catalogs/powers';

interface PowersStepProps {
  hero: Partial<HeroProfile>;
  onChange: (updates: Partial<HeroProfile>) => void;
}

export const PowersStep: React.FC<PowersStepProps> = ({ hero, onChange }) => {
  return (
    <div className="space-y-4">
      {/* Class / Archetype */}
      <div>
        <label className="block text-xs font-semibold text-dark-muted mb-1.5">Class / Archetype</label>
        <select
          value={hero.skills?.[0] || CLASS_OPTIONS[0]}
          onChange={(e) => {
            const currentSkills = hero.skills ? [...hero.skills] : [];
            currentSkills[0] = e.target.value;
            onChange({ skills: currentSkills });
          }}
          className="w-full bg-dark-elevated border border-dark-border rounded-xl px-3.5 py-2.5 text-sm text-dark-text focus:outline-none focus:border-brand-primary"
        >
          {CLASS_OPTIONS.map((cls) => (
            <option key={cls} value={cls}>{cls}</option>
          ))}
        </select>
      </div>

      {/* Signature Weapon */}
      <div>
        <label className="block text-xs font-semibold text-dark-muted mb-1.5">Signature Weapon</label>
        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-1">
          {WEAPON_OPTIONS.map((wpn) => {
            const isSelected = hero.weapons?.includes(wpn);
            return (
              <button
                key={wpn}
                type="button"
                onClick={() => {
                  onChange({ weapons: [wpn] });
                }}
                className={`p-2 rounded-xl border text-left text-xs transition-all ${
                  isSelected
                    ? 'bg-brand-primary/20 border-brand-primary text-white font-medium'
                    : 'bg-dark-elevated border-dark-border text-dark-muted hover:border-dark-muted'
                }`}
              >
                {wpn}
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Power / Magic */}
      <div>
        <label className="block text-xs font-semibold text-dark-muted mb-1.5">Primary Power / Inherent Gift</label>
        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-1">
          {POWER_OPTIONS.map((pwr) => {
            const isSelected = hero.powers?.includes(pwr);
            return (
              <button
                key={pwr}
                type="button"
                onClick={() => {
                  onChange({ powers: [pwr] });
                }}
                className={`p-2 rounded-xl border text-left text-xs transition-all ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-medium'
                    : 'bg-dark-elevated border-dark-border text-dark-muted hover:border-dark-muted'
                }`}
              >
                {pwr}
              </button>
            );
          })}
        </div>
      </div>

      {/* Critical Weakness / Vulnerability */}
      <div>
        <label className="block text-xs font-semibold text-dark-muted mb-1">Fatal Flaw or Weakness</label>
        <select
          value={hero.weaknesses?.[0] || WEAKNESS_OPTIONS[0]}
          onChange={(e) => {
            onChange({ weaknesses: [e.target.value] });
          }}
          className="w-full bg-dark-elevated border border-dark-border rounded-xl px-3.5 py-2.5 text-xs text-dark-text focus:outline-none focus:border-brand-primary"
        >
          {WEAKNESS_OPTIONS.map((wk) => (
            <option key={wk} value={wk}>{wk}</option>
          ))}
        </select>
      </div>

      {/* Power Level Slider */}
      <div className="bg-dark-elevated/60 border border-dark-border p-3 rounded-xl">
        <div className="flex justify-between items-center mb-1">
          <label className="text-xs font-semibold text-dark-muted">Initial Power Level</label>
          <span className="font-bold text-sm text-brand-accent">{hero.powerLevel || 35} / 100</span>
        </div>
        <input
          type="range"
          min="1"
          max="100"
          value={hero.powerLevel || 35}
          onChange={(e) => onChange({ powerLevel: parseInt(e.target.value, 10) })}
          className="w-full accent-brand-accent cursor-pointer h-2 bg-dark-border rounded-lg"
        />
        <div className="flex justify-between text-[10px] text-dark-muted mt-1">
          <span>Novice (1)</span>
          <span>Adept (35)</span>
          <span>S-Rank Godly (100)</span>
        </div>
      </div>
    </div>
  );
};
