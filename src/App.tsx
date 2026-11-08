import React, { useState, useEffect, useRef } from 'react';
import { HeroProfile } from './types/character';
import { WorldDefinition } from './types/world';
import { StorySettings } from './types/story';
import { storyRepository } from './lib/storage/storyRepository';
import { createNewStory } from './features/story/storyEngine';
import { completeHeroProfile } from './features/story/naturalPromptParser';
import { WORLD_CATALOG } from './catalogs/worlds';
import { GENRE_CATALOG } from './catalogs/genres';
import { auth } from './lib/firebase/firebase';
import { classifyAiError } from './engine';

// Screens
import { HomePage } from './pages/HomePage';
import { CreateHeroPage } from './pages/CreateHeroPage';
import { SelectGenrePage } from './pages/SelectGenrePage';
import { SelectWorldPage } from './pages/SelectWorldPage';
import { StorySettingsPage } from './pages/StorySettingsPage';
import { ReaderPage } from './pages/ReaderPage';
import { LibraryPage } from './pages/LibraryPage';
import { TranscriptPage } from './pages/TranscriptPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { CreateStoryWizardPage } from './pages/CreateStoryWizardPage';
import { RoleplaySetupPage } from './pages/RoleplaySetupPage';

// Contexts
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { I18nProvider } from './i18n';

// Navigation
import { BottomNav } from './components/navigation/BottomNav';
import { Sparkles } from 'lucide-react';

// Branding & Cinematic Experiences
import { SplashScreen, LoadingScreen } from './components/branding';

const isTestEnv =
  Boolean(import.meta.env?.VITEST) ||
  import.meta.env?.MODE === 'test' ||
  (typeof (globalThis as any).process !== 'undefined' && (globalThis as any).process?.env?.NODE_ENV === 'test');

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  const [showSplash, setShowSplash] = useState<boolean>(() => {
    if (isTestEnv) return false;
    try {
      return !sessionStorage.getItem('bv_splash_seen');
    } catch (_) {
      return false;
    }
  });

  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    return window.location.hash || '#/';
  });

  const [storyCount, setStoryCount] = useState<number>(0);

  // Multi-step Creation Flow State
  const [heroDraft, setHeroDraft] = useState<HeroProfile | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['High Fantasy']);
  const [selectedWorld, setSelectedWorld] = useState<WorldDefinition | null>(null);
  const [isGeneratingStory, setIsGeneratingStory] = useState<boolean>(false);
  const [launchError, setLaunchError] = useState<{
    title: string;
    message: string;
    retryable: boolean;
  } | null>(null);

  // Recovery refs: preserve story creation params & abort controller to avoid duplicate/stale requests
  const lastLaunchParamsRef = useRef<any>(null);
  const storyAbortControllerRef = useRef<AbortController | null>(null);

  const navigate = (path: string) => {
    window.location.hash = path;
    setCurrentRoute(path);
  };

  // Synchronize route with browser hash changes
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(window.location.hash || '#/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update story count badge when user is in the app
  useEffect(() => {
    if (!user) return;
    const refreshCount = async () => {
      try {
        const stories = await storyRepository.listStories();
        setStoryCount(stories.length);
      } catch (err) {
        console.warn('Could not refresh story count:', err);
      }
    };
    refreshCount();
  }, [currentRoute, user]);

  // If user is authenticated and on #/login, automatically navigate to #/
  useEffect(() => {
    if (user && (currentRoute === '#/login' || currentRoute === '#login')) {
      navigate('#/');
    }
  }, [user, currentRoute]);

  // Apply saved theme on startup
  useEffect(() => {
    const theme = localStorage.getItem('bv_theme') || 'dark';
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Creation Flow Handlers
  const handleHeroCreated = (hero: HeroProfile) => {
    setHeroDraft(hero);
    navigate('#/select-genre');
  };

  const handleGenresSelected = (genres: string[]) => {
    setSelectedGenres(genres);
    navigate('#/select-world');
  };

  const handleWorldSelected = (world: WorldDefinition) => {
    setSelectedWorld(world);
    navigate('#/story-settings');
  };

  const handleLaunchStory = async (params: {
    title: string;
    settings: StorySettings;
    generationMode?: 'ai';
    overrideHero?: HeroProfile;
    overrideWorld?: WorldDefinition;
    overrideGenres?: string[];
    userPromptDescription?: string;
  }) => {
    const defaultHeroName = user?.displayName?.trim() || 'Hari Khatri';
    const targetHero = params.overrideHero || heroDraft || completeHeroProfile({ name: defaultHeroName }, defaultHeroName);
    const targetWorld = params.overrideWorld || selectedWorld || WORLD_CATALOG[0];
    const targetGenres = params.overrideGenres || (selectedGenres && selectedGenres.length > 0 ? selectedGenres : ['High Fantasy']);
    if (isGeneratingStory) {
      console.warn('Story generation is already running. Ignoring duplicate request.');
      return;
    }

    setLaunchError(null);
    lastLaunchParamsRef.current = params;

    if (storyAbortControllerRef.current) {
      storyAbortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    storyAbortControllerRef.current = abortController;

    let initialNarrative: any = undefined;

    // Model A: Initial Story Generation with dynamic Gemini 3 fallback cascade
    setIsGeneratingStory(true);
    try {
      console.log('[StoryCreationFlow] Stage 1: Initiating story generation request to /api/narrative/initial...');
      let token = '';
      if (auth && auth.currentUser) {
        token = await auth.currentUser.getIdToken();
      }

      const res = await fetch('/api/narrative/initial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          hero: {
            name: targetHero.name,
            race: targetHero.race,
            origin: targetHero.origin,
            backstory: targetHero.backstory,
            personality: targetHero.personality,
            skills: targetHero.skills
          },
          genres: targetGenres,
          worldName: targetWorld.name,
          tone: params.settings.tone,
          pacing: params.settings.pacing,
          difficulty: params.settings.difficulty,
          storyLanguage: params.settings.storyLanguage || 'hi',
          narrativeLength: params.settings.narrativeLength || 'balanced',
          mode: params.settings.mode || 'story',
          timePeriod: params.settings.timePeriod,
          storyStyle: params.settings.storyStyle,
          romanceLevel: params.settings.romanceLevel,
          actionLevel: params.settings.actionLevel,
          mysteryLevel: params.settings.mysteryLevel,
          mainObjective: params.settings.mainObjective,
          supportingCharacters: params.settings.supportingCharacters,
          userPromptDescription: params.userPromptDescription || params.settings.userPromptDescription
        }),
        signal: abortController.signal
      });

      console.log(`[StoryCreationFlow] Stage 2: Received response with status ${res.status}`);
      if (!res.ok) {
        let errData: any = {};
        try {
          errData = await res.json();
        } catch {
          // ignore
        }
        const errorText = errData?.message || errData?.error || res.statusText;
        const failure = classifyAiError(errorText, res.status);
        setLaunchError(failure);
        return;
      }

      const data = await res.json();
      console.log('[StoryCreationFlow] Stage 3: Response parsed. Validating narrative payload...');
      if (data.narrative) {
        initialNarrative = data.narrative;
      } else {
        throw new Error('AI Narrative service did not return an opening scene.');
      }

      console.log('[StoryCreationFlow] Stage 4: Creating new StoryDocument with normalized choices...');
      const newStory = createNewStory({
        title: params.title,
        hero: targetHero,
        genres: targetGenres,
        worldId: targetWorld.id,
        worldName: targetWorld.name,
        settings: params.settings,
        generationMode: 'ai',
        mode: params.settings.mode || 'story',
        storyLanguage: params.settings.storyLanguage || 'hi',
        initialNarrative
      });
      newStory.mode = params.settings.mode || 'story';

      console.log(`[StoryCreationFlow] Stage 5: Saving story to local storage / IndexedDB (${newStory.id})...`);
      await storyRepository.saveStory(newStory);

      console.log(`[StoryCreationFlow] Stage 6: Story saved successfully! Navigating to Reader: #/reader/${newStory.id}`);
      setLaunchError(null);
      navigate(`#/reader/${newStory.id}`);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('[StoryCreationFlow] Story generation cancelled by user.');
        return;
      }
      console.error('[StoryCreationFlow] Story generation or persistence failed:', err);
      const failure = classifyAiError(err);
      setLaunchError(failure);
    } finally {
      setIsGeneratingStory(false);
      storyAbortControllerRef.current = null;
    }
  };

  const handleRetryStoryLaunch = () => {
    if (lastLaunchParamsRef.current && !isGeneratingStory) {
      handleLaunchStory(lastLaunchParamsRef.current);
    }
  };

  // Quick Play / 1-Tap Instant Journey with Live Gemini AI
  const handleQuickPlay = async () => {
    const defaultHeroName = user?.displayName?.trim() || 'Hari Khatri';
    const randomHero = completeHeroProfile({ name: defaultHeroName }, defaultHeroName);
    const randomWorld = WORLD_CATALOG[Math.floor(Math.random() * WORLD_CATALOG.length)];
    const randomGenre = GENRE_CATALOG.find(g => g.id === randomWorld.primaryGenreId) || GENRE_CATALOG[0];

    setHeroDraft(randomHero);
    setSelectedGenres([randomGenre.name]);
    setSelectedWorld(randomWorld);

    await handleLaunchStory({
      title: `${randomHero.name}’s Chronicle in ${randomWorld.name}`,
      settings: {
        tone: 'Epic Fantasy',
        pacing: 'Balanced Narrative',
        difficulty: 'Adventurer (Standard)',
        storyLanguage: 'hi'
      },
      generationMode: 'ai',
      overrideHero: randomHero,
      overrideWorld: randomWorld,
      overrideGenres: [randomGenre.name]
    });
  };

  // 1. First-time Cinematic Splash Screen
  if (showSplash) {
    return (
      <SplashScreen
        minDurationMs={2200}
        onComplete={() => {
          try {
            sessionStorage.setItem('bv_splash_seen', 'true');
          } catch (_) {}
          setShowSplash(false);
        }}
      />
    );
  }

  // 2. Cinematic Authentication & Multiverse Session Loading Screen
  if (loading) {
    return (
      <LoadingScreen
        context="auth"
        submessage="Verifying your chronicles and dimensional clearance..."
      />
    );
  }

  // 2. Strict Authentication Gate: Without Google login, the app does not open!
  if (!user) {
    return (
      <div className="flex flex-col h-[100dvh] w-full max-w-md mx-auto bg-dark-bg text-dark-text relative shadow-2xl overflow-hidden font-sans select-none">
        <LoginPage onSuccess={() => navigate('#/')} />
      </div>
    );
  }

  // Route Resolver for Authenticated App
  const renderCurrentScreen = () => {
    // 1. Reader Route: #/reader/:storyId
    if (currentRoute.startsWith('#/reader/')) {
      const storyId = currentRoute.replace('#/reader/', '');
      return (
        <ReaderPage
          storyId={storyId}
          onExit={() => navigate('#/library')}
          onViewTranscript={(id) => navigate(`#/transcript/${id}`)}
        />
      );
    }

    // 2. Transcript Route: #/transcript/:storyId
    if (currentRoute.startsWith('#/transcript/')) {
      const storyId = currentRoute.replace('#/transcript/', '');
      return (
        <TranscriptPage
          storyId={storyId}
          onBack={() => navigate(`#/reader/${storyId}`)}
        />
      );
    }

    // 3. New Dedicated Creation Modes
    if (currentRoute === '#/create-story') {
      return (
        <CreateStoryWizardPage
          onBack={() => {
            setLaunchError(null);
            navigate('#/');
          }}
          onLaunchStory={handleLaunchStory}
          isGenerating={isGeneratingStory}
          launchError={launchError}
          onRetry={handleRetryStoryLaunch}
          onDismissError={() => setLaunchError(null)}
        />
      );
    }

    if (currentRoute === '#/roleplay-setup') {
      return (
        <RoleplaySetupPage
          onBack={() => {
            setLaunchError(null);
            navigate('#/');
          }}
          onLaunchRoleplay={handleLaunchStory}
          isGenerating={isGeneratingStory}
          launchError={launchError}
          onRetry={handleRetryStoryLaunch}
          onDismissError={() => setLaunchError(null)}
        />
      );
    }

    // Legacy Step-by-Step Creation Wizard Routes
    if (currentRoute === '#/create-hero') {
      return (
        <CreateHeroPage
          onHeroCreated={handleHeroCreated}
          onBack={() => navigate('#/')}
        />
      );
    }

    if (currentRoute === '#/select-genre') {
      return (
        <SelectGenrePage
          selectedGenres={selectedGenres}
          onSelectGenres={handleGenresSelected}
          onBack={() => navigate('#/create-hero')}
        />
      );
    }

    if (currentRoute === '#/select-world') {
      return (
        <SelectWorldPage
          onSelectWorld={handleWorldSelected}
          onBack={() => navigate('#/select-genre')}
        />
      );
    }

    if (currentRoute === '#/story-settings') {
      const defaultTitle = heroDraft && selectedWorld
        ? `${heroDraft.name}’s Chronicle in ${selectedWorld.name}`
        : 'Chronicle of Destiny';

      return (
        <StorySettingsPage
          defaultTitle={defaultTitle}
          onLaunchStory={handleLaunchStory}
          onBack={() => {
            setLaunchError(null);
            navigate('#/select-world');
          }}
          isGenerating={isGeneratingStory}
          launchError={launchError}
          onDismissError={() => setLaunchError(null)}
        />
      );
    }

    // 4. Library Route: #/library
    if (currentRoute === '#/library') {
      return (
        <LibraryPage
          onOpenStory={(id) => navigate(`#/reader/${id}`)}
          onViewTranscript={(id) => navigate(`#/transcript/${id}`)}
          onCreateNew={() => navigate('#/create-story')}
        />
      );
    }

    // 5. Settings Route: #/settings
    if (currentRoute === '#/settings') {
      return (
        <SettingsPage
          onBack={() => navigate('#/')}
          onNavigate={navigate}
        />
      );
    }

    // Default: Home Page (#/)
    return (
      <HomePage
        onNavigate={navigate}
        onOpenStory={(id) => navigate(`#/reader/${id}`)}
        onQuickPlay={handleQuickPlay}
      />
    );
  };

  const isReaderActive = currentRoute.startsWith('#/reader/');

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-dark-bg text-dark-text relative overflow-hidden font-sans select-none">
      {/* Active Screen View */}
      <main className={`flex-1 overflow-hidden ${!isReaderActive ? 'pb-16' : ''}`}>
        {renderCurrentScreen()}
      </main>

      {/* Full-Screen Immersive Gemini AI Generation Experience */}
      {isGeneratingStory && (
        <LoadingScreen
          context="storyGenerate"
          submessage="Gemini AI is crafting your novelistic opening chapter: sensory worldbuilding, hero psyche & tactical choices..."
          error={
            launchError
              ? {
                  title: launchError.title,
                  message: launchError.message,
                  retryable: launchError.retryable,
                  onRetry: launchError.retryable ? handleRetryStoryLaunch : undefined,
                  onCancel: () => {
                    if (storyAbortControllerRef.current) {
                      storyAbortControllerRef.current.abort();
                    }
                    setIsGeneratingStory(false);
                    setLaunchError(null);
                  },
                }
              : null
          }
        />
      )}

      {/* Persistent Bottom Navigation Bar (rendered only for authenticated users) */}
      <BottomNav
        currentPath={currentRoute}
        onNavigate={navigate}
        storyCount={storyCount}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <I18nProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </I18nProvider>
  );
};

export default App;
