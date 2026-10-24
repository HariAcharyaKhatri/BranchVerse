import React, { useRef, useEffect } from 'react';
import { StoryDocument, LANGUAGE_LABELS } from '../../types/story';
import { ChoiceList } from './ChoiceList';
import { CustomActionInput } from './CustomActionInput';
import { getSceneBackground, getCharacterPortrait } from '../../features/assets/assetSelector';
import { Sparkles, Sword, Shield, Flame, Zap, Eye, Cpu, Crown, Compass, BookOpen } from 'lucide-react';
import { useI18n } from '../../i18n';

interface NarrativeReaderProps {
  story: StoryDocument;
  onSelectChoice: (choiceId: string) => void;
  onSubmitAction: (actionText: string) => void;
  isLoading?: boolean;
  fontSize?: number; // 14 to 20
  fontFamily?: 'serif' | 'sans';
}

export const NarrativeReader: React.FC<NarrativeReaderProps> = ({
  story,
  onSelectChoice,
  onSubmitAction,
  isLoading = false,
  fontSize = 16,
  fontFamily = 'serif'
}) => {
  const { t } = useI18n();
  const narrativeEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    narrativeEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [story.turns.length]);

  const getVisualIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Flame': return <Flame className="w-5 h-5 text-amber-500" />;
      case 'Sword': return <Sword className="w-5 h-5 text-indigo-400" />;
      case 'Shield': return <Shield className="w-5 h-5 text-emerald-400" />;
      case 'Zap': return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'Eye': return <Eye className="w-5 h-5 text-purple-400" />;
      case 'Cpu': return <Cpu className="w-5 h-5 text-cyan-400" />;
      case 'Crown': return <Crown className="w-5 h-5 text-amber-400" />;
      case 'Compass': return <Compass className="w-5 h-5 text-blue-400" />;
      default: return <Sparkles className="w-5 h-5 text-brand-primary" />;
    }
  };

  const currentTurn = story.turns[story.turns.length - 1];
  const isFontSerif = fontFamily === 'serif';

  return (
    <div className="flex flex-col min-h-full">
      {/* Scrollable Story Body */}
      <div className="flex-1 px-4 py-4 max-w-xl mx-auto w-full space-y-6">
        {/* Story Title & Setting Banner */}
        <div className="text-center py-3 border-b border-dark-border/40 space-y-1.5">
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-widest text-brand-accent">
              {story.worldName} • {story.genres[0]}
            </span>
            {story.generationMode === 'ai' ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-primary/20 text-brand-glow border border-brand-primary/40 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-brand-accent" /> {t.common.modeAI}
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> {t.common.modeDemo}
              </span>
            )}
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-dark-elevated text-dark-muted border border-dark-border font-medium">
              {LANGUAGE_LABELS[story.storyLanguage || 'en']?.flag} {LANGUAGE_LABELS[story.storyLanguage || 'en']?.native}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-dark-text tracking-tight">
            {story.title}
          </h2>
          <p className="text-xs text-dark-muted">
            Hero: <strong className="text-dark-text">{story.hero.name}</strong> • Level {story.state.powerLevel}
          </p>
        </div>

        {/* Narrative Turns Chronology */}
        {story.turns.map((turn, index) => {
          const isLatest = index === story.turns.length - 1;

          // Match local anime background artwork for this turn
          const bgAsset = getSceneBackground({
            sceneTitle: turn.sceneTitle,
            narrativeText: turn.narrativeText,
            worldId: story.worldId,
            genres: story.genres
          });

          return (
            <article
              key={turn.turnId}
              className={`space-y-4 animate-in fade-in duration-300 ${
                !isLatest ? 'opacity-90' : ''
              }`}
            >
              {/* Scene Visual Novel Illustration Banner */}
              <div className="relative rounded-2xl overflow-hidden border border-dark-border shadow-lg group">
                <div className="aspect-[16/9] w-full bg-dark-surface relative">
                  <img
                    src={bgAsset.path}
                    alt={bgAsset.title}
                    loading={isLatest ? 'eager' : 'lazy'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => {
                      // Fallback to placeholder SVG if any path issue occurs
                      (e.target as HTMLImageElement).src = '/assets/placeholders/default_scene.svg';
                    }}
                  />
                  {/* Subtle dark gradient overlay to ensure text contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/30 to-transparent" />

                  {/* Scene Title overlay on illustration */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-dark-surface/80 backdrop-blur-md border border-dark-border/80 flex items-center justify-center shrink-0 shadow-sm">
                        {getVisualIcon(turn.ambientVisual)}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-brand-glow uppercase tracking-wide">
                          Chapter {turn.chapterNumber}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-white leading-tight drop-shadow-md">
                          {turn.sceneTitle}
                        </h3>
                      </div>
                    </div>

                    <span className="text-[9px] text-dark-muted/80 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/10 shrink-0">
                      {bgAsset.title}
                    </span>
                  </div>
                </div>
              </div>

              {/* Narrative Text */}
              <div
                style={{ fontSize: `${fontSize}px` }}
                className={`text-dark-text leading-relaxed px-1 ${
                  isFontSerif ? 'font-narrative' : 'font-sans'
                }`}
              >
                {turn.narrativeText}
              </div>

              {/* Visual Novel Character Dialogue Bubbles with Character Sprites */}
              {turn.dialogues && turn.dialogues.length > 0 && (
                <div className="space-y-3 my-4">
                  {turn.dialogues.map((dlg, dIdx) => {
                    const portrait = getCharacterPortrait(dlg.speaker, story.hero, dlg.emotion);

                    return (
                      <div
                        key={dIdx}
                        className="flex items-start gap-3 p-3 rounded-2xl bg-dark-surface/90 border border-dark-border shadow-sm hover:border-brand-primary/40 transition-colors"
                      >
                        {/* Character Avatar Portrait */}
                        {portrait && (
                          <div className="relative shrink-0 w-12 h-14 rounded-xl overflow-hidden bg-dark-elevated border-2 border-brand-primary/40 shadow-sm">
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

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-brand-glow tracking-tight">
                              {dlg.speaker}
                            </span>
                            {dlg.emotion && (
                              <span className="text-[10px] capitalize text-dark-muted bg-dark-elevated px-1.5 py-0.5 rounded border border-dark-border">
                                {dlg.emotion}
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-dark-text/95 italic leading-snug">
                            "{dlg.text}"
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Previous Turn's Choice or Action Taken */}
              {turn.customActionText && (
                <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs space-y-1">
                  <span className="font-semibold text-indigo-400">Your Action:</span>
                  <p className="text-dark-text italic">"{turn.customActionText}"</p>
                  {turn.outcomeText && (
                    <p className="text-indigo-300/90 text-[11px] mt-1">{turn.outcomeText}</p>
                  )}
                </div>
              )}

              {turn.selectedChoiceId && (
                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs">
                  <span className="font-semibold text-amber-400">Chosen Path: </span>
                  <span className="text-dark-text">
                    {turn.choices.find(c => c.choiceId === turn.selectedChoiceId)?.text}
                  </span>
                </div>
              )}

              {/* Scene Divider */}
              {!isLatest && (
                <div className="flex items-center justify-center gap-2 py-4 text-dark-border">
                  <div className="w-12 h-px bg-dark-border" />
                  <span className="text-xs">•</span>
                  <div className="w-12 h-px bg-dark-border" />
                </div>
              )}
            </article>
          );
        })}

        {/* AI Generation / Processing Feedback */}
        {isLoading && (
          <div className="p-3.5 rounded-xl bg-brand-primary/10 border border-brand-primary/30 flex items-center justify-center gap-2.5 text-xs text-brand-glow animate-pulse">
            <span className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
            <span>{t.reader.aiThinking}</span>
          </div>
        )}

        {/* Current Turn Choices (at the bottom of latest chapter) */}
        {currentTurn && !story.state.isGameOver && (
          <div className="pt-2 border-t border-dark-border/40">
            <ChoiceList
              choices={currentTurn.choices}
              onSelectChoice={onSelectChoice}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Game Over Screen */}
        {story.state.isGameOver && (
          <div className="p-6 rounded-2xl bg-dark-surface border border-brand-accent/30 text-center space-y-3 glow-card-amber my-6">
            <Crown className="w-8 h-8 text-brand-accent mx-auto" />
            <h3 className="text-lg font-bold text-dark-text">Chronicle Concluded</h3>
            <p className="text-xs text-dark-muted">
              {story.state.endingType === 'tragedy'
                ? 'Your hero fell in battle, leaving their name etched in legend.'
                : 'You have triumphed and completed this narrative branch!'}
            </p>
          </div>
        )}

        <div ref={narrativeEndRef} className="h-6" />
      </div>

      {/* Sticky Custom Action Input at Bottom */}
      {!story.state.isGameOver && (
        <div className="sticky bottom-0 left-0 right-0 z-30">
          <CustomActionInput
            onSubmitAction={onSubmitAction}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
};
