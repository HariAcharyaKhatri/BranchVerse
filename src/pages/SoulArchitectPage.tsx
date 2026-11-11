import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { CharacterProfile, CharacterTalent, TalentMasteryLevel } from '../types/talent';
import { PowerTierCode, PowerTierInfo } from '../features/character/tierSystem';
import {
  createBlankCharacter,
  generateRandomCharacter,
  rerollCharacterProperty,
  validateCharacterProfile,
  convertToHeroProfile,
} from '../features/character/creationEngine';
import { characterPresetService } from '../features/character/characterPresetService';
import { angelService, AngelConversationMessage } from '../features/character/angelService';
import {
  SPECIES_CATALOGUE,
  SOCIAL_BACKGROUNDS,
  PROFESSIONS_CATALOGUE,
} from '../catalogs/characterCatalogs';
import { TierBadge } from '../components/character/TierBadge';
import { TierSelectorModal } from '../components/character/TierSelectorModal';
import { PowerCatalogueModal } from '../components/character/PowerCatalogueModal';
import { PresetLibraryModal } from '../components/character/PresetLibraryModal';
import { CharacterProfilePreviewModal } from '../components/character/CharacterProfilePreviewModal';
import { AngelChatPane } from '../components/character/AngelChatPane';
import {
  Sparkles,
  BookOpen,
  Dices,
  Layers,
  Eye,
  BookmarkPlus,
  Play,
  RotateCcw,
  Plus,
  Trash2,
  Check,
  AlertTriangle,
  Crown,
  Briefcase,
  User,
  Sliders,
  Zap,
  ArrowRight,
  ChevronLeft,
} from 'lucide-react';

export interface SoulArchitectPageProps {
  onBack?: () => void;
  onLaunchStory?: (launchParams: any) => Promise<void>;
  isGenerating?: boolean;
}

const MASTERY_OPTIONS: TalentMasteryLevel[] = [
  'Beginner',
  'Novice',
  'Adept',
  'Expert',
  'Master',
  'Grandmaster',
];

export const SoulArchitectPage: React.FC<SoulArchitectPageProps> = ({
  onBack,
  onLaunchStory,
  isGenerating = false,
}) => {
  const { user } = useAuth();

  // Character Draft State
  const [character, setCharacter] = useState<CharacterProfile>(() => {
    const defaultName = user?.displayName?.trim() || 'Hari Khatri';
    return createBlankCharacter(defaultName);
  });

  // Navigation & Mode States
  const [mode, setMode] = useState<'custom' | 'random' | 'presets'>('custom');
  const [activeMobileTab, setActiveMobileTab] = useState<'angel' | 'blueprint'>('angel');

  // Modals
  const [isCatalogueOpen, setIsCatalogueOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isPresetsOpen, setIsPresetsOpen] = useState(false);
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
  const [editingTalentId, setEditingTalentId] = useState<string | null>(null);

  // Random Forge Options
  const [allowGodTierInRandom, setAllowGodTierInRandom] = useState(false);
  const [preferNonCombatInRandom, setPreferNonCombatInRandom] = useState(false);

  // Notifications & Feedback
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Angel Chat State
  const [angelMessages, setAngelMessages] = useState<AngelConversationMessage[]>([
    {
      id: 'msg_welcome',
      role: 'angel',
      text: `Greetings, soul. I am Angel, Architect of Souls. Before you cross the veil into the mortal realms, we shall forge your true identity. Tell me of the powers you seek, or let me sculpt a path of trade, magic, martial arts, or divine miracles for you.`,
      timestamp: Date.now(),
      options: [
        {
          id: 'opt_merchant',
          label: 'Recommend an Economic Merchant Path',
          action: 'Design a non-combat Merchant Sovereign character with high charisma and economic dominance.',
        },
        {
          id: 'opt_elemental',
          label: 'Forge an Elemental Spellweaver',
          action: 'Create a versatile spellcaster specializing in Fire and Wind elemental synergies.',
        },
        {
          id: 'opt_jack',
          label: 'Awaken Jack of All Trades',
          action: 'Configure a Jack of All Trades character who can dabble in alchemy, swordsmanship, and arcana.',
        },
      ],
    },
  ]);
  const [isLoadingAngel, setIsLoadingAngel] = useState(false);
  const [angelError, setAngelError] = useState<{
    title: string;
    message: string;
    retryable: boolean;
  } | null>(null);
  const [lastFailedPrompt, setLastFailedPrompt] = useState<string | null>(null);

  // Auto-dismiss save toast
  useEffect(() => {
    if (saveToast) {
      const timer = setTimeout(() => setSaveToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [saveToast]);

  // Angel Communion Handler
  const handleSendAngelMessage = async (text: string) => {
    const userMsg: AngelConversationMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      text,
      timestamp: Date.now(),
    };

    setAngelMessages((prev) => [...prev, userMsg]);
    setIsLoadingAngel(true);
    setAngelError(null);
    setLastFailedPrompt(text);

    try {
      const history = angelMessages.concat(userMsg).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await angelService.communeWithAngel({
        userMessage: text,
        conversationHistory: history,
        currentDraft: character,
      });

      const angelReply: AngelConversationMessage = {
        id: `angel_${Date.now()}`,
        role: 'angel',
        text: res.angelDialogue,
        timestamp: Date.now(),
        options: res.suggestedOptions,
        proposedChanges: res.proposedChanges,
        ruleFeedback: res.ruleFeedback,
      };

      setAngelMessages((prev) => [...prev, angelReply]);

      // If Angel proposed structural changes, apply them automatically to the draft
      if (res.proposedChanges && Object.keys(res.proposedChanges).length > 0) {
        setCharacter((prev) => {
          const merged: CharacterProfile = {
            ...prev,
            ...res.proposedChanges,
            attributes: {
              ...prev.attributes,
              ...(res.proposedChanges?.attributes || {}),
            },
            talents: res.proposedChanges?.talents?.length
              ? res.proposedChanges.talents
              : prev.talents,
            abilitiesList: res.proposedChanges?.abilitiesList?.length
              ? res.proposedChanges.abilitiesList
              : prev.abilitiesList,
          };
          return merged;
        });
      }
    } catch (err: any) {
      console.warn('[SoulArchitectPage] Angel communion failed:', err);
      setAngelError({
        title: 'Celestial Communion Interrupted',
        message: err.message || 'Unable to commune with the Angel server. Please verify your connection or retry.',
        retryable: true,
      });
    } finally {
      setIsLoadingAngel(false);
    }
  };

  const handleRetryAngelCommune = () => {
    if (lastFailedPrompt) {
      handleSendAngelMessage(lastFailedPrompt);
    }
  };

  // Add / Remove / Update Talents
  const handleAddTalent = (newTalent: CharacterTalent) => {
    setCharacter((prev) => {
      const existing = prev.talents || [];
      if (existing.some((t) => t.id === newTalent.id)) return prev;
      const updated = [...existing, newTalent];
      return {
        ...prev,
        talents: updated,
        tier: updated[0]?.tier || prev.tier,
      };
    });
  };

  const handleRemoveTalent = (talentId: string) => {
    setCharacter((prev) => {
      const filtered = (prev.talents || []).filter((t) => t.id !== talentId);
      return {
        ...prev,
        talents: filtered,
        tier: filtered[0]?.tier || 'C',
      };
    });
  };

  const handleUpdateTalentMastery = (talentId: string, mastery: TalentMasteryLevel) => {
    setCharacter((prev) => ({
      ...prev,
      talents: (prev.talents || []).map((t) =>
        t.id === talentId ? { ...t, mastery } : t
      ),
    }));
  };

  const handleOpenTierModalForTalent = (talentId: string) => {
    setEditingTalentId(talentId);
    setIsTierModalOpen(true);
  };

  const handleSelectTierForTalent = (tierInfo: PowerTierInfo) => {
    if (editingTalentId) {
      setCharacter((prev) => ({
        ...prev,
        talents: (prev.talents || []).map((t) =>
          t.id === editingTalentId
            ? {
                ...t,
                tier: tierInfo.code,
                isGodTier: tierInfo.isGodTier,
                godTierOrigin: tierInfo.isGodTier
                  ? t.godTierOrigin || 'Bestowed via direct divine covenant with the Celestial Angel.'
                  : undefined,
              }
            : t
        ),
      }));
    }
    setIsTierModalOpen(false);
    setEditingTalentId(null);
  };

  // Level Stepper (Strictly separated from Talent Tier)
  const handleLevelChange = (newLevel: number) => {
    const clamped = Math.max(1, Math.min(100, Math.round(newLevel)));
    setCharacter((prev) => ({
      ...prev,
      characterLevel: clamped,
      powerLevel: clamped,
      // Note: talents and tier are explicitly preserved without changes
    }));
  };

  // Toggle Jack of All Trades
  const handleToggleJackOfAllTrades = (enabled: boolean) => {
    setCharacter((prev) => {
      if (enabled) {
        return {
          ...prev,
          jackOfAllTrades: {
            isAcquired: true,
            tier: 'A',
            mastery: 'Adept',
            disciplines: ['Crafting', 'Arcana', 'Field Scouting', 'Barter'],
            advantages: [
              'Zero penalty for cross-class skill and spell acquisition',
              'Accelerated basic and intermediate skill synthesis',
            ],
            limitations: [
              'Double XP requirement for Grandmaster tier ascension',
            ],
          },
        };
      } else {
        const copy = { ...prev };
        delete copy.jackOfAllTrades;
        return copy;
      }
    });
  };

  // Random Forge Generator
  const handleForgeRandom = () => {
    const forged = generateRandomCharacter({
      allowGodTier: allowGodTierInRandom,
      preferNonCombat: preferNonCombatInRandom,
    });
    setCharacter(forged);
    setSaveToast(`Forged new soul: ${forged.name} (${forged.species}, Lv. ${forged.characterLevel})`);
  };

  // Granular Rerolls
  const handleReroll = (property: 'talents' | 'attributes' | 'species' | 'background' | 'profession') => {
    const rerolled = rerollCharacterProperty(character, property);
    setCharacter(rerolled);
    setSaveToast(`Rerolled ${property}!`);
  };

  // Save As Preset
  const handleSavePreset = async () => {
    try {
      const name = `${character.name} — ${character.professions?.[0] || 'Hero'}`;
      const summary = `${character.species || 'Human'} Lv. ${character.characterLevel || 15} with ${character.talents?.length || 1} innate gifts.`;
      await characterPresetService.savePreset(
        character,
        name,
        summary,
        [character.species || 'Mortal', character.professions?.[0] || 'Adventurer'],
        user?.uid
      );
      setSaveToast('Character Preset saved to Soul Codex successfully!');
    } catch (err: any) {
      setSaveToast(`Failed to save preset: ${err.message || err}`);
    }
  };

  // Embark into Story Engine
  const handleEmbark = async () => {
    const validation = validateCharacterProfile(character);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }
    setValidationErrors([]);

    if (onLaunchStory) {
      const heroProfile = convertToHeroProfile(character);
      await onLaunchStory({
        title: `${character.name}’s Multiverse Chronicle`,
        settings: {
          tone: 'Epic Fantasy',
          pacing: 'Balanced Narrative',
          difficulty: 'Adventurer (Standard)',
          storyLanguage: 'hi',
        },
        generationMode: 'ai',
        overrideHero: heroProfile,
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-dark-bg text-dark-text overflow-hidden select-none">
      {/* Top Navigation Header */}
      <header className="px-4 py-3 bg-dark-surface/90 border-b border-dark-border/80 backdrop-blur-md flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-xl text-dark-muted hover:text-white hover:bg-dark-elevated transition-colors"
              title="Return"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-amber-400 p-0.5 shadow-md shadow-violet-950/50">
              <div className="w-full h-full bg-dark-surface rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold font-serif text-white tracking-wide flex items-center gap-2">
                Soul Architect
                <span className="text-[10px] font-mono font-bold text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20">
                  AI Soul Engine
                </span>
              </h1>
              <p className="text-[11px] text-dark-muted hidden sm:block">
                Separate Character Level (1-100) & Innate Talent Tiers (E to God)
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPresetsOpen(true)}
            className="text-xs text-amber-300 hover:text-amber-200 hover:bg-amber-500/10"
          >
            <BookmarkPlus className="w-3.5 h-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">Presets</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPreviewOpen(true)}
            className="text-xs text-violet-300 hover:text-violet-200 hover:bg-violet-500/10"
          >
            <Eye className="w-3.5 h-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">Preview</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleEmbark}
            disabled={isGenerating}
            className="text-xs bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 font-bold shadow-md shadow-violet-900/30"
          >
            <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
            <span>{isGenerating ? 'Ascending...' : 'Embark'}</span>
          </Button>
        </div>
      </header>

      {/* Save Toast Notification */}
      {saveToast && (
        <div className="bg-emerald-950/80 border-b border-emerald-500/30 text-emerald-300 text-xs py-1.5 px-4 text-center font-medium transition-all flex items-center justify-center gap-2">
          <Check className="w-3.5 h-3.5" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Validation Errors Banner */}
      {validationErrors.length > 0 && (
        <div className="bg-rose-950/80 border-b border-rose-500/40 text-rose-200 text-xs py-2 px-4 space-y-1">
          <div className="flex items-center gap-2 font-bold text-rose-300">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Authoritative Engine Restrictions:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] pl-5">
            {validationErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Mode Selector Strip */}
      <div className="px-4 py-2 bg-dark-surface/50 border-b border-dark-border/50 flex items-center justify-between gap-2 overflow-x-auto touch-scroll shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setMode('custom')}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
              mode === 'custom'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'text-dark-muted hover:text-white hover:bg-dark-elevated'
            }`}
          >
            Custom Architect
          </button>
          <button
            onClick={() => setMode('random')}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
              mode === 'random'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-dark-muted hover:text-white hover:bg-dark-elevated'
            }`}
          >
            Random Forge
          </button>
          <button
            onClick={() => setIsPresetsOpen(true)}
            className="px-3 py-1 rounded-xl text-xs font-medium text-dark-muted hover:text-white hover:bg-dark-elevated transition-all"
          >
            Preset Library
          </button>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="flex sm:hidden items-center gap-1 bg-dark-elevated p-0.5 rounded-xl border border-dark-border/60">
          <button
            onClick={() => setActiveMobileTab('angel')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
              activeMobileTab === 'angel'
                ? 'bg-violet-600 text-white'
                : 'text-dark-muted'
            }`}
          >
            Angel
          </button>
          <button
            onClick={() => setActiveMobileTab('blueprint')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
              activeMobileTab === 'blueprint'
                ? 'bg-violet-600 text-white'
                : 'text-dark-muted'
            }`}
          >
            Blueprint
          </button>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden p-3 sm:p-4 gap-3 sm:gap-4">
        {/* Left Column: Angel Dialogue & AI Assistant */}
        <div
          className={`flex-1 flex flex-col min-h-0 ${
            activeMobileTab === 'angel' ? 'flex' : 'hidden md:flex'
          }`}
        >
          <AngelChatPane
            messages={angelMessages}
            onSendMessage={handleSendAngelMessage}
            isLoading={isLoadingAngel}
            apiError={angelError}
            onRetry={handleRetryAngelCommune}
            className="h-full"
          />
        </div>

        {/* Right Column: Live Character Blueprint & Controls */}
        <div
          className={`flex-1 flex flex-col min-h-0 bg-dark-surface/90 border border-dark-border/80 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 overflow-y-auto touch-scroll space-y-5 ${
            activeMobileTab === 'blueprint' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* Mode B: Random Forge Panel (If selected) */}
          {mode === 'random' && (
            <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Dices className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold text-amber-200 font-serif">
                    Planar Leyline Forge (RNG with World Rarity)
                  </h3>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleForgeRandom}
                  className="text-xs bg-amber-600 hover:bg-amber-500 font-bold"
                >
                  <Dices className="w-3.5 h-3.5 mr-1.5" />
                  Full Randomize
                </Button>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-dark-muted">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowGodTierInRandom}
                    onChange={(e) => setAllowGodTierInRandom(e.target.checked)}
                    className="rounded bg-dark-surface border-dark-border text-amber-500 focus:ring-0"
                  />
                  <span>Allow God Tier (0.3% Mythic Rarity)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferNonCombatInRandom}
                    onChange={(e) => setPreferNonCombatInRandom(e.target.checked)}
                    className="rounded bg-dark-surface border-dark-border text-emerald-500 focus:ring-0"
                  />
                  <span>Prefer Non-Combat Role (Merchant, Scholar)</span>
                </label>
              </div>

              {/* Granular Reroll Pills */}
              <div className="pt-2 border-t border-amber-500/20 flex flex-wrap gap-1.5">
                <button
                  onClick={() => handleReroll('talents')}
                  className="px-2 py-1 rounded-lg bg-dark-surface border border-dark-border text-[11px] text-dark-muted hover:text-white hover:border-amber-500/40"
                >
                  ↻ Talents Only
                </button>
                <button
                  onClick={() => handleReroll('attributes')}
                  className="px-2 py-1 rounded-lg bg-dark-surface border border-dark-border text-[11px] text-dark-muted hover:text-white hover:border-amber-500/40"
                >
                  ↻ Attributes Only
                </button>
                <button
                  onClick={() => handleReroll('species')}
                  className="px-2 py-1 rounded-lg bg-dark-surface border border-dark-border text-[11px] text-dark-muted hover:text-white hover:border-amber-500/40"
                >
                  ↻ Species Only
                </button>
                <button
                  onClick={() => handleReroll('background')}
                  className="px-2 py-1 rounded-lg bg-dark-surface border border-dark-border text-[11px] text-dark-muted hover:text-white hover:border-amber-500/40"
                >
                  ↻ Background Only
                </button>
                <button
                  onClick={() => handleReroll('profession')}
                  className="px-2 py-1 rounded-lg bg-dark-surface border border-dark-border text-[11px] text-dark-muted hover:text-white hover:border-amber-500/40"
                >
                  ↻ Profession Only
                </button>
              </div>
            </div>
          )}

          {/* 1. Identity & Acquired Level Card */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold font-mono uppercase text-dark-muted tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-violet-400" />
                Soul Identity & Progression Level
              </h3>
              <TierBadge tier={character.tier || character.talents?.[0]?.tier || 'C'} size="xs" showTitle />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-dark-muted block mb-1">True Name</label>
                <input
                  type="text"
                  value={character.name}
                  onChange={(e) => setCharacter((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Hero True Name..."
                  className="w-full px-3 py-2 bg-dark-elevated border border-dark-border rounded-xl text-xs text-white focus:outline-none focus:border-violet-500/60"
                />
              </div>

              {/* Acquired Level Stepper */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] text-dark-muted">Acquired Level (1 - 100)</label>
                  <span className="text-[10px] text-amber-300 font-mono">Independent of Tier</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={character.characterLevel || 15}
                    onChange={(e) => handleLevelChange(Number(e.target.value))}
                    className="flex-1 accent-violet-500 h-1.5 bg-dark-elevated rounded-lg cursor-pointer"
                  />
                  <span className="w-12 px-2 py-1 text-center font-mono font-bold text-xs bg-dark-elevated border border-dark-border rounded-lg text-violet-300">
                    Lv.{character.characterLevel || 15}
                  </span>
                </div>
              </div>
            </div>

            {/* Species & Social Background Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-dark-muted block mb-1">Species / Bloodline</label>
                <select
                  value={character.species || 'Human'}
                  onChange={(e) => setCharacter((prev) => ({ ...prev, species: e.target.value, race: e.target.value }))}
                  className="w-full px-3 py-2 bg-dark-elevated border border-dark-border rounded-xl text-xs text-white focus:outline-none focus:border-violet-500/60"
                >
                  {SPECIES_CATALOGUE.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.rarity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-dark-muted block mb-1">Social Background</label>
                <select
                  value={character.socialStatus || 'Commoner / Free Citizen'}
                  onChange={(e) => setCharacter((prev) => ({ ...prev, socialStatus: e.target.value }))}
                  className="w-full px-3 py-2 bg-dark-elevated border border-dark-border rounded-xl text-xs text-white focus:outline-none focus:border-violet-500/60"
                >
                  {SOCIAL_BACKGROUNDS.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Primary Profession */}
            <div>
              <label className="text-[11px] text-dark-muted block mb-1">
                Primary Profession (Combat OR Non-Combat / Trade)
              </label>
              <select
                value={character.professions?.[0] || 'Licensed Adventurer / Explorer'}
                onChange={(e) => setCharacter((prev) => ({ ...prev, professions: [e.target.value] }))}
                className="w-full px-3 py-2 bg-dark-elevated border border-dark-border rounded-xl text-xs text-white focus:outline-none focus:border-violet-500/60"
              >
                {PROFESSIONS_CATALOGUE.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name} — {p.description.slice(0, 45)}...
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. Innate Talents & Power Catalogue Card */}
          <div className="space-y-3 pt-3 border-t border-dark-border/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold font-mono uppercase text-dark-muted tracking-wider flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  Innate Talents ({character.talents?.length || 0})
                </h3>
                <span className="text-[10px] text-dark-muted">
                  Each talent holds its own tier (E to God).
                </span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCatalogueOpen(true)}
                className="text-xs text-amber-300 hover:text-amber-200 hover:bg-amber-500/10"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Catalogue
              </Button>
            </div>

            {/* Talents List */}
            <div className="space-y-2">
              {(character.talents || []).map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-xl bg-dark-elevated border border-dark-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white font-serif">{t.name}</span>
                      <button
                        onClick={() => handleOpenTierModalForTalent(t.id)}
                        className="hover:scale-105 transition-transform"
                        title="Click to change Talent Tier"
                      >
                        <TierBadge tier={t.tier} size="xs" />
                      </button>
                    </div>
                    <p className="text-[11px] text-dark-muted mt-0.5 line-clamp-1">
                      {t.description}
                    </p>
                    {t.tier === 'GOD' && t.godTierOrigin && (
                      <p className="text-[10px] text-amber-300/90 mt-1 italic font-mono">
                        Origin: {t.godTierOrigin}
                      </p>
                    )}
                  </div>

                  {/* Mastery Dropdown & Remove Button */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <select
                      value={t.mastery}
                      onChange={(e) =>
                        handleUpdateTalentMastery(t.id, e.target.value as TalentMasteryLevel)
                      }
                      className="px-2 py-1 bg-dark-surface border border-dark-border rounded-lg text-[11px] text-violet-300 font-mono focus:outline-none"
                    >
                      {MASTERY_OPTIONS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleRemoveTalent(t.id)}
                      className="p-1 rounded-lg text-dark-muted hover:text-rose-400 transition-colors"
                      title="Remove Talent"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Jack of All Trades Checkbox */}
            <div className="p-3 rounded-xl bg-violet-950/20 border border-violet-500/20 flex items-center justify-between gap-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(character.jackOfAllTrades?.isAcquired)}
                  onChange={(e) => handleToggleJackOfAllTrades(e.target.checked)}
                  className="rounded bg-dark-surface border-dark-border text-violet-600 focus:ring-0"
                />
                <div>
                  <span className="text-xs font-bold text-violet-200 block">
                    Jack of All Trades Trait
                  </span>
                  <span className="text-[10px] text-dark-muted">
                    Learn any craft, trade, or basic magic with zero cross-discipline penalty.
                  </span>
                </div>
              </label>
              {character.jackOfAllTrades?.isAcquired && (
                <TierBadge tier={character.jackOfAllTrades.tier} size="xs" />
              )}
            </div>
          </div>

          {/* 3. Core Attributes Matrix (11 Attributes, NO Stamina) */}
          <div className="space-y-3 pt-3 border-t border-dark-border/50">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold font-mono uppercase text-dark-muted tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                Core Attributes (1 - 100)
              </h3>
              <span className="text-[10px] text-emerald-400 font-mono">
                No Stamina Restrictions
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { key: 'strength', label: 'Strength' },
                { key: 'agility', label: 'Agility' },
                { key: 'vitality', label: 'Vitality' },
                { key: 'intelligence', label: 'Intelligence' },
                { key: 'wisdom', label: 'Wisdom' },
                { key: 'perception', label: 'Perception' },
                { key: 'dexterity', label: 'Dexterity' },
                { key: 'luck', label: 'Luck' },
                { key: 'magicalControl', label: 'Magic Control' },
                { key: 'magicalCapacity', label: 'Magic Capacity' },
                { key: 'charisma', label: 'Charisma' },
              ].map(({ key, label }) => {
                const val = (character.attributes as any)?.[key] ?? 15;
                return (
                  <div
                    key={key}
                    className="p-2 rounded-xl bg-dark-elevated border border-dark-border/60 flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-dark-muted">{label}</span>
                      <span className="font-mono font-bold text-white">{val}</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={95}
                      value={val}
                      onChange={(e) => {
                        const newVal = Number(e.target.value);
                        setCharacter((prev) => ({
                          ...prev,
                          attributes: {
                            ...prev.attributes,
                            [key]: newVal,
                          },
                        }));
                      }}
                      className="accent-violet-500 h-1 bg-dark-surface rounded cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Card Action Buttons */}
          <div className="pt-3 border-t border-dark-border/50 flex flex-wrap items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSavePreset}
              className="text-xs text-amber-300 hover:text-amber-200 hover:bg-amber-500/10"
            >
              <BookmarkPlus className="w-3.5 h-3.5 mr-1.5" />
              Save As Preset
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPreviewOpen(true)}
                className="text-xs text-dark-muted hover:text-white"
              >
                <Eye className="w-3.5 h-3.5 mr-1" />
                Inspect Sheet
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleEmbark}
                disabled={isGenerating}
                className="text-xs bg-violet-600 hover:bg-violet-500 font-bold"
              >
                <Play className="w-3.5 h-3.5 mr-1 fill-current" />
                Embark
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isCatalogueOpen && (
        <PowerCatalogueModal
          isOpen={isCatalogueOpen}
          onClose={() => setIsCatalogueOpen(false)}
          selectedTalents={character.talents || []}
          onAddTalent={handleAddTalent}
          onRemoveTalent={handleRemoveTalent}
          onUpdateTalentTier={(talentId, newTier) => {
            setCharacter((prev) => ({
              ...prev,
              talents: (prev.talents || []).map((t) =>
                t.id === talentId ? { ...t, tier: newTier } : t
              ),
            }));
          }}
        />
      )}

      {isPresetsOpen && (
        <PresetLibraryModal
          isOpen={isPresetsOpen}
          onClose={() => setIsPresetsOpen(false)}
          onSelectPreset={(selectedProfile) => {
            setCharacter(selectedProfile);
            setSaveToast(`Loaded preset: ${selectedProfile.name}`);
          }}
          userId={user?.uid}
        />
      )}

      {isPreviewOpen && (
        <CharacterProfilePreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          profile={character}
          onSaveAsPreset={handleSavePreset}
          onLaunchStory={handleEmbark}
          isLaunching={isGenerating}
        />
      )}

      {isTierModalOpen && (
        <TierSelectorModal
          isOpen={isTierModalOpen}
          onClose={() => {
            setIsTierModalOpen(false);
            setEditingTalentId(null);
          }}
          selectedTier={
            character.talents?.find((t) => t.id === editingTalentId)?.tier || 'C'
          }
          onSelectTier={handleSelectTierForTalent}
          title="Talent Innate Potential Tier"
          subtitle="Select the innate latent tier for this specific talent. This is independent of character level."
        />
      )}
    </div>
  );
};