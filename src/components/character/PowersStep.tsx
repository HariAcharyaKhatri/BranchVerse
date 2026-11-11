import React, { useState } from 'react';
import { HeroProfile } from '../../types/character';
import { CLASS_OPTIONS, WEAPON_OPTIONS, POWER_OPTIONS, WEAKNESS_OPTIONS } from '../../catalogs/powers';
import { TierBadge } from './TierBadge';
import { ALL_POWER_TIERS, getPowerTier, PowerTierInfo } from '../../features/character/tierSystem';
import { TierSelectorModal } from './TierSelectorModal';
import { Trophy } from 'lucide-react';

interface PowersStepProps {
  hero: Partial<HeroProfile>;
  onChange: (updates: Partial<HeroProfile>) => void;
}

export const PowersStep: React.FC<PowersStepProps> = ({ hero, onChange }) => {
  const currentPowerLevel = hero.powerLevel || 45;
  const currentTier = getPowerTier(currentPowerLevel);
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);

  const handleSelectTier = (tier: PowerTierInfo) => {
    onChange({ powerLevel: tier.defaultPower });
  };

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

      {/* Soul Power Tier & Level System */}
      <div className="bg-dark-elevated/70 border border-dark-border/80 p-3.5 rounded-2xl space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <label className="text-xs font-semibold text-dark-muted block">Soul Power Tier & Potential</label>
            <span className="text-[10px] text-dark-muted/80">E to SSS, ascending to God Tier</span>
          </div>

          <div className="flex items-center gap-1.5">
            <TierBadge
              tier={currentPowerLevel}
              variant="pill"
              size="sm"
              showTitle={true}
              onClick={() => setIsTierModalOpen(true)}
            />
            <button
              type="button"
              onClick={() => setIsTierModalOpen(true)}
              className="text-[10px] text-amber-300 hover:text-white px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-400/30 font-bold flex items-center gap-0.5"
            >
              <Trophy className="w-2.5 h-2.5 text-amber-400" />
              <span>Tiers</span>
            </button>
          </div>
        </div>

        {/* Quick Tier Selection Chips (E to SSS and God Tier) */}
        <div className="flex flex-wrap gap-1 pt-1">
          {ALL_POWER_TIERS.map((t) => {
            const isSelected = currentTier.code === t.code;
            return (
              <button
                key={t.code}
                type="button"
                onClick={() => handleSelectTier(t)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all ${
                  isSelected
                    ? `${t.bgClass} ${t.borderClass} ${t.color} ring-1 ring-amber-400/50 shadow-sm scale-105`
                    : 'bg-dark-bg/60 border-dark-border/60 text-dark-muted hover:text-white hover:border-dark-muted'
                }`}
              >
                {t.name}
              </button>
            );
          })}
        </div>

        {/* Fine Tuning Slider */}
        <div className="space-y-1 pt-1">
          <div className="flex justify-between text-[11px] font-mono text-dark-muted">
            <span>Power Rating</span>
            <span className="font-bold text-brand-accent">{currentPowerLevel} / 100</span>
          </div>
          <input
            type="range"
            min="1"
            max="100"
            value={currentPowerLevel}
            onChange={(e) => onChange({ powerLevel: parseInt(e.target.value, 10) })}
            className="w-full accent-brand-accent cursor-pointer h-2 bg-dark-border rounded-lg"
          />
          <div className="flex justify-between text-[9px] text-dark-muted/80">
            <span>Tier E (1)</span>
            <span>Tier B (45)</span>
            <span className="text-amber-300 font-bold">God Tier (100)</span>
          </div>
        </div>
      </div>

      {/* Tier Codex Modal */}
      <TierSelectorModal
        isOpen={isTierModalOpen}
        onClose={() => setIsTierModalOpen(false)}
        selectedTier={currentPowerLevel}
        onSelectTier={handleSelectTier}
      />
    </div>
  );
};
