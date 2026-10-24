import React, { useState } from 'react';
import { StoryDocument } from '../../types/story';
import { Search, ArrowLeft, Download } from 'lucide-react';
import { Button } from '../ui/Button';

interface TranscriptViewProps {
  story: StoryDocument;
  onBack: () => void;
  onExport: () => void;
}

export const TranscriptView: React.FC<TranscriptViewProps> = ({
  story,
  onBack,
  onExport
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTurns = story.turns.filter((turn) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchesNarrative = turn.narrativeText.toLowerCase().includes(q);
    const matchesAction = turn.customActionText?.toLowerCase().includes(q);
    const matchesTitle = turn.sceneTitle.toLowerCase().includes(q);
    const matchesDialogue = turn.dialogues?.some(d => d.text.toLowerCase().includes(q) || d.speaker.toLowerCase().includes(q));
    return matchesNarrative || matchesAction || matchesTitle || matchesDialogue;
  });

  return (
    <div className="flex flex-col h-full max-w-xl mx-auto">
      {/* Header with Search and Export */}
      <div className="px-4 py-3 border-b border-dark-border/60 bg-dark-surface/90 space-y-2.5 safe-area-top">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg text-dark-muted hover:text-dark-text hover:bg-dark-elevated"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="font-bold text-base text-dark-text truncate">
              {story.title} — Transcript
            </h2>
          </div>
          <Button size="sm" variant="outline" onClick={onExport} iconLeft={<Download className="w-3.5 h-3.5" />}>
            Export
          </Button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-dark-muted absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dialogue, choices, or story events..."
            style={{ fontSize: '16px' }}
            className="w-full bg-dark-elevated border border-dark-border rounded-xl pl-9 pr-3.5 py-2 text-xs text-dark-text placeholder:text-dark-muted/50 focus:outline-none focus:border-brand-primary"
          />
        </div>
      </div>

      {/* Transcript Turns List */}
      <div className="flex-1 p-4 overflow-y-auto overscroll-contain space-y-6">
        {filteredTurns.length === 0 ? (
          <div className="text-center py-12 text-xs text-dark-muted">
            No entries matched your search query "{searchQuery}".
          </div>
        ) : (
          filteredTurns.map((turn, idx) => (
            <div
              key={turn.turnId}
              className="p-4 rounded-2xl bg-dark-surface border border-dark-border/80 space-y-3"
            >
              <div className="flex items-center justify-between border-b border-dark-border/40 pb-2">
                <span className="text-xs font-bold text-brand-primary">
                  Turn {idx + 1} • Chapter {turn.chapterNumber}
                </span>
                <span className="text-[10px] text-dark-muted">
                  {new Date(turn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <h4 className="font-semibold text-sm text-dark-text">{turn.sceneTitle}</h4>

              <p className="text-xs text-dark-text/90 leading-relaxed font-narrative">
                {turn.narrativeText}
              </p>

              {turn.dialogues && turn.dialogues.length > 0 && (
                <div className="space-y-1.5 pl-3 border-l-2 border-brand-primary/40 my-2">
                  {turn.dialogues.map((dlg, dIdx) => (
                    <div key={dIdx} className="text-xs">
                      <strong className="text-brand-glow">{dlg.speaker}:</strong>{' '}
                      <span className="italic text-dark-text/90">"{dlg.text}"</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Taken */}
              {turn.customActionText && (
                <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-xs">
                  <span className="font-semibold text-indigo-400">Custom Action: </span>
                  <span className="italic text-dark-text">"{turn.customActionText}"</span>
                  {turn.outcomeText && (
                    <p className="text-[11px] text-indigo-300 mt-1">{turn.outcomeText}</p>
                  )}
                </div>
              )}

              {turn.selectedChoiceId && (
                <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs">
                  <span className="font-semibold text-amber-400">Branch Selected: </span>
                  <span className="text-dark-text">
                    {turn.choices.find(c => c.choiceId === turn.selectedChoiceId)?.text}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
