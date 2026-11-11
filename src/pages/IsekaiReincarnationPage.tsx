import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { BrandEmblem } from '../components/branding/BrandEmblem';
import {
  ReincarnationSession,
  ReincarnationProfile,
  FateWheelCategory,
} from '../features/reincarnation/reincarnationTypes';
import {
  CANON_OPENING_SCENES,
  CANON_ANGEL,
  FIXED_OPENING_CANON,
} from '../features/reincarnation/reincarnationCanon';
import { FATE_WHEEL_CATEGORIES } from '../features/reincarnation/fateWheelCatalogs';
import {
  createInitialReincarnationSession,
  generateAngelDialogue,
  applyFateWheelResult,
  updateProfileFieldManually,
  buildReincarnationLaunchPackage,
  loadReincarnationSession,
  saveReincarnationSession,
  clearReincarnationSession,
} from '../features/reincarnation/reincarnationEngine';
import { FateWheelModal } from '../components/reincarnation/FateWheelModal';
import { TierBadge } from '../components/character/TierBadge';
import { TierSelectorModal } from '../components/character/TierSelectorModal';
import { ALL_POWER_TIERS, PowerTierCode, PowerTierInfo, calculateCombatEffectiveness } from '../features/character/tierSystem';
import {
  SPECIES_CATALOGUE,
  SOCIAL_BACKGROUNDS,
  PROFESSIONS_CATALOGUE,
} from '../catalogs/characterCatalogs';
import {
  ALL_POWER_DEFINITIONS,
  filterPowerCatalogue,
  PowerDefinition,
} from '../catalogs/powerCatalogue';
import { WORLD_CATALOG } from '../catalogs/worlds';
import { characterPresetService } from '../features/character/characterPresetService';
import { angelService } from '../features/character/angelService';
import { CharacterTalent, TalentMasteryLevel, CharacterProfile } from '../types/talent';
import { SequentialStepperHeader } from '../components/reincarnation/SequentialStepperHeader';
import { SequentialStepFooter } from '../components/reincarnation/SequentialStepFooter';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Send,
  Dices,
  BookOpen,
  Settings,
  User,
  LogIn,
  Check,
  Trophy,
  Crown,
  Briefcase,
  Globe,
  Sliders,
  Shield,
  Search,
  Filter,
  BookmarkPlus,
  Play,
  Layers,
  ArrowRight,
  Edit2,
} from 'lucide-react';

export interface IsekaiReincarnationPageProps {
  onNavigate: (path: string) => void;
  onLaunchStory: (launchParams: any) => Promise<void>;
  isGenerating?: boolean;
}

const TOTAL_GUIDED_STEPS = 8;

export const IsekaiReincarnationPage: React.FC<IsekaiReincarnationPageProps> = ({
  onNavigate,
  onLaunchStory,
  isGenerating = false,
}) => {
  const { user } = useAuth();

  // Persistent Reincarnation Session State
  const [session, setSession] = useState<ReincarnationSession>(() => {
    const cached = loadReincarnationSession();
    if (cached) return cached;
    return createInitialReincarnationSession(user?.displayName || '');
  });

  // UI Flow States
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(() => {
    return session.currentSceneIndex ?? 0;
  });
  const [guidedStep, setGuidedStep] = useState<number>(1);
  const [userChatInput, setUserChatInput] = useState<string>('');
  const [isFateWheelOpen, setIsFateWheelOpen] = useState<boolean>(false);
  const [activeFateWheelCategory, setActiveFateWheelCategory] = useState<FateWheelCategory>('world_type');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);
  const [isTierModalOpen, setIsTierModalOpen] = useState<boolean>(false);
  const [targetTalentForTier, setTargetTalentForTier] = useState<string | null>(null);

  // Power Catalogue Browsing State
  const [powerSearchQuery, setPowerSearchQuery] = useState<string>('');
  const [powerCategoryFilter, setPowerCategoryFilter] = useState<string>('all');
  const [powerPage, setPowerPage] = useState<number>(1);
  const [isJackOfAllTrades, setIsJackOfAllTrades] = useState<boolean>(false);

  // Selected Talents State
  const [selectedTalents, setSelectedTalents] = useState<CharacterTalent[]>([
    {
      id: 'elem_lightning',
      name: 'Lightning & Tempest Arcana',
      category: 'elemental',
      tier: 'B',
      mastery: 'Novice',
      description: 'High-voltage electric discharge and kinetic shockwaves.',
      source: 'Innate',
    },
    {
      id: 'div_starlight',
      name: 'Starlight Blessing',
      category: 'divine',
      tier: 'A',
      mastery: 'Novice',
      description: 'Radiant starlight illumination and celestial warding.',
      source: 'Awakened',
    },
  ]);

  // Acquired Level State (Independent from Talent Tier)
  const [characterLevel, setCharacterLevel] = useState<number>(15);

  // Toast / Feedback State
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const dialogueEndRef = useRef<HTMLDivElement>(null);

  // Synchronize user display name if changed
  useEffect(() => {
    if (user?.displayName && !session.userNameChosen) {
      setSession((prev) => {
        const next = { ...prev, userNameChosen: user.displayName || undefined };
        saveReincarnationSession(next);
        return next;
      });
    }
  }, [user?.displayName, session.userNameChosen]);

  // Auto-scroll chat stream
  useEffect(() => {
    if (typeof dialogueEndRef.current?.scrollIntoView === 'function') {
      dialogueEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [session.dialogueHistory?.length]);

  // Auto-dismiss toast
  useEffect(() => {
    if (feedbackToast) {
      const t = setTimeout(() => setFeedbackToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [feedbackToast]);

  // =========================================================================
  // 1. STAGE 1: FIRST LIFE & DEATH OPENING NARRATIVE
  // =========================================================================
  const handleNextOpeningScene = () => {
    if (currentSceneIndex < CANON_OPENING_SCENES.length - 1) {
      const nextIndex = currentSceneIndex + 1;
      setCurrentSceneIndex(nextIndex);
      const updated: ReincarnationSession = {
        ...session,
        currentSceneIndex: nextIndex,
      };
      setSession(updated);
      saveReincarnationSession(updated);
    } else {
      // Scene 4 (Arrival before Angel) completed -> Automatically transition to Angel!
      const updated: ReincarnationSession = {
        ...session,
        stage: 'angel_dialogue',
        currentSceneIndex: CANON_OPENING_SCENES.length - 1,
      };
      setSession(updated);
      saveReincarnationSession(updated);
      setGuidedStep(1);
    }
  };

  const handleSkipToAngel = () => {
    const updated: ReincarnationSession = {
      ...session,
      stage: 'angel_dialogue',
      currentSceneIndex: CANON_OPENING_SCENES.length - 1,
    };
    setCurrentSceneIndex(CANON_OPENING_SCENES.length - 1);
    setSession(updated);
    saveReincarnationSession(updated);
    setGuidedStep(1);
  };

  // =========================================================================
  // 2. STAGE 2: SEQUENTIAL ANGEL COMMUNION & SOUL ARCHITECT
  // =========================================================================
  const handleSendMessage = async (messageText?: string) => {
    const textToSend = (messageText || userChatInput).trim();
    if (!textToSend) return;

    // 1. Immediately update local session so tests & instant UI responses fire
    const nextSession = generateAngelDialogue(session, textToSend);
    setSession(nextSession);
    setUserChatInput('');

    // 2. Synchronously check if name was chosen
    if (guidedStep === 1 && nextSession.userNameChosen) {
      setGuidedStep(2);
    }

    // 3. Optional: asynchronous call to live Gemini AI Angel backend
    try {
      angelService
        .communeWithAngel({
          userMessage: textToSend,
          conversationHistory: nextSession.dialogueHistory.map((d) => ({
            role: d.speaker === 'angel' ? 'angel' : 'user',
            text: d.text,
          })),
          currentDraft: {
            name: nextSession.userNameChosen,
            race: nextSession.profile.character.race.value,
            socialStatus: nextSession.profile.character.socialStatus.value,
          },
        })
        .catch(() => {});
    } catch (_) {}
  };

  const handleQuickInquiry = (inquiryText: string) => {
    handleSendMessage(inquiryText);
  };

  const handleFateWheelSelect = (category: FateWheelCategory, option: any) => {
    const nextSession = applyFateWheelResult(session, category, option);
    setSession(nextSession);
    setIsFateWheelOpen(false);
  };

  const handleUpdateProfileField = (category: keyof ReincarnationProfile, field: string, value: any) => {
    setSession((prev) => {
      const nextSession = updateProfileFieldManually(prev, category, field, value);
      saveReincarnationSession(nextSession);
      return nextSession;
    });
  };

  // Reset Session
  const handleResetSession = () => {
    clearReincarnationSession();
    const fresh = createInitialReincarnationSession(user?.displayName || '');
    setSession(fresh);
    setCurrentSceneIndex(0);
    setGuidedStep(1);
    setIsResetConfirmOpen(false);
  };

  // Step Navigation Handlers
  const handleNextStep = () => {
    if (guidedStep < TOTAL_GUIDED_STEPS) {
      setGuidedStep((prev) => prev + 1);
    } else {
      handleProceedToReview();
    }
  };

  const handlePrevStep = () => {
    if (guidedStep > 1) {
      setGuidedStep((prev) => prev - 1);
    } else {
      // Go back to scene 4
      const updated: ReincarnationSession = {
        ...session,
        stage: 'opening_scenes',
      };
      setSession(updated);
      saveReincarnationSession(updated);
    }
  };

  const handleProceedToReview = () => {
    const updated: ReincarnationSession = {
      ...session,
      stage: 'review_confirmation',
    };
    setSession(updated);
    saveReincarnationSession(updated);
  };

  const handleBackToAngel = () => {
    const updated: ReincarnationSession = {
      ...session,
      stage: 'angel_dialogue',
    };
    setSession(updated);
    saveReincarnationSession(updated);
  };

  // Talent & Tier Handlers
  const handleToggleTalent = (power: PowerDefinition) => {
    const existing = selectedTalents.find((t) => t.id === power.id);
    if (existing) {
      setSelectedTalents((prev) => prev.filter((t) => t.id !== power.id));
      handleUpdateProfileField(
        'abilities',
        'magicAffinity',
        selectedTalents.filter((t) => t.id !== power.id).map((t) => t.name)
      );
    } else {
      const newTalent: CharacterTalent = {
        id: power.id,
        name: power.name,
        category: power.category,
        tier: power.defaultTier,
        mastery: 'Novice',
        description: power.description,
        source: 'Innate',
        isGodTier: power.defaultTier === 'GOD',
        godTierOrigin: power.defaultTier === 'GOD' ? 'Direct divine blessing from Celestial Seraphina.' : undefined,
      };
      const updated = [...selectedTalents, newTalent];
      setSelectedTalents(updated);
      handleUpdateProfileField('abilities', 'magicAffinity', updated.map((t) => t.name));
    }
  };

  const handleSelectTierForTalent = (tierInfo: PowerTierInfo) => {
    if (targetTalentForTier) {
      setSelectedTalents((prev) =>
        prev.map((t) =>
          t.id === targetTalentForTier
            ? {
                ...t,
                tier: tierInfo.code,
                isGodTier: tierInfo.isGodTier,
                godTierOrigin: tierInfo.isGodTier
                  ? t.godTierOrigin || 'Bestowed via celestial covenant with Divine Angel Seraphina.'
                  : undefined,
              }
            : t
        )
      );
      handleUpdateProfileField('abilities', 'powerTier', tierInfo.code);
    }
    setIsTierModalOpen(false);
    setTargetTalentForTier(null);
  };

  // Filtered Powers for Step 5
  const filteredPowers = useMemo(() => {
    return filterPowerCatalogue({
      category: powerCategoryFilter as any,
      query: powerSearchQuery,
    });
  }, [powerCategoryFilter, powerSearchQuery]);

  const pagedPowers = useMemo(() => {
    const pageSize = 6;
    const start = (powerPage - 1) * pageSize;
    return filteredPowers.slice(start, start + pageSize);
  }, [filteredPowers, powerPage]);

  // Combat Effectiveness Score
  const combatEffectiveness = useMemo(() => {
    return calculateCombatEffectiveness({
      level: characterLevel,
      talentTiers: selectedTalents.map((t) => ({ tier: t.tier, mastery: t.mastery })),
    });
  }, [characterLevel, selectedTalents]);

  // Save As Preset Handler
  const handleSavePreset = async () => {
    try {
      const heroName = session.userNameChosen || session.profile.character.name.value || 'Hari Khatri';
      const species = session.profile.character.race.value || 'Human';
      const prof = session.profile.abilities.skills.value?.[0] || 'Adventurer';

      const draftProfile: CharacterProfile = {
        id: `hero_${Date.now()}`,
        name: heroName,
        age: '19',
        gender: 'Any',
        appearance: session.profile.character.appearance.value,
        personality: session.profile.character.personality.value,
        race: species,
        species,
        origin: session.profile.character.socialStatus.value,
        socialStatus: session.profile.character.socialStatus.value,
        professions: session.profile.abilities.skills.value || ['Adventurer'],
        backstory: `Reborn into the multiverse guided by Divine Angel Seraphina.`,
        skills: session.profile.abilities.skills.value,
        powers: selectedTalents.map((t) => `${t.name} (${t.tier})`),
        weapons: ['Sunforged Longsword'],
        weaknesses: ['Dimensional Anchor Fluctuation'],
        goals: ['Explore the multiverse', 'Master innate abilities'],
        motivations: ['Protect allies', 'Uncover celestial truths'],
        fears: ['Losing soul identity'],
        secrets: ['Recalls memories of Earthly demise'],
        alignment: 'Neutral Good',
        relationships: [],
        powerLevel: characterLevel,
        characterLevel,
        tier: selectedTalents[0]?.tier || 'B',
        attributes: {
          strength: 15,
          agility: 15,
          vitality: 15,
          intelligence: 15,
          wisdom: 15,
          perception: 15,
          dexterity: 15,
          luck: 15,
          magicalControl: 15,
          magicalCapacity: 15,
          charisma: 15,
        },
        talents: selectedTalents,
        abilitiesList: [],
        createdAt: Date.now(),
      };

      await characterPresetService.savePreset(
        draftProfile,
        `${heroName} — ${species} ${prof}`,
        `Reincarnated hero in ${session.profile.world.name.value}`,
        [species, prof],
        user?.uid
      );
      setFeedbackToast('Preset saved to Soul Codex!');
    } catch (err: any) {
      setFeedbackToast(`Preset save error: ${err.message}`);
    }
  };

  // Launch Story Handler
  const handleConfirmReincarnation = async () => {
    const launchPackage = buildReincarnationLaunchPackage(session);
    const storyParams = {
      title: `${launchPackage.hero.name}'s Awakening: Chronicles of ${launchPackage.world.name}`,
      genre: launchPackage.world.primaryGenreId,
      genres: [launchPackage.world.primaryGenreId],
      worldId: launchPackage.world.id,
      worldName: launchPackage.world.name,
      settings: launchPackage.settings,
      generationMode: 'ai',
      overrideHero: {
        ...launchPackage.hero,
        characterLevel,
        powerLevel: characterLevel,
        tier: selectedTalents[0]?.tier || launchPackage.hero.tier || 'B',
        powers: selectedTalents.map((t) => `${t.name} (${t.tier} Tier)`),
      },
      overrideWorld: launchPackage.world,
      overrideGenres: [launchPackage.world.primaryGenreId],
    };

    await onLaunchStory(storyParams);
  };

  const currentScene = CANON_OPENING_SCENES[currentSceneIndex] || CANON_OPENING_SCENES[0];
  const isNameUndecided = !session.userNameChosen && session.profile.character.name.status === 'undecided';

  return (
    <div className="relative flex flex-col h-[100dvh] w-full bg-dark-bg text-dark-text overflow-hidden font-sans select-none">
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 text-xs font-semibold rounded-full shadow-xl flex items-center gap-2 animate-in fade-in">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* TOP GLOBAL HEADER (Secondary Controls) */}
      <header className="relative z-20 flex items-center justify-between px-3 sm:px-6 py-2 border-b border-dark-border/40 bg-dark-bg/90 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2">
          <BrandEmblem size="sm" variant="icon" />
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-xs sm:text-sm text-white tracking-tight">BranchVerse</span>
            <span className="text-[9px] text-amber-300 font-mono font-bold uppercase bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-400/30">
              Reincarnation Journey
            </span>
          </div>
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => onNavigate('#/architect')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-950/40 border border-violet-500/40 hover:border-violet-400 text-[11px] text-violet-300 hover:text-white transition-all shadow-sm"
            title="AI Soul Architect & Character Creation"
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span className="hidden sm:inline">Soul Architect</span>
          </button>

          <button
            onClick={() => onNavigate('#/library')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-dark-surface border border-dark-border hover:border-violet-500/50 text-[11px] text-dark-muted hover:text-white transition-all shadow-sm"
            title="Saved Chronicles"
          >
            <BookOpen className="w-3 h-3 text-indigo-400" />
            <span className="hidden sm:inline">Library</span>
          </button>

          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-dark-surface border border-dark-border hover:border-rose-500/50 text-[11px] text-dark-muted hover:text-rose-300 transition-all shadow-sm"
            title="Restart Journey"
          >
            <RotateCcw className="w-3 h-3 text-rose-400" />
            <span className="hidden md:inline">Restart</span>
          </button>

          {user ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-dark-surface border border-violet-500/30 text-[11px] text-white shadow-sm">
              <User className="w-3 h-3 text-violet-400" />
              <span className="max-w-[70px] sm:max-w-[100px] truncate font-medium">
                {user.displayName?.split(' ')[0] || (user.isGuest ? 'Guest' : 'Soul')}
              </span>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('#/login')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-600/20 border border-violet-500/40 text-[11px] text-violet-300 font-bold transition-all shadow-sm"
            >
              <LogIn className="w-3 h-3 text-violet-400" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </header>

      {/* ===================================================================== */}
      {/* STAGE 1: FIRST LIFE & DEATH NARRATIVE (SCENES 1 TO 4)                 */}
      {/* ===================================================================== */}
      {session.stage === 'opening_scenes' && (
        <main className="relative z-10 flex-1 min-h-0 flex flex-col justify-between max-w-3xl mx-auto w-full p-4 sm:p-6 overflow-hidden">
          {/* Top Progress & Skip */}
          <div className="flex items-center justify-between gap-2 border-b border-dark-border/40 pb-2.5 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-400/15 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                Scene {currentScene.order} of {CANON_OPENING_SCENES.length}
              </span>
              <span className="text-xs text-dark-muted hidden sm:inline">
                {currentScene.atmosphere}
              </span>
            </div>

            <button
              type="button"
              onClick={handleSkipToAngel}
              className="text-[11px] font-semibold text-amber-300/90 hover:text-amber-200 underline flex items-center gap-1 transition-colors"
            >
              <span>Skip to Angel Encounter</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Narrative Content Body */}
          <div className="flex-1 min-h-0 overflow-y-auto touch-scroll py-4 sm:py-6 space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 block">
                {currentScene.atmosphere}
              </span>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white font-serif tracking-wide leading-tight">
                {currentScene.title}
              </h1>
            </div>

            {/* Paragraphs */}
            <div className="space-y-3.5 text-xs sm:text-sm md:text-base text-dark-text/90 leading-relaxed font-serif">
              {currentScene.narrativeText.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="tracking-normal">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Visual Atmosphere Cue */}
            <div className="p-3 rounded-2xl bg-dark-surface/60 border border-dark-border/50 text-[11px] text-dark-muted italic flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{currentScene.visualCues}</span>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="pt-3 border-t border-dark-border/40 flex items-center justify-between gap-3 shrink-0">
            {currentSceneIndex > 0 ? (
              <button
                type="button"
                onClick={() => setCurrentSceneIndex((p) => Math.max(0, p - 1))}
                className="min-h-[44px] px-4 rounded-xl text-xs font-semibold text-dark-muted hover:text-white flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Scene</span>
              </button>
            ) : (
              <div className="w-20" />
            )}

            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleNextOpeningScene}
              className="min-h-[44px] px-6 sm:px-8 font-bold text-xs sm:text-sm shadow-lg shadow-violet-900/30 flex items-center gap-1.5"
            >
              {currentSceneIndex < CANON_OPENING_SCENES.length - 1 ? (
                <>
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              ) : (
                <>
                  <span>Approach the Angel</span>
                  <Sparkles className="w-4 h-4 ml-1 text-amber-300" />
                </>
              )}
            </Button>
          </div>
        </main>
      )}

      {/* ===================================================================== */}
      {/* STAGE 2: SEQUENTIAL ANGEL COMMUNION & REINCARNATION STEPPER           */}
      {/* ===================================================================== */}
      {session.stage === 'angel_dialogue' && (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {/* Sequential Stepper Header */}
          <SequentialStepperHeader
            currentStep={guidedStep}
            totalSteps={TOTAL_GUIDED_STEPS}
            stepTitle={
              guidedStep === 1
                ? "Soul Name & Identity"
                : guidedStep === 2
                ? "Species & Bloodline"
                : guidedStep === 3
                ? "Social Origin & Station"
                : guidedStep === 4
                ? "Profession & Path"
                : guidedStep === 5
                ? "Innate Powers & Talents"
                : guidedStep === 6
                ? "Level & Talent Tiers"
                : guidedStep === 7
                ? "Destination World"
                : "Starting Scenario & Language"
            }
            stepSubtitle={
              guidedStep === 1
                ? "Your True Name across the leylines"
                : guidedStep === 2
                ? "Physical vessel & biological traits"
                : guidedStep === 3
                ? "Upbringing & early life memories"
                : guidedStep === 4
                ? "Combat vanguard or non-combat trade"
                : guidedStep === 5
                ? "Innate gifts from the Power Catalogue"
                : guidedStep === 6
                ? "Level 1-100 progression vs Innate Tiers"
                : guidedStep === 7
                ? "Realm of transmigration"
                : "Entry catalyst & language preference"
            }
            onBack={handlePrevStep}
            canGoBack={guidedStep > 1}
            onSkipToReview={handleProceedToReview}
          />

          {/* Main Layout: Mobile Single-Column / Desktop 3-Panel */}
          <div className="flex-1 min-h-0 flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-2.5 sm:p-4 gap-3 sm:gap-4 overflow-hidden">
            {/* PANEL A: ANGEL SERAPHINA LIVE COMMUNION (LEFT ON DESKTOP) */}
            <aside className="w-full lg:w-80 xl:w-96 flex flex-col bg-dark-surface/80 border border-dark-border/70 rounded-2xl p-3 sm:p-4 backdrop-blur-md shadow-lg shrink-0 max-h-[38vh] lg:max-h-none overflow-hidden">
              {/* Angel Presence Card */}
              <div className="flex items-center justify-between pb-2.5 border-b border-dark-border/40 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-violet-600 p-0.5 shadow-md shrink-0">
                    <div className="w-full h-full bg-dark-surface rounded-[9px] overflow-hidden flex items-center justify-center">
                      <img
                        src={CANON_ANGEL.portraitPath}
                        alt={CANON_ANGEL.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white font-serif">{CANON_ANGEL.name}</h3>
                    <p className="text-[10px] text-amber-300/90">{CANON_ANGEL.title}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveFateWheelCategory('world_type');
                      setIsFateWheelOpen(true);
                    }}
                    className="p-1 rounded-lg text-amber-300 hover:bg-dark-elevated border border-amber-400/30 text-[10px] flex items-center gap-1"
                    title="Fate Wheel"
                  >
                    <Dices className="w-3 h-3 text-amber-400" />
                    <span className="hidden sm:inline">Fate Wheel</span>
                  </button>
                </div>
              </div>

              {/* Dialogue Scroller */}
              <div
                className="flex-1 min-h-[90px] overflow-y-auto touch-scroll py-2.5 space-y-2 pr-1"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {session.dialogueHistory.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.speaker === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[9px] font-bold uppercase tracking-wider text-dark-muted mb-0.5 px-1">
                      {msg.speaker === 'angel' ? CANON_ANGEL.name : (session.userNameChosen || 'You')}
                    </span>
                    <div
                      className={`max-w-[90%] rounded-2xl p-2.5 text-xs leading-relaxed ${
                        msg.speaker === 'user'
                          ? 'bg-violet-600 text-white rounded-tr-none shadow-sm'
                          : 'bg-dark-bg/90 text-dark-text border border-amber-400/30 rounded-tl-none font-serif'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={dialogueEndRef} />
              </div>

              {/* Natural Text Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="pt-2 border-t border-dark-border/40 flex items-center gap-1.5 shrink-0"
              >
                <input
                  type="text"
                  value={userChatInput}
                  onChange={(e) => setUserChatInput(e.target.value)}
                  placeholder={
                    isNameUndecided
                      ? "Seraphina awaits your name (e.g. 'My name is Hari Khatri')..."
                      : "Speak with Seraphina in English or Hindi..."
                  }
                  className="flex-1 px-3 py-2 rounded-xl bg-dark-bg border border-dark-border text-xs text-white placeholder-dark-muted focus:outline-none focus:border-amber-400"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!userChatInput.trim()}
                  className="px-3 py-2 shrink-0 bg-amber-500 hover:bg-amber-400 text-black font-bold"
                  aria-label="Send response to Angel"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </form>
            </aside>

            {/* PANEL B: ACTIVE SEQUENTIAL STEP (CENTER / PRIMARY) */}
            <main className="flex-1 min-h-0 flex flex-col justify-between bg-dark-surface/90 border border-dark-border/70 rounded-2xl p-3 sm:p-5 backdrop-blur-md shadow-lg overflow-y-auto touch-scroll">
              <div className="space-y-4">
                {/* STEP 1: SOUL NAME & IDENTITY */}
                {guidedStep === 1 && (
                  <div className="space-y-4 animate-in fade-in">
                    <div>
                      <span className="text-[10px] font-mono text-amber-300 font-bold uppercase tracking-wider block">
                        Decision 1 of 8 • Soul Identity
                      </span>
                      <h2 className="text-base sm:text-lg font-bold text-white font-serif mt-0.5">
                        What True Name shall echo across the multiverse?
                      </h2>
                      {user?.displayName && (
                        <p className="text-xs text-violet-300 mt-1">
                          In your earthly existence, you walked as <strong>{user.displayName}</strong>. You may retain this name or awaken under a new moniker.
                        </p>
                      )}
                    </div>

                    {/* Quick Suggestion Chips */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] text-dark-muted block">Quick Archetype Suggestions:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {[user?.displayName, 'Hari Khatri', 'Kaelen Starweaver', 'Solomon Vane', 'Lyra Silverfall', 'Elora Vance', 'कबीर'].filter(Boolean).map((nm) => (
                          <button
                            key={nm as string}
                            onClick={() => {
                              handleQuickInquiry(`My name is ${nm}.`);
                              setGuidedStep(2);
                            }}
                            className="px-3 py-1 rounded-xl bg-dark-elevated border border-dark-border hover:border-amber-400 text-xs text-amber-300 hover:text-white transition-all font-medium"
                          >
                            "{nm}"
                          </button>
                        ))}
                      </div>
                    </div>

                    {session.userNameChosen && (
                      <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
                        <span>Chosen Soul Name: <strong>{session.userNameChosen}</strong></span>
                        <Check className="w-4 h-4 text-emerald-400" />
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 2: SPECIES & BLOODLINE */}
                {guidedStep === 2 && (
                  <div className="space-y-3.5 animate-in fade-in">
                    <div>
                      <span className="text-[10px] font-mono text-amber-300 font-bold uppercase tracking-wider block">
                        Decision 2 of 8 • Biological Vessel
                      </span>
                      <h2 className="text-base sm:text-lg font-bold text-white font-serif mt-0.5">
                        Select your physical lineage & species
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[50vh] overflow-y-auto touch-scroll pr-1">
                      {SPECIES_CATALOGUE.map((s) => {
                        const isSelected = session.profile.character.race.value === s.name;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              handleUpdateProfileField('character', 'race', s.name);
                            }}
                            className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between ${
                              isSelected
                                ? 'bg-violet-950/40 border-violet-400 text-white shadow-md ring-1 ring-violet-400/50'
                                : 'bg-dark-elevated/70 border-dark-border/70 text-dark-muted hover:text-white hover:border-violet-500/30'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                {(s.portraitPath || s.iconPath) && (
                                  <div className="w-7 h-7 rounded-lg overflow-hidden bg-black/60 border border-dark-border shrink-0 flex items-center justify-center p-0.5">
                                    <img
                                      src={s.portraitPath || s.iconPath}
                                      alt=""
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                )}
                                <span className="text-xs font-bold text-white font-serif truncate">{s.name}</span>
                              </div>
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-dark-surface border border-dark-border text-amber-300 shrink-0">
                                {s.rarity}
                              </span>
                            </div>
                            <p className="text-[11px] text-dark-muted mt-1 leading-normal line-clamp-2">
                              {s.description}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {s.traits.slice(0, 2).map((tr, idx) => (
                                <span key={idx} className="text-[9px] px-1.5 py-0.2 rounded bg-dark-surface text-dark-text">
                                  {tr}
                                </span>
                              ))}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 3: SOCIAL ORIGIN & BACKGROUND */}
                {guidedStep === 3 && (
                  <div className="space-y-3.5 animate-in fade-in">
                    <div>
                      <span className="text-[10px] font-mono text-amber-300 font-bold uppercase tracking-wider block">
                        Decision 3 of 8 • Social Station
                      </span>
                      <h2 className="text-base sm:text-lg font-bold text-white font-serif mt-0.5">
                        What station shaped your new life's upbringing?
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[50vh] overflow-y-auto touch-scroll pr-1">
                      {SOCIAL_BACKGROUNDS.map((b) => {
                        const isSelected = session.profile.character.socialStatus.value === b.name;
                        return (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => {
                              handleUpdateProfileField('character', 'socialStatus', b.name);
                            }}
                            className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between ${
                              isSelected
                                ? 'bg-amber-950/40 border-amber-400 text-white shadow-md ring-1 ring-amber-400/50'
                                : 'bg-dark-elevated/70 border-dark-border/70 text-dark-muted hover:text-white hover:border-amber-500/30'
                            }`}
                          >
                            <span className="text-xs font-bold text-white font-serif">{b.name}</span>
                            <p className="text-[11px] text-dark-muted mt-1 leading-normal line-clamp-2">
                              {b.description}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {b.traits.slice(0, 2).map((tr, idx) => (
                                <span key={idx} className="text-[9px] px-1.5 py-0.2 rounded bg-dark-surface text-dark-text">
                                  {tr}
                                </span>
                              ))}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 4: PROFESSION (COMBAT OR NON-COMBAT / TRADE) */}
                {guidedStep === 4 && (
                  <div className="space-y-3.5 animate-in fade-in">
                    <div>
                      <span className="text-[10px] font-mono text-amber-300 font-bold uppercase tracking-wider block">
                        Decision 4 of 8 • Calling & Discipline
                      </span>
                      <div className="flex items-center justify-between mt-0.5">
                        <h2 className="text-base sm:text-lg font-bold text-white font-serif">
                          Will you walk the path of steel, or govern through trade & wisdom?
                        </h2>
                        <span className="text-xs font-mono font-bold text-violet-300 bg-violet-400/10 px-2 py-0.5 rounded-full border border-violet-400/20 shrink-0">
                          {PROFESSIONS_CATALOGUE.length} Callings
                        </span>
                      </div>
                      <p className="text-xs text-dark-muted mt-1">
                        Active Callings: <strong className="text-violet-300">{(session.profile.abilities.skills.value || []).join(', ') || 'None selected'}</strong>
                        <span className="text-[10px] text-dark-muted/80 ml-2">(Select up to 3 dual-class callings)</span>
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[50vh] overflow-y-auto touch-scroll pr-1">
                      {PROFESSIONS_CATALOGUE.map((p) => {
                        const currentSkills = session.profile.abilities.skills.value || [];
                        const isSelected = currentSkills.includes(p.name);
                        const isNonCombat = !['warrior', 'knight', 'swordsman', 'mage', 'archmage', 'healer', 'archer', 'assassin', 'rogue', 'berserker', 'necromancer', 'summoner', 'monk', 'spearman'].some(cr => p.id.includes(cr));
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              let updated: string[];
                              if (isSelected) {
                                updated = currentSkills.filter((s: string) => s !== p.name);
                              } else {
                                updated = currentSkills.length >= 3 ? [...currentSkills.slice(1), p.name] : [...currentSkills, p.name];
                              }
                              handleUpdateProfileField('abilities', 'skills', updated.length > 0 ? updated : [p.name]);
                            }}
                            className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between ${
                              isSelected
                                ? 'bg-violet-950/40 border-violet-400 text-white shadow-md ring-1 ring-violet-400/50'
                                : 'bg-dark-elevated/70 border-dark-border/70 text-dark-muted hover:text-white hover:border-violet-500/30'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                {(p.iconPath || p.portraitPath) && (
                                  <div className="w-6 h-6 rounded-md overflow-hidden bg-black/60 border border-dark-border shrink-0 p-0.5 flex items-center justify-center">
                                    <img
                                      src={p.iconPath || p.portraitPath}
                                      alt=""
                                      className="w-full h-full object-contain"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                )}
                                <span className="text-xs font-bold text-white font-serif truncate">{p.name.split('/')[0]}</span>
                              </div>
                              {isNonCombat && (
                                <span className="text-[9px] font-mono text-emerald-300 bg-emerald-500/15 px-1.5 py-0.5 rounded border border-emerald-500/30 shrink-0">
                                  Trade/Civic
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-dark-muted mt-1 leading-normal line-clamp-2">
                              {p.description}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 5: INNATE POWERS & TALENTS */}
                {guidedStep === 5 && (
                  <div className="space-y-3.5 animate-in fade-in">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono text-amber-300 font-bold uppercase tracking-wider block">
                          Decision 5 of 8 • Power Catalogue
                        </span>
                        <h2 className="text-base sm:text-lg font-bold text-white font-serif mt-0.5">
                          Select your innate arcane, martial, or celestial gifts
                        </h2>
                      </div>
                      <span className="text-xs text-dark-muted">
                        Configured: <strong className="text-amber-300">{selectedTalents.length}</strong>
                      </span>
                    </div>

                    {/* Jack of All Trades Toggle */}
                    <div className="p-3 rounded-xl bg-violet-950/30 border border-violet-500/30 flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isJackOfAllTrades}
                          onChange={(e) => setIsJackOfAllTrades(e.target.checked)}
                          className="rounded bg-dark-surface border-dark-border text-violet-500 focus:ring-0"
                        />
                        <div>
                          <span className="text-xs font-bold text-violet-200 block">Awaken Jack of All Trades</span>
                          <span className="text-[10px] text-dark-muted">Zero cross-discipline learning penalty; double XP for Grandmastery</span>
                        </div>
                      </label>
                      {isJackOfAllTrades && <TierBadge tier="A" size="xs" />}
                    </div>

                    {/* Category Filter & Search Bar */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" />
                        <input
                          type="text"
                          value={powerSearchQuery}
                          onChange={(e) => {
                            setPowerSearchQuery(e.target.value);
                            setPowerPage(1);
                          }}
                          placeholder="Search 50+ powers (e.g. Fire, Starlight, Sword, Economy)..."
                          className="w-full pl-8 pr-3 py-1.5 bg-dark-elevated border border-dark-border rounded-xl text-xs text-white placeholder-dark-muted focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <select
                        value={powerCategoryFilter}
                        onChange={(e) => {
                          setPowerCategoryFilter(e.target.value);
                          setPowerPage(1);
                        }}
                        className="px-3 py-1.5 bg-dark-elevated border border-dark-border rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                      >
                        <option value="all">All 10 Categories</option>
                        <option value="elemental">Elemental Magic (35 variants)</option>
                        <option value="divine">Divine & Sacred</option>
                        <option value="dark">Dark & Forbidden</option>
                        <option value="space_time">Space & Time</option>
                        <option value="conceptual">Conceptual Arcana</option>
                        <option value="combat">Combat & Martial</option>
                        <option value="racial">Racial & Biological</option>
                        <option value="production">Production & Trade</option>
                        <option value="intellectual">Intellectual & Sage</option>
                        <option value="unique">Unique</option>
                      </select>
                    </div>

                    {/* Power Cards Grid (Paginated) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[38vh] overflow-y-auto touch-scroll pr-1">
                      {pagedPowers.map((p) => {
                        const isSelected = selectedTalents.some((t) => t.id === p.id);
                        const talentEntry = selectedTalents.find((t) => t.id === p.id);
                        return (
                          <div
                            key={p.id}
                            className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                              isSelected
                                ? 'bg-amber-950/30 border-amber-400 text-white shadow-sm'
                                : 'bg-dark-elevated/70 border-dark-border/70 text-dark-muted hover:border-violet-500/30'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1.5">
                              <div className="flex items-center gap-2 min-w-0">
                                {p.svgPath ? (
                                  <div className="w-6 h-6 rounded-md overflow-hidden bg-black/60 border border-dark-border/80 p-0.5 flex items-center justify-center shrink-0">
                                    <img
                                      src={p.svgPath}
                                      alt=""
                                      className="w-full h-full object-contain"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <span className="text-sm shrink-0">{p.icon}</span>
                                )}
                                <div className="min-w-0">
                                  <span className="text-xs font-bold text-white font-serif truncate block">{p.name}</span>
                                  <span className="text-[9px] text-dark-muted block">Cat: {p.category.replace('_', ' ')}</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setTargetTalentForTier(p.id);
                                  setIsTierModalOpen(true);
                                }}
                                title="Click to adjust Talent Tier"
                              >
                                <TierBadge tier={talentEntry?.tier || p.defaultTier} size="xs" />
                              </button>
                            </div>
                            <p className="text-[11px] text-dark-muted mt-1 leading-normal line-clamp-2">
                              {p.description}
                            </p>
                            <div className="pt-2 mt-2 border-t border-dark-border/40 flex items-center justify-between">
                              <button
                                type="button"
                                onClick={() => handleToggleTalent(p)}
                                className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border transition-colors ${
                                  isSelected
                                    ? 'bg-amber-500 text-black border-amber-500'
                                    : 'bg-dark-surface text-amber-300 border-amber-400/30 hover:bg-amber-400/10'
                                }`}
                              >
                                {isSelected ? 'Selected ✓' : '+ Select Gift'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 6: ACQUIRED LEVEL VS TALENT TIER */}
                {guidedStep === 6 && (
                  <div className="space-y-4 animate-in fade-in">
                    <div>
                      <span className="text-[10px] font-mono text-amber-300 font-bold uppercase tracking-wider block">
                        Decision 6 of 8 • Progression Invariant
                      </span>
                      <h2 className="text-base sm:text-lg font-bold text-white font-serif mt-0.5">
                        Acquired Level (1-100) vs Innate Talent Tiers (E-God)
                      </h2>
                      <p className="text-xs text-dark-muted mt-1 leading-relaxed">
                        Level represents experience and battle practice. Talent Tier represents latent genetic or cosmic rarity. Leveling up never automatically increases Talent Tier.
                      </p>
                    </div>

                    {/* Acquired Level Slider */}
                    <div className="p-4 rounded-2xl bg-dark-elevated border border-dark-border/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">Acquired Progression Level:</span>
                        <span className="font-mono font-black text-sm text-violet-300">
                          Lv. {characterLevel} <span className="text-[10px] text-dark-muted font-normal">/ 100</span>
                        </span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={100}
                        value={characterLevel}
                        onChange={(e) => setCharacterLevel(Number(e.target.value))}
                        className="w-full accent-violet-500 h-1.5 bg-dark-surface rounded cursor-pointer"
                      />
                    </div>

                    {/* Combat Rating Display */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-950/40 via-dark-surface to-dark-elevated border border-violet-500/30 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-dark-muted block font-mono">
                          Calculated Combat Effectiveness
                        </span>
                        <p className="text-xs text-dark-muted mt-0.5">
                          Accounts for Level, Attributes, and Talent Masteries.
                        </p>
                      </div>
                      <span className="font-mono font-black text-xl text-amber-300">
                        {combatEffectiveness}
                      </span>
                    </div>
                  </div>
                )}

                {/* STEP 7: DESTINATION WORLD SELECTION */}
                {guidedStep === 7 && (
                  <div className="space-y-3.5 animate-in fade-in">
                    <div>
                      <span className="text-[10px] font-mono text-amber-300 font-bold uppercase tracking-wider block">
                        Decision 7 of 8 • Destination Horizon
                      </span>
                      <div className="flex items-center justify-between mt-0.5">
                        <h2 className="text-base sm:text-lg font-bold text-white font-serif">
                          Choose your destination realm in the multiverse
                        </h2>
                        <span className="text-xs font-mono font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20 shrink-0">
                          {WORLD_CATALOG.length} Multiverse Realms
                        </span>
                      </div>
                      <p className="text-xs text-dark-muted mt-1">
                        Chosen Destination: <strong className="text-amber-300">{session.profile.world.name.value || 'None selected'}</strong>
                        {session.profile.world.genre.value && (
                          <span className="text-[10px] font-mono text-amber-400/80 ml-2">({session.profile.world.genre.value})</span>
                        )}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[52vh] overflow-y-auto touch-scroll pr-1">
                      {WORLD_CATALOG.map((w) => {
                        const isSelected = session.profile.world.name.value === w.name;
                        return (
                          <button
                            key={w.id}
                            type="button"
                            onClick={() => {
                              setSession((prev) => {
                                let next = updateProfileFieldManually(prev, 'world', 'name', w.name);
                                next = updateProfileFieldManually(next, 'world', 'genre', w.primaryGenreId);
                                saveReincarnationSession(next);
                                return next;
                              });
                            }}
                            className={`rounded-2xl text-left border transition-all overflow-hidden flex flex-col justify-between group ${
                              isSelected
                                ? 'bg-amber-950/40 border-amber-400 text-white shadow-xl ring-2 ring-amber-400/70 scale-[1.01]'
                                : 'bg-dark-elevated/70 border-dark-border/70 text-dark-muted hover:border-amber-500/40 hover:bg-dark-elevated'
                            }`}
                          >
                            {w.imagePath && (
                              <div className="w-full h-24 sm:h-28 relative overflow-hidden bg-dark-surface">
                                <img
                                  src={w.imagePath}
                                  alt={w.name}
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-dark-surface via-dark-surface/40 to-transparent" />
                                <span className="absolute top-2 right-2 text-[9px] font-mono font-bold text-amber-300 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full border border-amber-400/30">
                                  {w.primaryGenreId}
                                </span>
                              </div>
                            )}
                            <div className="p-3 flex-1 flex flex-col justify-between">
                              <div>
                                <span className="text-xs sm:text-sm font-bold text-white font-serif block">{w.name}</span>
                                <p className="text-[11px] text-dark-muted mt-1 leading-relaxed line-clamp-2">
                                  {w.synopsis}
                                </p>
                              </div>
                              <div className="mt-2.5 pt-2 border-t border-dark-border/40 text-[10px] text-dark-muted font-mono flex items-center justify-between">
                                <span>Magic: {w.magicSystem?.name || 'Leylines'}</span>
                                <span>Threat: {w.threats?.[0] || 'Monsters'}</span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 8: STARTING SCENARIO & LANGUAGE */}
                {guidedStep === 8 && (
                  <div className="space-y-4 animate-in fade-in">
                    <div>
                      <span className="text-[10px] font-mono text-amber-300 font-bold uppercase tracking-wider block">
                        Decision 8 of 8 • Entry & Language
                      </span>
                      <h2 className="text-base sm:text-lg font-bold text-white font-serif mt-0.5">
                        Configure your starting catalyst & story language
                      </h2>
                    </div>

                    {/* Language Selector */}
                    <div className="p-4 rounded-2xl bg-dark-elevated border border-dark-border/80 space-y-2">
                      <span className="text-xs font-bold text-white block">Story Narration Language</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateProfileField('preferences', 'storyLanguage', 'hi')}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                            session.profile.preferences.storyLanguage.value === 'hi'
                              ? 'bg-amber-400 text-black border-amber-400 shadow-md'
                              : 'bg-dark-surface border-dark-border text-dark-muted hover:text-white'
                          }`}
                        >
                          हिंदी (Hindi - Default)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateProfileField('preferences', 'storyLanguage', 'en')}
                          className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                            session.profile.preferences.storyLanguage.value === 'en'
                              ? 'bg-amber-400 text-black border-amber-400 shadow-md'
                              : 'bg-dark-surface border-dark-border text-dark-muted hover:text-white'
                          }`}
                        >
                          English
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Navigation Footer */}
              <SequentialStepFooter
                onBack={handlePrevStep}
                onNext={handleNextStep}
                canGoBack={guidedStep > 1}
                nextLabel={guidedStep === TOTAL_GUIDED_STEPS ? 'Proceed to Final Review' : 'Continue'}
              />
            </main>

            {/* PANEL C: LIVE CHARACTER DOSSIER BLUEPRINT (RIGHT ON DESKTOP) */}
            <aside className="hidden xl:flex w-80 flex-col bg-dark-surface/80 border border-dark-border/70 rounded-2xl p-4 backdrop-blur-md shadow-lg shrink-0 space-y-3.5 overflow-y-auto touch-scroll">
              <div className="flex items-center justify-between pb-2 border-b border-dark-border/40">
                <span className="text-xs font-bold text-white font-serif flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-violet-400" />
                  Soul Dossier
                </span>
                <TierBadge tier={session.profile.abilities.powerTier?.value || 'B'} size="xs" />
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[10px] text-dark-muted block">Name:</span>
                  <strong className="text-white font-serif text-sm">{session.userNameChosen || 'Wandering Soul'}</strong>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-dark-border/40">
                  <div>
                    <span className="text-[10px] text-dark-muted block">Species:</span>
                    <span className="text-violet-300 font-medium">{session.profile.character.race.value}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-dark-muted block">Level:</span>
                    <span className="text-violet-300 font-mono font-bold">Lv. {characterLevel}</span>
                  </div>
                </div>

                <div className="pt-1 border-t border-dark-border/40">
                  <span className="text-[10px] text-dark-muted block">Profession:</span>
                  <span className="text-white">{session.profile.abilities.skills.value?.[0] || 'Adventurer'}</span>
                </div>

                <div className="pt-1 border-t border-dark-border/40">
                  <span className="text-[10px] text-dark-muted block">Destination Realm:</span>
                  <span className="text-amber-300 font-semibold">{session.profile.world.name.value}</span>
                </div>

                <div className="pt-1 border-t border-dark-border/40">
                  <span className="text-[10px] text-dark-muted block">Combat Rating:</span>
                  <span className="text-amber-300 font-mono font-black text-sm">{combatEffectiveness}</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* STAGE 3: FINAL REVIEW & CONFIRMATION DOSSIER                          */}
      {/* ===================================================================== */}
      {session.stage === 'review_confirmation' && (
        <main className="relative z-10 flex-1 min-h-0 flex flex-col justify-between max-w-4xl mx-auto w-full p-4 sm:p-6 overflow-hidden">
          <div className="space-y-4 overflow-y-auto touch-scroll pr-1 pb-4">
            {/* Header Card */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-violet-950/40 via-dark-surface to-dark-elevated border border-violet-500/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 block">
                  Reincarnation Affirmation • Dimensional Gate Primed
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-white font-serif mt-1">
                  {session.userNameChosen || session.profile.character.name.value || 'Hari Khatri'}
                </h1>
                <p className="text-xs text-violet-300 mt-0.5">
                  {session.profile.character.race.value} • {session.profile.character.socialStatus.value}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <TierBadge tier={session.profile.abilities.powerTier?.value || 'B'} size="sm" showTitle />
                <div className="px-3 py-1.5 rounded-xl bg-dark-surface/80 border border-violet-400/30 text-center">
                  <span className="text-[9px] uppercase tracking-wider text-dark-muted block font-mono">Level</span>
                  <span className="text-xs font-mono font-bold text-violet-300">Lv. {characterLevel}</span>
                </div>
              </div>
            </div>

            {/* Dossier Grid with Jump-to-Edit buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Box 1: Calling & Path */}
              <div className="p-3.5 rounded-2xl bg-dark-surface border border-dark-border/80 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-white font-serif flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-violet-400" />
                    Profession & Calling
                  </span>
                  <button
                    onClick={() => {
                      setGuidedStep(4);
                      handleBackToAngel();
                    }}
                    className="text-[10px] text-amber-300 hover:underline flex items-center gap-0.5"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                </div>
                <p className="text-dark-muted text-xs">
                  {session.profile.abilities.skills.value?.[0] || 'Licensed Adventurer'}
                </p>
              </div>

              {/* Box 2: Destination Realm */}
              <div className="p-3.5 rounded-2xl bg-dark-surface border border-dark-border/80 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-white font-serif flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-amber-400" />
                    Destination Realm
                  </span>
                  <button
                    onClick={() => {
                      setGuidedStep(7);
                      handleBackToAngel();
                    }}
                    className="text-[10px] text-amber-300 hover:underline flex items-center gap-0.5"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                </div>
                <p className="text-dark-muted text-xs">
                  {session.profile.world.name.value} ({session.profile.world.genre.value})
                </p>
              </div>

              {/* Box 3: Innate Talents */}
              <div className="p-3.5 rounded-2xl bg-dark-surface border border-dark-border/80 sm:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white font-serif flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    Innate Talents ({selectedTalents.length})
                  </span>
                  <button
                    onClick={() => {
                      setGuidedStep(5);
                      handleBackToAngel();
                    }}
                    className="text-[10px] text-amber-300 hover:underline flex items-center gap-0.5"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTalents.map((t) => (
                    <span
                      key={t.id}
                      className="px-2.5 py-1 rounded-xl bg-dark-elevated border border-dark-border/70 text-white text-[11px] flex items-center gap-1.5"
                    >
                      <span>{t.name}</span>
                      <TierBadge tier={t.tier} size="xs" />
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Review Actions Footer */}
          <div className="pt-3 border-t border-dark-border/40 flex items-center justify-between gap-3 shrink-0">
            <button
              onClick={handleBackToAngel}
              className="text-xs text-dark-muted hover:text-white flex items-center gap-1 px-3 py-2 rounded-xl"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Creation</span>
            </button>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSavePreset}
                className="text-xs text-amber-300 hover:text-amber-200"
              >
                <BookmarkPlus className="w-3.5 h-3.5 mr-1" />
                <span>Save Preset</span>
              </Button>

              <Button
                variant="primary"
                size="md"
                onClick={handleConfirmReincarnation}
                disabled={isGenerating}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/25 flex items-center gap-1.5"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>
                  {isGenerating
                    ? 'Ascending...'
                    : `Awaken in ${session.profile.world.name.value || 'the Multiverse'}`}
                </span>
              </Button>
            </div>
          </div>
        </main>
      )}

      {/* Modals */}
      {isFateWheelOpen && (
        <FateWheelModal
          isOpen={isFateWheelOpen}
          onClose={() => setIsFateWheelOpen(false)}
          categoryKey={activeFateWheelCategory}
          onOptionSelected={handleFateWheelSelect}
        />
      )}

      {isTierModalOpen && (
        <TierSelectorModal
          isOpen={isTierModalOpen}
          onClose={() => {
            setIsTierModalOpen(false);
            setTargetTalentForTier(null);
          }}
          selectedTier="B"
          onSelectTier={handleSelectTierForTalent}
          title="Talent Innate Tier Selection"
          subtitle="Select the innate potential tier for this specific gift (E to God Tier)."
        />
      )}
    </div>
  );
};