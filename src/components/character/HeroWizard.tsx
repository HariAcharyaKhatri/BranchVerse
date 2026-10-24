import React, { useState, useEffect } from 'react';
import { HeroProfile } from '../../types/character';
import { IdentityStep } from './IdentityStep';
import { PowersStep } from './PowersStep';
import { PersonaStep } from './PersonaStep';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { Modal } from '../ui/Modal';
import { Sparkles, Dices, ArrowRight, ArrowLeft } from 'lucide-react';
import { parseHeroPrompt, completeHeroProfile } from '../../features/story/naturalPromptParser';
import { storyRepository } from '../../lib/storage/storyRepository';

interface HeroWizardProps {
  initialHero?: Partial<HeroProfile>;
  onComplete: (hero: HeroProfile) => void;
  onCancel?: () => void;
}

export const HeroWizard: React.FC<HeroWizardProps> = ({
  initialHero,
  onComplete,
  onCancel
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [heroDraft, setHeroDraft] = useState<Partial<HeroProfile>>(initialHero || {});
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [promptText, setPromptText] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  // Restore draft from storage on mount if no initialHero
  useEffect(() => {
    if (!initialHero || Object.keys(initialHero).length === 0) {
      storyRepository.getDraft<Partial<HeroProfile>>('hero_wizard_draft').then(draft => {
        if (draft && draft.name) {
          setHeroDraft(draft);
        }
      });
    }
  }, [initialHero]);

  // Persist draft on changes
  useEffect(() => {
    if (heroDraft && Object.keys(heroDraft).length > 0) {
      storyRepository.saveDraft('hero_wizard_draft', heroDraft);
    }
  }, [heroDraft]);

  const updateHero = (updates: Partial<HeroProfile>) => {
    setHeroDraft(prev => ({
      ...prev,
      ...updates,
      appearance: {
        ...(prev.appearance || { hair: '', eyes: '', clothing: '', distinguishingFeatures: '' }),
        ...(updates.appearance || {})
      }
    }));
  };

  const handleMagicPromptApply = () => {
    if (!promptText.trim()) return;
    const extracted = parseHeroPrompt(promptText);
    setHeroDraft(prev => ({
      ...prev,
      ...extracted,
      name: extracted.name || prev.name,
      age: extracted.age || prev.age,
      gender: extracted.gender || prev.gender,
      origin: extracted.origin || prev.origin,
      personality: extracted.personality && extracted.personality.length > 0 ? extracted.personality : prev.personality,
      powers: extracted.powers && extracted.powers.length > 0 ? extracted.powers : prev.powers,
      weapons: extracted.weapons && extracted.weapons.length > 0 ? extracted.weapons : prev.weapons,
      appearance: {
        hair: extracted.appearance?.hair || prev.appearance?.hair || '',
        eyes: extracted.appearance?.eyes || prev.appearance?.eyes || '',
        clothing: prev.appearance?.clothing || '',
        distinguishingFeatures: prev.appearance?.distinguishingFeatures || ''
      }
    }));
    setIsPromptModalOpen(false);
    setNotification('Extracted hero details from prompt!');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSmartRandomize = () => {
    const completed = completeHeroProfile(heroDraft);
    setHeroDraft(completed);
    setNotification('Generated missing details without replacing your choices!');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleNext = () => {
    if (step === 1) {
      if (!heroDraft.name || !heroDraft.name.trim()) {
        setNotification('Please enter a hero name before continuing.');
        setTimeout(() => setNotification(null), 3000);
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      // Finalize and complete
      const fullHero = completeHeroProfile(heroDraft);
      storyRepository.clearDraft('hero_wizard_draft');
      onComplete(fullHero);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-md mx-auto">
      {/* Top Header & Assistant Bar */}
      <div className="px-4 py-3 border-b border-dark-border/60 bg-dark-surface/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-brand-primary">Step {step} of 3</span>
            <span className="text-xs text-dark-muted">•</span>
            <span className="text-xs text-dark-text font-medium">
              {step === 1 && 'Identity & Roots'}
              {step === 2 && 'Powers & Arsenal'}
              {step === 3 && 'Soul & Ambition'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsPromptModalOpen(true)}
              className="text-xs h-7 px-2 text-indigo-400 hover:text-white"
              iconLeft={<Sparkles className="w-3.5 h-3.5 text-brand-primary" />}
            >
              Prompt
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSmartRandomize}
              className="text-xs h-7 px-2 text-amber-400 hover:text-white"
              iconLeft={<Dices className="w-3.5 h-3.5 text-amber-400" />}
            >
              Auto-Fill
            </Button>
          </div>
        </div>

        <ProgressBar value={step} max={3} variant="indigo" size="sm" />

        {notification && (
          <div className="mt-2 text-xs text-brand-accent bg-brand-accent/10 border border-brand-accent/20 rounded-lg px-2.5 py-1 animate-in fade-in">
            {notification}
          </div>
        )}
      </div>

      {/* Step Content with containment */}
      <div className="flex-1 p-4 overflow-y-auto overscroll-contain">
        {step === 1 && <IdentityStep hero={heroDraft} onChange={updateHero} />}
        {step === 2 && <PowersStep hero={heroDraft} onChange={updateHero} />}
        {step === 3 && <PersonaStep hero={heroDraft} onChange={updateHero} />}
      </div>

      {/* Footer Navigation Bar */}
      <div className="p-4 border-t border-dark-border/60 bg-dark-surface/90 flex gap-2 safe-area-bottom">
        {step > 1 ? (
          <Button
            variant="secondary"
            onClick={() => setStep((step - 1) as any)}
            className="flex-1"
            iconLeft={<ArrowLeft className="w-4 h-4" />}
          >
            Back
          </Button>
        ) : onCancel ? (
          <Button variant="ghost" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        ) : null}

        <Button
          variant="primary"
          onClick={handleNext}
          className="flex-1"
          iconRight={<ArrowRight className="w-4 h-4" />}
        >
          {step === 3 ? 'Choose Genre' : 'Continue'}
        </Button>
      </div>

      {/* Magic Natural Language Prompt Modal */}
      <Modal
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
        title="Hero Prompt Assistant"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsPromptModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleMagicPromptApply} iconLeft={<Sparkles className="w-4 h-4" />}>
              Parse & Fill
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-dark-muted">
            Type or paste a natural description of your protagonist. The system will extract character attributes automatically:
          </p>
          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            rows={4}
            placeholder="Create Hari, a 20-year-old white-haired swordsman from a forgotten village. He has god-level swordsmanship, a calm personality, and a mysterious past."
            className="w-full bg-dark-elevated border border-dark-border rounded-xl p-3 text-xs text-dark-text placeholder:text-dark-muted/40 focus:outline-none focus:border-brand-primary"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPromptText("Create Hari, a 20-year-old white-haired swordsman from a forgotten village. He has god-level swordsmanship, a calm personality, and a mysterious past.")}
              className="text-[11px] text-brand-primary hover:underline"
            >
              Paste example prompt
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
