import React, { useState, useEffect } from 'react';
import { StoryDocument } from '../types/story';
import { storyRepository } from '../lib/storage/storyRepository';
import { completeHeroProfile } from '../features/story/naturalPromptParser';
import { createNewStory } from '../features/story/storyEngine';
import { GENRE_CATALOG } from '../catalogs/genres';
import { WORLD_CATALOG } from '../catalogs/worlds';
import { getSceneBackground, getCharacterPortrait } from '../features/assets/assetSelector';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Play, PlusCircle, Dices, BookOpen, ChevronRight, Sparkles, Clock, LogIn, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onOpenStory: (storyId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenStory }) => {
  const { user } = useAuth();
  const [recentStories, setRecentStories] = useState<StoryDocument[]>([]);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const stories = await storyRepository.listStories();
      setRecentStories(stories);
    } catch (err) {
      console.error('Failed to load recent stories:', err);
    }
  };

  const lastStory = recentStories.find(s => s.status === 'active') || recentStories[0];

  const handleRandomAdventure = async () => {
    const randomHero = completeHeroProfile({});
    const randomWorld = WORLD_CATALOG[Math.floor(Math.random() * WORLD_CATALOG.length)];
    const randomGenre = GENRE_CATALOG.find(g => g.id === randomWorld.primaryGenreId) || GENRE_CATALOG[0];

    const newStory = createNewStory({
      title: `${randomHero.name}’s Destiny in ${randomWorld.name}`,
      hero: randomHero,
      genres: [randomGenre.name],
      worldId: randomWorld.id,
      worldName: randomWorld.name,
      settings: {
        tone: 'Epic Fantasy',
        pacing: 'Balanced Narrative',
        difficulty: 'Adventurer (Standard)'
      }
    });

    await storyRepository.saveStory(newStory);
    onOpenStory(newStory.id);
  };

  // Get background and portrait for the last story card
  const lastBg = lastStory ? getSceneBackground({
    sceneTitle: lastStory.turns[lastStory.turns.length - 1]?.sceneTitle || 'Start',
    worldId: lastStory.worldId,
    genres: lastStory.genres
  }) : null;

  const lastPortrait = lastStory ? getCharacterPortrait(lastStory.hero.name, lastStory.hero) : null;

  return (
    <div className="flex flex-col h-full max-w-md mx-auto p-4 space-y-4 overflow-y-auto overscroll-contain safe-area-bottom">
      {/* Top User Status Bar */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-primary to-amber-500 flex items-center justify-center text-white font-bold text-xs shadow-sm">
            BV
          </div>
          <span className="font-bold text-sm text-dark-text tracking-tight">BranchVerse</span>
        </div>

        {user ? (
          <button
            onClick={() => onNavigate('#/settings')}
            className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-dark-surface border border-dark-border hover:border-brand-primary/50 transition-all text-xs text-dark-text focus:outline-none"
            aria-label="View Account Settings"
          >
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Hero'}
                className="w-5 h-5 rounded-full object-cover border border-brand-primary/40"
              />
            ) : (
              <User className="w-3.5 h-3.5 text-brand-primary" />
            )}
            <span className="max-w-[100px] truncate font-medium">
              {user.displayName?.split(' ')[0] || 'Hero'}
            </span>
          </button>
        ) : (
          <button
            onClick={() => onNavigate('#/login')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/30 hover:bg-brand-primary/20 transition-all text-xs text-brand-glow font-medium focus:outline-none"
          >
            <LogIn className="w-3.5 h-3.5 text-brand-primary" />
            <span>Sign In</span>
          </button>
        )}
      </div>

      {/* Brand Header */}
      <div className="pt-1 text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-glow text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" /> Mobile-First Interactive Storytelling
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
          BranchVerse
        </h1>
        <p className="text-xs text-dark-muted font-medium">
          "Your Choices. Your World. Your Story."
        </p>
      </div>

      {/* Visual Novel "Continue Last Adventure" Hero Banner (if story exists) */}
      {lastStory && lastBg && (
        <div className="relative rounded-2xl overflow-hidden border border-indigo-500/40 shadow-xl glow-card group">
          <div className="h-40 w-full relative">
            <img
              src={lastBg.path}
              alt={lastBg.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/placeholders/default_scene.svg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/60 to-transparent" />

            {/* Content overlay */}
            <div className="absolute inset-0 p-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/10 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-brand-accent" /> Continue Story
                </span>
                <Badge variant="primary" size="sm">
                  Ch. {lastStory.turns.length}
                </Badge>
              </div>

              <div className="flex items-end gap-3">
                {lastPortrait && (
                  <div className="w-11 h-13 rounded-xl overflow-hidden bg-dark-surface border-2 border-brand-primary/60 shrink-0 shadow-md">
                    <img
                      src={lastPortrait.path}
                      alt={lastPortrait.name}
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/placeholders/default_avatar.svg';
                      }}
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-sm sm:text-base text-white truncate drop-shadow-md">
                    {lastStory.title}
                  </h3>
                  <p className="text-[11px] text-dark-muted truncate">
                    {lastStory.hero.name} ({lastStory.hero.race}) • {lastStory.worldName}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-dark-surface/90 border-t border-dark-border/60">
            <Button
              variant="primary"
              fullWidth
              size="md"
              onClick={() => onOpenStory(lastStory.id)}
              iconLeft={<Play className="w-4 h-4 fill-current" />}
            >
              Resume Story
            </Button>
          </div>
        </div>
      )}

      {/* Core Action Buttons */}
      <div className="grid grid-cols-2 gap-2.5">
        <Button
          variant="amber"
          size="lg"
          onClick={() => onNavigate('#/create-hero')}
          iconLeft={<PlusCircle className="w-5 h-5" />}
          className="flex-col py-3.5 h-auto text-left items-start gap-1"
        >
          <span className="font-bold text-sm">New Hero</span>
          <span className="text-[10px] font-normal opacity-90">Craft protagonist & world</span>
        </Button>

        <Button
          variant="secondary"
          size="lg"
          onClick={handleRandomAdventure}
          iconLeft={<Dices className="w-5 h-5 text-amber-400" />}
          className="flex-col py-3.5 h-auto text-left items-start gap-1 border-dark-border hover:border-amber-500/40"
        >
          <span className="font-bold text-sm">Quick Play</span>
          <span className="text-[10px] font-normal text-dark-muted">1-Tap instant adventure</span>
        </Button>
      </div>

      {/* Recent Adventures Preview */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-dark-muted">
            Recent Stories
          </span>
          <button
            onClick={() => onNavigate('#/library')}
            className="text-xs text-brand-primary hover:underline flex items-center gap-0.5"
          >
            All Stories <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {recentStories.length === 0 ? (
          <div className="p-6 rounded-2xl bg-dark-surface border border-dark-border text-center space-y-2">
            <BookOpen className="w-6 h-6 text-dark-muted mx-auto" />
            <p className="text-xs text-dark-muted">No adventures yet. Tap "New Hero" to begin your journey!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentStories.slice(0, 3).map((story) => (
              <div
                key={story.id}
                onClick={() => onOpenStory(story.id)}
                className="p-3 rounded-xl bg-dark-surface hover:bg-dark-elevated border border-dark-border cursor-pointer transition-all active:scale-[0.99] flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-xs text-dark-text truncate">{story.title}</h4>
                  <p className="text-[11px] text-dark-muted truncate">
                    {story.hero.name} • {story.genres[0]} • Ch. {story.turns.length}
                  </p>
                </div>
                <Play className="w-4 h-4 text-brand-primary shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Genre Discovery Pills */}
      <div className="space-y-2 pt-1">
        <span className="text-xs font-bold uppercase tracking-wider text-dark-muted px-1">
          Explore Genres
        </span>
        <div className="flex flex-wrap gap-1.5">
          {GENRE_CATALOG.slice(0, 8).map((genre) => (
            <Badge
              key={genre.id}
              variant="outline"
              size="sm"
              onClick={() => onNavigate('#/select-genre')}
              className="py-1 px-2.5 text-xs hover:border-brand-primary hover:text-white"
            >
              {genre.name}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};
