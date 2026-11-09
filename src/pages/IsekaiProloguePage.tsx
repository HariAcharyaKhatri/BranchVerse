import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { BrandEmblem } from '../components/branding/BrandEmblem';
import {
  ProloguePhase,
  PrologueSessionState,
  EntityPersonality,
} from '../features/isekai/isekaiTypes';
import {
  ISEKAI_RACES,
  ISEKAI_CLASSES,
  ISEKAI_ELEMENTS,
  ISEKAI_SCENARIOS,
  ENTITY_PERSONALITY_PROFILES,
} from '../features/isekai/isekaiCatalog';
import {
  createInitialPrologueSession,
  advanceProloguePhase,
  appendDialogue,
  updateSoulSculpt,
  generateEntityResponse,
  buildIsekaiStoryLaunchParams,
  loadPrologueSession,
  clearPrologueSession,
} from '../features/isekai/isekaiEngine';
import { WORLD_CATALOG } from '../catalogs/worlds';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Send,
  RotateCcw,
  Compass,
  User,
  Shield,
  Zap,
  Flame,
  Globe,
  CheckCircle2,
  HelpCircle,
  Feather,
} from 'lucide-react';

interface IsekaiProloguePageProps {
  onBack: () => void;
  onLaunchStory: (params: any) => Promise<void>;
  isGenerating?: boolean;
}

export const IsekaiProloguePage: React.FC<IsekaiProloguePageProps> = ({
  onBack,
  onLaunchStory,
  isGenerating = false,
}) => {
  const { user } = useAuth();
  const [session, setSession] = useState<PrologueSessionState>(() => {
    const cached = loadPrologueSession();
    if (cached) return cached;
    return createInitialPrologueSession(user?.displayName || 'Hari Khatri');
  });

  const [customInput, setCustomInput] = useState('');
  const [sculptTab, setSculptTab] = useState<'identity' | 'race' | 'class' | 'elements' | 'scenario'>('identity');
  const dialogueEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll dialogue container
  useEffect(() => {
    if (typeof dialogueEndRef.current?.scrollIntoView === 'function') {
      dialogueEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [session.dialogueHistory.length]);

  const handleNextPhase = (targetPhase?: ProloguePhase) => {
    const next = advanceProloguePhase(session, targetPhase);
    setSession(next);
  };

  const handleEntityQuestion = (question: string) => {
    if (!question.trim()) return;

    // 1. Add hero's dialogue
    let currentSession = appendDialogue(session, {
      speaker: 'hero',
      text: question.trim(),
    });

    // 2. Generate and append entity response
    const entityReply = generateEntityResponse(currentSession, question.trim());
    currentSession = appendDialogue(currentSession, {
      speaker: 'entity',
      text: entityReply,
      emotion: 'mysterious',
    });

    setSession(currentSession);
    setCustomInput('');
  };

  const handlePersonalityChange = (personality: EntityPersonality) => {
    const profile = ENTITY_PERSONALITY_PROFILES[personality];
    const updated = appendDialogue(
      {
        ...session,
        entityPersonality: personality,
      },
      {
        speaker: 'narrator',
        text: `The aura of the entity shifts. Now manifesting as: ${profile.name} (${profile.epithet}).`,
      }
    );
    setSession(updated);
  };

  const handleToggleElement = (elementId: string) => {
    const current = [...session.soulSculpt.elementalAffinities];
    const exists = current.includes(elementId);
    let updatedList: string[];
    if (exists) {
      if (current.length <= 1) return; // Keep at least 1 affinity
      updatedList = current.filter((id) => id !== elementId);
    } else {
      if (current.length >= 3) {
        updatedList = [...current.slice(1), elementId]; // Max 3 affinities
      } else {
        updatedList = [...current, elementId];
      }
    }
    const updated = updateSoulSculpt(session, { elementalAffinities: updatedList });
    setSession(updated);
  };

  const handleFinalDeparture = async () => {
    const launchPkg = buildIsekaiStoryLaunchParams(session, WORLD_CATALOG);
    clearPrologueSession();
    await onLaunchStory({
      title: `${launchPkg.hero.name}’s Chronicle in ${launchPkg.world.name}`,
      settings: launchPkg.settings,
      generationMode: 'ai',
      overrideHero: launchPkg.hero,
      overrideWorld: launchPkg.world,
      overrideGenres: [launchPkg.world.primaryGenreId || 'High Fantasy'],
      userPromptDescription: launchPkg.settings.userPromptDescription,
    });
  };

  const phasesList: { key: ProloguePhase; label: string }[] = [
    { key: 'first_life', label: '1. First Life' },
    { key: 'astral_awakening', label: '2. Astral Awakening' },
    { key: 'entity_communion', label: '3. The Arbiter' },
    { key: 'soul_sculpting', label: '4. Soul Sculpting' },
    { key: 'gateway_selection', label: '5. World Gateway' },
    { key: 'final_departure', label: '6. Departure' },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-[#080511] text-white overflow-hidden relative select-none">
      {/* Background ambient lighting glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-violet-600/15 blur-[120px]" />
        <div className="absolute bottom-10 right-0 w-96 h-96 rounded-full bg-indigo-500/10 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-amber-500/5 blur-[140px]" />
      </div>

      {/* Top Header Bar */}
      <header className="relative z-20 flex items-center justify-between px-4 sm:px-6 py-3 border-b border-dark-border/60 bg-[#090514]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-xl text-dark-muted hover:text-white hover:bg-dark-elevated transition-colors"
            aria-label="Back to Hub"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <BrandEmblem size="sm" variant="icon" />
            <div>
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white font-serif">
                Isekai Rebirth Prologue
              </h1>
              <p className="text-[10px] text-amber-300/80 font-mono">
                Multiverse Soul Migration
              </p>
            </div>
          </div>
        </div>

        {/* Phase Pill Navigation (Desktop/Tablet) */}
        <div className="hidden md:flex items-center gap-1 text-[11px] font-mono">
          {phasesList.map((p) => {
            const isActive = session.currentPhase === p.key;
            return (
              <span
                key={p.key}
                className={`px-2.5 py-1 rounded-full border transition-all ${
                  isActive
                    ? 'bg-brand-primary/20 text-brand-glow border-brand-primary/50 shadow-sm shadow-brand-primary/30'
                    : 'text-dark-muted border-transparent opacity-60'
                }`}
              >
                {p.label}
              </span>
            );
          })}
        </div>

        <button
          onClick={() => {
            clearPrologueSession();
            setSession(createInitialPrologueSession(user?.displayName || 'Hari Khatri'));
          }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-dark-muted hover:text-white hover:bg-dark-elevated transition-colors"
          title="Restart Prologue"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </header>

      {/* Main Interactive Stage */}
      <main className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full flex flex-col justify-between space-y-6">
        {/* PHASE 1: THE FIRST LIFE */}
        {session.currentPhase === 'first_life' && (
          <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            <div className="p-6 rounded-3xl bg-dark-surface/90 border border-dark-border shadow-2xl space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-widest font-mono">
                <Sparkles className="w-4 h-4" /> Earth • 02:47 AM • A Storm Outside
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-white leading-tight">
                The Final Hours of an Ordinary World
              </h2>
              <div className="space-y-3 text-sm sm:text-base text-dark-text/90 leading-relaxed font-sans">
                <p>
                  Rain lashes against the glass in relentless, rhythmic bursts. The city outside is a blur of watery headlights and quiet shadows. Before you sits an unfinished creation, its glow reflecting softly in your tired eyes.
                </p>
                <p>
                  You stretch your fingers, listening to the thunder roll across the rooftops. There was so much left to accomplish—ideas left unsaid, journeys unstarted. You pause, wondering what choice to make before the night claims you.
                </p>
              </div>

              {/* Free-Choice Prompt Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
                <button
                  onClick={() => {
                    handleEntityQuestion('I remained at my desk, determined to see my work through to the end.');
                    handleNextPhase('astral_awakening');
                  }}
                  className="p-4 rounded-2xl bg-dark-elevated/70 border border-dark-border hover:border-brand-primary/60 text-left space-y-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <p className="text-xs font-bold text-white">Work into the Night</p>
                  <p className="text-[11px] text-dark-muted">Stay focused, ignoring the fatigue in your veins.</p>
                </button>

                <button
                  onClick={() => {
                    handleEntityQuestion('I stepped onto the balcony into the cold rain to feel the tempest.');
                    handleNextPhase('astral_awakening');
                  }}
                  className="p-4 rounded-2xl bg-dark-elevated/70 border border-dark-border hover:border-brand-primary/60 text-left space-y-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <p className="text-xs font-bold text-white">Face the Storm</p>
                  <p className="text-[11px] text-dark-muted">Step outside, breathing in the ozone-charged air.</p>
                </button>

                <button
                  onClick={() => {
                    handleEntityQuestion('I leaned back, closing my eyes and finally resting.');
                    handleNextPhase('astral_awakening');
                  }}
                  className="p-4 rounded-2xl bg-dark-elevated/70 border border-dark-border hover:border-brand-primary/60 text-left space-y-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <p className="text-xs font-bold text-white">Yield to Sleep</p>
                  <p className="text-[11px] text-dark-muted">Close your eyes, letting the world fade away.</p>
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                variant="primary"
                size="lg"
                onClick={() => handleNextPhase('astral_awakening')}
                className="w-full sm:w-auto font-serif tracking-wider"
              >
                Cross the Fateful Threshold <ChevronRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* PHASE 2: ASTRAL AWAKENING */}
        {session.currentPhase === 'astral_awakening' && (
          <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            <div className="p-6 rounded-3xl bg-dark-surface/90 border border-violet-500/30 shadow-2xl space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-violet-300 uppercase tracking-widest font-mono">
                <Compass className="w-4 h-4" /> The Nexus of Lost Stars • Dimension Zero
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-white leading-tight">
                Awakening Beyond Flesh and Gravity
              </h2>
              <div className="space-y-3 text-sm sm:text-base text-dark-text/90 leading-relaxed">
                <p>
                  There was no impact. No lingering agony. Only an instantaneous transition from heavy earthbound existence into boundless astral tranquility.
                </p>
                <p>
                  You look down. Your hands are woven from translucent starlight. Beneath your feet lies an endless pane of obsidian glass, reflecting celestial constellations that no telescope on Earth ever documented. In the distance, an enormous shifting silhouette observes you with ancient curiosity.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                <button
                  onClick={() => {
                    handleEntityQuestion('Where am I? What happened to my physical body?');
                    handleNextPhase('entity_communion');
                  }}
                  className="p-4 rounded-2xl bg-dark-elevated/70 border border-dark-border hover:border-violet-500/60 text-left space-y-1 transition-all"
                >
                  <p className="text-xs font-bold text-white">"Where am I?"</p>
                  <p className="text-[11px] text-dark-muted">Demand to understand your current reality.</p>
                </button>

                <button
                  onClick={() => {
                    handleEntityQuestion('Who are you? Are you a god, or something beyond?');
                    handleNextPhase('entity_communion');
                  }}
                  className="p-4 rounded-2xl bg-dark-elevated/70 border border-dark-border hover:border-violet-500/60 text-left space-y-1 transition-all"
                >
                  <p className="text-xs font-bold text-white">"Who is speaking to me?"</p>
                  <p className="text-[11px] text-dark-muted">Address the shifting presence directly.</p>
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <Button variant="ghost" onClick={() => handleNextPhase('first_life')}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={() => handleNextPhase('entity_communion')}
                className="font-serif tracking-wide"
              >
                Confront the Entity <ChevronRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* PHASE 3: THE ARBITER & ENTITY COMMUNION */}
        {session.currentPhase === 'entity_communion' && (
          <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            {/* Entity Presence Header & Personality Switcher */}
            <div className="p-4 rounded-2xl bg-dark-surface/90 border border-dark-border flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-amber-400 p-0.5 shadow-lg">
                  <div className="w-full h-full bg-[#080511] rounded-[14px] flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-amber-300" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-serif">
                    {ENTITY_PERSONALITY_PROFILES[session.entityPersonality].name}
                  </h3>
                  <p className="text-[11px] text-dark-muted font-mono">
                    {ENTITY_PERSONALITY_PROFILES[session.entityPersonality].epithet}
                  </p>
                </div>
              </div>

              {/* Personality Pills */}
              <div className="flex items-center gap-1 text-[10px] font-mono">
                <span className="text-dark-muted mr-1 hidden sm:inline">Attitude:</span>
                {(['mysterious', 'formal', 'witty', 'divine'] as EntityPersonality[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePersonalityChange(p)}
                    className={`px-2.5 py-1 rounded-lg border uppercase transition-all ${
                      session.entityPersonality === p
                        ? 'bg-amber-400/20 text-amber-300 border-amber-400/50'
                        : 'text-dark-muted border-dark-border hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Dialogue Feed */}
            <div className="p-4 sm:p-6 rounded-3xl bg-dark-surface/95 border border-dark-border max-h-[380px] overflow-y-auto space-y-4 shadow-inner">
              {session.dialogueHistory.map((item) => {
                if (item.speaker === 'narrator') {
                  return (
                    <div key={item.id} className="text-center py-1">
                      <span className="text-[11px] font-mono text-dark-muted bg-dark-bg/60 px-3 py-1 rounded-full border border-dark-border/40">
                        {item.text}
                      </span>
                    </div>
                  );
                }

                const isEntity = item.speaker === 'entity';
                return (
                  <div
                    key={item.id}
                    className={`flex flex-col ${isEntity ? 'items-start' : 'items-end'}`}
                  >
                    <span className="text-[10px] font-mono text-dark-muted px-1 mb-1">
                      {isEntity
                        ? ENTITY_PERSONALITY_PROFILES[session.entityPersonality].name
                        : session.soulSculpt.name || 'Hero'}
                    </span>
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isEntity
                          ? 'bg-violet-950/40 border border-violet-500/30 text-white rounded-tl-sm'
                          : 'bg-brand-primary text-white font-medium rounded-tr-sm shadow-md'
                      }`}
                    >
                      {item.text}
                    </div>
                  </div>
                );
              })}
              <div ref={dialogueEndRef} />
            </div>

            {/* Quick Dialogue Options & Custom Input */}
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {[
                  'Where am I?',
                  'Am I dead?',
                  'Who are you?',
                  'Can I return home?',
                  'What worlds exist?',
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => handleEntityQuestion(q)}
                    className="px-3 py-1.5 rounded-xl bg-dark-elevated text-xs text-dark-text border border-dark-border hover:border-brand-primary/50 hover:text-white transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Free-text Player Action / Question */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleEntityQuestion(customInput);
                  }}
                  placeholder="Ask the entity anything or state your resolve..."
                  className="flex-1 bg-dark-surface border border-dark-border rounded-xl px-4 py-2.5 text-xs text-white placeholder-dark-muted focus:outline-none focus:border-brand-primary"
                />
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleEntityQuestion(customInput)}
                  disabled={!customInput.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button variant="ghost" onClick={() => handleNextPhase('astral_awakening')}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={() => handleNextPhase('soul_sculpting')}
                className="font-serif tracking-wide"
              >
                Accept Rebirth & Sculpt Soul <ChevronRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* PHASE 4: SOUL SCULPTING */}
        {session.currentPhase === 'soul_sculpting' && (
          <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            {/* Tab Navigation */}
            <div className="flex items-center gap-2 border-b border-dark-border/60 pb-2 overflow-x-auto">
              {[
                { id: 'identity', label: '1. Identity', icon: User },
                { id: 'race', label: '2. Race & Species', icon: Shield },
                { id: 'class', label: '3. Class & Role', icon: Zap },
                { id: 'elements', label: '4. Affinities', icon: Flame },
                { id: 'scenario', label: '5. Scenario', icon: Compass },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = sculptTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSculptTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      isActive
                        ? 'bg-brand-primary text-white shadow-md'
                        : 'text-dark-muted hover:text-white hover:bg-dark-elevated'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: IDENTITY */}
            {sculptTab === 'identity' && (
              <div className="p-6 rounded-3xl bg-dark-surface/90 border border-dark-border space-y-4">
                <h3 className="text-lg font-bold text-white font-serif">Vessel Nomenclature & Soul Anchor</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-dark-muted">True Name</label>
                    <input
                      type="text"
                      value={session.soulSculpt.name}
                      onChange={(e) => updateSoulSculpt(session, { name: e.target.value })}
                      className="w-full bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-dark-muted">Soul Title / Epithet</label>
                    <input
                      type="text"
                      value={session.soulSculpt.title}
                      onChange={(e) => updateSoulSculpt(session, { title: e.target.value })}
                      className="w-full bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-dark-muted">Apparent Age</label>
                    <input
                      type="text"
                      value={session.soulSculpt.age}
                      onChange={(e) => updateSoulSculpt(session, { age: e.target.value })}
                      className="w-full bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-dark-muted">Gender Expression</label>
                    <select
                      value={session.soulSculpt.gender}
                      onChange={(e) => updateSoulSculpt(session, { gender: e.target.value })}
                      className="w-full bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-primary"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-Binary">Non-Binary</option>
                      <option value="Any">Any / Fluid</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: RACE & SPECIES */}
            {sculptTab === 'race' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                {ISEKAI_RACES.map((race) => {
                  const isSelected = session.soulSculpt.raceId === race.id;
                  return (
                    <div
                      key={race.id}
                      onClick={() => {
                        const updated = updateSoulSculpt(session, { raceId: race.id });
                        setSession(updated);
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-violet-950/40 border-violet-500 shadow-md shadow-violet-500/20 ring-1 ring-violet-500'
                          : 'bg-dark-surface border-dark-border hover:border-dark-border/80'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-1">
                        <h4 className="text-sm font-bold text-white font-serif">{race.name}</h4>
                        <span className="text-[10px] font-mono text-dark-muted uppercase">{race.lifespan}</span>
                      </div>
                      <p className="text-[11px] text-dark-muted leading-relaxed pb-2">{race.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {race.innateTraits.map((t) => (
                          <span key={t} className="text-[9px] px-2 py-0.5 rounded bg-dark-bg text-indigo-300 border border-indigo-500/20">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 3: CLASS & DISCIPLINE */}
            {sculptTab === 'class' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                {ISEKAI_CLASSES.map((cls) => {
                  const isSelected = session.soulSculpt.classId === cls.id;
                  return (
                    <div
                      key={cls.id}
                      onClick={() => {
                        const updated = updateSoulSculpt(session, { classId: cls.id });
                        setSession(updated);
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-amber-950/40 border-amber-500 shadow-md shadow-amber-500/20 ring-1 ring-amber-500'
                          : 'bg-dark-surface border-dark-border hover:border-dark-border/80'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-1">
                        <h4 className="text-sm font-bold text-white font-serif">{cls.name}</h4>
                        <span className="text-[10px] font-mono text-amber-400 uppercase">{cls.role}</span>
                      </div>
                      <p className="text-[11px] text-dark-muted leading-relaxed pb-2">{cls.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {cls.signatureAbilities.map((ab) => (
                          <span key={ab} className="text-[9px] px-2 py-0.5 rounded bg-dark-bg text-amber-200 border border-amber-500/20">
                            {ab}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 4: ELEMENTAL AFFINITIES */}
            {sculptTab === 'elements' && (
              <div className="space-y-4">
                <p className="text-xs text-dark-muted">
                  Select up to 3 elemental frequencies your soul will naturally resonate with:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {ISEKAI_ELEMENTS.map((elem) => {
                    const isSelected = session.soulSculpt.elementalAffinities.includes(elem.id);
                    return (
                      <div
                        key={elem.id}
                        onClick={() => handleToggleElement(elem.id)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-indigo-950/50 border-brand-primary shadow-lg ring-1 ring-brand-primary'
                            : 'bg-dark-surface border-dark-border hover:border-brand-primary/40'
                        }`}
                      >
                        <div className="flex items-center justify-between pb-1">
                          <span className="text-xs font-bold" style={{ color: elem.color }}>
                            {elem.name}
                          </span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-brand-glow" />}
                        </div>
                        <p className="text-[11px] text-dark-muted leading-relaxed">{elem.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 5: STARTING SCENARIO */}
            {sculptTab === 'scenario' && (
              <div className="space-y-3">
                {ISEKAI_SCENARIOS.map((sc) => {
                  const isSelected = session.soulSculpt.startingScenarioId === sc.id;
                  return (
                    <div
                      key={sc.id}
                      onClick={() => {
                        const updated = updateSoulSculpt(session, { startingScenarioId: sc.id });
                        setSession(updated);
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-emerald-950/40 border-emerald-500 shadow-md ring-1 ring-emerald-500'
                          : 'bg-dark-surface border-dark-border hover:border-dark-border/80'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-1">
                        <h4 className="text-sm font-bold text-white font-serif">{sc.title}</h4>
                        <span className="text-[10px] text-emerald-400 font-mono">{sc.tagline}</span>
                      </div>
                      <p className="text-xs text-dark-text/90 leading-relaxed pb-2">{sc.description}</p>
                      <p className="text-[10px] text-emerald-300 font-mono">Boon: {sc.startingBonusDescription}</p>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <Button variant="ghost" onClick={() => handleNextPhase('entity_communion')}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={() => handleNextPhase('gateway_selection')}
                className="font-serif tracking-wide"
              >
                Proceed to Multiverse Gateway <ChevronRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* PHASE 5: THE MULTIVERSE GATEWAY */}
        {session.currentPhase === 'gateway_selection' && (
          <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
            <div className="text-center space-y-1">
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-white">
                The Gateway of Infinite Realities
              </h2>
              <p className="text-xs sm:text-sm text-dark-muted">
                The Arbiter parts the veil, revealing three living universes awaiting your entry:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {WORLD_CATALOG.map((world) => {
                const isSelected = session.selectedWorldId === world.id;
                return (
                  <div
                    key={world.id}
                    onClick={() => {
                      const updated = {
                        ...session,
                        selectedWorldId: world.id,
                      };
                      setSession(updated);
                    }}
                    className={`p-5 rounded-3xl border flex flex-col justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-gradient-to-b from-brand-primary/20 via-dark-surface to-dark-surface border-brand-primary shadow-xl ring-2 ring-brand-primary'
                        : 'bg-dark-surface border-dark-border hover:border-dark-border/80'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-amber-300 uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {world.primaryGenreId}
                        </span>
                        {isSelected && <Badge variant="primary">Target Realm</Badge>}
                      </div>
                      <h3 className="text-lg font-bold text-white font-serif">{world.name}</h3>
                      <p className="text-xs text-dark-muted leading-relaxed">{world.synopsis}</p>
                    </div>

                    <div className="pt-4 border-t border-dark-border/40 mt-4 space-y-1 text-[11px] text-dark-muted font-mono">
                      <div>Locations: {world.locations.length}</div>
                      <div>Magic: {world.magicSystem.name}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button variant="ghost" onClick={() => handleNextPhase('soul_sculpting')}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={() => handleNextPhase('final_departure')}
                className="font-serif tracking-wide"
              >
                Approach the Departure Portal <ChevronRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* PHASE 6: FINAL DEPARTURE */}
        {session.currentPhase === 'final_departure' && (
          <div className="space-y-6 text-center animate-[fadeIn_0.5s_ease-out]">
            <div className="p-8 rounded-3xl bg-dark-surface/90 border border-violet-500/30 max-w-xl mx-auto space-y-6 shadow-2xl">
              <div className="inline-flex relative justify-center">
                <BrandEmblem size="xl" variant="logo" showGlow priority />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-serif font-black text-white">
                  The Veil Opens
                </h2>
                <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed font-sans">
                  "{ENTITY_PERSONALITY_PROFILES[session.entityPersonality].name} smiles as the rings of fate begin to rotate. Your soul signature is fully woven into the fabric of the multiverse."
                </p>
              </div>

              {/* Summary of Chosen Destiny */}
              <div className="p-4 rounded-2xl bg-dark-bg/80 border border-dark-border text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-dark-muted font-mono">Protagonist:</span>
                  <span className="font-bold text-white">{session.soulSculpt.name} ({session.soulSculpt.title})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-muted font-mono">Race / Class:</span>
                  <span className="font-bold text-indigo-300">
                    {ISEKAI_RACES.find((r) => r.id === session.soulSculpt.raceId)?.name} •{' '}
                    {ISEKAI_CLASSES.find((c) => c.id === session.soulSculpt.classId)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-muted font-mono">Destination:</span>
                  <span className="font-bold text-amber-300">
                    {WORLD_CATALOG.find((w) => w.id === session.selectedWorldId)?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-muted font-mono">Resonances:</span>
                  <span className="font-bold text-emerald-300">
                    {session.soulSculpt.elementalAffinities.join(', ')}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleFinalDeparture}
                  disabled={isGenerating}
                  className="w-full py-4 text-base font-serif font-bold tracking-wider shadow-xl shadow-brand-primary/30"
                >
                  <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                  Transmigrate into the Multiverse
                </Button>
              </div>
            </div>

            <div>
              <Button variant="ghost" onClick={() => handleNextPhase('gateway_selection')}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Adjust Selections
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
