import React, { useState, useEffect } from 'react';
import { useOptionalAuth } from '../contexts/AuthContext';
import { HeroProfile } from '../types/character';
import { WorldDefinition } from '../types/world';
import { StorySettings, SupportedLanguage, LANGUAGE_LABELS } from '../types/story';
import { GENRE_CATALOG } from '../catalogs/genres';
import { WORLD_CATALOG } from '../catalogs/worlds';
import { parseStoryIdeaPrompt, completeHeroProfile } from '../features/story/naturalPromptParser';
import { preferencesService } from '../features/preferences/preferencesService';
import { presetService } from '../features/presets/presetService';
import { StoryPreset } from '../types/preset';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Wand2,
  Dices,
  BookOpen,
  Compass,
  User,
  Sliders,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Bookmark,
  Save
} from 'lucide-react';

interface CreateStoryWizardPageProps {
  onBack: () => void;
  onLaunchStory: (params: {
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

export const CreateStoryWizardPage: React.FC<CreateStoryWizardPageProps> = ({
  onBack,
  onLaunchStory,
  isGenerating = false,
  launchError = null,
  onRetry,
  onDismissError
}) => {
  const auth = useOptionalAuth();
  const user = auth?.user;
  const defaultDisplayName = user?.displayName?.trim() || 'Hari Khatri';

  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [promptDescription, setPromptDescription] = useState<string>('');
  const [title, setTitle] = useState<string>('Chronicle of the Arcane Prodigy');
  const [selectedGenre, setSelectedGenre] = useState<string>('High Fantasy');
  const [worldName, setWorldName] = useState<string>('Grand Academy of Arcana');
  const [timePeriod, setTimePeriod] = useState<string>('Era of Enchanted Towers');
  const [tone, setTone] = useState<StorySettings['tone']>('Anime Shonen');
  const [pacing, setPacing] = useState<StorySettings['pacing']>('Balanced Narrative');
  const [storyStyle, setStoryStyle] = useState<string>('Coming of Age Journey');

  // Protagonist State
  const [heroName, setHeroName] = useState<string>(defaultDisplayName);
  const [hasManuallyEditedName, setHasManuallyEditedName] = useState<boolean>(false);
  const [heroRace, setHeroRace] = useState<string>('Human');
  const [heroPersonality, setHeroPersonality] = useState<string>('Determined, Observant, Curious');
  const [heroAppearance, _setHeroAppearance] = useState<string>('Navy blue tunic with silver sigils, unruly dark hair');
  const [heroBackstory, setHeroBackstory] = useState<string>(
    'An aspiring student admitted into the elite academy, concealing an awakening dormant power.'
  );
  const [supportingCharacters, setSupportingCharacters] = useState<string>(
    'Elena (Brilliant Classmate & Rival), Master Balthazar (Alchemy Instructor)'
  );
  const [mainObjective, setMainObjective] = useState<string>(
    'Unlock the ancient grimoires and survive the trials of the High Council.'
  );

  // Automatically update hero name when user profile loads, unless the user has manually edited it
  useEffect(() => {
    if (user?.displayName?.trim() && !hasManuallyEditedName) {
      setHeroName(user.displayName.trim());
    }
  }, [user?.displayName, hasManuallyEditedName]);

  // Sliders & Game Settings
  const [romanceLevel, setRomanceLevel] = useState<'None' | 'Light' | 'Prominent'>('Light');
  const [actionLevel, setActionLevel] = useState<'Low' | 'Moderate' | 'High'>('Moderate');
  const [mysteryLevel, setMysteryLevel] = useState<'Low' | 'Moderate' | 'High'>('High');
  const [difficulty, setDifficulty] = useState<StorySettings['difficulty']>('Adventurer (Standard)');
  const [narrativeLength, setNarrativeLength] = useState<'concise' | 'balanced' | 'detailed'>('balanced');
  const [storyLanguage, setStoryLanguage] = useState<SupportedLanguage>(() => {
    return preferencesService.getStoryLanguage(user?.uid);
  });

  // Story Presets State
  const [presets, setPresets] = useState<StoryPreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [isSavingPreset, setIsSavingPreset] = useState<boolean>(false);
  const [newPresetName, setNewPresetName] = useState<string>('');
  const [presetSaveMessage, setPresetSaveMessage] = useState<string>('');

  useEffect(() => {
    presetService.listPresets(user?.uid).then(setPresets);
  }, [user?.uid]);

  const handleApplyPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const preset = presets.find((p) => p.id === presetId);
    if (!preset) return;

    if (preset.selectedGenre) setSelectedGenre(preset.selectedGenre);
    if (preset.tone) setTone(preset.tone);
    if (preset.pacing) setPacing(preset.pacing);
    if (preset.difficulty) setDifficulty(preset.difficulty as any);
    if (preset.narrativeLength) setNarrativeLength(preset.narrativeLength);
    if (preset.storyLanguage) {
      setStoryLanguage(preset.storyLanguage);
      preferencesService.setStoryLanguage(preset.storyLanguage, user?.uid);
    }
    if (preset.timePeriod) setTimePeriod(preset.timePeriod);
    if (preset.storyStyle) setStoryStyle(preset.storyStyle);
    if (preset.heroArchetype?.race) setHeroRace(preset.heroArchetype.race);
    if (preset.heroArchetype?.personality) setHeroPersonality(preset.heroArchetype.personality);
  };

  const handleSaveCurrentAsPreset = async () => {
    const nameToSave = newPresetName.trim() || `${selectedGenre} Custom Preset`;
    const saved = await presetService.savePreset(
      {
        name: nameToSave,
        selectedGenre,
        genres: [selectedGenre],
        tone,
        pacing: 'Balanced Narrative',
        difficulty,
        narrativeLength,
        storyLanguage,
        timePeriod,
        storyStyle,
        heroArchetype: {
          race: heroRace,
          personality: heroPersonality,
        },
      },
      undefined,
      user?.uid
    );
    const updated = await presetService.listPresets(user?.uid);
    setPresets(updated);
    setSelectedPresetId(saved.id);
    setPresetSaveMessage(`Saved as preset "${saved.name}"!`);
    setIsSavingPreset(false);
    setNewPresetName('');
    setTimeout(() => setPresetSaveMessage(''), 4000);
  };

  const handleSuggestTitle = () => {
    const hero = heroName.trim() || 'The Traveler';
    const world = worldName.trim() || 'The Realm';
    const suggestions = [
      `The Chronicles of ${hero}: Rise of ${world}`,
      `Echoes of ${world}: ${hero}'s Journey`,
      `${hero} and the Secret of ${world}`,
      `The ${selectedGenre} Saga: ${hero} in ${world}`,
      `Shadows over ${world}: A ${selectedGenre} Tale`,
    ];
    const picked = suggestions[Math.floor(Math.random() * suggestions.length)];
    setTitle(picked);
  };

  // Step 1 AI Prompt Converter
  const handleApplyAiSuggestion = (input?: string) => {
    const raw = input || promptDescription || 'I want to become a student in a magical academy where I slowly discover that I have forbidden powers.';
    const preferredName = hasManuallyEditedName ? heroName : (user?.displayName?.trim() || 'Hari Khatri');
    const parsed = parseStoryIdeaPrompt(raw, preferredName);

    setTitle(parsed.title);
    setSelectedGenre(parsed.genre);
    setWorldName(parsed.worldName);
    setTimePeriod(parsed.timePeriod);
    setTone(parsed.tone);
    setStoryStyle(parsed.style);
    if (!hasManuallyEditedName && user?.displayName?.trim()) {
      setHeroName(user.displayName.trim());
    } else if (parsed.heroName) {
      setHeroName(parsed.heroName);
    }
    setHeroRace(parsed.heroRace);
    setHeroPersonality(parsed.heroPersonality.join(', '));
    setHeroBackstory(parsed.heroBackstory);
    setSupportingCharacters(parsed.supportingCharacters.join(', '));
    setMainObjective(parsed.mainObjective);
    setRomanceLevel(parsed.romanceLevel);
    setActionLevel(parsed.actionLevel);
    setMysteryLevel(parsed.mysteryLevel);
  };

  const handleRandomize = () => {
    const samplePrompts = [
      'I want to become a student in a magical academy where I slowly discover that I have forbidden powers.',
      'A cyber-enhanced detective in a rainy neon metropolis tracking a rogue AI syndicate.',
      'A lone ranger at the edge of an ancient forest investigating celestial rifts.',
      'A wandering airship engineer hunting for a legendary floating citadel in a steampunk sky.',
      'A wasteland survivor searching for a lost seed vault to restore life to the barren earth.'
    ];
    const picked = samplePrompts[Math.floor(Math.random() * samplePrompts.length)];
    setPromptDescription(picked);
    handleApplyAiSuggestion(picked);
  };

  const handleFinalLaunch = () => {
    const matchedWorld: WorldDefinition = WORLD_CATALOG.find(w => w.name.toLowerCase() === worldName.toLowerCase()) || {
      id: `custom_world_${Date.now()}`,
      name: worldName,
      primaryGenreId: selectedGenre.toLowerCase().replace(/\s+/g, '_'),
      synopsis: `A dynamic realm situated in the ${timePeriod}.`,
      locations: [{ id: 'loc_init', name: 'Starting Ground', type: 'village', description: `A realm in the ${timePeriod}`, dangerLevel: 'Moderate' }],
      factions: [{ id: 'fac_1', name: 'The Sovereign Order', alignment: 'Lawful Neutral', description: 'Rules the central regions' }],
      magicSystem: { id: 'mag_1', name: 'World Weaving', source: 'Natural ley currents', rules: ['Actions yield consequences'], limitations: [] },
      races: [heroRace, 'Human'],
      classes: ['Adventurer', 'Scholar', 'Warrior'],
      powerSystems: ['Natural Resonance'],
      commonWeapons: ['Steel Blade', 'Focus Wand'],
      commonAbilities: ['Action', 'Sprint'],
      threats: ['Rival Factions', 'Wild Anomalies']
    };

    const baseHero = completeHeroProfile({
      name: heroName.trim() || defaultDisplayName,
      race: heroRace,
      personality: heroPersonality.split(',').map(s => s.trim()).filter(Boolean),
      backstory: heroBackstory,
      appearance: {
        hair: 'Dark',
        eyes: 'Amber',
        clothing: heroAppearance,
        distinguishingFeatures: 'A faint glowing mark'
      }
    });

    const settings: StorySettings = {
      tone,
      pacing: pacing || 'Balanced Narrative',
      difficulty,
      storyLanguage,
      narrativeLength,
      mode: 'story',
      timePeriod,
      storyStyle,
      romanceLevel,
      actionLevel,
      mysteryLevel,
      mainObjective,
      supportingCharacters: supportingCharacters.split(',').map(s => s.trim()).filter(Boolean),
      userPromptDescription: promptDescription
    };

    const finalTitle = title.trim() || `${heroName.trim() || defaultDisplayName}'s Chronicle in ${worldName}`;

    onLaunchStory({
      title: finalTitle,
      settings,
      generationMode: 'ai',
      overrideHero: baseHero,
      overrideWorld: matchedWorld,
      overrideGenres: [selectedGenre],
      userPromptDescription: promptDescription
    });
  };

  const steps = [
    { num: 1, label: 'Concept', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { num: 2, label: 'World', icon: <Compass className="w-3.5 h-3.5" /> },
    { num: 3, label: 'Cast', icon: <User className="w-3.5 h-3.5" /> },
    { num: 4, label: 'Pacing', icon: <Sliders className="w-3.5 h-3.5" /> },
    { num: 5, label: 'Preview', icon: <CheckCircle2 className="w-3.5 h-3.5" /> }
  ];

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-5 overflow-y-auto overscroll-contain">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-dark-border/60 pb-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-dark-muted hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Home
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-primary bg-brand-primary/10 px-2.5 py-0.5 rounded-full border border-brand-primary/30">
            Mode 1 • Create Story
          </span>
        </div>
      </div>

      {/* Progress Step Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white">Step {currentStep} of 5</span>
          <span className="text-xs text-dark-muted font-medium">{steps[currentStep - 1].label}</span>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {steps.map((st) => (
            <button
              key={st.num}
              onClick={() => setCurrentStep(st.num)}
              className={`h-2 rounded-full transition-all ${
                st.num === currentStep
                  ? 'bg-gradient-to-r from-brand-primary to-brand-glow shadow-sm shadow-brand-primary/50'
                  : st.num < currentStep
                  ? 'bg-brand-primary/40'
                  : 'bg-dark-elevated'
              }`}
              title={`Go to Step ${st.num}: ${st.label}`}
            />
          ))}
        </div>
      </div>

      {/* Floating Error Banner */}
      {launchError && (
        <div className="p-4 rounded-xl bg-red-950/90 border border-red-500/50 text-xs text-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl animate-in fade-in">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold text-white text-sm">{launchError.title}</p>
              <p className="text-red-200/90 leading-relaxed">{launchError.message}</p>
              <p className="text-[11px] text-amber-300/80">Your story setup and character configurations are completely preserved.</p>
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
                {isGenerating ? 'Generating...' : 'Retry'}
              </Button>
            )}
            {onDismissError && (
              <button
                onClick={onDismissError}
                className="px-2 py-1 text-xs text-red-400 hover:text-white font-medium"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      )}

      {/* STEP 1: Story Concept & Describe Your Story */}
      {currentStep === 1 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" /> Describe Your Story Idea
            </h2>
            <p className="text-xs text-dark-muted leading-relaxed">
              Type your vision in plain English (or any language). Our AI will parse and automatically structure your entire story setup!
            </p>
          </div>

          <div className="space-y-2">
            <textarea
              value={promptDescription}
              onChange={(e) => setPromptDescription(e.target.value)}
              placeholder="e.g., I want to become a student in a magical academy where I slowly discover that I have forbidden powers."
              rows={4}
              className="w-full p-3.5 rounded-xl bg-dark-surface border border-dark-border text-dark-text text-sm focus:border-brand-primary focus:outline-none resize-none shadow-inner"
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleApplyAiSuggestion()}
                className="px-3 py-1.5 rounded-xl bg-brand-primary/20 border border-brand-primary/40 text-brand-glow text-xs font-semibold hover:bg-brand-primary/30 flex items-center gap-1.5 transition-all"
              >
                <Wand2 className="w-3.5 h-3.5" /> AI Suggest & Pre-fill Story
              </button>
              <button
                type="button"
                onClick={handleRandomize}
                className="px-3 py-1.5 rounded-xl bg-dark-elevated border border-dark-border text-dark-muted text-xs hover:text-white flex items-center gap-1.5 transition-all"
              >
                <Dices className="w-3.5 h-3.5 text-amber-400" /> Randomize Idea
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-dark-muted uppercase tracking-wider">Story Preset (Quick Setup)</label>
              <select
                value={selectedPresetId}
                onChange={(e) => handleApplyPreset(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-dark-surface border border-dark-border text-dark-text text-sm focus:border-brand-primary focus:outline-none"
              >
                <option value="">Custom Configuration (No Preset)</option>
                {presets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.selectedGenre})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-dark-muted uppercase tracking-wider">Primary Genre</label>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-dark-surface border border-dark-border text-dark-text text-sm focus:border-brand-primary focus:outline-none"
              >
                {GENRE_CATALOG.map((g) => (
                  <option key={g.id} value={g.name}>{g.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: World, Setting & Time Period */}
      {currentStep === 2 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-400" /> World & Setting
            </h2>
            <p className="text-xs text-dark-muted">
              Define the realm, epoch, and atmosphere where your chronicle will take place.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-dark-muted uppercase tracking-wider">World / Realm Name</label>
              <input
                type="text"
                value={worldName}
                onChange={(e) => setWorldName(e.target.value)}
                placeholder="e.g., Grand Academy of Arcana"
                className="w-full p-2.5 rounded-xl bg-dark-surface border border-dark-border text-dark-text text-sm focus:border-brand-primary focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-dark-muted uppercase tracking-wider">Time Period / Era</label>
              <input
                type="text"
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
                placeholder="e.g., Era of Enchanted Towers"
                className="w-full p-2.5 rounded-xl bg-dark-surface border border-dark-border text-dark-text text-sm focus:border-brand-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-dark-muted uppercase tracking-wider">Story Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as StorySettings['tone'])}
                className="w-full p-2.5 rounded-xl bg-dark-surface border border-dark-border text-dark-text text-sm focus:border-brand-primary focus:outline-none"
              >
                <option value="Anime Shonen">Anime Shonen (Action & Camaraderie)</option>
                <option value="Epic Fantasy">Epic Fantasy (High Stakes & Grand Lore)</option>
                <option value="Dark & Gritty">Dark & Gritty (Survival & Peril)</option>
                <option value="Cyberpunk Noir">Cyberpunk Noir (Rain, Neon & Mystery)</option>
                <option value="Lighthearted Isekai">Lighthearted Isekai (Whimsical Adventure)</option>
                <option value="Mystery & Suspense">Mystery & Suspense (Secrets & Clues)</option>
                <option value="Epic Saga">Epic Saga (Kingdoms & War)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-dark-muted uppercase tracking-wider">Story Narrative Style</label>
              <input
                type="text"
                value={storyStyle}
                onChange={(e) => setStoryStyle(e.target.value)}
                placeholder="e.g., Coming of Age Journey"
                className="w-full p-2.5 rounded-xl bg-dark-surface border border-dark-border text-dark-text text-sm focus:border-brand-primary focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Protagonist & Cast */}
      {currentStep === 3 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-400" /> Protagonist & Supporting Cast
            </h2>
            <p className="text-xs text-dark-muted">
              Define who you are playing as and the important characters in your life.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-dark-muted uppercase tracking-wider">Hero Name</label>
              <input
                type="text"
                value={heroName}
                onChange={(e) => {
                  setHeroName(e.target.value);
                  setHasManuallyEditedName(true);
                }}
                placeholder={defaultDisplayName}
                className="w-full p-2.5 rounded-xl bg-dark-surface border border-dark-border text-dark-text text-sm focus:border-brand-primary focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-dark-muted uppercase tracking-wider">Race / Species</label>
              <input
                type="text"
                value={heroRace}
                onChange={(e) => setHeroRace(e.target.value)}
                placeholder="Human, Elf, Starborn, etc."
                className="w-full p-2.5 rounded-xl bg-dark-surface border border-dark-border text-dark-text text-sm focus:border-brand-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-dark-muted uppercase tracking-wider">Personality Traits</label>
            <input
              type="text"
              value={heroPersonality}
              onChange={(e) => setHeroPersonality(e.target.value)}
              placeholder="e.g., Determined, Observant, Curious"
              className="w-full p-2.5 rounded-xl bg-dark-surface border border-dark-border text-dark-text text-sm focus:border-brand-primary focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-dark-muted uppercase tracking-wider">Backstory</label>
            <textarea
              value={heroBackstory}
              onChange={(e) => setHeroBackstory(e.target.value)}
              rows={2}
              className="w-full p-2.5 rounded-xl bg-dark-surface border border-dark-border text-dark-text text-sm focus:border-brand-primary focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-dark-muted uppercase tracking-wider">Supporting Characters</label>
              <input
                type="text"
                value={supportingCharacters}
                onChange={(e) => setSupportingCharacters(e.target.value)}
                placeholder="e.g., Elena (Rival), Master Balthazar"
                className="w-full p-2.5 rounded-xl bg-dark-surface border border-dark-border text-dark-text text-sm focus:border-brand-primary focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-dark-muted uppercase tracking-wider">Main Objective</label>
              <input
                type="text"
                value={mainObjective}
                onChange={(e) => setMainObjective(e.target.value)}
                placeholder="e.g., Master forbidden powers without detection"
                className="w-full p-2.5 rounded-xl bg-dark-surface border border-dark-border text-dark-text text-sm focus:border-brand-primary focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: Parameters & Sliders */}
      {currentStep === 4 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-400" /> Story Parameters & Dynamics
            </h2>
            <p className="text-xs text-dark-muted">
              Fine-tune the narrative pacing, response length, difficulty, and story language.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5 p-3 rounded-xl bg-dark-surface border border-dark-border">
              <span className="text-xs font-bold text-white">Action Level</span>
              <div className="grid grid-cols-3 gap-1 pt-1">
                {(['Low', 'Moderate', 'High'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setActionLevel(lvl)}
                    className={`py-1 text-xs rounded-lg font-semibold transition-all ${
                      actionLevel === lvl
                        ? 'bg-brand-primary text-white shadow-sm'
                        : 'bg-dark-elevated text-dark-muted hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 p-3 rounded-xl bg-dark-surface border border-dark-border">
              <span className="text-xs font-bold text-white">Mystery Level</span>
              <div className="grid grid-cols-3 gap-1 pt-1">
                {(['Low', 'Moderate', 'High'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setMysteryLevel(lvl)}
                    className={`py-1 text-xs rounded-lg font-semibold transition-all ${
                      mysteryLevel === lvl
                        ? 'bg-indigo-500 text-white shadow-sm'
                        : 'bg-dark-elevated text-dark-muted hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 p-3 rounded-xl bg-dark-surface border border-dark-border">
              <span className="text-xs font-bold text-white">Romance Level</span>
              <div className="grid grid-cols-3 gap-1 pt-1">
                {(['None', 'Light', 'Prominent'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setRomanceLevel(lvl)}
                    className={`py-1 text-xs rounded-lg font-semibold transition-all ${
                      romanceLevel === lvl
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'bg-dark-elevated text-dark-muted hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-dark-muted uppercase tracking-wider">Narrative Length</label>
              <select
                value={narrativeLength}
                onChange={(e) => setNarrativeLength(e.target.value as any)}
                className="w-full p-2.5 rounded-xl bg-dark-surface border border-dark-border text-dark-text text-sm focus:border-brand-primary focus:outline-none"
              >
                <option value="concise">Concise (Fast & Snappy: 80-150 words)</option>
                <option value="balanced">Balanced (Recommended: 120-200 words)</option>
                <option value="detailed">Detailed (Deep Prose: 200-300 words)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-dark-muted uppercase tracking-wider">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full p-2.5 rounded-xl bg-dark-surface border border-dark-border text-dark-text text-sm focus:border-brand-primary focus:outline-none"
              >
                <option value="Adventurer (Standard)">Adventurer (Standard)</option>
                <option value="Heroic (Tactical)">Heroic (Tactical)</option>
                <option value="Hardcore Iron (Unforgiving)">Hardcore Iron (Unforgiving)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-dark-muted uppercase tracking-wider">Story Language</label>
              <select
                value={storyLanguage}
                onChange={(e) => {
                  const val = e.target.value as SupportedLanguage;
                  setStoryLanguage(val);
                  preferencesService.setStoryLanguage(val, user?.uid);
                }}
                className="w-full p-2.5 rounded-xl bg-dark-surface border border-dark-border text-dark-text text-sm focus:border-brand-primary focus:outline-none"
              >
                {Object.entries(LANGUAGE_LABELS).map(([code, info]) => (
                  <option key={code} value={code}>
                    {info.flag} {info.label} ({info.native})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: Story Preview */}
      {currentStep === 5 && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-brand-primary" /> Story Preview & Confirmation
            </h2>
            <p className="text-xs text-dark-muted">
              Choose your chronicle title, review settings, or save this configuration as a reusable preset.
            </p>
          </div>

          {/* Chronicle Title Input (Final Stage) */}
          <div className="p-4 rounded-2xl bg-dark-surface border border-brand-primary/40 shadow-xl space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Chronicle Title (Final Step)
                </label>
                <button
                  type="button"
                  onClick={handleSuggestTitle}
                  className="px-2.5 py-1 rounded-lg bg-dark-elevated border border-dark-border text-xs text-amber-300 hover:text-white flex items-center gap-1 transition-all"
                >
                  <Sparkles className="w-3 h-3" /> Suggest Title
                </button>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`e.g., ${heroName}'s Adventure in ${worldName}`}
                className="w-full p-2.5 rounded-xl bg-dark-elevated border border-dark-border text-dark-text text-sm font-semibold focus:border-brand-primary focus:outline-none"
              />
              <p className="text-[11px] text-dark-muted">
                Finalize your chronicle title or tap "Suggest Title" to generate one matching your hero and genre.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-dark-border/60 pt-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-brand-accent tracking-widest">
                  {selectedGenre} • {timePeriod}
                </span>
                <h3 className="text-sm font-bold text-white">{title || 'Untitled Chronicle'}</h3>
              </div>
              <Badge variant="primary" size="md">
                {LANGUAGE_LABELS[storyLanguage].flag} {LANGUAGE_LABELS[storyLanguage].label}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1 p-2.5 rounded-xl bg-dark-elevated/70 border border-dark-border">
                <span className="font-bold text-brand-glow">Protagonist:</span>
                <p className="text-dark-text font-semibold">{heroName} ({heroRace})</p>
                <p className="text-dark-muted text-[11px]">{heroPersonality}</p>
                <p className="text-dark-muted text-[11px] italic mt-1">"{heroBackstory}"</p>
              </div>

              <div className="space-y-1 p-2.5 rounded-xl bg-dark-elevated/70 border border-dark-border">
                <span className="font-bold text-indigo-400">Realm & Setting:</span>
                <p className="text-dark-text font-semibold">{worldName}</p>
                <p className="text-dark-muted text-[11px]">Tone: {tone} • Style: {storyStyle}</p>
                <p className="text-dark-muted text-[11px] mt-1">Action: {actionLevel} | Mystery: {mysteryLevel} | Romance: {romanceLevel}</p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-dark-elevated/70 border border-dark-border text-xs space-y-1">
              <span className="font-bold text-amber-400">Main Objective:</span>
              <p className="text-dark-text">{mainObjective}</p>
              {supportingCharacters && (
                <p className="text-dark-muted text-[11px]">
                  <strong>Supporting Cast:</strong> {supportingCharacters}
                </p>
              )}
            </div>

            {/* Save as Reusable Preset */}
            <div className="pt-3 border-t border-dark-border/60">
              <label className="text-[11px] font-bold text-dark-muted uppercase tracking-wider block mb-1.5">
                Save Setup as Reusable Preset
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  placeholder={`Preset name (e.g., My ${selectedGenre} Setup)`}
                  className="flex-1 p-2 rounded-xl bg-dark-elevated border border-dark-border text-dark-text text-xs focus:border-brand-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSaveCurrentAsPreset}
                  disabled={isSavingPreset}
                  className="px-3 py-2 rounded-xl bg-brand-primary/20 border border-brand-primary/40 text-brand-glow text-xs font-semibold hover:bg-brand-primary/30 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  {isSavingPreset ? 'Saving...' : 'Save as Preset'}
                </button>
              </div>
              {presetSaveMessage && (
                <p className="text-[11px] text-emerald-400 mt-1.5 font-medium">{presetSaveMessage}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons (Bottom Controls) */}
      <div className="flex items-center justify-between pt-3 border-t border-dark-border/60 safe-area-bottom">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={() => setCurrentStep(currentStep - 1)}
            disabled={isGenerating}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-dark-elevated border border-dark-border text-xs text-dark-text hover:text-white flex items-center gap-1.5 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2">
          {currentStep < 5 ? (
            <>
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="min-h-[44px] px-3 py-2 rounded-xl text-xs text-dark-muted hover:text-white"
              >
                Skip / Next
              </button>
              <Button
                variant="primary"
                size="md"
                onClick={() => setCurrentStep(currentStep + 1)}
                iconRight={<ArrowRight className="w-4 h-4" />}
                className="min-h-[44px]"
              >
                Next Step
              </Button>
            </>
          ) : (
            <Button
              variant="amber"
              size="lg"
              onClick={handleFinalLaunch}
              disabled={isGenerating}
              iconLeft={<Sparkles className="w-4 h-4" />}
              className="min-h-[44px]"
            >
              {isGenerating ? 'Weaving Story with Gemini...' : 'Begin Chronicle'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
