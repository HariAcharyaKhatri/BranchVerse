import React, { useState, useEffect } from 'react';
import { HeroProfile } from '../types/character';
import { WorldDefinition } from '../types/world';
import { StorySettings, SupportedLanguage, LANGUAGE_LABELS } from '../types/story';
import { WORLD_CATALOG } from '../catalogs/worlds';
import { GENRE_CATALOG } from '../catalogs/genres';
import { storyRepository } from '../lib/storage/storyRepository';
import { completeHeroProfile } from '../features/story/naturalPromptParser';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  User,
  Globe,
  Compass,
  MessageSquare,
  Shield,
  Zap,
  Dices,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export interface RoleplayScenario {
  id: string;
  title: string;
  worldId: string;
  genre: string;
  synopsis: string;
  suggestedHeroName: string;
  suggestedArchetype: string;
  openingPrompt: string;
}

export const PRESET_SCENARIOS: RoleplayScenario[] = [
  {
    id: 'forbidden_arcana',
    title: 'The Forbidden Arcana',
    worldId: 'aethelgard',
    genre: 'High Fantasy',
    synopsis: 'An apprentice discovers a banned grimoire in the grand library as inquisitor footsteps echo nearby.',
    suggestedHeroName: 'Hari Khatri',
    suggestedArchetype: 'Arcane Scholar',
    openingPrompt: 'Late at night in the High Silver Spire library, an ancient grimoire bound in black starlight pulses with forbidden magic in your hands. Heavy inquisitor armor clinks outside the chamber door.'
  },
  {
    id: 'neon_syndicate',
    title: 'Neon Syndicate Infiltration',
    worldId: 'neokyoto',
    genre: 'Cyberpunk',
    synopsis: 'A stealth cyber-runner trapped on a rain-slick rooftop with a stolen corporate data-slate.',
    suggestedHeroName: 'Hari Khatri',
    suggestedArchetype: 'Cyber Runner',
    openingPrompt: 'Neon rain slicks your synthetic trench coat on the 88th floor of Arakawa Tower. Your neural cyber-deck holds encrypted corporate black-ops files, and security gunships are converging.'
  },
  {
    id: 'astral_wayfarer',
    title: 'Astral Wayfarer Ruin',
    worldId: 'aethelgard',
    genre: 'Sci-Fi / Space Fantasy',
    synopsis: 'Stranded on an uncharted celestial artifact orbiting a dying star with an enigmatic AI hologram.',
    suggestedHeroName: 'Hari Khatri',
    suggestedArchetype: 'Star Explorer',
    openingPrompt: 'Your ship emergency-docked on a dormant celestial ring orbiting a violet nebula. An ancient holographic guide flickers awake before you, speaking in a long-dead dialect.'
  },
  {
    id: 'valen_garrison',
    title: 'Siege of Valen’s Crossing',
    worldId: 'aethelgard',
    genre: 'Dark Fantasy',
    synopsis: 'A wandering mercenary defending a riverside haven as abyssal shadow-beasts emerge at dusk.',
    suggestedHeroName: 'Hari Khatri',
    suggestedArchetype: 'Rune Blade Mercenary',
    openingPrompt: 'The wooden palisades of Valen’s Crossing shake as midnight falls. Terrified villagers look to you for commands while glowing red eyes peer from the tree line.'
  }
];

interface RoleplaySetupPageProps {
  onBack: () => void;
  onLaunchRoleplay: (params: {
    title: string;
    settings: StorySettings;
    generationMode: 'ai';
    overrideHero: HeroProfile;
    overrideWorld: WorldDefinition;
    overrideGenres: string[];
    userPromptDescription?: string;
  }) => void;
  isGenerating?: boolean;
  launchError?: { title: string; message: string; retryable: boolean } | null;
  onRetry?: () => void;
  onDismissError?: () => void;
}

export const RoleplaySetupPage: React.FC<RoleplaySetupPageProps> = ({
  onBack,
  onLaunchRoleplay,
  isGenerating = false,
  launchError = null,
  onRetry,
  onDismissError
}) => {
  const [tab, setTab] = useState<'scenario' | 'character' | 'world' | 'settings'>('scenario');

  // Scenario Selection
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('forbidden_arcana');
  const [isCustomScenario, setIsCustomScenario] = useState<boolean>(false);
  const [customScenarioText, setCustomScenarioText] = useState<string>('');

  // Character Mode
  const [characterMode, setCharacterMode] = useState<'new' | 'saved'>('new');
  const [savedHeroes, setSavedHeroes] = useState<HeroProfile[]>([]);
  const [selectedSavedHeroIndex, setSelectedSavedHeroIndex] = useState<number>(0);

  // New Character fields
  const [heroName, setHeroName] = useState<string>('Hari Khatri');
  const [heroAge, setHeroAge] = useState<string>('23');
  const [heroRace, setHeroRace] = useState<string>('Human');
  const [heroArchetype, setHeroArchetype] = useState<string>('Spellblade & Investigator');
  const [heroPersonality, setHeroPersonality] = useState<string>('Calm under pressure, sharp-witted, skeptical of authority');
  const [heroPowers, setHeroPowers] = useState<string>('Starlight Blink, Runic Shielding, Spell Disruption');
  const [heroBackstory, setHeroBackstory] = useState<string>('Ex-investigator from the borderlands who witnessed a secret the Council wanted buried.');
  const [startingGear, setStartingGear] = useState<string>('Silver-etched shortblade, encrypted pocket journal, mana restorative vial');

  // World selection
  const [selectedWorldId, setSelectedWorldId] = useState<string>('aethelgard');
  const [isCustomWorld, setIsCustomWorld] = useState<boolean>(false);
  const [customWorldName, setCustomWorldName] = useState<string>('Aethelgard High Realm');
  const [customWorldSynopsis, setCustomWorldSynopsis] = useState<string>(
    'Floating crystal citadels, whispering elderwoods, and ancient magical leylines.'
  );

  // RPG Preferences
  const [narrativeLength, setNarrativeLength] = useState<'concise' | 'balanced' | 'detailed'>('balanced');
  const [tone, setTone] = useState<StorySettings['tone']>('Dark & Gritty');
  const [difficulty, setDifficulty] = useState<StorySettings['difficulty']>('Adventurer (Standard)');
  const [storyLanguage, setStoryLanguage] = useState<SupportedLanguage>('en');

  // Load existing characters from saved stories
  useEffect(() => {
    const fetchSavedCharacters = async () => {
      try {
        const stories = await storyRepository.listStories();
        const heroesMap = new Map<string, HeroProfile>();
        stories.forEach(s => {
          if (s.hero && s.hero.name) {
            heroesMap.set(s.hero.name.toLowerCase(), s.hero);
          }
        });
        const heroes = Array.from(heroesMap.values());
        if (heroes.length > 0) {
          setSavedHeroes(heroes);
        }
      } catch (err) {
        console.warn('Failed to load saved characters:', err);
      }
    };
    fetchSavedCharacters();
  }, []);

  const activeScenario = PRESET_SCENARIOS.find(s => s.id === selectedScenarioId) || PRESET_SCENARIOS[0];

  const handleApplyScenario = (sc: RoleplayScenario) => {
    setSelectedScenarioId(sc.id);
    setIsCustomScenario(false);
    setSelectedWorldId(sc.worldId);
    setHeroArchetype(sc.suggestedArchetype);
    if (sc.suggestedHeroName) {
      setHeroName(sc.suggestedHeroName);
    }
  };

  const handleRandomizeHero = () => {
    const randomized = completeHeroProfile({ name: 'Hari Khatri' });
    setHeroName(randomized.name);
    setHeroRace(randomized.race);
    setHeroPersonality(randomized.personality.join(', '));
    setHeroBackstory(randomized.backstory);
    if (randomized.skills && randomized.skills.length > 0) {
      setHeroPowers(randomized.skills.join(', '));
    }
  };

  const handleLaunch = () => {
    // 1. Resolve character
    let finalHero: HeroProfile;
    if (characterMode === 'saved' && savedHeroes[selectedSavedHeroIndex]) {
      finalHero = savedHeroes[selectedSavedHeroIndex];
    } else {
      const skillsArray = heroPowers.split(',').map(s => s.trim()).filter(Boolean);
      finalHero = completeHeroProfile({
        name: heroName.trim() || 'Hari Khatri',
        age: heroAge.trim() || '20',
        race: heroRace.trim() || 'Human',
        origin: heroArchetype.trim() || 'Adventurer',
        backstory: `[Age: ${heroAge}] ${heroBackstory.trim()} Starting gear: ${startingGear}.`,
        personality: heroPersonality.split(',').map(s => s.trim()).filter(Boolean),
        skills: skillsArray.length > 0 ? skillsArray : ['Blade Mastery', 'Aura Sense']
      });
    }

    // 2. Resolve world
    let finalWorld: WorldDefinition;
    if (isCustomWorld && customWorldName.trim()) {
      finalWorld = {
        id: `world_${Date.now()}`,
        name: customWorldName.trim(),
        primaryGenreId: 'fantasy',
        synopsis: customWorldSynopsis.trim(),
        locations: [{ id: 'loc_1', name: 'Starting Ground', type: 'village', description: customWorldSynopsis, dangerLevel: 'Moderate' }],
        factions: [],
        magicSystem: { id: 'm_1', name: 'Living Leylines', source: 'Natural Flow', rules: ['Actions have immediate consequences'], limitations: [] },
        races: [finalHero.race, 'Human'],
        classes: [heroArchetype],
        powerSystems: ['Roleplay Freeform'],
        commonWeapons: ['Steel Blade'],
        commonAbilities: ['Action'],
        threats: ['Rival factions', 'Unknown entities']
      };
    } else {
      finalWorld = WORLD_CATALOG.find(w => w.id === selectedWorldId) || WORLD_CATALOG[0];
    }

    // 3. Resolve genre
    const genre = GENRE_CATALOG.find(g => g.id === finalWorld.primaryGenreId) || GENRE_CATALOG[0];

    // 4. Construct Opening Prompt
    const startingSituation = isCustomScenario
      ? customScenarioText.trim() || 'You awaken at the crossroads of destiny as whispers rise.'
      : activeScenario.openingPrompt;

    const fullDescription = `ROLE-PLAY MODE. Setting: ${finalWorld.name} (${genre.name}). Hero: ${finalHero.name}, Archetype: ${heroArchetype}. Scenario: ${startingSituation}`;

    const title = isCustomScenario
      ? `${finalHero.name}’s Role-Play in ${finalWorld.name}`
      : `${activeScenario.title}: ${finalHero.name}`;

    const settings: StorySettings = {
      tone,
      pacing: 'Balanced Narrative',
      difficulty,
      storyLanguage,
      narrativeLength,
      mode: 'roleplay',
      timePeriod: 'Living Era',
      storyStyle: 'Interactive Role-Play RPG',
      mainObjective: isCustomScenario ? 'Survive and define your own path' : activeScenario.synopsis,
      userPromptDescription: fullDescription
    };

    onLaunchRoleplay({
      title,
      settings,
      generationMode: 'ai',
      overrideHero: finalHero,
      overrideWorld: finalWorld,
      overrideGenres: [genre.name],
      userPromptDescription: fullDescription
    });
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto p-4 sm:p-6 overflow-y-auto overscroll-contain safe-area-bottom">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-dark-border/60">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-dark-surface border border-dark-border text-dark-muted hover:text-white hover:border-brand-primary transition-all"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-widest">
                Mode 2 • Role-Play
              </span>
              <span className="text-xs text-dark-muted hidden sm:inline">• Living World Simulator</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Enter Living Role-Play
            </h1>
          </div>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleLaunch}
          disabled={isGenerating}
          iconRight={isGenerating ? <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
          className="shadow-lg shadow-brand-primary/25"
        >
          {isGenerating ? 'Summoning World...' : 'Begin Role-Play'}
        </Button>
      </div>

      {/* Error banner if previous launch failed */}
      {launchError && (
        <div className="my-3 p-4 rounded-xl bg-red-950/90 border border-red-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-red-200 shadow-xl animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold text-white text-sm">{launchError.title}</p>
              <p className="text-red-200/90 leading-relaxed">{launchError.message}</p>
              <p className="text-[11px] text-amber-300/80">Your character and scenario selections are preserved.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            {launchError.retryable && onRetry && (
              <Button
                variant="primary"
                size="sm"
                onClick={onRetry}
                disabled={isGenerating}
                className="gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? 'Summoning...' : 'Retry'}
              </Button>
            )}
            {onDismissError && (
              <button
                onClick={onDismissError}
                className="px-2 py-1 rounded bg-red-900/50 hover:bg-red-800 text-red-200 text-xs font-medium"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 my-4 border-b border-dark-border/60 pb-2 overflow-x-auto">
        {[
          { id: 'scenario', label: '1. Scenario', icon: Compass },
          { id: 'character', label: '2. Character Identity', icon: User },
          { id: 'world', label: '3. World & Setting', icon: Globe },
          { id: 'settings', label: '4. RPG Rules', icon: Shield }
        ].map(item => {
          const Icon = item.icon;
          const isActive = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                isActive
                  ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
                  : 'bg-dark-surface text-dark-muted hover:text-white border border-dark-border'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: SCENARIO SELECTION */}
      {tab === 'scenario' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-white">Choose Your Starting Scenario</h2>
            <p className="text-xs text-dark-muted">
              Select an inciting incident where your choices determine life, death, factions, and destiny.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PRESET_SCENARIOS.map(sc => {
              const isSelected = !isCustomScenario && selectedScenarioId === sc.id;
              return (
                <div
                  key={sc.id}
                  onClick={() => handleApplyScenario(sc)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-brand-primary/10 border-brand-primary shadow-lg ring-1 ring-brand-primary/50'
                      : 'bg-dark-surface border-dark-border hover:border-dark-border/90 hover:bg-dark-elevated'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-accent px-2 py-0.5 rounded bg-dark-bg border border-dark-border">
                      {sc.genre}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-glow" />}
                  </div>
                  <h3 className="font-bold text-sm text-white">{sc.title}</h3>
                  <p className="text-xs text-dark-muted mt-1 leading-relaxed">{sc.synopsis}</p>
                  <div className="mt-3 pt-2 border-t border-dark-border/40 flex items-center justify-between text-[11px] text-indigo-300">
                    <span>Archetype: <strong>{sc.suggestedArchetype}</strong></span>
                    <span className="text-dark-muted text-[10px]">Tap to select</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom Scenario Toggle */}
          <div className="p-4 rounded-2xl bg-dark-surface border border-dark-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-brand-glow" />
                <span className="font-bold text-sm text-white">Or Describe Your Own Starting Scenario</span>
              </div>
              <button
                onClick={() => setIsCustomScenario(!isCustomScenario)}
                className={`text-xs px-3 py-1 rounded-lg font-semibold transition-colors ${
                  isCustomScenario
                    ? 'bg-brand-primary text-white'
                    : 'bg-dark-elevated text-dark-muted hover:text-white'
                }`}
              >
                {isCustomScenario ? 'Active' : 'Use Custom'}
              </button>
            </div>

            {isCustomScenario && (
              <div className="space-y-2 pt-2 border-t border-dark-border/50">
                <textarea
                  value={customScenarioText}
                  onChange={e => setCustomScenarioText(e.target.value)}
                  placeholder="Example: I am an exiled paladin guarding a forgotten shrine in the snow. An injured assassin collapses at my doorstep bearing an imperial seal..."
                  rows={3}
                  className="w-full bg-dark-bg border border-dark-border rounded-xl p-3 text-xs text-white placeholder:text-dark-muted/60 focus:outline-none focus:border-brand-primary"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="amber"
              onClick={() => setTab('character')}
              iconRight={<ArrowRight className="w-4 h-4" />}
            >
              Continue to Character Identity
            </Button>
          </div>
        </div>
      )}

      {/* TAB 2: CHARACTER IDENTITY */}
      {tab === 'character' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-white">Character Identity & Capabilities</h2>
              <p className="text-xs text-dark-muted">Define who you are in this living world.</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleRandomizeHero}
                className="px-2.5 py-1.5 rounded-xl bg-dark-surface border border-dark-border text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
              >
                <Dices className="w-3.5 h-3.5" /> Randomize
              </button>
            </div>
          </div>

          {/* Mode Switcher: New Character vs Saved Character */}
          {savedHeroes.length > 0 && (
            <div className="flex gap-2 p-1 rounded-xl bg-dark-surface border border-dark-border w-fit text-xs font-semibold">
              <button
                onClick={() => setCharacterMode('new')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  characterMode === 'new' ? 'bg-brand-primary text-white' : 'text-dark-muted hover:text-white'
                }`}
              >
                Create New Character
              </button>
              <button
                onClick={() => setCharacterMode('saved')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  characterMode === 'saved' ? 'bg-brand-primary text-white' : 'text-dark-muted hover:text-white'
                }`}
              >
                Use Saved Character ({savedHeroes.length})
              </button>
            </div>
          )}

          {characterMode === 'saved' && savedHeroes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {savedHeroes.map((hero, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedSavedHeroIndex(idx)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    selectedSavedHeroIndex === idx
                      ? 'bg-brand-primary/10 border-brand-primary shadow-md'
                      : 'bg-dark-surface border-dark-border hover:bg-dark-elevated'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">{hero.name}</span>
                    <Badge variant="primary" size="sm">{hero.race}</Badge>
                  </div>
                  <p className="text-xs text-indigo-300 mt-1">{hero.origin}</p>
                  <p className="text-[11px] text-dark-muted line-clamp-2 mt-1">{hero.personality}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-dark-muted">Name</label>
                  <input
                    type="text"
                    value={heroName}
                    onChange={e => setHeroName(e.target.value)}
                    className="w-full bg-dark-surface border border-dark-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-dark-muted">Age</label>
                  <input
                    type="text"
                    value={heroAge}
                    onChange={e => setHeroAge(e.target.value)}
                    className="w-full bg-dark-surface border border-dark-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-dark-muted">Race / Species</label>
                  <input
                    type="text"
                    value={heroRace}
                    onChange={e => setHeroRace(e.target.value)}
                    className="w-full bg-dark-surface border border-dark-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-dark-muted">Archetype / Class</label>
                  <input
                    type="text"
                    value={heroArchetype}
                    onChange={e => setHeroArchetype(e.target.value)}
                    placeholder="e.g. Rogue Netrunner, Arcane Blade, Cyber Medic"
                    className="w-full bg-dark-surface border border-dark-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-dark-muted">Personality & Demeanor</label>
                  <input
                    type="text"
                    value={heroPersonality}
                    onChange={e => setHeroPersonality(e.target.value)}
                    placeholder="e.g. Witty, pragmatic, relentless"
                    className="w-full bg-dark-surface border border-dark-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-dark-muted flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> Powers, Spells & Signature Skills (comma-separated)
                </label>
                <input
                  type="text"
                  value={heroPowers}
                  onChange={e => setHeroPowers(e.target.value)}
                  placeholder="Starlight Blink, Neural Overload, Shadow Step"
                  className="w-full bg-dark-surface border border-dark-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-dark-muted flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-400" /> Starting Gear & Inventory
                </label>
                <input
                  type="text"
                  value={startingGear}
                  onChange={e => setStartingGear(e.target.value)}
                  placeholder="Silver dagger, leather trenchcoat, mana potion"
                  className="w-full bg-dark-surface border border-dark-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-dark-muted">Backstory & Secret</label>
                <textarea
                  value={heroBackstory}
                  onChange={e => setHeroBackstory(e.target.value)}
                  rows={2}
                  className="w-full bg-dark-surface border border-dark-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-primary"
                />
              </div>
            </div>
          )}

          <div className="flex justify-between pt-2">
            <Button variant="ghost" onClick={() => setTab('scenario')} iconLeft={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
            <Button variant="amber" onClick={() => setTab('world')} iconRight={<ArrowRight className="w-4 h-4" />}>
              Continue to World & Setting
            </Button>
          </div>
        </div>
      )}

      {/* TAB 3: WORLD & SETTING */}
      {tab === 'world' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-white">Select Your Living World</h2>
            <p className="text-xs text-dark-muted">
              Choose an established realm or craft a custom world.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {WORLD_CATALOG.map(w => {
              const isSelected = !isCustomWorld && selectedWorldId === w.id;
              return (
                <div
                  key={w.id}
                  onClick={() => {
                    setSelectedWorldId(w.id);
                    setIsCustomWorld(false);
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-brand-primary/10 border-brand-primary shadow-lg ring-1 ring-brand-primary/50'
                      : 'bg-dark-surface border-dark-border hover:bg-dark-elevated'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-sm text-white">{w.name}</h3>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-glow" />}
                  </div>
                  <p className="text-xs text-dark-muted leading-relaxed">{w.synopsis}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {w.locations.slice(0, 2).map(l => (
                      <span key={l.id} className="text-[10px] bg-dark-bg px-2 py-0.5 rounded text-indigo-300">
                        {l.name}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom World Option */}
          <div className="p-4 rounded-2xl bg-dark-surface border border-dark-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white">Or Forge a Custom World</span>
              <button
                onClick={() => setIsCustomWorld(!isCustomWorld)}
                className={`text-xs px-3 py-1 rounded-lg font-semibold transition-colors ${
                  isCustomWorld ? 'bg-brand-primary text-white' : 'bg-dark-elevated text-dark-muted hover:text-white'
                }`}
              >
                {isCustomWorld ? 'Active' : 'Enable Custom'}
              </button>
            </div>

            {isCustomWorld && (
              <div className="space-y-3 pt-2 border-t border-dark-border/40">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-dark-muted">World Name</label>
                  <input
                    type="text"
                    value={customWorldName}
                    onChange={e => setCustomWorldName(e.target.value)}
                    className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-dark-muted">World Lore & Atmosphere</label>
                  <textarea
                    value={customWorldSynopsis}
                    onChange={e => setCustomWorldSynopsis(e.target.value)}
                    rows={2}
                    className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="ghost" onClick={() => setTab('character')} iconLeft={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
            <Button variant="amber" onClick={() => setTab('settings')} iconRight={<ArrowRight className="w-4 h-4" />}>
              Continue to RPG Rules
            </Button>
          </div>
        </div>
      )}

      {/* TAB 4: RPG RULES & LAUNCH */}
      {tab === 'settings' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-white">RPG Atmosphere & Narrative Controls</h2>
            <p className="text-xs text-dark-muted">
              Configure how Gemini generates role-play interactions, response lengths, and difficulty.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Narrative Length */}
            <div className="p-4 rounded-2xl bg-dark-surface border border-dark-border space-y-2">
              <label className="text-xs font-bold text-white flex items-center justify-between">
                <span>Narrative Response Length</span>
                <span className="text-[10px] text-brand-glow uppercase font-mono">{narrativeLength}</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['concise', 'balanced', 'detailed'] as const).map(len => (
                  <button
                    key={len}
                    onClick={() => setNarrativeLength(len)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-semibold capitalize border transition-all ${
                      narrativeLength === len
                        ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                        : 'bg-dark-elevated text-dark-muted border-dark-border hover:text-white'
                    }`}
                  >
                    {len}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-dark-muted">
                {narrativeLength === 'concise' && 'Fast 80-140 words. Great for rapid dialogue and tactical choices.'}
                {narrativeLength === 'balanced' && 'Optimal 120-200 words. Rich atmosphere and swift turn execution.'}
                {narrativeLength === 'detailed' && 'Deep 200-300 words. Deep novelistic descriptions.'}
              </p>
            </div>

            {/* Story Tone */}
            <div className="p-4 rounded-2xl bg-dark-surface border border-dark-border space-y-2">
              <label className="text-xs font-bold text-white">Tone & Atmosphere</label>
              <select
                value={tone}
                onChange={e => setTone(e.target.value as any)}
                className="w-full bg-dark-elevated border border-dark-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-primary"
              >
                <option value="Epic Fantasy">Epic Fantasy</option>
                <option value="Dark & Gritty">Dark & Gritty</option>
                <option value="Grimdark">Grimdark Realism</option>
                <option value="Anime Shonen">Anime Shonen High Energy</option>
                <option value="Cyberpunk Noir">Cyberpunk Noir</option>
                <option value="Horror & Dread">Horror & Cosmic Dread</option>
                <option value="Whimsical & Wonder">Whimsical & Wonder</option>
              </select>
            </div>

            {/* Difficulty */}
            <div className="p-4 rounded-2xl bg-dark-surface border border-dark-border space-y-2">
              <label className="text-xs font-bold text-white">Difficulty & Game Stakes</label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value as any)}
                className="w-full bg-dark-elevated border border-dark-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-primary"
              >
                <option value="Storyteller (Easy)">Storyteller (Easy - Safe)</option>
                <option value="Adventurer (Standard)">Adventurer (Standard - Balanced)</option>
                <option value="Hardcore (Unforgiving)">Hardcore (Unforgiving - Real Danger)</option>
              </select>
            </div>

            {/* Language */}
            <div className="p-4 rounded-2xl bg-dark-surface border border-dark-border space-y-2">
              <label className="text-xs font-bold text-white">Role-Play Language</label>
              <select
                value={storyLanguage}
                onChange={e => setStoryLanguage(e.target.value as SupportedLanguage)}
                className="w-full bg-dark-elevated border border-dark-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-primary"
              >
                {(Object.keys(LANGUAGE_LABELS) as SupportedLanguage[]).map(langKey => (
                  <option key={langKey} value={langKey}>
                    {LANGUAGE_LABELS[langKey].flag} {LANGUAGE_LABELS[langKey].native} ({LANGUAGE_LABELS[langKey].label})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Role-Play Summary Preview Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-tr from-brand-primary/10 via-dark-surface to-dark-surface border border-brand-primary/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-glow uppercase tracking-wider">Ready to Enter Living World</span>
              <Badge variant="primary" size="sm">Gemini 3.8 Flash</Badge>
            </div>
            <p className="text-sm font-bold text-white">
              {heroName} • {heroArchetype}
            </p>
            <p className="text-xs text-dark-muted">
              {isCustomScenario ? 'Custom Scenario' : activeScenario.title} in {isCustomWorld ? customWorldName : WORLD_CATALOG.find(w => w.id === selectedWorldId)?.name}
            </p>
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="ghost" onClick={() => setTab('world')} iconLeft={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={handleLaunch}
              disabled={isGenerating}
              iconRight={isGenerating ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
              className="shadow-xl shadow-brand-primary/30"
            >
              {isGenerating ? 'Weaving Role-Play Session...' : 'Enter Living World'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
