import React, { useState, useEffect } from 'react';
import { StoryDocument } from '../types/story';
import { SaveStatus } from '../types/storage';
import { storyRepository } from '../lib/storage/storyRepository';
import { executeStoryTurn, executeAdvancedStoryTurn } from '../features/story/storyEngine';
import { LocalNarrativeProvider, AiNarrativeError, classifyAiError, AiFailureDetails } from '../engine';
import { NarrativeReader } from '../components/story/NarrativeReader';
import { CharacterSheetDrawer } from '../components/story/CharacterSheetDrawer';
import { SaveIndicator } from '../components/story/SaveIndicator';
import { ExportModal } from '../components/history/ExportModal';
import { FateDiceRoller } from '../components/story/FateDiceRoller';
import { AtmosphereSoundscape } from '../components/story/AtmosphereSoundscape';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { ChevronLeft, Shield, FileText, Download, AlertCircle, AlertTriangle, RefreshCw } from 'lucide-react';

interface PendingTurnAction {
  type: 'choice' | 'custom';
  choiceId?: string;
  customActionText?: string;
}

interface FailureState extends AiFailureDetails {
  pendingAction: PendingTurnAction;
}

interface ReaderPageProps {
  storyId: string;
  onExit: () => void;
  onViewTranscript: (storyId: string) => void;
}

export const ReaderPage: React.FC<ReaderPageProps> = ({
  storyId,
  onExit,
  onViewTranscript
}) => {
  const [story, setStory] = useState<StoryDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingTurn, setIsProcessingTurn] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<number>(() => Date.now());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [aiFailureState, setAiFailureState] = useState<FailureState | null>(null);

  // User reading preferences
  const fontSize = parseInt(localStorage.getItem('bv_font_size') || '16', 10);
  const fontFamily = (localStorage.getItem('bv_font_family') as any) || 'serif';

  // Load story from IndexedDB on mount
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setErrorMessage(null);

    storyRepository.getStory(storyId)
      .then(doc => {
        if (!isMounted) return;
        if (!doc) {
          setErrorMessage('Story not found or corrupted.');
        } else {
          setStory(doc);
        }
      })
      .catch(err => {
        if (!isMounted) return;
        setErrorMessage(`Failed to load story: ${err.message}`);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [storyId]);

  const handleSelectChoice = async (choiceId: string) => {
    if (!story || isProcessingTurn) return;

    setIsProcessingTurn(true);
    setSaveStatus('saving');
    try {
      let updatedStory: StoryDocument;
      if (story.generationMode === 'ai') {
        const result = await executeAdvancedStoryTurn(story, { choiceId });
        updatedStory = result.updatedStory;
      } else {
        try {
          const result = executeStoryTurn(story, { choiceId });
          updatedStory = result.updatedStory;
        } catch {
          const result = await executeAdvancedStoryTurn(story, { choiceId }, new LocalNarrativeProvider());
          updatedStory = result.updatedStory;
        }
      }

      setStory(updatedStory);
      await storyRepository.saveStory(updatedStory);
      setSaveStatus('saved');
      setLastSavedAt(Date.now());
    } catch (err: any) {
      console.error('Turn execution error:', err);
      setSaveStatus('error');
      const details = err instanceof AiNarrativeError ? err.details : classifyAiError(err);
      setAiFailureState({
        ...details,
        pendingAction: { type: 'choice', choiceId }
      });
    } finally {
      setIsProcessingTurn(false);
    }
  };

  const handleSubmitCustomAction = async (actionText: string) => {
    if (!story || isProcessingTurn) return;

    setIsProcessingTurn(true);
    setSaveStatus('saving');
    try {
      let updatedStory: StoryDocument;
      if (story.generationMode === 'ai') {
        const result = await executeAdvancedStoryTurn(story, { customActionText: actionText });
        updatedStory = result.updatedStory;
      } else {
        try {
          const result = await executeAdvancedStoryTurn(story, { customActionText: actionText }, new LocalNarrativeProvider());
          updatedStory = result.updatedStory;
        } catch {
          const result = executeStoryTurn(story, { customActionText: actionText });
          updatedStory = result.updatedStory;
        }
      }

      setStory(updatedStory);
      await storyRepository.saveStory(updatedStory);
      setSaveStatus('saved');
      setLastSavedAt(Date.now());
    } catch (err: any) {
      console.error('Custom action turn execution error:', err);
      setSaveStatus('error');
      const details = err instanceof AiNarrativeError ? err.details : classifyAiError(err);
      setAiFailureState({
        ...details,
        pendingAction: { type: 'custom', customActionText: actionText }
      });
    } finally {
      setIsProcessingTurn(false);
    }
  };

  const handleRetryAction = () => {
    if (!aiFailureState) return;
    const pending = aiFailureState.pendingAction;
    setAiFailureState(null);
    if (pending.type === 'choice' && pending.choiceId) {
      handleSelectChoice(pending.choiceId);
    } else if (pending.type === 'custom' && pending.customActionText) {
      handleSubmitCustomAction(pending.customActionText);
    }
  };

  const handleUseItem = async (itemId: string) => {
    if (!story) return;
    const item = story.state.inventory.find(i => i.id === itemId);
    if (!item) return;

    // Use consumable to restore stamina
    const staminaGain = 35;

    const nextInventory = story.state.inventory
      .map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i)
      .filter(i => i.quantity > 0);

    const nextState = {
      ...story.state,
      stamina: Math.min(100, story.state.stamina + staminaGain),
      inventory: nextInventory
    };

    const updatedStory: StoryDocument = {
      ...story,
      state: nextState,
      updatedAt: Date.now()
    };

    setStory(updatedStory);
    await storyRepository.saveStory(updatedStory);
    setSaveStatus('saved');
    setLastSavedAt(Date.now());
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-3 bg-dark-bg">
        <span className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-dark-muted font-medium">Opening Chronicle...</p>
      </div>
    );
  }

  if (errorMessage && !story) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-4 bg-dark-bg">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-sm text-dark-text font-semibold">{errorMessage}</p>
        <button
          onClick={onExit}
          className="px-4 py-2 rounded-xl bg-dark-elevated border border-dark-border text-xs text-dark-text"
        >
          Return to Home
        </button>
      </div>
    );
  }

  if (!story) return null;

  return (
    <div className="flex flex-col h-full bg-dark-bg">
      {/* Sticky Reader Header */}
      <header className="sticky top-0 z-30 bg-dark-surface/95 backdrop-blur-md border-b border-dark-border/80 safe-area-top">
        <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <button
              onClick={onExit}
              className="p-1.5 -ml-1 rounded-xl text-dark-muted hover:text-dark-text hover:bg-dark-elevated transition-colors"
              aria-label="Exit reader"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="truncate">
              <h2 className="font-bold text-sm text-dark-text truncate leading-tight">
                {story.title}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-dark-muted">Ch. {story.turns.length}</span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                  story.generationMode === 'ai'
                    ? 'bg-brand-primary/10 text-brand-glow border-brand-primary/30'
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                }`}>
                  {story.generationMode === 'ai' ? 'Live AI' : 'Local Demo'}
                </span>
                <SaveIndicator status={saveStatus} lastSavedAt={lastSavedAt} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* D20 Fate Check Dice Roller */}
            <FateDiceRoller
              heroName={story.hero.name}
              powerLevel={story.state.powerLevel}
              onApplyToCustomAction={handleSubmitCustomAction}
            />

            {/* Ambient Soundscape Synthesizer */}
            <AtmosphereSoundscape />

            {/* Character Sheet Trigger */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 rounded-xl bg-dark-elevated border border-dark-border text-dark-text hover:border-brand-primary transition-all active:scale-95 flex items-center gap-1.5 text-xs font-semibold"
              aria-label="Open Hero Sheet"
            >
              <Shield className="w-4 h-4 text-brand-primary" />
              <span className="hidden sm:inline">Hero</span>
              <span className="text-[10px] text-amber-400 font-bold">{story.state.stamina} ST</span>
            </button>

            {/* View Transcript */}
            <button
              onClick={() => onViewTranscript(story.id)}
              className="p-2 rounded-xl text-dark-muted hover:text-dark-text hover:bg-dark-elevated"
              aria-label="Story Transcript"
            >
              <FileText className="w-4 h-4" />
            </button>

            {/* Export & Backup */}
            <button
              onClick={() => setIsExportOpen(true)}
              className="p-2 rounded-xl text-dark-muted hover:text-dark-text hover:bg-dark-elevated"
              aria-label="Export Story"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Floating Error Toast */}
      {errorMessage && (
        <div className="fixed top-16 left-4 right-4 z-50 max-w-sm mx-auto p-3 bg-red-950/90 border border-red-500/50 rounded-xl text-xs text-red-200 flex items-center gap-2 shadow-2xl animate-in slide-in-from-top">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Narrative Area with Natural Scroll */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <NarrativeReader
          story={story}
          onSelectChoice={handleSelectChoice}
          onSubmitAction={handleSubmitCustomAction}
          isLoading={isProcessingTurn}
          fontSize={fontSize}
          fontFamily={fontFamily}
        />
      </div>

      {/* Hero Stats & Inventory Bottom Sheet Drawer */}
      <CharacterSheetDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        hero={story.hero}
        state={story.state}
        onUseItem={handleUseItem}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        story={story}
      />

      {/* Live AI Failure & Recovery Modal */}
      {aiFailureState && (
        <Modal
          isOpen={true}
          onClose={() => setAiFailureState(null)}
          title={aiFailureState.title || 'Live AI Turn Notice'}
          maxWidth="sm"
          footer={
            <div className="flex flex-col gap-2 w-full">
              {aiFailureState.retryable && (
                <Button
                  variant="primary"
                  onClick={handleRetryAction}
                  disabled={isProcessingTurn}
                  className="w-full justify-center"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Retry Turn with Gemini
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setAiFailureState(null)}
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
                <p className="font-semibold text-white">{aiFailureState.title}</p>
                <p className="text-amber-200/90 leading-relaxed">{aiFailureState.message}</p>
              </div>
            </div>
            <p className="text-dark-muted leading-relaxed">
              Your story state has been preserved. Please retry to continue weaving your tale with Gemini AI.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};
