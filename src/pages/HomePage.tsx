import React, { useState, useEffect } from 'react';
import { StoryDocument } from '../types/story';
import { storyRepository } from '../lib/storage/storyRepository';
import { GENRE_CATALOG } from '../catalogs/genres';
import { getSceneBackground, getCharacterPortrait } from '../features/assets/assetSelector';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Play,
  Sparkles,
  BookPlus,
  Users,
  Dices,
  BookOpen,
  ChevronRight,
  Clock,
  User,
  LogIn,
  Layers
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { BrandEmblem } from '../components/branding/BrandEmblem';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onOpenStory: (storyId: string) => void;
  onQuickPlay?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenStory, onQuickPlay }) => {
  const { user } = useAuth();
  const [recentStories, setRecentStories] = useState<StoryDocument[]>([]);

  const loadStories = async () => {
    try {
      const stories = await storyRepository.listStories();
      setRecentStories(stories);
    } catch (err) {
      console.error('Failed to load recent stories:', err);
    }
  };

  useEffect(() => {
    loadStories();
  }, []);

  const lastStory = recentStories.find(s => s.status === 'active') || recentStories[0];

  const handleRandomAdventure = async () => {
    if (onQuickPlay) {
      onQuickPlay();
    } else {
      onNavigate('#/create-story');
    }
  };

  // Get background and portrait for the last story card
  const lastBg = lastStory ? getSceneBackground({
    sceneTitle: lastStory.turns[lastStory.turns.length - 1]?.sceneTitle || 'Start',
    worldId: lastStory.worldId,
    genres: lastStory.genres
  }) : null;

  const lastPortrait = lastStory ? getCharacterPortrait(lastStory.hero.name, lastStory.hero) : null;

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto overscroll-contain safe-area-bottom">
      {/* Top User Status Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-dark-border/40">
        <div className="flex items-center gap-2.5">
          <BrandEmblem size="sm" variant="icon" />
          <div>
            <span className="font-extrabold text-base text-white tracking-tight">BranchVerse</span>
            <span className="text-[10px] text-brand-glow ml-2 font-mono uppercase bg-brand-primary/10 px-1.5 py-0.5 rounded border border-brand-primary/20">AI RPG</span>
          </div>
        </div>

        {user ? (
          <button
            onClick={() => onNavigate('#/settings')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-dark-surface border border-dark-border hover:border-brand-primary/50 transition-all text-xs text-dark-text focus:outline-none shadow-sm"
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
            <span className="max-w-[120px] truncate font-medium">
              {user.displayName?.split(' ')[0] || 'Hero'}
            </span>
          </button>
        ) : (
          <button
            onClick={() => onNavigate('#/login')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/30 hover:bg-brand-primary/20 transition-all text-xs text-brand-glow font-medium focus:outline-none"
          >
            <LogIn className="w-3.5 h-3.5 text-brand-primary" />
            <span>Sign In</span>
          </button>
        )}
      </div>

      {/* Brand Hero Pitch */}
      <div className="text-center space-y-2 py-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-brand-primary/15 via-indigo-500/10 to-amber-500/15 border border-brand-primary/30 text-brand-glow text-xs font-bold tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Living World AI Fiction & Role-Play
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
          Where Your Actions Shape Reality
        </h1>
        <p className="text-xs sm:text-sm text-dark-muted max-w-xl mx-auto leading-relaxed">
          Create novelistic original stories or immerse yourself as a living character in reactive worlds powered by Gemini AI.
        </p>
      </div>

      {/* PREMIER FEATURED EXPERIENCE: ISEKAI REBIRTH PROLOGUE */}
      <div
        onClick={() => onNavigate('#/isekai')}
        className="relative group p-6 rounded-3xl bg-gradient-to-r from-violet-950/70 via-indigo-950/60 to-purple-950/70 border border-violet-500/40 hover:border-amber-400/80 shadow-2xl cursor-pointer transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-violet-600/20 via-amber-400/10 to-transparent blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            <div className="relative shrink-0">
              <BrandEmblem size="md" variant="icon" showGlow priority />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300 bg-amber-400/15 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  Featured Experience
                </span>
                <span className="text-[10px] text-indigo-300 font-mono hidden sm:inline">
                  Interactive Multiverse Prologue
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white font-serif group-hover:text-amber-200 transition-colors">
                Begin Your Isekai Rebirth
              </h2>
              <p className="text-xs text-dark-muted max-w-xl leading-relaxed">
                Awaken beyond your first life, converse with the mysterious Arbiter of Threads, shape your race and affinities, and step through the Multiverse Gateway.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-amber-300 shrink-0 self-end sm:self-center">
            <span>Enter Astral Void</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* 2 PRIMARY MAJOR MODES (Side by Side on Tablet/Desktop, Stacked on Mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* MODE 1: CREATE STORY */}
        <div
          onClick={() => onNavigate('#/create-story')}
          className="relative group p-6 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-dark-surface to-dark-surface border border-indigo-500/30 hover:border-indigo-400 shadow-xl cursor-pointer transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex flex-col justify-between overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-44 h-44 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all" />

          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
                <BookPlus className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/15 px-3 py-1 rounded-full border border-indigo-500/30">
                Mode 1 • Authoring
              </span>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-black text-white group-hover:text-indigo-200 transition-colors">
                Create a Story
              </h2>
              <p className="text-xs text-dark-muted leading-relaxed">
                Describe an idea in your own words or design a protagonist, world, tone, and pacing in a guided 5-step wizard.
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-dark-bg/80 text-dark-text border border-dark-border">
                Natural Prompt AI
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-dark-bg/80 text-dark-text border border-dark-border">
                Custom Lore
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-dark-bg/80 text-dark-text border border-dark-border">
                Multi-Step Wizard
              </span>
            </div>
          </div>

          <div className="pt-6 relative z-10 flex items-center justify-between text-xs font-bold text-indigo-300">
            <span>Launch Story Creator</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* MODE 2: ROLE-PLAY */}
        <div
          onClick={() => onNavigate('#/roleplay-setup')}
          className="relative group p-6 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-dark-surface to-dark-surface border border-emerald-500/30 hover:border-emerald-400 shadow-xl cursor-pointer transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex flex-col justify-between overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all" />

          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/30">
                Mode 2 • Living RPG
              </span>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-black text-white group-hover:text-emerald-200 transition-colors">
                Role-Play Inside a World
              </h2>
              <p className="text-xs text-dark-muted leading-relaxed">
                Step into a living universe as a persistent character. Interact through free action, spoken dialogue, and tactical choices.
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-dark-bg/80 text-dark-text border border-dark-border">
                Dialogue & Actions
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-dark-bg/80 text-dark-text border border-dark-border">
                NPC Relationships
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-dark-bg/80 text-dark-text border border-dark-border">
                Persistent Memory
              </span>
            </div>
          </div>

          <div className="pt-6 relative z-10 flex items-center justify-between text-xs font-bold text-emerald-300">
            <span>Enter Role-Play Setup</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Quick Play 1-Tap Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-2xl bg-dark-surface border border-dark-border/80 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Dices className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Instant Adventure</h3>
            <p className="text-xs text-dark-muted">Roll random hero, realm & inciting crisis in 1 tap</p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="md"
          onClick={handleRandomAdventure}
          iconLeft={<Dices className="w-4 h-4 text-amber-400" />}
          className="w-full sm:w-auto"
        >
          Quick Play
        </Button>
      </div>

      {/* Visual Novel "Continue Last Adventure" Hero Banner (if story exists) */}
      {lastStory && lastBg && (
        <div className="relative rounded-3xl overflow-hidden border border-indigo-500/40 shadow-2xl glow-card group">
          <div className="h-44 sm:h-52 w-full relative">
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
            <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-brand-accent" /> Active Chronicle
                </span>
                <Badge variant="primary" size="sm">
                  Chapter {lastStory.turns.length}
                </Badge>
              </div>

              <div className="flex items-end gap-3.5">
                {lastPortrait && (
                  <div className="w-14 h-16 sm:w-16 sm:h-20 rounded-2xl overflow-hidden bg-dark-surface border-2 border-brand-primary/60 shrink-0 shadow-lg">
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
                  <h3 className="font-black text-base sm:text-xl text-white truncate drop-shadow-md">
                    {lastStory.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-dark-muted truncate">
                    {lastStory.hero.name} ({lastStory.hero.race}) • {lastStory.worldName}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-dark-surface/90 border-t border-dark-border/60 flex items-center justify-between">
            <div className="text-xs text-dark-muted hidden sm:block">
              {lastStory.turns[lastStory.turns.length - 1]?.sceneTitle}
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={() => onOpenStory(lastStory.id)}
              iconLeft={<Play className="w-4 h-4 fill-current" />}
              className="w-full sm:w-auto"
            >
              Resume Story
            </Button>
          </div>
        </div>
      )}

      {/* Recent Adventures Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-dark-muted flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-brand-primary" /> Recent Chronicles
          </span>
          <button
            onClick={() => onNavigate('#/library')}
            className="text-xs text-brand-primary hover:underline flex items-center gap-0.5 font-semibold"
          >
            All Chronicles <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentStories.length === 0 ? (
          <div className="p-8 rounded-2xl bg-dark-surface border border-dark-border text-center space-y-2">
            <BookOpen className="w-8 h-8 text-dark-muted mx-auto" />
            <p className="text-xs text-dark-muted">No adventures yet. Tap Create Story or Role-Play to begin your journey!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {recentStories.slice(0, 3).map((story) => (
              <div
                key={story.id}
                onClick={() => onOpenStory(story.id)}
                className="p-3.5 rounded-2xl bg-dark-surface hover:bg-dark-elevated border border-dark-border cursor-pointer transition-all active:scale-[0.99] flex items-center justify-between gap-3 group"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-xs text-dark-text truncate group-hover:text-brand-glow">{story.title}</h4>
                  <p className="text-[11px] text-dark-muted truncate mt-0.5">
                    {story.hero.name} • {story.genres[0]} • Ch. {story.turns.length}
                  </p>
                </div>
                <div className="w-7 h-7 rounded-lg bg-brand-primary/10 group-hover:bg-brand-primary group-hover:text-white text-brand-primary flex items-center justify-center shrink-0 transition-colors">
                  <Play className="w-3.5 h-3.5 fill-current" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Genre Exploration */}
      <div className="space-y-2.5 pt-2">
        <span className="text-xs font-bold uppercase tracking-wider text-dark-muted px-1">
          Explore World Realms
        </span>
        <div className="flex flex-wrap gap-2">
          {GENRE_CATALOG.slice(0, 8).map((genre) => (
            <Badge
              key={genre.id}
              variant="outline"
              size="sm"
              onClick={() => onNavigate('#/create-story')}
              className="py-1.5 px-3 text-xs hover:border-brand-primary hover:text-white cursor-pointer"
            >
              {genre.name}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};
