import React, { useState, useEffect } from 'react';
import { HeroProfile } from './types/character';
import { WorldDefinition } from './types/world';
import { StorySettings } from './types/story';
import { storyRepository } from './lib/storage/storyRepository';
import { createNewStory } from './features/story/storyEngine';
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

// Contexts
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { I18nProvider } from './i18n';

// Navigation
import { BottomNav } from './components/navigation/BottomNav';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [demoBypass, setDemoBypass] = useState<boolean>(false);

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
  const [pendingLaunchParams, setPendingLaunchParams] = useState<{
    title: string;
    settings: StorySettings;
    generationMode?: 'demo' | 'ai';
  } | null>(null);

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
    if (!user && !demoBypass) return;
    const refreshCount = async () => {
      try {
        const stories = await storyRepository.listStories();
        setStoryCount(stories.length);
      } catch (err) {
        console.warn('Could not refresh story count:', err);
      }
    };
    refreshCount();
  }, [currentRoute, user, demoBypass]);

  // If user is authenticated or bypassed and still on #/login, automatically navigate to #/
  useEffect(() => {
    if ((user || demoBypass) && (currentRoute === '#/login' || currentRoute === '#login')) {
      navigate('#/');
    }
  }, [user, demoBypass, currentRoute]);

  // Apply saved theme on startup
  useEffect(() => {
    const theme = localStorage.getItem('bv_theme') || 'dark';
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path;
  };

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
    generationMode?: 'demo' | 'ai';
  }) => {
    if (!heroDraft || !selectedWorld) return;
    setLaunchError(null);
    setPendingLaunchParams(params);

    let initialNarrative: any = undefined;

    // Model A: Initial Story Generation with gemini-3.8-flash if AI mode is selected
    if (params.generationMode === 'ai') {
      setIsGeneratingStory(true);
      try {
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
              name: heroDraft.name,
              race: heroDraft.race,
              origin: heroDraft.origin,
              backstory: heroDraft.backstory,
              personality: heroDraft.personality,
              skills: heroDraft.skills
            },
            genres: selectedGenres,
            worldName: selectedWorld.name,
            tone: params.settings.tone,
            pacing: params.settings.pacing,
            difficulty: params.settings.difficulty,
            storyLanguage: params.settings.storyLanguage || 'en'
          })
        });

        if (!res.ok) {
          let errData: any = {};
          try {
            errData = await res.json();
          } catch {
            // ignore
          }
          const failure = classifyAiError(errData?.error || res.statusText, res.status);
          setLaunchError(failure);
          return;
        }

        const data = await res.json();
        if (data.narrative) {
          initialNarrative = data.narrative;
        } else {
          setLaunchError(classifyAiError(new Error('AI Narrative service did not return an opening scene.')));
          return;
        }
      } catch (err: any) {
        console.warn('Initial AI generation failed:', err);
        const failure = classifyAiError(err);
        setLaunchError(failure);
        return;
      } finally {
        setIsGeneratingStory(false);
      }
    }

    const newStory = createNewStory({
      title: params.title,
      hero: heroDraft,
      genres: selectedGenres,
      worldId: selectedWorld.id,
      worldName: selectedWorld.name,
      settings: params.settings,
      generationMode: params.generationMode || 'demo',
      storyLanguage: params.settings.storyLanguage || 'en',
      initialNarrative
    });

    await storyRepository.saveStory(newStory);
    navigate(`#/reader/${newStory.id}`);
  };

  // 1. Loading Splash Screen
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[100dvh] w-full max-w-md mx-auto bg-dark-bg text-dark-text p-6 space-y-4 select-none">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-primary via-indigo-500 to-brand-accent p-0.5 shadow-xl shadow-brand-primary/25 animate-pulse">
          <div className="w-full h-full bg-dark-surface rounded-[14px] flex items-center justify-center">
            <span className="text-2xl font-black bg-gradient-to-r from-brand-glow via-indigo-300 to-amber-300 bg-clip-text text-transparent">
              BV
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-dark-muted font-medium">
          <span className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <span>Verifying Hero Session...</span>
        </div>
      </div>
    );
  }

  // 2. Strict Authentication Gate: Without login, the app does not open!
  if (!user && !demoBypass) {
    return (
      <div className="flex flex-col h-[100dvh] w-full max-w-md mx-auto bg-dark-bg text-dark-text relative shadow-2xl overflow-hidden font-sans select-none">
        <LoginPage
          onSuccess={() => navigate('#/')}
          onDemoBypass={() => setDemoBypass(true)}
        />
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

    // 3. Step-by-Step Creation Wizard Routes
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
          onSwitchToDemoAndLaunch={() => {
            if (pendingLaunchParams) {
              setLaunchError(null);
              handleLaunchStory({
                ...pendingLaunchParams,
                generationMode: 'demo'
              });
            }
          }}
        />
      );
    }

    // 4. Library Route: #/library
    if (currentRoute === '#/library') {
      return (
        <LibraryPage
          onOpenStory={(id) => navigate(`#/reader/${id}`)}
          onViewTranscript={(id) => navigate(`#/transcript/${id}`)}
          onCreateNew={() => navigate('#/create-hero')}
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

    // 6. Explicit Login Route: #/login or #login
    if (currentRoute === '#/login' || currentRoute === '#login') {
      return (
        <LoginPage
          onBack={() => navigate('#/')}
          onSuccess={() => navigate('#/')}
          onDemoBypass={() => setDemoBypass(true)}
        />
      );
    }

    // Default: Home Page (#/)
    return (
      <HomePage
        onNavigate={navigate}
        onOpenStory={(id) => navigate(`#/reader/${id}`)}
      />
    );
  };

  const isReaderActive = currentRoute.startsWith('#/reader/');

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-md mx-auto bg-dark-bg text-dark-text relative shadow-2xl overflow-hidden font-sans select-none">
      {/* Active Screen View */}
      <main className={`flex-1 overflow-hidden ${!isReaderActive ? 'pb-16' : ''}`}>
        {renderCurrentScreen()}
      </main>

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
