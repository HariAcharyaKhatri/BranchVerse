import React, { useState, useEffect } from 'react';
import { ChoiceOption, NpcRelationship } from '../../types/story';
import { ChoiceList } from './ChoiceList';
import {
  ListChecks,
  Activity,
  MessageSquare,
  Send,
  Sparkles,
  User,
  XCircle
} from 'lucide-react';

interface BottomInteractionAreaProps {
  choices: ChoiceOption[];
  onSelectChoice: (choiceId: string) => void;
  onSubmitAction: (actionText: string, actionType: 'action' | 'dialogue' | 'thought', targetNpc?: string) => void;
  onCancelGeneration?: () => void;
  isLoading: boolean;
  knownNpcs?: string[];
  npcRelationships?: Record<string, NpcRelationship> | NpcRelationship[];
  isGameOver?: boolean;
}

const ACTION_SUGGESTIONS = [
  "I draw my blade, stepping between the wounded villagers and the threat.",
  "I cast a protective ward and look around for an escape path.",
  "I silently slip into the shadows to flank the enemy vanguard.",
  "I analyze the magical residue etched into the stone."
];

const DIALOGUE_SUGGESTIONS = [
  "I don't trust you. Tell me what happened here.",
  "Lower your weapons. We don't have to be enemies.",
  "Who sent you, and what are they planning next?",
  "I will stand by you until this crisis is resolved."
];

export const BottomInteractionArea: React.FC<BottomInteractionAreaProps> = ({
  choices,
  onSelectChoice,
  onSubmitAction,
  onCancelGeneration,
  isLoading,
  knownNpcs = [],
  npcRelationships: _npcRelationships = [],
  isGameOver = false
}) => {
  const [activeTab, setActiveTab] = useState<'choices' | 'action' | 'speak'>('choices');
  const [actionText, setActionText] = useState('');
  const [dialogueText, setDialogueText] = useState('');
  const [targetNpc, setTargetNpc] = useState<string>('');
  const [showInspiration, setShowInspiration] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Timer for generation feedback
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isLoading) {
      setElapsedSeconds(0);
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  // Set default target NPC if available
  useEffect(() => {
    if (knownNpcs.length > 0 && !targetNpc) {
      setTargetNpc(knownNpcs[0]);
    }
  }, [knownNpcs, targetNpc]);

  if (isGameOver) {
    return null;
  }

  const handleActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionText.trim() || isLoading) return;
    const text = actionText.trim();
    onSubmitAction(text, 'action');
    setActionText('');
    setShowInspiration(false);
  };

  const handleDialogueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dialogueText.trim() || isLoading) return;
    const text = dialogueText.trim();
    onSubmitAction(text, 'dialogue', targetNpc || undefined);
    setDialogueText('');
    setShowInspiration(false);
  };

  return (
    <div
      className="relative w-full max-w-2xl mx-auto mt-6 pt-5 pb-8 border-t border-dark-border/70 safe-area-bottom animate-in fade-in"
      data-testid="story-choices-area"
    >
      <div className="space-y-3">
        {/* Loading Overlay / Progress Status */}
        {isLoading ? (
          <div className="p-3.5 rounded-2xl bg-brand-primary/10 border border-brand-primary/40 flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3">
              <span className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin shrink-0" />
              <div>
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  Gemini AI is weaving next chapter... ({elapsedSeconds}s)
                </p>
                <p className="text-[11px] text-indigo-300">Evaluating world consequences & dialogue</p>
              </div>
            </div>

            {onCancelGeneration && (
              <button
                type="button"
                onClick={onCancelGeneration}
                className="px-3 py-1.5 rounded-xl bg-red-950/60 border border-red-500/40 hover:bg-red-900/60 text-red-200 text-xs font-semibold flex items-center gap-1 transition-all active:scale-95"
              >
                <XCircle className="w-3.5 h-3.5 text-red-400" /> Cancel
              </button>
            )}
          </div>
        ) : (
          <>
            {/* 3 Interaction Tabs */}
            <div className="flex items-center justify-between gap-1 p-1 bg-dark-bg/80 border border-dark-border rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('choices')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'choices'
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'text-dark-muted hover:text-white'
                }`}
              >
                <ListChecks className="w-3.5 h-3.5" />
                <span>Choices ({choices.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('action')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'action'
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'text-dark-muted hover:text-white'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Action</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('speak')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'speak'
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'text-dark-muted hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Speak</span>
              </button>
            </div>

            {/* TAB 1: CHOICES */}
            {activeTab === 'choices' && (
              <div className="animate-in fade-in duration-150">
                <ChoiceList
                  choices={choices}
                  onSelectChoice={onSelectChoice}
                  isLoading={isLoading}
                />
              </div>
            )}

            {/* TAB 2: FREE ACTION */}
            {activeTab === 'action' && (
              <div className="space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center justify-between px-1 text-[11px] text-dark-muted">
                  <span className="flex items-center gap-1">
                    <Activity className="w-3 h-3 text-brand-primary" /> Describe any physical action
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowInspiration(!showInspiration)}
                    className="text-brand-glow hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    {showInspiration ? 'Hide Ideas' : 'Inspire Me'}
                  </button>
                </div>

                {showInspiration && (
                  <div className="p-2 rounded-xl bg-dark-elevated border border-dark-border space-y-1.5 text-xs animate-in fade-in">
                    {ACTION_SUGGESTIONS.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => { setActionText(s); setShowInspiration(false); }}
                        className="w-full text-left p-1.5 rounded-lg hover:bg-dark-surface text-dark-muted hover:text-white transition-colors"
                      >
                        "{s}"
                      </button>
                    ))}
                  </div>
                )}

                <form onSubmit={handleActionSubmit} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={actionText}
                    onChange={e => setActionText(e.target.value)}
                    placeholder="What will you do? (e.g. examine the door, sneak around, attack)"
                    disabled={isLoading}
                    style={{ fontSize: '16px' }}
                    className="flex-1 bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2.5 text-white placeholder:text-dark-muted/50 focus:outline-none focus:border-brand-primary disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!actionText.trim() || isLoading}
                    className="w-11 h-11 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white flex items-center justify-center transition-all disabled:opacity-40 active:scale-95 shrink-0 shadow-md shadow-brand-primary/30"
                    aria-label="Submit action"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* TAB 3: SPEAK / DIALOGUE */}
            {activeTab === 'speak' && (
              <div className="space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center justify-between px-1 text-[11px] text-dark-muted">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3 h-3 text-emerald-400" />
                    <span>Talk to:</span>
                    {knownNpcs.length > 0 ? (
                      <select
                        value={targetNpc}
                        onChange={e => setTargetNpc(e.target.value)}
                        className="bg-dark-bg border border-dark-border rounded-lg px-2 py-0.5 text-xs text-white focus:outline-none focus:border-brand-primary"
                      >
                        <option value="">Anyone nearby</option>
                        {knownNpcs.map(npc => (
                          <option key={npc} value={npc}>
                            {npc}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-white font-medium">Anyone nearby</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowInspiration(!showInspiration)}
                    className="text-brand-glow hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    {showInspiration ? 'Hide' : 'Lines'}
                  </button>
                </div>

                {showInspiration && (
                  <div className="p-2 rounded-xl bg-dark-elevated border border-dark-border space-y-1.5 text-xs animate-in fade-in">
                    {DIALOGUE_SUGGESTIONS.map((d, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => { setDialogueText(d); setShowInspiration(false); }}
                        className="w-full text-left p-1.5 rounded-lg hover:bg-dark-surface text-dark-muted hover:text-white transition-colors"
                      >
                        "{d}"
                      </button>
                    ))}
                  </div>
                )}

                <form onSubmit={handleDialogueSubmit} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={dialogueText}
                    onChange={e => setDialogueText(e.target.value)}
                    placeholder="What do you say?"
                    disabled={isLoading}
                    style={{ fontSize: '16px' }}
                    className="flex-1 bg-dark-bg border border-dark-border rounded-xl px-3.5 py-2.5 text-white placeholder:text-dark-muted/50 focus:outline-none focus:border-brand-primary disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!dialogueText.trim() || isLoading}
                    className="w-11 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-all disabled:opacity-40 active:scale-95 shrink-0 shadow-md shadow-emerald-600/30"
                    aria-label="Speak dialogue"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
