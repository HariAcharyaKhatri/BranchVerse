import React, { useState, useEffect, useRef } from 'react';
import { StoryDocument, NarrativeLength } from '../types/story';
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
import {
  ChevronLeft,
  Shield,
  FileText,
  Download,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Settings,
  BookOpen,
  Sliders,
  Type
} from 'lucide-react';

interface PendingTurnAction {
  type: 'choice' | 'action' | 'dialogue' | 'thought';
  choiceId?: string;
  customActionText?: string;
  targetNpc?: string;
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [aiFailureState, setAiFailureState] = useState<FailureState | null>(null);

  // User reading preferences
  const [fontSize, setFontSize] = useState<number>(() => {
    return parseInt(localStorage.getItem('bv_font_size') || '16', 10);
  });
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>(() => {
    return (localStorage.getItem('bv_font_family') as any) || 'serif';
  });

  // Active in-flight request cancellation ref
  const abortControllerRef = useRef<AbortController | null>(null);

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
      // Abort any pending generation when leaving page
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [storyId]);

  // Cancel generation handler
  const handleCancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsProcessingTurn(false);
    setSaveStatus('idle');
  };

  const handleSelectChoice = async (choiceId: string) => {
    if (!story || isProcessingTurn) return;

    handleCancelGeneration();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsProcessingTurn(true);
    setSaveStatus('saving');

    try {
      let updatedStory: StoryDocument;
      if (story.generationMode === 'ai') {
        const result = await executeAdvancedStoryTurn(story, {
          choiceId,
          actionType: 'choice',
          signal: controller.signal
        });
        updatedStory = result.updatedStory;
      } else {
        try {
          const result = executeStoryTurn(story, { choiceId });
          updatedStory = result.updatedStory;
        } catch {
          const result = await executeAdvancedStoryTurn(story, { choiceId, actionType: 'choice', signal: controller.signal }, new LocalNarrativeProvider());
          updatedStory = result.updatedStory;
        }
      }

      setStory(updatedStory);
      await storyRepository.saveStory(updatedStory);
      setSaveStatus('saved');
      setLastSavedAt(Date.now());
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Turn generation cancelled by user.');
        return;
      }
      console.error('Turn execution error:', err);
      setSaveStatus('error');
      const details = err instanceof AiNarrativeError ? err.details : classifyAiError(err);
      setAiFailureState({
        ...details,
        pendingAction: { type: 'choice', choiceId }
      });
    } finally {
      setIsProcessingTurn(false);
      abortControllerRef.current = null;
    }
  };

  const handleSubmitAction = async (
    actionText: string,
    actionType: 'action' | 'dialogue' | 'thought' = 'action',
    targetNpc?: string
  ) => {
    if (!story || isProcessingTurn) return;

    handleCancelGeneration();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsProcessingTurn(true);
    setSaveStatus('saving');

    try {
      let updatedStory: StoryDocument;
      if (story.generationMode === 'ai') {
        const result = await executeAdvancedStoryTurn(story, {
          customActionText: actionText,
          actionType,
          targetNpc,
          signal: controller.signal
        });
        updatedStory = result.updatedStory;
      } else {
        try {
          const result = await executeAdvancedStoryTurn(
            story,
            { customActionText: actionText, actionType, targetNpc, signal: controller.signal },
            new LocalNarrativeProvider()
          );
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
      if (err.name === 'AbortError') {
        console.log('Turn generation cancelled by user.');
        return;
      }
      console.error('Action turn execution error:', err);
      setSaveStatus('error');
      const details = err instanceof AiNarrativeError ? err.details : classifyAiError(err);
      setAiFailureState({
        ...details,
        pendingAction: { type: actionType, customActionText: actionText, targetNpc }
      });
    } finally {
      setIsProcessingTurn(false);
      abortControllerRef.current = null;
    }
  };

  const handleRetryAction = () => {
    if (!aiFailureState) return;
    const pending = aiFailureState.pendingAction;
    setAiFailureState(null);
    if (pending.type === 'choice' && pending.choiceId) {
      handleSelectChoice(pending.choiceId);
    } else if (pending.customActionText) {
      const actType = pending.type === 'choice' ? 'action' : pending.type;
      handleSubmitAction(pending.customActionText, actType, pending.targetNpc);
    }
  };

  // Graceful fallback to Offline Mode if AI is slow or unreachable
  const handleContinueInOfflineMode = async () => {
    if (!story || !aiFailureState) return;
    const pending = aiFailureState.pendingAction;
    setAiFailureState(null);
    setIsProcessingTurn(true);
    setSaveStatus('saving');

    try {
      const offlineStory: StoryDocument = {
        ...story,
        generationMode: 'demo'
      };

      let result;
      if (pending.type === 'choice' && pending.choiceId) {
        result = await executeAdvancedStoryTurn(offlineStory, { choiceId: pending.choiceId }, new LocalNarrativeProvider());
      } else {
        result = await executeAdvancedStoryTurn(
          offlineStory,
          {
            customActionText: pending.customActionText || 'I assess the surroundings and proceed cautiously.',
            actionType: pending.type,
            targetNpc: pending.targetNpc
          },
          new LocalNarrativeProvider()
        );
      }

      setStory(result.updatedStory);
      await storyRepository.saveStory(result.updatedStory);
      setSaveStatus('saved');
      setLastSavedAt(Date.now());
    } catch (err) {
      console.error('Failed to continue in offline mode:', err);
    } finally {
      setIsProcessingTurn(false);
    }
  };

  const handleUseItem = async (itemId: string) => {
    if (!story) return;
    const item = story.state.inventory.find(i => i.id === itemId);
    if (!item) return;

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

  const handleUpdateNarrativeLength = async (length: NarrativeLength) => {
    if (!story) return;
    const updated: StoryDocument = {
      ...story,
      settings: {
        ...story.settings,
        narrativeLength: length
      },
      updatedAt: Date.now()
    };
    setStory(updated);
    await storyRepository.saveStory(updated);
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
    <div className="flex flex-col h-full w-full bg-dark-bg">
      {/* Sticky Reader Header */}
      <header className="sticky top-0 z-30 bg-dark-surface/95 backdrop-blur-md border-b border-dark-border/80 safe-area-top">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
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
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  story.generationMode === 'ai'
                    ? 'bg-brand-primary/15 text-brand-glow border-brand-primary/40'
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                }`}>
                  {story.generationMode === 'ai' ? 'AI Story Mode' : 'Offline Mode'}
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
              onApplyToCustomAction={(act) => handleSubmitAction(act, 'action')}
            />

            {/* Ambient Soundscape Synthesizer */}
            <AtmosphereSoundscape />

            {/* Reader Settings Modal Trigger */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl text-dark-muted hover:text-dark-text hover:bg-dark-elevated"
              aria-label="Story Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

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

      {/* Main Narrative Area */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <NarrativeReader
          story={story}
          onSelectChoice={handleSelectChoice}
          onSubmitAction={handleSubmitAction}
          onCancelGeneration={handleCancelGeneration}
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

      {/* Settings Modal (Narrative Length, Font, Layout) */}
      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Chronicle & Reading Settings"
        maxWidth="sm"
        footer={
          <Button variant="primary" fullWidth size="sm" onClick={() => setIsSettingsOpen(false)}>
            Apply & Close
          </Button>
        }
      >
        <div className="p-4 space-y-4 text-xs">
          {/* Narrative Length */}
          <div className="space-y-1.5">
            <label className="font-bold text-white flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-brand-primary" /> AI Narrative Length
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['concise', 'balanced', 'detailed'] as const).map(len => (
                <button
                  key={len}
                  onClick={() => handleUpdateNarrativeLength(len)}
                  className={`py-2 rounded-xl text-center capitalize font-semibold border transition-all ${
                    (story.settings?.narrativeLength || 'balanced') === len
                      ? 'bg-brand-primary text-white border-brand-primary'
                      : 'bg-dark-elevated text-dark-muted border-dark-border hover:text-white'
                  }`}
                >
                  {len}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-dark-muted">
              Balanced (120-200 words) provides optimal response speed without sacrificing depth.
            </p>
          </div>

          {/* Font Size */}
          <div className="space-y-1.5">
            <label className="font-bold text-white flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-indigo-400" /> Reading Font Size
            </label>
            <div className="flex items-center gap-2">
              {[14, 16, 18, 20].map(sz => (
                <button
                  key={sz}
                  onClick={() => {
                    setFontSize(sz);
                    localStorage.setItem('bv_font_size', sz.toString());
                  }}
                  className={`flex-1 py-1.5 rounded-lg font-bold border transition-all ${
                    fontSize === sz
                      ? 'bg-brand-primary text-white border-brand-primary'
                      : 'bg-dark-elevated text-dark-muted border-dark-border'
                  }`}
                >
                  {sz}px
                </button>
              ))}
            </div>
          </div>

          {/* Font Family */}
          <div className="space-y-1.5">
            <label className="font-bold text-white">Typography</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setFontFamily('serif');
                  localStorage.setItem('bv_font_family', 'serif');
                }}
                className={`py-2 rounded-xl font-serif font-bold border transition-all ${
                  fontFamily === 'serif'
                    ? 'bg-brand-primary text-white border-brand-primary'
                    : 'bg-dark-elevated text-dark-muted border-dark-border'
                }`}
              >
                Novel Serif
              </button>
              <button
                onClick={() => {
                  setFontFamily('sans');
                  localStorage.setItem('bv_font_family', 'sans');
                }}
                className={`py-2 rounded-xl font-sans font-bold border transition-all ${
                  fontFamily === 'sans'
                    ? 'bg-brand-primary text-white border-brand-primary'
                    : 'bg-dark-elevated text-dark-muted border-dark-border'
                }`}
              >
                Modern Sans
              </button>
            </div>
          </div>
        </div>
      </Modal>

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
                variant="amber"
                onClick={handleContinueInOfflineMode}
                disabled={isProcessingTurn}
                className="w-full justify-center"
              >
                <BookOpen className="w-3.5 h-3.5 mr-1.5" /> Continue in Offline Mode
              </Button>
              <Button
                variant="ghost"
                onClick={() => setAiFailureState(null)}
                className="w-full justify-center text-xs text-dark-muted"
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
              Your story state and last action are preserved. You can retry with Gemini or switch immediately to Offline Mode to continue your story seamlessly.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};
