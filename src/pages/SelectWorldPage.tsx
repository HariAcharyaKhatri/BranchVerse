import React, { useState } from 'react';
import { WORLD_CATALOG } from '../catalogs/worlds';
import { WorldDefinition } from '../types/world';
import { ScreenHeader } from '../components/navigation/ScreenHeader';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ArrowRight, MapPin, Check } from 'lucide-react';

interface SelectWorldPageProps {
  onSelectWorld: (world: WorldDefinition) => void;
  onBack: () => void;
}

export const SelectWorldPage: React.FC<SelectWorldPageProps> = ({ onSelectWorld, onBack }) => {
  const [selectedWorldId, setSelectedWorldId] = useState<string>(WORLD_CATALOG[0].id);

  const selectedWorld = WORLD_CATALOG.find(w => w.id === selectedWorldId) || WORLD_CATALOG[0];

  const handleContinue = () => {
    onSelectWorld(selectedWorld);
  };

  return (
    <div className="flex flex-col h-full bg-dark-bg">
      <ScreenHeader
        title="Choose World & Realm"
        subtitle="Select the backdrop of your adventure"
        onBack={onBack}
      />

      <div className="flex-1 p-4 overflow-y-auto overscroll-contain max-w-md mx-auto w-full space-y-3">
        {WORLD_CATALOG.map((world) => {
          const isSelected = world.id === selectedWorldId;

          return (
            <div
              key={world.id}
              onClick={() => setSelectedWorldId(world.id)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-dark-surface border-brand-primary shadow-glow-sm'
                  : 'bg-dark-surface/60 border-dark-border hover:border-dark-muted'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-sm text-dark-text flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-brand-primary" /> {world.name}
                </h3>
                {isSelected && (
                  <Badge variant="primary" size="sm" className="gap-1">
                    <Check className="w-3 h-3" /> Selected
                  </Badge>
                )}
              </div>

              <p className="text-xs text-dark-muted leading-relaxed line-clamp-2 mt-1">
                {world.synopsis}
              </p>

              {/* World Lore Details Preview */}
              <div className="mt-3 pt-2.5 border-t border-dark-border/40 grid grid-cols-2 gap-2 text-[11px]">
                <div className="text-dark-muted truncate">
                  <span className="font-semibold text-dark-text">Magic:</span> {world.magicSystem.name}
                </div>
                <div className="text-dark-muted truncate">
                  <span className="font-semibold text-dark-text">Factions:</span> {world.factions.length} Major
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-dark-border/60 bg-dark-surface/90 safe-area-bottom">
        <div className="max-w-md mx-auto">
          <Button
            variant="primary"
            fullWidth
            onClick={handleContinue}
            iconRight={<ArrowRight className="w-4 h-4" />}
          >
            Configure Story Settings
          </Button>
        </div>
      </div>
    </div>
  );
};
