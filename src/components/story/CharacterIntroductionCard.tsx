import React, { useState } from 'react';
import { HeroProfile } from '../../types/character';
import { StoryState } from '../../types/story';
import {
  Compass,
  Sparkles,
  MapPin,
  Briefcase,
  Coins,
  Shield,
  Sword,
  BookOpen,
  ChevronDown,
  ChevronUp,
  User,
  Zap,
  Award
} from 'lucide-react';

interface CharacterIntroductionCardProps {
  hero: HeroProfile;
  state: StoryState;
  worldName: string;
  genres: string[];
  mainObjective?: string;
}

export const CharacterIntroductionCard: React.FC<CharacterIntroductionCardProps> = ({
  hero,
  state,
  worldName,
  genres,
  mainObjective
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const genreStr = genres.join(' ').toLowerCase();
  const isFantasy = /fantasy|magic|supernatural|myth|cultivation|wuxia/i.test(genreStr);
  const isBusiness = /business|commerce|trade|merchant|corporate/i.test(genreStr);
  const isSciFi = /sci-fi|cyberpunk|space|future/i.test(genreStr);

  // Genre-adapted theme accent
  const theme = isBusiness
    ? { border: 'border-emerald-500/40', badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30', icon: Briefcase, label: 'Commercial Ledger & Persona' }
    : isSciFi
    ? { border: 'border-cyan-500/40', badge: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30', icon: Zap, label: 'Operative Dossier' }
    : isFantasy
    ? { border: 'border-amber-500/40', badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30', icon: Sparkles, label: 'Chronicle Awakening & Dossier' }
    : { border: 'border-indigo-500/40', badge: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30', icon: BookOpen, label: 'Identity Overview' };

  const HeaderIcon = theme.icon;

  // Extract location information from authoritative state
  const currentLocation = state.currentLocation || hero.origin || 'Unknown Realm';
  const rawRegion = state.worldFlags?.region as string;
  const rawKingdom = state.worldFlags?.kingdom as string;
  const regionOrKingdom = rawRegion && rawKingdom
    ? `${rawRegion}, ${rawKingdom}`
    : rawRegion || rawKingdom || worldName;

  // Extract wealth from state if present, or format from items
  const rawWealth = state.worldFlags?.wealth || state.worldFlags?.gold || state.worldFlags?.credits;
  const wealthDisplay = rawWealth
    ? String(rawWealth)
    : isBusiness
    ? 'Initial Working Capital'
    : isFantasy
    ? 'Standard Adventurer Coinage'
    : undefined;

  // Extract starting weapons and equipment
  const initialWeapons = hero.weapons || [];
  const initialEquipment = state.inventory.slice(0, 3).map(i => i.name);

  // Active status / title
  const activeStatus = state.statusEffects[0] || (hero.origin ? `Active as ${hero.origin}` : 'Prepared for the Journey');

  return (
    <div
      className={`rounded-2xl bg-dark-surface/90 backdrop-blur-md border ${theme.border} p-4 sm:p-5 shadow-xl transition-all mb-4 animate-in fade-in duration-300`}
      data-testid="character-introduction-card"
    >
      {/* Header bar with toggle */}
      <div className="flex items-center justify-between gap-3 border-b border-dark-border/50 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-dark-elevated flex items-center justify-center text-brand-primary border border-dark-border">
            <HeaderIcon className="w-4 h-4 text-brand-accent" />
          </div>
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${theme.badge}`}>
              {theme.label}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 mt-0.5">
              <span>{hero.name}</span>
              <span className="text-xs font-normal text-dark-muted">({hero.race})</span>
            </h3>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1.5 rounded-lg text-dark-muted hover:text-white hover:bg-dark-elevated transition-colors"
          aria-label={isExpanded ? 'Collapse character dossier' : 'Expand character dossier'}
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Dossier Content */}
      {isExpanded ? (
        <div className="mt-3.5 space-y-3.5 text-xs">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Role / Profession */}
            <div className="p-2.5 rounded-xl bg-dark-elevated/70 border border-dark-border/60">
              <span className="text-[10px] text-dark-muted font-medium flex items-center gap-1">
                <User className="w-3 h-3 text-indigo-400" />
                {isBusiness ? 'Profession' : 'Role / Position'}
              </span>
              <p className="font-semibold text-white truncate mt-0.5">
                {hero.origin || 'Adventurer'}
              </p>
            </div>

            {/* Current Location */}
            <div className="p-2.5 rounded-xl bg-dark-elevated/70 border border-dark-border/60">
              <span className="text-[10px] text-dark-muted font-medium flex items-center gap-1">
                <MapPin className="w-3 h-3 text-red-400" />
                Location
              </span>
              <p className="font-semibold text-white truncate mt-0.5" title={`${currentLocation}, ${regionOrKingdom}`}>
                {currentLocation}
              </p>
              <p className="text-[10px] text-dark-muted truncate">{regionOrKingdom}</p>
            </div>

            {/* Mastery or Rank */}
            <div className="p-2.5 rounded-xl bg-dark-elevated/70 border border-dark-border/60">
              <span className="text-[10px] text-dark-muted font-medium flex items-center gap-1">
                <Award className="w-3 h-3 text-amber-400" />
                {isBusiness ? 'Standing' : 'Mastery & Focus'}
              </span>
              <p className="font-semibold text-amber-300 truncate mt-0.5">
                Level {state.powerLevel}
              </p>
            </div>

            {/* Wealth or Resources (Genre Adaptive) */}
            <div className="p-2.5 rounded-xl bg-dark-elevated/70 border border-dark-border/60">
              <span className="text-[10px] text-dark-muted font-medium flex items-center gap-1">
                <Coins className="w-3 h-3 text-emerald-400" />
                {isBusiness ? 'Capital & Wealth' : 'Starting Resources'}
              </span>
              <p className="font-semibold text-emerald-300 truncate mt-0.5">
                {wealthDisplay || `${state.inventory.length} Items in Satchel`}
              </p>
            </div>
          </div>

          {/* Talents, Powers, and Skills */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-dark-muted">
              {isFantasy ? '✨ Key Abilities & Martial Talents' : isBusiness ? '💼 Core Competencies & Skills' : '💡 Skills & Capabilities'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {hero.powers && hero.powers.length > 0 && hero.powers.map((p, idx) => (
                <span
                  key={`p-${idx}`}
                  className="px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[11px] font-medium"
                >
                  ⚡ {p}
                </span>
              ))}
              {hero.skills && hero.skills.length > 0 && hero.skills.map((s, idx) => (
                <span
                  key={`s-${idx}`}
                  className="px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-[11px] font-medium"
                >
                  🎯 {s}
                </span>
              ))}
              {initialWeapons.length > 0 && initialWeapons.map((w, idx) => (
                <span
                  key={`w-${idx}`}
                  className="px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/30 text-[11px] font-medium"
                >
                  ⚔️ {w}
                </span>
              ))}
              {initialEquipment.length > 0 && initialEquipment.map((eq, idx) => (
                <span
                  key={`eq-${idx}`}
                  className="px-2 py-0.5 rounded-lg bg-dark-elevated text-dark-text border border-dark-border text-[11px] font-medium"
                >
                  🎒 {eq}
                </span>
              ))}
            </div>
          </div>

          {/* Background Briefing & Current Situation */}
          {hero.backstory && (
            <div className="p-3 rounded-xl bg-dark-elevated/50 border border-dark-border/50 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-dark-muted flex items-center gap-1">
                <Compass className="w-3 h-3 text-brand-primary" />
                Starting Background & Circumstance
              </span>
              <p className="text-xs text-dark-text leading-relaxed italic">
                "{hero.backstory}"
              </p>
            </div>
          )}

          {/* Main Objective */}
          {mainObjective && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-brand-primary/10 border border-brand-primary/30 text-xs">
              <Shield className="w-4 h-4 text-brand-accent shrink-0" />
              <span className="text-indigo-200">
                <strong>Primary Objective:</strong> {mainObjective}
              </span>
            </div>
          )}
        </div>
      ) : (
        /* Collapsed summary pill */
        <div className="mt-2 flex items-center justify-between text-xs text-dark-muted">
          <span>{hero.origin || 'Protagonist'} • {currentLocation}</span>
          <span className="text-amber-400 font-semibold">Lvl {state.powerLevel}</span>
        </div>
      )}
    </div>
  );
};
