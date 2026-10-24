import React, { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';

interface CustomActionInputProps {
  onSubmitAction: (actionText: string) => void;
  isLoading?: boolean;
}

const QUICK_ACTIONS = [
  "I distract the guards, rescue the villagers, and secretly search for evidence.",
  "I channel my primary power to break through the front line.",
  "I slip into the shadows and look for an alternate escape route.",
  "I attempt to negotiate and uncover who sent them."
];

export const CustomActionInput: React.FC<CustomActionInputProps> = ({
  onSubmitAction,
  isLoading = false
}) => {
  const [actionText, setActionText] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionText.trim() || isLoading) return;
    const text = actionText.trim();
    onSubmitAction(text);
    setActionText('');
    setShowSuggestions(false);
  };

  const selectSuggestion = (suggestion: string) => {
    setActionText(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="bg-dark-surface/95 backdrop-blur-md border-t border-dark-border/80 p-3 safe-area-bottom">
      <div className="max-w-md mx-auto space-y-2">
        {/* Suggestion Toggle */}
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-semibold text-dark-muted flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-brand-accent" /> Custom Action
          </span>
          <button
            type="button"
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="text-[11px] text-brand-primary hover:underline"
          >
            {showSuggestions ? 'Hide Ideas' : 'Inspire Me'}
          </button>
        </div>

        {/* Suggestion Chips */}
        {showSuggestions && (
          <div className="flex flex-col gap-1.5 p-2 bg-dark-elevated/70 border border-dark-border rounded-xl animate-in fade-in">
            {QUICK_ACTIONS.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => selectSuggestion(s)}
                className="text-left text-xs text-dark-text hover:text-brand-glow p-1.5 rounded-lg hover:bg-dark-surface transition-colors"
              >
                "{s}"
              </button>
            ))}
          </div>
        )}

        {/* Input Form with guaranteed >= 16px font to prevent mobile zoom */}
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
          <div className="relative flex-1">
            <input
              type="text"
              value={actionText}
              onChange={(e) => setActionText(e.target.value)}
              placeholder="What will you do? (e.g. distract, rescue, attack)"
              disabled={isLoading}
              style={{ fontSize: '16px' }}
              className="w-full bg-dark-elevated border border-dark-border rounded-xl px-3.5 py-2.5 text-dark-text placeholder:text-dark-muted/50 focus:outline-none focus:border-brand-primary pr-3 disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={!actionText.trim() || isLoading}
            className="min-w-[44px] min-h-[44px] rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white flex items-center justify-center transition-all disabled:opacity-40 active:scale-95 shadow-glow-sm shrink-0"
            aria-label="Send custom action"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
