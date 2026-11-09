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
import {
  createInitialReincarnationSession,
  generateAngelDialogue,
  applyFateWheelResult,
  spinAllUndecidedCategories,
  updateProfileFieldManually,
  buildReincarnationLaunchPackage,
  loadReincarnationSession,
  saveReincarnationSession,
  clearReincarnationSession,
} from '../features/reincarnation/reincarnationEngine';
import { FateWheelModal } from '../components/reincarnation/FateWheelModal';
import { ReincarnationProfilePanel } from '../components/reincarnation/ReincarnationProfilePanel';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Send,
  Dices,
  CheckCircle2,
  BookOpen,
  Settings,
  User,
  LogIn,
  Layers,
  ArrowRight,
  Globe,
  Shield,
  Zap,
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
  const { user, signInWithGoogle } = useAuth();

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
  const [userChatInput, setUserChatInput] = useState<string>('');
  const [isFateWheelOpen, setIsFateWheelOpen] = useState<boolean>(false);
  const [activeFateWheelCategory, setActiveFateWheelCategory] = useState<FateWheelCategory>('world_type');
  const [mobileActiveTab, setMobileActiveTab] = useState<'dialogue' | 'profile'>('dialogue');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const dialogueEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat stream
  useEffect(() => {
    if (typeof dialogueEndRef.current?.scrollIntoView === 'function') {
      dialogueEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [session.dialogueHistory.length]);

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

  // Handle Spin All Undecided
  const handleSpinAllUndecided = () => {
    const nextSession = spinAllUndecidedCategories(session);
    setSession(nextSession);
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
    <div className="flex flex-col h-full w-full bg-dark-bg text-dark-text relative overflow-x-hidden font-sans select-none">
      {/* Dynamic Celestial Backdrop */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-brand-primary/10 blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      {/* TOP SECONDARY HEADER BAR */}
      <header className="relative z-20 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-dark-border/40 bg-dark-bg/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <BrandEmblem size="sm" variant="icon" />
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base text-white tracking-tight">BranchVerse</span>
            <span className="text-[10px] text-amber-300 font-mono font-bold uppercase bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-400/30">
              Isekai Reincarnation
            </span>
          </div>
        </div>

        {/* Secondary Controls: Library, Settings, Reset, Profile */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('#/library')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-dark-surface border border-dark-border hover:border-brand-primary/50 text-xs text-dark-muted hover:text-white transition-all shadow-sm"
            title="Saved Chronicles & Library"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Library</span>
          </button>

          <button
            onClick={() => onNavigate('#/settings')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-dark-surface border border-dark-border hover:border-brand-primary/50 text-xs text-dark-muted hover:text-white transition-all shadow-sm"
            title="Preferences & Audio Settings"
          >
            <Settings className="w-3.5 h-3.5 text-dark-muted" />
            <span className="hidden sm:inline">Settings</span>
          </button>

          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-dark-surface border border-dark-border hover:border-rose-500/50 text-xs text-dark-muted hover:text-rose-300 transition-all shadow-sm"
            title="Restart Journey from the Beginning"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden md:inline">Restart</span>
          </button>

          {user ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-dark-surface border border-brand-primary/30 text-xs text-white shadow-sm">
              <User className="w-3.5 h-3.5 text-brand-primary" />
              <span className="max-w-[100px] truncate font-medium">
                {user.displayName?.split(' ')[0] || 'Hero'}
              </span>
            </div>
          ) : (
            <button
              onClick={() => onNavigate('#/login')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-primary/20 border border-brand-primary/40 hover:bg-brand-primary/30 text-xs text-brand-glow font-bold transition-all shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5 text-brand-primary" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </header>

      {/* STAGE 1: FIXED OPENING STORY (SCENES 1 TO 4) */}
      {session.stage === 'opening_scenes' && (
        <main className="relative z-10 flex-1 flex flex-col justify-between max-w-3xl mx-auto w-full p-4 sm:p-8 overflow-y-auto">
          {/* Scene Progress Indicator */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center justify-between text-xs text-dark-muted">
              <span className="font-mono text-amber-300 font-semibold uppercase tracking-wider">
                Scene {currentScene.order} of {CANON_OPENING_SCENES.length}
              </span>
              <span className="text-[11px] text-dark-muted/80">{currentScene.atmosphere}</span>
            </div>
            {/* Visual Step Bar */}
            <div className="grid grid-cols-4 gap-2">
              {CANON_OPENING_SCENES.map((s, idx) => (
                <div
                  key={s.id}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
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

          {/* Narrative Card */}
          <div className="relative p-6 sm:p-10 rounded-3xl bg-gradient-to-b from-dark-surface/90 via-dark-surface/80 to-dark-bg/95 border border-dark-border/60 shadow-2xl backdrop-blur-md space-y-6 flex-1 flex flex-col justify-center">
            {/* Ambient Aura */}
            <div className="absolute top-0 right-1/4 w-72 h-32 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-2 text-center">
              <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-amber-300 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/25">
                The Chronicle Begins
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white font-serif tracking-tight">
                {currentScene.title}
              </h1>
            </div>

            {/* Prose Text */}
            <div className="space-y-4 text-sm sm:text-base text-dark-text/90 leading-relaxed font-serif max-w-2xl mx-auto">
              {currentScene.narrativeText.split('\n\n').map((paragraph, pIdx) => (
                <p key={pIdx} className="first-letter:text-2xl first-letter:font-bold first-letter:text-amber-300">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* In-world Visual Cue */}
            <div className="p-3.5 rounded-2xl bg-brand-primary/5 border border-brand-primary/20 text-xs text-indigo-300 flex items-center justify-center gap-2 italic text-center">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{currentScene.visualCues}</span>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between gap-4 mt-6 pt-4 border-t border-dark-border/40">
            <button
              onClick={handleSkipToAngel}
              className="text-xs text-dark-muted hover:text-white transition-colors underline-offset-4 hover:underline"
            >
              Skip to Angel Encounter
            </button>

            <Button
              variant="primary"
              size="lg"
              onClick={handleNextOpeningScene}
              className="px-8 shadow-lg shadow-brand-primary/30 font-bold"
            >
              {currentSceneIndex < CANON_OPENING_SCENES.length - 1 ? (
                <>
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4 ml-1.5" />
                </>
              ) : (
                <>
                  <span>Approach the Angel</span>
                  <Sparkles className="w-4 h-4 ml-1.5 text-amber-300" />
                </>
              )}
            </Button>
          </div>
        </main>
      )}

      {/* STAGE 2: ANGEL CONVERSATION & LIVE EDITABLE PROFILE */}
      {session.stage === 'angel_dialogue' && (
        <main className="relative z-10 flex-1 flex flex-col max-w-7xl mx-auto w-full p-3 sm:p-6 overflow-hidden">
          {/* Mobile Tab Switcher */}
          <div className="flex lg:hidden items-center justify-between pb-3 mb-2 border-b border-dark-border/40">
            <div className="flex gap-2">
              <button
                onClick={() => setMobileActiveTab('dialogue')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  mobileActiveTab === 'dialogue'
                    ? 'bg-brand-primary text-white shadow-md'
                    : 'bg-dark-surface text-dark-muted hover:text-white'
                }`}
              >
                Angel Seraphina
              </button>
              <button
                onClick={() => setMobileActiveTab('profile')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  mobileActiveTab === 'profile'
                    ? 'bg-brand-primary text-white shadow-md'
                    : 'bg-dark-surface text-dark-muted hover:text-white'
                }`}
              >
                <span>Reincarnation Profile</span>
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              </button>
            </div>

            <Button
              variant="amber"
              size="sm"
              onClick={handleProceedToReview}
              className="text-xs font-bold"
            >
              <span>Review</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>

          {/* Desktop Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
            {/* LEFT COLUMN: SERAPHINA CONVERSATION & INPUT */}
            <div
              className={`lg:col-span-7 flex flex-col justify-between h-full bg-dark-surface/60 rounded-3xl border border-dark-border/60 p-4 sm:p-6 backdrop-blur-md shadow-xl overflow-hidden ${
                mobileActiveTab === 'dialogue' ? 'flex' : 'hidden lg:flex'
              }`}
            >
              {/* Angel Identity Banner */}
              <div className="flex items-center justify-between pb-4 border-b border-dark-border/40 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-indigo-500/20 to-purple-500/30 border border-amber-400/50 flex items-center justify-center shadow-lg shadow-amber-400/10">
                      <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-dark-bg" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white font-serif">{CANON_ANGEL.name}</h2>
                    <p className="text-[11px] text-amber-300/90">{CANON_ANGEL.title}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setActiveFateWheelCategory('world_type');
                      setIsFateWheelOpen(true);
                    }}
                    className="text-xs text-amber-300 hover:bg-amber-400/10 border border-amber-400/30"
                  >
                    <Dices className="w-3.5 h-3.5 mr-1 text-amber-400" />
                    <span>Fate Wheel</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSpinAllUndecided}
                    className="text-xs text-indigo-300 hover:bg-indigo-400/10 border border-indigo-400/30 hidden sm:flex"
                    title="Spin randomized choices for remaining undecided fields"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                    <span>Spin All Undecided</span>
                  </Button>
                </div>
              </div>

              {/* Dialogue Scroll Stream */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 min-h-[220px]">
                {session.dialogueHistory.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.speaker === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-dark-muted">
                        {msg.speaker === 'angel' ? CANON_ANGEL.name : (session.userNameChosen || 'You')}
                      </span>
                      {msg.speaker === 'angel' && (
                        <span className="text-[9px] text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/20">
                          Herald
                        </span>
                      )}
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                        msg.speaker === 'user'
                          ? 'bg-brand-primary text-white rounded-tr-none shadow-md'
                          : 'bg-dark-bg/90 text-dark-text border border-amber-400/30 rounded-tl-none shadow-lg shadow-amber-400/5 font-serif'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={dialogueEndRef} />
              </div>

              {/* Quick Inquiry / Contextual Reply Chips */}
              <div className="py-2 shrink-0">
                <div className="text-[10px] text-dark-muted uppercase font-bold tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Suggested Inquiries</span>
                  {isNameUndecided && (
                    <span className="text-amber-400 font-normal">State your true name to proceed</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {isNameUndecided ? (
                    <>
                      <button
                        onClick={() => handleQuickInquiry('My name is Hari Khatri.')}
                        className="px-2.5 py-1 rounded-full bg-dark-bg border border-amber-400/40 text-[11px] text-amber-300 hover:bg-amber-400/10 transition-colors"
                      >
                        "My name is Hari Khatri."
                      </button>
                      <button
                        onClick={() => handleQuickInquiry('Call me Kaelen.')}
                        className="px-2.5 py-1 rounded-full bg-dark-bg border border-dark-border text-[11px] text-dark-text hover:border-brand-primary transition-colors"
                      >
                        "Call me Kaelen."
                      </button>
                      <button
                        onClick={() => handleQuickInquiry('मेरा नाम कबीर है।')}
                        className="px-2.5 py-1 rounded-full bg-dark-bg border border-dark-border text-[11px] text-indigo-300 hover:border-brand-primary transition-colors"
                      >
                        "मेरा नाम कबीर है।"
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleQuickInquiry('What worlds can I choose from?')}
                        className="px-2.5 py-1 rounded-full bg-dark-bg border border-dark-border text-[11px] text-dark-text hover:border-brand-primary transition-colors"
                      >
                        "What worlds can I choose from?"
                      </button>
                      <button
                        onClick={() => handleQuickInquiry('Can I ever return to Earth?')}
                        className="px-2.5 py-1 rounded-full bg-dark-bg border border-dark-border text-[11px] text-dark-text hover:border-brand-primary transition-colors"
                      >
                        "Can I return to Earth?"
                      </button>
                      <button
                        onClick={() => handleQuickInquiry('I want a High Fantasy world with celestial magic leylines.')}
                        className="px-2.5 py-1 rounded-full bg-dark-bg border border-dark-border text-[11px] text-amber-300 hover:border-amber-400/50 transition-colors"
                      >
                        "I want a High Fantasy world."
                      </button>
                      <button
                        onClick={() => handleQuickInquiry('मुझे कहानी हिंदी में पढ़नी है।')}
                        className="px-2.5 py-1 rounded-full bg-dark-bg border border-dark-border text-[11px] text-indigo-300 hover:border-indigo-400/50 transition-colors"
                      >
                        "हिंदी में कहानी सुनाओ।"
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Natural Language Input Bar */}
              <div className="pt-3 border-t border-dark-border/40 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={userChatInput}
                    onChange={(e) => setUserChatInput(e.target.value)}
                    placeholder={
                      isNameUndecided
                        ? "Seraphina awaits your name (e.g. 'My name is Hari Khatri')..."
                        : "Speak with Seraphina in English or Hindi (e.g. 'I want to be an elven scholar')..."
                    }
                    className="flex-1 px-4 py-2.5 rounded-2xl bg-dark-bg border border-dark-border text-xs sm:text-sm text-dark-text placeholder-dark-muted focus:outline-none focus:border-amber-400/80 transition-colors"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!userChatInput.trim()}
                    className="rounded-2xl px-4 py-2.5 shrink-0"
                    aria-label="Send response to Angel"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </div>

            {/* RIGHT COLUMN: LIVE EDITABLE REINCARNATION PROFILE */}
            <div
              className={`lg:col-span-5 flex flex-col h-full ${
                mobileActiveTab === 'profile' ? 'flex' : 'hidden lg:flex'
              }`}
            >
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

      {/* STAGE 3: REVIEW & REINCARNATION AFFIRMATION */}
      {session.stage === 'review_confirmation' && (
        <main className="relative z-10 flex-1 flex flex-col justify-between max-w-4xl mx-auto w-full p-4 sm:p-8 overflow-y-auto">
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-300 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/25">
                Dimensional Gate Primed
              </span>
              <h1 className="text-2xl sm:text-4xl font-black text-white font-serif tracking-tight">
                Reincarnation Affirmation
              </h1>
              <p className="text-xs sm:text-sm text-dark-muted max-w-lg mx-auto">
                Divine Angel Seraphina has crystallized your soul’s blueprint. Review your destiny before crossing the threshold.
              </p>
            </div>

            {/* Comprehensive Dossier Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Identity Card */}
              <div className="p-5 rounded-3xl bg-dark-surface border border-dark-border/70 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-dark-border/40">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-white">Vessel & Soul</h3>
                  </div>
                  <Badge variant="amber">{session.profile.character.race.value}</Badge>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-dark-muted">True Name:</span>
                    <span className="font-bold text-white">{session.profile.character.name.value || 'Hari Khatri'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-muted">Lineage & Status:</span>
                    <span className="text-dark-text">{session.profile.character.socialStatus.value}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-muted">Personality:</span>
                    <span className="text-dark-text">{session.profile.character.personality.value.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-muted">Origin Borough:</span>
                    <span className="text-dark-text">{session.profile.circumstances.birthplace.value}</span>
                  </div>
                </div>
              </div>

              {/* World Card */}
              <div className="p-5 rounded-3xl bg-dark-surface border border-dark-border/70 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-dark-border/40">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-400" />
                    <h3 className="text-sm font-bold text-white">Destination Realm</h3>
                  </div>
                  <Badge variant="primary">{session.profile.world.genre.value}</Badge>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-dark-muted">World Name:</span>
                    <span className="font-bold text-white">{session.profile.world.name.value}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-muted">Era:</span>
                    <span className="text-dark-text">{session.profile.world.era.value}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-muted">Power System:</span>
                    <span className="text-dark-text truncate max-w-[200px]">{session.profile.world.magicSystem.value}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-muted">Pacing & Language:</span>
                    <span className="text-amber-300 font-mono">
                      {session.profile.preferences.storyLanguage.value.toUpperCase()} • {session.profile.preferences.pacing.value}
                    </span>
                  </div>
                </div>
              </div>

              {/* Inherent Gifts & Knowledge */}
              <div className="p-5 rounded-3xl bg-dark-surface border border-dark-border/70 space-y-3 md:col-span-2">
                <div className="flex items-center gap-2 pb-2 border-b border-dark-border/40">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">Affinities, Skills & Prior Life Retention</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="text-dark-muted block">Magic Affinities:</span>
                    <div className="flex flex-wrap gap-1">
                      {session.profile.abilities.magicAffinity.value.map((aff, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-dark-bg border border-amber-400/30 text-amber-300 font-medium">
                          {aff}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-dark-muted block">Trained Skills:</span>
                    <div className="flex flex-wrap gap-1">
                      {session.profile.abilities.skills.value.map((sk, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-dark-bg border border-dark-border text-dark-text">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-dark-muted block">Earth Memories:</span>
                    <p className="text-dark-text/90 italic leading-relaxed">
                      {session.profile.abilities.previousLifeKnowledge.value}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Angel's Departure Blessing */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-amber-500/10 border border-amber-400/40 text-xs text-amber-200/90 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-serif italic">
                  "{CANON_ANGEL.farewellBlessing}"
                </p>
                <p className="text-[10px] text-dark-muted">— Seraphina, Divine Herald</p>
              </div>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-4 border-t border-dark-border/40">
            <Button
              variant="ghost"
              size="md"
              onClick={handleBackToAngel}
              className="text-xs text-dark-muted hover:text-white w-full sm:w-auto"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              <span>Back to Angel Seraphina</span>
            </Button>

            <Button
              variant="amber"
              size="lg"
              disabled={isGenerating}
              onClick={handleConfirmReincarnation}
              className="w-full sm:w-auto px-8 shadow-xl shadow-amber-400/20 font-bold"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin text-amber-300" />
                  <span>Awakening in New World...</span>
                </>
              ) : (
                <>
                  <span>Awaken in {session.profile.world.name.value}</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
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

      {/* RESTART CONFIRMATION MODAL */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="p-6 rounded-3xl bg-dark-surface border border-dark-border max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Restart Reincarnation Journey?</h3>
            <p className="text-xs text-dark-muted leading-relaxed">
              This will reset your conversation with Angel Seraphina and return you to Scene 1 of the afterlife transition.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setIsResetConfirmOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleResetSession}>
                Reset Journey
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
