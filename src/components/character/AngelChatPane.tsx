import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/Button';
import {
  Sparkles,
  Send,
  RefreshCw,
  AlertTriangle,
  Bot,
  User,
  Compass,
} from 'lucide-react';
import { AngelConversationMessage } from '../../features/character/angelService';

interface AngelChatPaneProps {
  messages: AngelConversationMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  apiError: { title: string; message: string; retryable: boolean } | null;
  onRetry: () => void;
  className?: string;
}

export const AngelChatPane: React.FC<AngelChatPaneProps> = ({
  messages,
  onSendMessage,
  isLoading,
  apiError,
  onRetry,
  className = '',
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, apiError]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const text = inputText.trim();
    setInputText('');
    onSendMessage(text);
  };

  const handleSelectOption = (action: string) => {
    if (isLoading) return;
    onSendMessage(action);
  };

  return (
    <div className={`flex flex-col bg-dark-surface/90 border border-dark-border/80 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden backdrop-blur-md ${className}`}>
      {/* Header with Celestial Online Indicator */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-dark-border/50 bg-dark-elevated/40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-amber-400 p-0.5 shadow-sm">
            <div className="w-full h-full bg-dark-surface rounded-[7px] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs sm:text-sm font-bold text-white font-serif tracking-wide">
                Angel
              </h3>
              <span className="text-[9px] font-mono font-bold text-amber-300 bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/20">
                Soul Architect
              </span>
            </div>
            <p className="text-[10px] text-dark-muted font-sans">
              Online AI Character Architect
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-mono text-emerald-300">Celestial Sync</span>
        </div>
      </div>

      {/* Message History Scroller */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 max-h-[380px] sm:max-h-[460px] touch-scroll">
        {messages.map((msg) => {
          const isAngel = msg.role === 'angel';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isAngel ? '' : 'flex-row-reverse'}`}
            >
              <div
                className={`w-6 h-6 rounded-lg shrink-0 flex items-center justify-center text-xs shadow-sm ${
                  isAngel
                    ? 'bg-gradient-to-tr from-violet-500 to-amber-400 text-white'
                    : 'bg-dark-elevated border border-dark-border text-dark-text'
                }`}
              >
                {isAngel ? <Sparkles className="w-3 h-3" /> : <User className="w-3 h-3" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                  isAngel
                    ? 'bg-dark-elevated/70 border border-dark-border text-dark-text shadow-sm'
                    : 'bg-brand-primary text-white shadow-sm'
                }`}
              >
                <div className="space-y-2 whitespace-pre-wrap font-sans">
                  {msg.text}
                </div>

                {/* Rule Violation / Cosmic Invariant Feedback */}
                {msg.ruleFeedback && !msg.ruleFeedback.valid && (
                  <div className="mt-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                    <span>{msg.ruleFeedback.reason || 'Cosmic balance rule applied.'}</span>
                  </div>
                )}

                {/* Interactive Suggestion Options */}
                {isAngel && msg.options && msg.options.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-dark-border/40 space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-amber-300 font-bold block">
                      Suggested Inquiries
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {msg.options.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => handleSelectOption(opt.action)}
                          disabled={isLoading}
                          className="px-2.5 py-1 rounded-xl bg-dark-surface/90 hover:bg-dark-surface border border-dark-border hover:border-amber-400/60 text-dark-text hover:text-white text-[11px] font-medium transition-all text-left flex items-center gap-1 active:scale-95 disabled:opacity-50"
                        >
                          <Compass className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                          <span>{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-dark-muted pl-8 animate-pulse">
            <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
            <span>Angel is listening and weaving soul possibilities...</span>
          </div>
        )}

        {/* Online API Connection Error Banner */}
        {apiError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{apiError.title}</span>
            </div>
            <p className="text-[11px] text-rose-200/90 leading-relaxed">
              {apiError.message}
            </p>
            <div className="pt-1">
              <Button
                variant="primary"
                size="sm"
                onClick={onRetry}
                className="gap-1 text-xs"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry Communion</span>
              </Button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={handleSubmit}
        className="p-2 sm:p-2.5 border-t border-dark-border/50 bg-dark-surface/90 flex items-center gap-2"
      >
        <input
          type="text"
          placeholder="Speak to Angel (e.g. 'I want to be an elven merchant with water magic')..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isLoading}
          className="flex-1 bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-xs text-white placeholder-dark-muted focus:outline-none focus:border-brand-primary disabled:opacity-50"
        />
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={!inputText.trim() || isLoading}
          className="px-3 shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </Button>
      </form>
    </div>
  );
};
