import React, { useState } from 'react';
import { StoryDocument, LANGUAGE_LABELS } from '../../types/story';
import { Badge } from '../ui/Badge';
import { getSceneBackground, getCharacterPortrait } from '../../features/assets/assetSelector';
import { Play, MoreVertical, Archive, Trash2, Edit2, FileText, Sparkles } from 'lucide-react';

interface StoryCardProps {
  story: StoryDocument;
  onOpen: (storyId: string) => void;
  onViewTranscript: (storyId: string) => void;
  onRename: (storyId: string, currentTitle: string) => void;
  onArchive: (storyId: string) => void;
  onDelete: (storyId: string) => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  story,
  onOpen,
  onViewTranscript,
  onRename,
  onArchive,
  onDelete
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const formattedDate = new Date(story.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  const latestTurn = story.turns[story.turns.length - 1];

  const bgAsset = getSceneBackground({
    sceneTitle: latestTurn?.sceneTitle || story.title,
    worldId: story.worldId,
    genres: story.genres
  });

  const portrait = getCharacterPortrait(story.hero.name, story.hero);

  return (
    <div className="relative rounded-2xl bg-dark-surface hover:bg-dark-elevated border border-dark-border transition-all duration-200 group overflow-hidden">
      {/* Top Background Artwork Thumbnail */}
      <div className="relative h-24 w-full overflow-hidden bg-dark-elevated">
        <img
          src={bgAsset.path}
          alt={bgAsset.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/assets/placeholders/default_scene.svg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-surface via-dark-surface/40 to-transparent" />

        {/* Floating Category Pills */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-1">
            <Badge variant="primary" size="sm">
              {story.genres[0]}
            </Badge>
            <Badge
              variant={story.generationMode === 'ai' ? 'primary' : 'amber'}
              size="sm"
            >
              {story.generationMode === 'ai' ? (
                <>
                  <Sparkles className="w-2.5 h-2.5 mr-0.5 inline text-brand-accent" /> AI
                </>
              ) : (
                'Demo'
              )}
            </Badge>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/50 text-white font-medium">
              {LANGUAGE_LABELS[story.storyLanguage || 'en']?.flag}
            </span>
          </div>

          {/* Options Menu Button */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 rounded-lg bg-black/60 backdrop-blur-sm text-dark-muted hover:text-dark-text hover:bg-black/80"
              aria-label="Story options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-7 w-44 bg-dark-elevated border border-dark-border rounded-xl shadow-xl z-50 py-1 text-xs">
                  <button
                    onClick={() => { setMenuOpen(false); onViewTranscript(story.id); }}
                    className="w-full px-3 py-2 text-left text-dark-text hover:bg-dark-surface flex items-center gap-2"
                  >
                    <FileText className="w-3.5 h-3.5 text-brand-primary" /> Transcript
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); onRename(story.id, story.title); }}
                    className="w-full px-3 py-2 text-left text-dark-text hover:bg-dark-surface flex items-center gap-2"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-amber-400" /> Rename
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); onArchive(story.id); }}
                    className="w-full px-3 py-2 text-left text-dark-text hover:bg-dark-surface flex items-center gap-2"
                  >
                    <Archive className="w-3.5 h-3.5 text-dark-muted" /> {story.status === 'archived' ? 'Unarchive' : 'Archive'}
                  </button>
                  <div className="h-px bg-dark-border my-1" />
                  <button
                    onClick={() => { setMenuOpen(false); onDelete(story.id); }}
                    className="w-full px-3 py-2 text-left text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content clickable to resume story */}
      <div onClick={() => onOpen(story.id)} className="p-3.5 pt-2 cursor-pointer space-y-1.5">
        <div className="flex items-start gap-3">
          {portrait && (
            <div className="w-10 h-12 rounded-lg overflow-hidden bg-dark-elevated border border-brand-primary/40 shrink-0">
              <img
                src={portrait.path}
                alt={portrait.name}
                loading="lazy"
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/placeholders/default_avatar.svg';
                }}
              />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-sm text-dark-text group-hover:text-brand-glow transition-colors truncate">
              {story.title}
            </h3>
            <p className="text-[11px] text-dark-muted truncate">
              {story.hero.name} ({story.hero.race}) • {story.worldName}
            </p>
          </div>
        </div>

        <p className="text-xs text-dark-muted/80 line-clamp-2 leading-relaxed">
          {latestTurn?.narrativeText}
        </p>
      </div>

      {/* Footer / Resume Button */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-dark-elevated/40 border-t border-dark-border/40">
        <span className="text-[10px] text-dark-muted">
          Ch. {latestTurn ? latestTurn.chapterNumber : 1} • {formattedDate}
        </span>
        <button
          onClick={() => onOpen(story.id)}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-brand-primary/15 hover:bg-brand-primary text-brand-primary hover:text-white text-xs font-semibold transition-all active:scale-95"
        >
          <Play className="w-3 h-3 fill-current" /> Read
        </button>
      </div>
    </div>
  );
};
