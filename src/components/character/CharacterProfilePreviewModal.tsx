import React, { useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { CharacterProfile } from '../../types/talent';
import { TierBadge } from './TierBadge';
import {
  calculateCombatEffectiveness,
  MASTERY_MULTIPLIERS,
} from '../../features/character/tierSystem';
import {
  Shield,
  Sparkles,
  BookOpen,
  Briefcase,
  Award,
  Crown,
  Zap,
  Sword,
  Compass,
  Download,
  BookmarkPlus,
  Play,
  Heart,
  Brain,
  Eye,
  Sliders,
} from 'lucide-react';

interface CharacterProfilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: CharacterProfile;
  onSaveAsPreset?: () => void;
  onLaunchStory?: () => void;
  isLaunching?: boolean;
}

export const CharacterProfilePreviewModal: React.FC<CharacterProfilePreviewModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveAsPreset,
  onLaunchStory,
  isLaunching = false,
}) => {
  const level = profile.characterLevel ?? profile.powerLevel ?? 1;

  // Calculate combat rating
  const combatEffectiveness = useMemo(() => {
    return calculateCombatEffectiveness({
      level,
      talentTiers: (profile.talents || []).map((t) => ({
        tier: t.tier,
        mastery: t.mastery,
      })),
      attributes: profile.attributes,
    });
  }, [level, profile.talents, profile.attributes]);

  // Export JSON handler
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${profile.name.replace(/\s+/g, '_')}_profile.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const attributesList: Array<{ key: string; label: string; value: number; icon: string }> = [
    { key: 'strength', label: 'Strength', value: profile.attributes?.strength ?? 10, icon: '💪' },
    { key: 'agility', label: 'Agility', value: profile.attributes?.agility ?? 10, icon: '⚡' },
    { key: 'vitality', label: 'Vitality', value: profile.attributes?.vitality ?? 10, icon: '🛡️' },
    { key: 'intelligence', label: 'Intelligence', value: profile.attributes?.intelligence ?? 10, icon: '🧠' },
    { key: 'wisdom', label: 'Wisdom', value: profile.attributes?.wisdom ?? 10, icon: '📜' },
    { key: 'perception', label: 'Perception', value: profile.attributes?.perception ?? 10, icon: '👁️' },
    { key: 'dexterity', label: 'Dexterity', value: profile.attributes?.dexterity ?? 10, icon: '🎯' },
    { key: 'luck', label: 'Luck', value: profile.attributes?.luck ?? 10, icon: '🍀' },
    { key: 'magicalControl', label: 'Magic Control', value: profile.attributes?.magicalControl ?? 10, icon: '✨' },
    { key: 'magicalCapacity', label: 'Magic Capacity', value: profile.attributes?.magicalCapacity ?? 10, icon: '🌌' },
    { key: 'charisma', label: 'Charisma', value: profile.attributes?.charisma ?? 10, icon: '👑' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Character Dossier & Soul Sheet"
      maxWidth="lg"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2.5 w-full">
          <div className="flex items-center gap-2">
            {onSaveAsPreset && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSaveAsPreset}
                className="text-xs text-amber-300 hover:text-amber-200 hover:bg-amber-500/10"
              >
                <BookmarkPlus className="w-3.5 h-3.5 mr-1.5" />
                Save Preset
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportJson}
              className="text-xs text-dark-muted hover:text-white"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
              Back to Architect
            </Button>
            {onLaunchStory && (
              <Button
                variant="primary"
                size="sm"
                onClick={onLaunchStory}
                disabled={isLaunching}
                className="text-xs bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 font-bold shadow-md shadow-violet-900/30"
              >
                <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
                {isLaunching ? 'Forging Realm...' : 'Embark Into Story'}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="p-4 sm:p-5 space-y-5 max-h-[72vh] overflow-y-auto touch-scroll">
        {/* Hero Identity Header Card */}
        <div className="relative rounded-2xl p-4 bg-gradient-to-br from-violet-950/40 via-dark-elevated to-dark-surface border border-violet-500/30 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-serif font-black text-white tracking-wide">
                  {profile.name}
                </h2>
                <TierBadge tier={profile.tier || profile.talents?.[0]?.tier || 'C'} size="sm" showTitle />
              </div>
              <p className="text-xs text-violet-300 font-sans mt-0.5">
                {profile.species || profile.race || 'Human'} • {profile.socialStatus || 'Free Citizen'}
                {profile.bloodline && profile.bloodline !== 'None' ? ` • ${profile.bloodline}` : ''}
              </p>
            </div>

            {/* Level & Combat Effectiveness Badges */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="px-3 py-1.5 rounded-xl bg-dark-surface/80 border border-violet-400/30 text-center">
                <span className="text-[10px] uppercase tracking-wider text-dark-muted block font-mono">
                  Acquired Level
                </span>
                <span className="text-sm font-black font-mono text-violet-300">
                  Lv. {level} <span className="text-[10px] text-dark-muted font-normal">/ 100</span>
                </span>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-dark-surface/80 border border-amber-400/30 text-center">
                <span className="text-[10px] uppercase tracking-wider text-dark-muted block font-mono">
                  Combat Rating
                </span>
                <span className="text-sm font-black font-mono text-amber-300">
                  {combatEffectiveness}
                </span>
              </div>
            </div>
          </div>

          {/* Level vs Talent Separation Banner */}
          <div className="mt-3.5 pt-3 border-t border-violet-500/20 text-[11px] text-dark-muted flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <span className="text-violet-300 font-semibold">Invariant Architecture:</span> Level ({level}) represents acquired experience and combat training. Innate Talent Tiers represent genetic and cosmic potential. A Level 80 Adept surpasses a Level 1 novice with God-Tier talent until the novice trains and ascends.
            </p>
          </div>
        </div>

        {/* Professions & Roles */}
        {profile.professions && profile.professions.length > 0 && (
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold font-mono uppercase text-dark-muted tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-violet-400" />
              Professions & Disciplines
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {profile.professions.map((prof, idx) => (
                <span
                  key={idx}
                  className="text-xs font-medium px-2.5 py-1 rounded-lg bg-dark-elevated border border-dark-border text-dark-text shadow-sm"
                >
                  {prof}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Innate Talents Section */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold font-mono uppercase text-dark-muted tracking-wider flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              Innate Talents ({profile.talents?.length || 0})
            </h4>
            <span className="text-[10px] text-dark-muted font-mono">
              Independent Tier Assigned Per Talent
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {(profile.talents || []).map((t) => {
              const isGod = t.tier === 'GOD';
              return (
                <div
                  key={t.id}
                  className={`p-3 rounded-xl border transition-all ${
                    isGod
                      ? 'bg-gradient-to-br from-amber-950/30 via-dark-surface to-dark-elevated border-amber-500/50 shadow-md shadow-amber-900/20'
                      : 'bg-dark-surface border-dark-border/80 hover:border-violet-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-white font-serif">{t.name}</span>
                        {isGod && <Crown className="w-3 h-3 text-amber-300" />}
                      </div>
                      <span className="text-[10px] text-dark-muted font-mono block">
                        Category: {t.category.replace('_', ' ')} • Source: {t.source}
                      </span>
                    </div>
                    <TierBadge tier={t.tier} size="xs" />
                  </div>

                  <p className="text-xs text-dark-muted mt-2 leading-relaxed line-clamp-2">
                    {t.description}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-dark-border/40 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-dark-muted">
                      Mastery: <strong className="text-violet-300">{t.mastery}</strong>
                    </span>
                    {t.specialization && (
                      <span className="text-amber-300/80">Spec: {t.specialization}</span>
                    )}
                  </div>

                  {isGod && t.godTierOrigin && (
                    <div className="mt-2 p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-200">
                      <strong className="text-amber-300">Divine / Cosmic Origin:</strong> {t.godTierOrigin}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Jack of All Trades (If Acquired) */}
        {profile.jackOfAllTrades?.isAcquired && (
          <div className="p-3.5 rounded-xl bg-violet-950/20 border border-violet-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">🎭</span>
                <div>
                  <h5 className="text-xs font-bold text-violet-200 font-serif">
                    Jack of All Trades Trait Active
                  </h5>
                  <p className="text-[10px] text-dark-muted">
                    High multidisciplinary synergy across professions, trades, and basic arcane arts.
                  </p>
                </div>
              </div>
              <TierBadge tier={profile.jackOfAllTrades.tier} size="xs" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-dark-muted pt-1">
              <div>
                <span className="text-emerald-400 font-semibold block text-[10px] font-mono">
                  ADVANTAGES
                </span>
                <ul className="list-disc list-inside space-y-0.5 mt-0.5">
                  {(profile.jackOfAllTrades.advantages || ['Rapid cross-discipline comprehension']).map((adv, idx) => (
                    <li key={idx} className="line-clamp-1">{adv}</li>
                  ))}
                </ul>
              </div>
              <div>
                <span className="text-rose-400 font-semibold block text-[10px] font-mono">
                  LIMITATIONS
                </span>
                <ul className="list-disc list-inside space-y-0.5 mt-0.5">
                  {(profile.jackOfAllTrades.limitations || ['Higher XP requirement for Grandmastery']).map((lim, idx) => (
                    <li key={idx} className="line-clamp-1">{lim}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Unlocked Abilities List */}
        {profile.abilitiesList && profile.abilitiesList.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold font-mono uppercase text-dark-muted tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              Actionable Abilities & Spells ({profile.abilitiesList.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {profile.abilitiesList.map((ab) => (
                <div
                  key={ab.id}
                  className="p-2.5 rounded-lg bg-dark-surface border border-dark-border/70 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <span className="text-xs font-semibold text-white font-sans">{ab.name}</span>
                    <span className="text-[9px] font-mono font-bold text-cyan-300 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                      {ab.mastery}
                    </span>
                  </div>
                  <p className="text-[11px] text-dark-muted mt-1 leading-normal">
                    {ab.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attributes Matrix (11 Attributes, NO Stamina) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold font-mono uppercase text-dark-muted tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              Attributes Matrix (Scale 1 - 100)
            </h4>
            <span className="text-[10px] text-emerald-400 font-mono">
              Stamina-Free RPG Engine
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {attributesList.map((attr) => {
              const pct = Math.min(100, Math.max(1, attr.value));
              return (
                <div
                  key={attr.key}
                  className="p-2 rounded-xl bg-dark-surface border border-dark-border/60 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-dark-muted text-[11px] flex items-center gap-1">
                      <span>{attr.icon}</span> {attr.label}
                    </span>
                    <span className="font-mono font-bold text-white text-[11px]">{attr.value}</span>
                  </div>
                  <div className="w-full h-1.5 bg-dark-border/40 rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-indigo-400 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Narrative Persona & Origin */}
        <div className="p-3.5 rounded-xl bg-dark-surface border border-dark-border/70 space-y-2">
          <h4 className="text-xs font-bold font-mono uppercase text-dark-muted tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            Origin & Background Lore
          </h4>
          <p className="text-xs text-dark-muted leading-relaxed italic">
            "{profile.backstory || 'A soul newly arrived in the leylines of the multiverse.'}"
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-dark-border/40 text-[11px] text-dark-muted">
            <div>
              <span className="text-white font-medium">Personality:</span>{' '}
              {profile.personality?.join(', ') || 'Resilient, Curious'}
            </div>
            <div>
              <span className="text-white font-medium">Origin:</span> {profile.origin || 'Frontier Haven'}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};