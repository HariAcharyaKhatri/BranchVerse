import React, { useState } from 'react';
import { StorySettings, SupportedLanguage, LANGUAGE_LABELS } from '../types/story';
import { ScreenHeader } from '../components/navigation/ScreenHeader';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Play, Sparkles, Cpu, BookOpen, Globe, AlertTriangle, RefreshCw } from 'lucide-react';
import { useI18n } from '../i18n';

interface StorySettingsPageProps {
  defaultTitle: string;
  onLaunchStory: (params: {
    title: string;
    settings: StorySettings;
    generationMode: 'demo' | 'ai';
  }) => void;
  onBack: () => void;
  isGenerating?: boolean;
  launchError?: { title: string; message: string; retryable: boolean } | null;
  onDismissError?: () => void;
  onSwitchToDemoAndLaunch?: () => void;
}

const TONES: StorySettings['tone'][] = [
  'Anime Shonen',
  'Epic Fantasy',
  'Dark & Gritty',
  'Cyberpunk Noir',
  'Lighthearted Isekai'
];

const PACINGS: StorySettings['pacing'][] = [
  'Fast-paced Action',
  'Balanced Narrative',
  'Deep Lore Exploration'
];

const DIFFICULTIES: StorySettings['difficulty'][] = [
  'Adventurer (Standard)',
  'Heroic (Tactical)',
  'Hardcore Iron (Unforgiving)'
];

export const StorySettingsPage: React.FC<StorySettingsPageProps> = ({
  defaultTitle,
  onLaunchStory,
  onBack,
  isGenerating = false,
  launchError = null,
  onDismissError,
  onSwitchToDemoAndLaunch,
}) => {
  const { t, language: appLang } = useI18n();
  const [title, setTitle] = useState(defaultTitle);
  const [tone, setTone] = useState<StorySettings['tone']>('Epic Fantasy');
  const [pacing, setPacing] = useState<StorySettings['pacing']>('Balanced Narrative');
  const [difficulty, setDifficulty] = useState<StorySettings['difficulty']>('Adventurer (Standard)');
  const [storyLanguage, setStoryLanguage] = useState<SupportedLanguage>(appLang || 'en');
  const [generationMode, setGenerationMode] = useState<'demo' | 'ai'>('ai');

  const handleLaunch = () => {
    onLaunchStory({
      title: title.trim() || defaultTitle,
      settings: {
        tone,
        pacing,
        difficulty,
        storyLanguage,
      },
      generationMode,
    });
  };

  return (
    <div className="flex flex-col h-full bg-dark-bg">
      <ScreenHeader
        title={t.create.stepSettings}
        subtitle="Tone, language, and narrative engine"
        onBack={onBack}
      />

      <div className="flex-1 p-4 overflow-y-auto overscroll-contain max-w-md mx-auto w-full space-y-4">
        {/* Story Title */}
        <div>
          <label className="block text-xs font-semibold text-dark-muted mb-1">
            Story Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-dark-elevated border border-dark-border rounded-xl px-3.5 py-2.5 text-sm text-dark-text focus:outline-none focus:border-brand-primary font-medium"
          />
        </div>

        {/* Story Language Selection */}
        <div>
          <label className="block text-xs font-semibold text-dark-muted mb-1 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-brand-primary" /> {t.create.storyLanguage}
          </label>
          <p className="text-[11px] text-dark-muted/80 mb-2">
            {t.create.storyLanguageDesc}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(LANGUAGE_LABELS) as SupportedLanguage[]).map((langKey) => (
              <button
                key={langKey}
                type="button"
                onClick={() => setStoryLanguage(langKey)}
                className={`p-2 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                  storyLanguage === langKey
                    ? 'bg-brand-primary/20 border-brand-primary text-white font-semibold'
                    : 'bg-dark-surface border-dark-border text-dark-muted hover:border-dark-muted'
                }`}
              >
                <span>{LANGUAGE_LABELS[langKey].flag}</span>
                <span className="truncate">{LANGUAGE_LABELS[langKey].native}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Story Generation Engine Mode */}
        <div>
          <label className="block text-xs font-semibold text-dark-muted mb-1 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-brand-glow" /> {t.create.generationMode}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setGenerationMode('ai')}
              className={`p-3 rounded-xl border text-left transition-all space-y-1 ${
                generationMode === 'ai'
                  ? 'bg-brand-primary/20 border-brand-primary ring-1 ring-brand-primary/50 text-white'
                  : 'bg-dark-surface border-dark-border text-dark-muted hover:border-dark-muted'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs text-brand-glow">
                <Sparkles className="w-3.5 h-3.5 text-brand-accent" /> Live AI Chronicle
              </div>
              <p className="text-[10px] text-dark-muted leading-tight">
                Gemini 3.8 Flash + 3.1 Flash-Lite dual routing.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setGenerationMode('demo')}
              className={`p-3 rounded-xl border text-left transition-all space-y-1 ${
                generationMode === 'demo'
                  ? 'bg-amber-500/20 border-amber-500 ring-1 ring-amber-500/50 text-amber-200'
                  : 'bg-dark-surface border-dark-border text-dark-muted hover:border-dark-muted'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs text-amber-400">
                <BookOpen className="w-3.5 h-3.5" /> Local Demo Mode
              </div>
              <p className="text-[10px] text-dark-muted leading-tight">
                Offline deterministic scenario with zero API limits.
              </p>
            </button>
          </div>
        </div>

        {/* Narrative Tone */}
        <div>
          <label className="block text-xs font-semibold text-dark-muted mb-1.5">
            Narrative Tone
          </label>
          <div className="grid grid-cols-2 gap-2">
            {TONES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTone(t)}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                  tone === t
                    ? 'bg-brand-primary/20 border-brand-primary text-white font-semibold'
                    : 'bg-dark-surface border-dark-border text-dark-muted hover:border-dark-muted'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Story Pacing */}
        <div>
          <label className="block text-xs font-semibold text-dark-muted mb-1.5">
            Pacing & Progression
          </label>
          <div className="space-y-1.5">
            {PACINGS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPacing(p)}
                className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all ${
                  pacing === p
                    ? 'bg-brand-primary/20 border-brand-primary text-white font-semibold'
                    : 'bg-dark-surface border-dark-border text-dark-muted hover:border-dark-muted'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-xs font-semibold text-dark-muted mb-1.5">
            Rules & Consequence Severity
          </label>
          <div className="space-y-1.5">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all ${
                  difficulty === d
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                    : 'bg-dark-surface border-dark-border text-dark-muted hover:border-dark-muted'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-dark-border/60 bg-dark-surface/90 safe-area-bottom">
        <div className="max-w-md mx-auto">
          <Button
            variant="amber"
            fullWidth
            size="lg"
            onClick={handleLaunch}
            disabled={isGenerating}
            iconLeft={
              isGenerating ? (
                <span className="w-5 h-5 border-2 border-dark-bg border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play className="w-5 h-5 fill-current" />
              )
            }
          >
            {isGenerating ? t.create.generatingStory : t.create.launchStory}
          </Button>
        </div>
      </div>
      {/* Initial AI Generation Failure Modal */}
      {launchError && (
        <Modal
          isOpen={true}
          onClose={onDismissError || (() => {})}
          title={launchError.title || 'AI Story Generation Notice'}
          maxWidth="sm"
          footer={
            <div className="flex flex-col gap-2 w-full">
              {launchError.retryable && (
                <Button
                  variant="primary"
                  onClick={handleLaunch}
                  disabled={isGenerating}
                  className="w-full justify-center"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Retry with Gemini 3.8 Flash
                </Button>
              )}
              {onSwitchToDemoAndLaunch && (
                <Button
                  variant="amber"
                  onClick={onSwitchToDemoAndLaunch}
                  disabled={isGenerating}
                  className="w-full justify-center text-xs"
                >
                  <BookOpen className="w-3.5 h-3.5 mr-1.5" /> Continue in Local Demo Mode
                </Button>
              )}
              <Button
                variant="outline"
                onClick={onDismissError || (() => {})}
                className="w-full justify-center text-xs"
              >
                Cancel
              </Button>
            </div>
          }
        >
          <div className="p-4 space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-white">{launchError.title}</p>
                <p className="text-amber-200/90 leading-relaxed">{launchError.message}</p>
              </div>
            </div>
            <p className="text-dark-muted leading-relaxed">
              Your hero and settings are completely preserved. You can retry calling Gemini or switch to Local Demo Mode to immediately start your chronicle offline.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};
