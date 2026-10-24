import React from 'react';
import { HeroProfile } from '../../types/character';
import { RACE_CATALOG } from '../../catalogs/races';
import { getAvailableProtagonistAvatars } from '../../features/assets/assetSelector';

interface IdentityStepProps {
  hero: Partial<HeroProfile>;
  onChange: (updates: Partial<HeroProfile>) => void;
}

export const IdentityStep: React.FC<IdentityStepProps> = ({ hero, onChange }) => {
  const avatars = getAvailableProtagonistAvatars();

  return (
    <div className="space-y-4">
      {/* Anime Protagonist Avatar Selection */}
      <div>
        <label className="block text-xs font-semibold text-dark-muted mb-1.5">
          Protagonist Appearance & Avatar
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          {avatars.map((av) => {
            const isSelected = hero.gender?.toLowerCase() === av.gender?.toLowerCase() ||
              (av.id === 'hari_swordsman' && (!hero.gender || hero.gender === 'Male')) ||
              (av.id === 'aria_spellblade' && hero.gender === 'Female');

            return (
              <button
                key={av.id}
                type="button"
                onClick={() => {
                  onChange({
                    gender: av.gender,
                    appearance: {
                      ...(hero.appearance || { clothing: '', distinguishingFeatures: '' }),
                      hair: av.id === 'hari_swordsman' ? 'White spiked hair' : 'Long raven hair with bangs',
                      eyes: av.id === 'hari_swordsman' ? 'Amber irises' : 'Emerald eyes'
                    } as any
                  });
                }}
                className={`p-2.5 rounded-2xl border text-left transition-all flex items-center gap-2.5 ${
                  isSelected
                    ? 'bg-brand-primary/20 border-brand-primary text-white shadow-glow-sm'
                    : 'bg-dark-elevated border-dark-border text-dark-muted hover:border-dark-muted'
                }`}
              >
                <div className="w-12 h-14 rounded-xl overflow-hidden bg-dark-surface border border-dark-border shrink-0">
                  <img
                    src={av.defaultPath}
                    alt={av.name}
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/placeholders/default_avatar.svg';
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-xs text-dark-text truncate">{av.name.split('(')[0]}</div>
                  <div className="text-[10px] text-dark-muted truncate mt-0.5">{av.gender} Hero</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Name and Age */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-dark-muted mb-1">
            Hero Name <span className="text-brand-accent">*</span>
          </label>
          <input
            type="text"
            value={hero.name || ''}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="e.g. Hari, Ren, Aria"
            className="w-full bg-dark-elevated border border-dark-border rounded-xl px-3.5 py-2.5 text-dark-text placeholder:text-dark-muted/50 focus:outline-none focus:border-brand-primary"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-dark-muted mb-1">Age</label>
          <input
            type="text"
            value={hero.age || ''}
            onChange={(e) => onChange({ age: e.target.value })}
            placeholder="20"
            className="w-full bg-dark-elevated border border-dark-border rounded-xl px-3 py-2.5 text-center text-dark-text placeholder:text-dark-muted/50 focus:outline-none focus:border-brand-primary"
          />
        </div>
      </div>

      {/* Gender */}
      <div>
        <label className="block text-xs font-semibold text-dark-muted mb-1.5">Gender</label>
        <div className="grid grid-cols-3 gap-2">
          {['Male', 'Female', 'Non-Binary'].map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => onChange({ gender: g })}
              className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all ${
                hero.gender === g
                  ? 'bg-brand-primary/20 border-brand-primary text-white shadow-sm'
                  : 'bg-dark-elevated border-dark-border text-dark-muted hover:border-dark-muted'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Race / Species Selector */}
      <div>
        <label className="block text-xs font-semibold text-dark-muted mb-1.5">Race & Heritage</label>
        <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
          {RACE_CATALOG.map((race) => (
            <button
              key={race.id}
              type="button"
              onClick={() => onChange({ race: race.name })}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                hero.race === race.name
                  ? 'bg-brand-primary/20 border-brand-primary text-white'
                  : 'bg-dark-elevated border-dark-border text-dark-muted hover:border-dark-muted'
              }`}
            >
              <div className="font-semibold text-xs text-dark-text">{race.name}</div>
              <div className="text-[10px] text-dark-muted truncate mt-0.5">{race.innateBonus}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Origin / Village */}
      <div>
        <label className="block text-xs font-semibold text-dark-muted mb-1">Origin / Village / Homeland</label>
        <input
          type="text"
          value={hero.origin || ''}
          onChange={(e) => onChange({ origin: e.target.value })}
          placeholder="e.g. Forgotten Mountain Village, Valen's Crossing"
          className="w-full bg-dark-elevated border border-dark-border rounded-xl px-3.5 py-2.5 text-dark-text placeholder:text-dark-muted/50 focus:outline-none focus:border-brand-primary text-sm"
        />
      </div>

      {/* Appearance details */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-semibold text-dark-muted mb-1">Hair</label>
          <input
            type="text"
            value={hero.appearance?.hair || ''}
            onChange={(e) => onChange({ appearance: { ...hero.appearance, hair: e.target.value } as any })}
            placeholder="e.g. Spiky white hair"
            className="w-full bg-dark-elevated border border-dark-border rounded-xl px-3 py-2 text-xs text-dark-text placeholder:text-dark-muted/50 focus:outline-none focus:border-brand-primary"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-dark-muted mb-1">Eyes</label>
          <input
            type="text"
            value={hero.appearance?.eyes || ''}
            onChange={(e) => onChange({ appearance: { ...hero.appearance, eyes: e.target.value } as any })}
            placeholder="e.g. Glowing amber eyes"
            className="w-full bg-dark-elevated border border-dark-border rounded-xl px-3 py-2 text-xs text-dark-text placeholder:text-dark-muted/50 focus:outline-none focus:border-brand-primary"
          />
        </div>
      </div>
    </div>
  );
};
