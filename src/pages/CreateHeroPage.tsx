import React from 'react';
import { HeroProfile } from '../types/character';
import { HeroWizard } from '../components/character/HeroWizard';
import { ScreenHeader } from '../components/navigation/ScreenHeader';
import { Sparkles, ArrowRight } from 'lucide-react';

interface CreateHeroPageProps {
  onHeroCreated: (hero: HeroProfile) => void;
  onBack: () => void;
}

export const CreateHeroPage: React.FC<CreateHeroPageProps> = ({ onHeroCreated, onBack }) => {
  return (
    <div className="flex flex-col h-full bg-dark-bg">
      <ScreenHeader
        title="Hero Creator"
        subtitle="Craft your legend or use natural prompt"
        onBack={onBack}
      />
      {/* Banner to Soul Architect */}
      <div className="px-4 py-2 bg-gradient-to-r from-violet-950/60 via-dark-surface to-dark-surface border-b border-violet-500/30 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
          <span className="text-xs text-violet-200">
            Looking for AI Angel Architect & Power Catalogue?
          </span>
        </div>
        <button
          onClick={() => {
            window.location.hash = '#/architect';
          }}
          className="text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 shrink-0"
        >
          <span>Open Soul Architect</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        <HeroWizard
          onComplete={onHeroCreated}
          onCancel={onBack}
        />
      </div>
    </div>
  );
};
