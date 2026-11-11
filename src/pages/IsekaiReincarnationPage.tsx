import React, { useState, useEffect, useRef } from 'react';
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
import { ReincarnationProfilePanel } from '../components/reincarnation/ReincarnationProfilePanel';
import { TierBadge } from '../components/character/TierBadge';
import { TierSelectorModal } from '../components/character/TierSelectorModal';
import { ALL_POWER_TIERS } from '../features/character/tierSystem';
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
  ArrowRight,
  Check,
  Trophy,
} from 'lucide-react';

export interface IsekaiReincarnationPageProps {
  onNavigate: (path: string) => void;
  onLaunchStory: (launchParams: any) => Promise<void>;
  isGenerating?: boolean;
}

export const IsekaiReincarnationPage: React.FC<IsekaiReincarnationPageProps> = ({
  onNavigate,
  onLaunchStory,
  isGenerating = false,
}) => {
  const { user } = useAuth();

  // Load or initialize persistent session
  const [session, setSession] = useState<ReincarnationSession>(() => {
    const cached = loadReincarnationSession();
    if (cached) return cached;
    return createInitialReincarnationSession(user?.displayName || '');
  });

  // UI States
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(() => {
    return session.currentSceneIndex ?? 0;
  });
  const [guidedStep, setGuidedStep] = useState<number>(1);
  const [userChatInput, setUserChatInput] = useState<string>('');
  const [isFateWheelOpen, setIsFateWheelOpen] = useState<boolean>(false);
  const [activeFateWheelCategory, setActiveFateWheelCategory] = useState<FateWheelCategory>('world_type');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);
  const [isTierModalOpen, setIsTierModalOpen] = useState<boolean>(false);

  const dialogueEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat stream
  useEffect(() => {
    if (typeof dialogueEndRef.current?.scrollIntoView === 'function') {
      dialogueEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [session.dialogueHistory?.length]);

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

  // Advance Fixed Opening Scene
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
      // Transition from Scene 4 (Arrival before Angel) into Stage 2 (Angel Conversation)
      const updated: ReincarnationSession = {
        ...session,
        stage: 'angel_dialogue',
        currentSceneIndex: CANON_OPENING_SCENES.length - 1,
      };
      setSession(updated);
      saveReincarnationSession(updated);
    }
  };

  // Skip straight to Angel encounter for returning users
  const handleSkipToAngel = () => {
    const updated: ReincarnationSession = {
      ...session,
      stage: 'angel_dialogue',
      currentSceneIndex: CANON_OPENING_SCENES.length - 1,
    };
    setCurrentSceneIndex(CANON_OPENING_SCENES.length - 1);
    setSession(updated);
    saveReincarnationSession(updated);
  };

  // Submit User Message to Angel
  const handleSendMessage = (messageText?: string) => {
    const textToSend = (messageText || userChatInput).trim();
    if (!textToSend) return;

    const nextSession = generateAngelDialogue(session, textToSend);
    setSession(nextSession);
    setUserChatInput('');
  };

  // Handle Quick Inquiry selection
  const handleQuickInquiry = (inquiryText: string) => {
    handleSendMessage(inquiryText);
  };

  // Handle Fate Wheel Spin Result
  const handleFateWheelSelect = (category: FateWheelCategory, option: any) => {
    const nextSession = applyFateWheelResult(session, category, option);
    setSession(nextSession);
    setIsFateWheelOpen(false);
  };

  // Handle Manual Field Edit in Profile Panel
  const handleUpdateProfileField = (category: keyof ReincarnationProfile, field: string, value: any) => {
    const nextSession = updateProfileFieldManually(session, category, field, value);
    setSession(nextSession);
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

  // Proceed to Final Review
  const handleProceedToReview = () => {
    const updated: ReincarnationSession = {
      ...session,
      stage: 'review_confirmation',
    };
    setSession(updated);
    saveReincarnationSession(updated);
  };

  // Return to Angel Dialogue from Review
  const handleBackToAngel = () => {
    const updated: ReincarnationSession = {
      ...session,
      stage: 'angel_dialogue',
    };
    setSession(updated);
    saveReincarnationSession(updated);
  };

  // Final Story Launch Trigger
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
      overrideHero: launchPackage.hero,
      overrideWorld: launchPackage.world,
      overrideGenres: [launchPackage.world.primaryGenreId],
    };

    await onLaunchStory(storyParams);
  };

  const currentScene = CANON_OPENING_SCENES[currentSceneIndex] || CANON_OPENING_SCENES[0];
  const isNameUndecided = session.profile.character.name.status === 'undecided' || !session.userNameChosen;

  return (
    <div className="flex flex-col h-full w-full bg-dark-bg text-dark-text relative overflow-hidden font-sans">
      {/* Dynamic Celestial Backdrop */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-brand-primary/10 blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      {/* TOP SECONDARY HEADER BAR */}
      <header className="relative z-20 flex items-center justify-between px-3 sm:px-6 py-2.5 border-b border-dark-border/40 bg-dark-bg/90 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2.5">
          <BrandEmblem size="sm" variant="icon" />
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-sm sm:text-base text-white tracking-tight">BranchVerse</span>
            <span className="text-[9px] sm:text-[10px] text-amber-300 font-mono font-bold uppercase bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-400/30">
              Isekai Reincarnation
            </span>
          </div>
        </div>

        {/* Secondary Controls: Soul Architect, Library, Settings, Reset, Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => onNavigate('#/architect')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-950/40 border border-violet-500/40 hover:border-violet-400 text-[11px] text-violet-300 hover:text-white transition-all shadow-sm"
            title="AI Soul Architect & Character Creation"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Soul Architect</span>
          </button>

          <button
            onClick={() => onNavigate('#/library')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-dark-surface border border-dark-border hover:border-brand-primary/50 text-[11px] text-dark-muted hover:text-white transition-all shadow-sm"
            title="Saved Chronicles & Library"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Library</span>
          </button>

          <button
            onClick={() => onNavigate('#/settings')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-dark-surface border border-dark-border hover:border-brand-primary/50 text-[11px] text-dark-muted hover:text-white transition-all shadow-sm"
            title="Preferences & Audio Settings"
          >
            <Settings className="w-3.5 h-3.5 text-dark-muted" />
            <span className="hidden sm:inline">Settings</span>
          </button>

          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-dark-surface border border-dark-border hover:border-rose-500/50 text-[11px] text-dark-muted hover:text-rose-300 transition-all shadow-sm"
            title="Restart Journey from Beginning"
          >
            <RotateCcw className="w-3 h-3 text-rose-400" />
            <span className="hidden md:inline">Restart</span>
          </button>

          {user ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-dark-surface border border-brand-primary/30 text-[11px] text-white shadow-sm">
              <User className="w-3 h-3 text-brand-primary" />
              <span className="max-w-[80px] sm:max-w-[110px] truncate font-medium">
                {user.displayName?.split(' ')[0] || 'Hero'}
              </span>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('#/login')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-primary/20 border border-brand-primary/40 text-[11px] text-brand-glow font-bold transition-all shadow-sm"
            >
              <LogIn className="w-3 h-3 text-brand-primary" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </header>

      {/* STAGE 1: FIXED OPENING STORY (PAGINATED SCENES 1 TO 4 — NO SCROLL NEEDED) */}
      {session.stage === 'opening_scenes' && (
        <main className="relative z-10 flex-1 min-h-0 flex flex-col justify-between max-w-2xl mx-auto w-full p-3 sm:p-6 overflow-hidden">
          {/* Scene Progress Indicator */}
          <div className="space-y-1.5 shrink-0">
            <div className="flex items-center justify-between text-[11px] text-dark-muted">
              <span className="font-mono text-amber-300 font-semibold uppercase tracking-wider">
                Scene {currentScene.order} of {CANON_OPENING_SCENES.length}
              </span>
              <span className="text-[10px] text-dark-muted/80">{currentScene.atmosphere}</span>
            </div>
            {/* Visual Step Dots */}
            <div className="grid grid-cols-4 gap-1.5">
              {CANON_OPENING_SCENES.map((s, idx) => (
                <div
                  key={s.id}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentSceneIndex
                      ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                      : idx < currentSceneIndex
                      ? 'bg-brand-primary'
                      : 'bg-dark-border/40'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Focused Cinematic Narrative Card (Fits screen height perfectly) */}
          <div className="relative my-auto p-4 sm:p-7 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-dark-surface/95 via-dark-surface/85 to-dark-bg/95 border border-dark-border/60 shadow-xl backdrop-blur-md flex flex-col justify-center space-y-3 sm:space-y-4">
            <div className="space-y-1 text-center">
              <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/25">
                The Chronicle Begins
              </span>
              <h1 className="text-lg sm:text-2xl font-black text-white font-serif tracking-tight">
                {currentScene.title}
              </h1>
            </div>

            {/* Prose Paragraphs — Concise, highly evocative, fits on mobile */}
            <div
              className="space-y-2.5 text-xs sm:text-sm text-dark-text/90 leading-relaxed font-serif max-h-[38vh] sm:max-h-none overflow-y-auto touch-scroll pr-1"
              style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
            >
              {currentScene.narrativeText.split('\n\n').map((paragraph, pIdx) => (
                <p key={pIdx} className="first-letter:text-lg sm:first-letter:text-xl first-letter:font-bold first-letter:text-amber-300">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Visual Cue */}
            <div className="p-2 sm:p-2.5 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-[11px] text-indigo-300 flex items-center justify-center gap-1.5 italic text-center">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{currentScene.visualCues}</span>
            </div>
          </div>

          {/* Bottom Actions — Always pinned and visible on mobile */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-dark-border/40 shrink-0">
            <button
              onClick={handleSkipToAngel}
              className="text-[11px] text-dark-muted hover:text-white transition-colors underline-offset-4 hover:underline"
            >
              Skip to Angel Encounter
            </button>

            <Button
              variant="primary"
              size="md"
              onClick={handleNextOpeningScene}
              className="px-6 sm:px-8 shadow-lg shadow-brand-primary/30 font-bold text-xs sm:text-sm"
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

      {/* STAGE 2: ANGEL SERAPHINA ENCOUNTER & REINCARNATION PAGINATED FLOW */}
      {session.stage === 'angel_dialogue' && (
        <main className="relative z-10 flex-1 min-h-0 flex flex-col max-w-7xl mx-auto w-full p-2.5 sm:p-5 overflow-hidden">
          {/* Top Actions: Fate Wheel & Proceed to Review */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-dark-border/40 shrink-0">
            {/* Step Indicator */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-400/15 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                Phase {guidedStep} of 6
              </span>
              <span className="text-[11px] text-dark-muted hidden sm:inline">
                {guidedStep === 1 && 'Soul Name & Identity'}
                {guidedStep === 2 && 'Destination World'}
                {guidedStep === 3 && 'Vessel & Race'}
                {guidedStep === 4 && 'Social Origin'}
                {guidedStep === 5 && 'Magic Affinities'}
                {guidedStep === 6 && 'Narration Language'}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setActiveFateWheelCategory('world_type');
                  setIsFateWheelOpen(true);
                }}
                className="text-[11px] text-amber-300 border border-amber-400/30 px-2 py-1"
              >
                <Dices className="w-3 h-3 mr-1 text-amber-400" />
                <span>Fate Wheel</span>
              </Button>

              <Button
                variant="amber"
                size="sm"
                onClick={handleProceedToReview}
                className="text-[11px] font-bold px-2.5 py-1 shadow-md shadow-amber-400/20"
              >
                <span>Proceed to Final Review</span>
                <ChevronRight className="w-3 h-3 ml-0.5" />
              </Button>
            </div>
          </div>

          {/* Desktop Two-Column / Mobile Single Clean View */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0">
            {/* PRIMARY COLUMN: UNIFIED ZERO-SCROLL DIALOGUE & GUIDED STEPPER */}
            <div className="lg:col-span-7 flex flex-col justify-between h-full bg-dark-surface/60 rounded-2xl sm:rounded-3xl border border-dark-border/60 p-3 sm:p-5 backdrop-blur-md shadow-xl overflow-hidden min-h-0">
              {/* Angel Presence Card Header */}
              <div className="flex items-center justify-between pb-2 border-b border-dark-border/40 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500/20 via-indigo-500/20 to-purple-500/30 border border-amber-400/50 flex items-center justify-center shadow-md">
                    <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-xs sm:text-sm font-bold text-white font-serif">{CANON_ANGEL.name}</h2>
                    <p className="text-[10px] text-amber-300/90">{CANON_ANGEL.title}</p>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-dark-muted hidden sm:inline">
                  The Nexus of Divine Grace
                </span>
              </div>

              {/* Dialogue Scroll Stream (Compact, touch-scrolling enabled if many messages) */}
              <div
                className="flex-1 min-h-[90px] max-h-[30vh] sm:max-h-[35vh] overflow-y-auto touch-scroll py-2 space-y-2 pr-1"
                style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' }}
              >
                {session.dialogueHistory.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.speaker === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5 px-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-dark-muted">
                        {msg.speaker === 'angel' ? CANON_ANGEL.name : (session.userNameChosen || 'You')}
                      </span>
                    </div>
                    <div
                      className={`max-w-[88%] rounded-2xl p-2.5 text-xs leading-relaxed ${
                        msg.speaker === 'user'
                          ? 'bg-brand-primary text-white rounded-tr-none shadow-md'
                          : 'bg-dark-bg/90 text-dark-text border border-amber-400/30 rounded-tl-none font-serif'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={dialogueEndRef} />
              </div>

              {/* GUIDED REINCARNATION STEPPER OPTIONS (FITS MOBILE HEIGHT PERFECTLY) */}
              <div className="py-2 border-t border-dark-border/40 shrink-0">
                {/* STEP 1: SOUL IDENTITY & NAME */}
                {guidedStep === 1 && (
                  <div className="space-y-1.5 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">Step 1: Your Soul's Name</span>
                      {session.userNameChosen && (
                        <span className="text-[10px] text-emerald-400 font-bold">Confirmed: {session.userNameChosen}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {['Hari Khatri', 'Kaelen', 'Aria', 'कबीर'].map((nm) => (
                        <button
                          key={nm}
                          onClick={() => {
                            handleQuickInquiry(`My name is ${nm}.`);
                            setGuidedStep(2);
                          }}
                          className="px-2 py-0.5 rounded-full bg-dark-bg border border-dark-border text-[10px] text-amber-300 hover:border-amber-400/60"
                        >
                          "{nm}"
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 2: DESTINATION REALM */}
                {guidedStep === 2 && (
                  <div className="space-y-1.5 animate-fadeIn">
                    <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">Step 2: Choose Destination Realm</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {FATE_WHEEL_CATEGORIES.world_type.options.slice(0, 4).map((opt: any) => {
                        const isSelected = session.profile.world.genre.value === opt.data.genre;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => {
                              handleFateWheelSelect('world_type', opt);
                            }}
                            className={`p-1.5 rounded-xl text-left border transition-all ${
                              isSelected
                                ? 'bg-amber-400/15 border-amber-400 text-white shadow-sm'
                                : 'bg-dark-bg/60 border-dark-border text-dark-muted hover:text-white'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[11px] font-bold">
                              <span className="truncate">{opt.label}</span>
                              {isSelected && <Check className="w-3 h-3 text-amber-300 shrink-0" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 3: VESSEL & RACE */}
                {guidedStep === 3 && (
                  <div className="space-y-1.5 animate-fadeIn">
                    <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">Step 3: Choose Vessel & Race</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {FATE_WHEEL_CATEGORIES.race.options.map((opt: any) => {
                        const isSelected = session.profile.character.race.value === opt.data.race;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => handleFateWheelSelect('race', opt)}
                            className={`p-1.5 rounded-xl text-left border transition-all ${
                              isSelected
                                ? 'bg-amber-400/15 border-amber-400 text-white shadow-sm'
                                : 'bg-dark-bg/60 border-dark-border text-dark-muted hover:text-white'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[11px] font-bold">
                              <span className="truncate">{opt.data.race}</span>
                              {isSelected && <Check className="w-2.5 h-2.5 text-amber-300 shrink-0" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 4: SOCIAL ORIGIN */}
                {guidedStep === 4 && (
                  <div className="space-y-1.5 animate-fadeIn">
                    <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">Step 4: Social Origin</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {FATE_WHEEL_CATEGORIES.origin.options.map((opt: any) => {
                        const isSelected = session.profile.character.socialStatus.value === opt.data.socialStatus;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => handleFateWheelSelect('origin', opt)}
                            className={`p-1.5 rounded-xl text-left border transition-all ${
                              isSelected
                                ? 'bg-amber-400/15 border-amber-400 text-white shadow-sm'
                                : 'bg-dark-bg/60 border-dark-border text-dark-muted hover:text-white'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[11px] font-bold">
                              <span className="truncate">{opt.data.socialStatus.split(' ')[0]}</span>
                              {isSelected && <Check className="w-2.5 h-2.5 text-amber-300 shrink-0" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 5: MAGIC AFFINITY & SOUL POWER TIER */}
                {guidedStep === 5 && (
                  <div className="space-y-2 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">Step 5: Magic Gift & Tier</span>
                      <button
                        type="button"
                        onClick={() => setIsTierModalOpen(true)}
                        className="text-[10px] text-amber-300 font-bold hover:text-white flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30"
                      >
                        <Trophy className="w-2.5 h-2.5 text-amber-400" />
                        <span>All Tiers (E to God)</span>
                      </button>
                    </div>

                    {/* Magic Affinities */}
                    <div className="grid grid-cols-3 gap-1.5">
                      {FATE_WHEEL_CATEGORIES.abilities.options.map((opt: any) => {
                        const isSelected = session.profile.abilities.magicAffinity.value.includes(opt.data.magicAffinity[0]);
                        return (
                          <button
                            key={opt.id}
                            onClick={() => handleFateWheelSelect('abilities', opt)}
                            className={`p-1.5 rounded-xl text-left border transition-all ${
                              isSelected
                                ? 'bg-amber-400/15 border-amber-400 text-white shadow-sm'
                                : 'bg-dark-bg/60 border-dark-border text-dark-muted hover:text-white'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[11px] font-bold">
                              <span className="truncate">{opt.data.magicAffinity[0]}</span>
                              {isSelected && <Check className="w-2.5 h-2.5 text-amber-300 shrink-0" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Starting Soul Tier Chips (E to SSS and God Tier) */}
                    <div className="pt-1.5 border-t border-dark-border/40">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-dark-muted font-semibold">Starting Soul Tier</span>
                        <TierBadge tier={session.profile.abilities.powerTier?.value || 'B'} size="xs" variant="pill" showTitle={true} />
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {ALL_POWER_TIERS.map((t) => {
                          const isSelected = (session.profile.abilities.powerTier?.value || 'B') === t.code;
                          return (
                            <button
                              key={t.code}
                              type="button"
                              onClick={() => handleUpdateProfileField('abilities', 'powerTier', t.code)}
                              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all ${
                                isSelected
                                  ? `${t.bgClass} ${t.borderClass} ${t.color} ring-1 ring-amber-400/50 shadow-sm scale-105`
                                  : 'bg-dark-bg/60 border-dark-border/60 text-dark-muted hover:text-white'
                              }`}
                            >
                              {t.code === 'GOD' ? 'GOD TIER' : t.code}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 6: TONE & LANGUAGE */}
                {guidedStep === 6 && (
                  <div className="space-y-1.5 animate-fadeIn">
                    <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">Step 6: Language & Pacing</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => handleUpdateProfileField('preferences', 'storyLanguage', 'hi')}
                        className={`p-1.5 rounded-xl text-[11px] font-bold border transition-all text-center ${
                          session.profile.preferences.storyLanguage.value === 'hi'
                            ? 'bg-amber-400 text-black border-amber-400'
                            : 'bg-dark-bg border-dark-border text-dark-text'
                        }`}
                      >
                        हिंदी (Hindi - Default)
                      </button>
                      <button
                        onClick={() => handleUpdateProfileField('preferences', 'storyLanguage', 'en')}
                        className={`p-1.5 rounded-xl text-[11px] font-bold border transition-all text-center ${
                          session.profile.preferences.storyLanguage.value === 'en'
                            ? 'bg-amber-400 text-black border-amber-400'
                            : 'bg-dark-bg border-dark-border text-dark-text'
                        }`}
                      >
                        English
                      </button>
                    </div>
                  </div>
                )}

                {/* Stepper Navigation Buttons */}
                <div className="flex items-center justify-between gap-2 pt-2">
                  {guidedStep > 1 ? (
                    <button
                      onClick={() => setGuidedStep((p) => Math.max(1, p - 1))}
                      className="text-[11px] text-dark-muted hover:text-white flex items-center gap-0.5"
                    >
                      <ChevronLeft className="w-3 h-3" />
                      <span>Back</span>
                    </button>
                  ) : (
                    <span />
                  )}

                  {guidedStep < 6 ? (
                    <button
                      onClick={() => setGuidedStep((p) => Math.min(6, p + 1))}
                      className="px-3 py-1 rounded-lg bg-dark-surface border border-dark-border hover:border-amber-400 text-[11px] font-bold text-amber-300 flex items-center gap-1"
                    >
                      <span>Next Phase</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  ) : (
                    <button
                      onClick={handleProceedToReview}
                      className="px-3 py-1 rounded-lg bg-amber-400 text-black text-[11px] font-bold flex items-center gap-1 shadow-sm"
                    >
                      <span>Review Destiny Affirmation</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Text Input Bar (Send custom queries in English or Hindi) */}
              <div className="pt-2 border-t border-dark-border/40 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-1.5"
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
                    className="flex-1 px-3 py-2 rounded-xl bg-dark-bg border border-dark-border text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={!userChatInput.trim()}
                    className="px-3 py-2 shrink-0"
                    aria-label="Send response to Angel"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </form>
              </div>
            </div>

            {/* DESKTOP RIGHT COLUMN: LIVE EDITABLE REINCARNATION PROFILE */}
            <div className="hidden lg:flex lg:col-span-5 flex-col h-full min-h-0">
              <ReincarnationProfilePanel
                profile={session.profile}
                onUpdateField={handleUpdateProfileField}
                onOpenFateWheel={(cat) => {
                  setActiveFateWheelCategory(cat);
                  setIsFateWheelOpen(true);
                }}
                onConfirmProfile={handleProceedToReview}
              />
            </div>
          </div>
        </main>
      )}

      {/* STAGE 3: REVIEW & REINCARNATION AFFIRMATION (ZERO-SCROLL VIEWPORT CARD) */}
      {session.stage === 'review_confirmation' && (
        <main className="relative z-10 flex-1 min-h-0 flex flex-col justify-between max-w-2xl mx-auto w-full p-3 sm:p-6 overflow-hidden">
          {/* Header */}
          <div className="text-center space-y-1 shrink-0">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/25">
              Dimensional Gate Primed
            </span>
            <h1 className="text-lg sm:text-2xl font-black text-white font-serif tracking-tight">
              Reincarnation Affirmation
            </h1>
            <p className="text-[11px] text-dark-muted">
              Divine Angel Seraphina has crystallized your soul’s blueprint.
            </p>
          </div>

          {/* Compact Zero-Scroll Summary Dossier */}
          <div className="my-auto p-4 rounded-2xl bg-dark-surface/90 border border-dark-border/80 space-y-3 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between pb-2 border-b border-dark-border/40">
              <div>
                <span className="text-[10px] text-dark-muted uppercase font-bold tracking-wider">Soul Vessel</span>
                <h3 className="text-base font-bold text-white font-serif">
                  {session.profile.character.name.value || 'Hari Khatri'}
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <TierBadge
                  tier={session.profile.abilities.powerTier?.value || 'B'}
                  size="sm"
                  variant="badge"
                  showTitle={true}
                  onClick={() => setIsTierModalOpen(true)}
                />
                <Badge variant="primary">{session.profile.character.race.value}</Badge>
                <Badge variant="amber">{session.profile.world.genre.value}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-dark-bg/60 border border-dark-border/60">
                <span className="text-[10px] text-dark-muted block">Destination Realm:</span>
                <span className="font-bold text-white truncate block">{session.profile.world.name.value}</span>
                <span className="text-[10px] text-amber-300/80 block mt-0.5">{session.profile.world.era.value}</span>
              </div>

              <div className="p-2 rounded-xl bg-dark-bg/60 border border-dark-border/60">
                <span className="text-[10px] text-dark-muted block">Status & Origin:</span>
                <span className="font-bold text-white truncate block">{session.profile.character.socialStatus.value}</span>
                <span className="text-[10px] text-dark-muted truncate block mt-0.5">{session.profile.circumstances.birthplace.value}</span>
              </div>

              <div className="p-2 rounded-xl bg-dark-bg/60 border border-dark-border/60 col-span-2">
                <span className="text-[10px] text-dark-muted block">Inherent Gifts & Language:</span>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-amber-300 font-medium">
                    {session.profile.abilities.magicAffinity.value.join(', ')}
                  </span>
                  <span className="text-[10px] text-indigo-300 font-mono">
                    {session.profile.preferences.storyLanguage.value.toUpperCase()} • {session.profile.preferences.pacing.value}
                  </span>
                </div>
              </div>
            </div>

            {/* Angel's Farewell Blessing */}
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-indigo-500/10 border border-amber-400/30 text-[11px] text-amber-200/90 flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <p className="font-serif italic leading-relaxed">
                "{CANON_ANGEL.farewellBlessing}"
              </p>
            </div>
          </div>

          {/* Bottom Action Bar — Always pinned and visible on mobile */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-dark-border/40 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToAngel}
              className="text-xs text-dark-muted hover:text-white"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              <span>Back to Angel</span>
            </Button>

            <Button
              variant="amber"
              size="md"
              disabled={isGenerating}
              onClick={handleConfirmReincarnation}
              className="px-6 font-bold shadow-xl shadow-amber-400/20 text-xs sm:text-sm"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 mr-1.5 animate-spin text-amber-300" />
                  <span>Awakening in Realm...</span>
                </>
              ) : (
                <>
                  <span>Awaken in {session.profile.world.name.value}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </>
              )}
            </Button>
          </div>
        </main>
      )}

      {/* FATE WHEEL MODAL */}
      <FateWheelModal
        isOpen={isFateWheelOpen}
        onClose={() => setIsFateWheelOpen(false)}
        categoryKey={activeFateWheelCategory}
        onSelectCategory={(cat) => setActiveFateWheelCategory(cat)}
        onOptionSelected={handleFateWheelSelect}
      />

      {/* TIER SELECTION MODAL */}
      <TierSelectorModal
        isOpen={isTierModalOpen}
        onClose={() => setIsTierModalOpen(false)}
        selectedTier={session.profile.abilities.powerTier?.value || 'B'}
        onSelectTier={(tier) => handleUpdateProfileField('abilities', 'powerTier', tier.code)}
      />

      {/* RESTART CONFIRMATION MODAL */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="p-5 rounded-2xl bg-dark-surface border border-dark-border max-w-xs w-full space-y-3 shadow-2xl">
            <h3 className="text-sm font-bold text-white">Restart Reincarnation Journey?</h3>
            <p className="text-xs text-dark-muted leading-relaxed">
              This will reset your conversation with Angel Seraphina and return you to Scene 1.
            </p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button variant="ghost" size="sm" onClick={() => setIsResetConfirmOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleResetSession}>
                Reset
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
