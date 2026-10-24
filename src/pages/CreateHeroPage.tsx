import React from 'react';
import { HeroProfile } from '../types/character';
import { HeroWizard } from '../components/character/HeroWizard';
import { ScreenHeader } from '../components/navigation/ScreenHeader';

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
      <div className="flex-1 overflow-hidden">
        <HeroWizard
          onComplete={onHeroCreated}
          onCancel={onBack}
        />
      </div>
    </div>
  );
};
