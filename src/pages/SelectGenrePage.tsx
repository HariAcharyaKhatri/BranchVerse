import React, { useState } from 'react';
import { GENRE_CATALOG } from '../catalogs/genres';
import { ScreenHeader } from '../components/navigation/ScreenHeader';
import { Button } from '../components/ui/Button';
import { ArrowRight, Check } from 'lucide-react';

interface SelectGenrePageProps {
  selectedGenres: string[];
  onSelectGenres: (genres: string[]) => void;
  onBack: () => void;
}

export const SelectGenrePage: React.FC<SelectGenrePageProps> = ({
  selectedGenres: initialSelected,
  onSelectGenres,
  onBack
}) => {
  const [selected, setSelected] = useState<string[]>(
    initialSelected.length > 0 ? initialSelected : ['High Fantasy']
  );

  const toggleGenre = (genreName: string) => {
    if (selected.includes(genreName)) {
      if (selected.length > 1) {
        setSelected(selected.filter(g => g !== genreName));
      }
    } else {
      if (selected.length < 3) {
        setSelected([...selected, genreName]);
      }
    }
  };

  const handleContinue = () => {
    onSelectGenres(selected);
  };

  return (
    <div className="flex flex-col h-full bg-dark-bg">
      <ScreenHeader
        title="Choose Genres"
        subtitle="Select 1 to 3 complementary genres"
        onBack={onBack}
      />

      {/* Scrollable Grid of 13 Genres */}
      <div className="flex-1 p-4 overflow-y-auto overscroll-contain max-w-md mx-auto w-full space-y-3">
        <div className="flex items-center justify-between text-xs text-dark-muted px-1">
          <span>Active Mix:</span>
          <span className="font-semibold text-brand-primary">{selected.length} / 3 selected</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {GENRE_CATALOG.map((genre) => {
            const isSelected = selected.includes(genre.name);
            return (
              <button
                key={genre.id}
                type="button"
                onClick={() => toggleGenre(genre.name)}
                className={`p-3 rounded-2xl border text-left transition-all duration-150 flex flex-col justify-between min-h-[92px] ${
                  isSelected
                    ? 'bg-brand-primary/20 border-brand-primary text-white shadow-glow-sm'
                    : 'bg-dark-surface border-dark-border text-dark-muted hover:border-dark-muted'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-dark-text leading-tight">{genre.name}</span>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-brand-primary text-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-dark-muted line-clamp-2 mt-1 leading-snug">
                    {genre.tagline}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Continue Action */}
      <div className="p-4 border-t border-dark-border/60 bg-dark-surface/90 safe-area-bottom">
        <div className="max-w-md mx-auto">
          <Button
            variant="primary"
            fullWidth
            onClick={handleContinue}
            iconRight={<ArrowRight className="w-4 h-4" />}
          >
            Continue to World Selection
          </Button>
        </div>
      </div>
    </div>
  );
};
