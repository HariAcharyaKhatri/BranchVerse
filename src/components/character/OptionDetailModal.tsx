import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Check, Sparkles, Shield, Compass, BookOpen, Crown } from 'lucide-react';
import { TierBadge } from './TierBadge';
import { PowerTierCode } from '../../features/character/tierSystem';

export interface OptionDetailData {
  id: string;
  title: string;
  category?: string;
  tier?: PowerTierCode | string;
  rarity?: string;
  badge?: string;
  iconPath?: string;
  portraitPath?: string;
  imagePath?: string;
  iconText?: string;
  description: string;
  traits?: string[];
  godTierOrigin?: string;
  limitations?: string;
  magicSystem?: string;
  threats?: string[];
  factions?: string[];
  era?: string;
  isSelected?: boolean;
}

export interface OptionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: OptionDetailData | null;
  onSelect?: (data: OptionDetailData) => void;
  selectLabel?: string;
}

export const OptionDetailModal: React.FC<OptionDetailModalProps> = ({
  isOpen,
  onClose,
  data,
  onSelect,
  selectLabel = 'Select This Option',
}) => {
  if (!data) return null;

  const isSelected = Boolean(data.isSelected);
  const visualSrc = data.portraitPath || data.iconPath || data.imagePath;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Celestial Chronicle Inspection"
      maxWidth="md"
      footer={
        <div className="flex items-center justify-between w-full gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
            Back
          </Button>
          {onSelect && (
            <Button
              variant={isSelected ? 'secondary' : 'primary'}
              size="sm"
              onClick={() => {
                onSelect(data);
                onClose();
              }}
              className="text-xs font-bold"
            >
              {isSelected ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                  Currently Selected
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  {selectLabel}
                </>
              )}
            </Button>
          )}
        </div>
      }
    >
      <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto touch-scroll">
        {/* Banner / Header Visual */}
        {data.imagePath && (
          <div className="w-full h-36 sm:h-44 relative rounded-xl overflow-hidden border border-dark-border bg-dark-bg">
            <img
              src={data.imagePath}
              alt={data.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-surface via-transparent to-black/30" />
            {data.badge && (
              <span className="absolute top-2.5 right-2.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-amber-300 border border-amber-400/30">
                {data.badge}
              </span>
            )}
          </div>
        )}

        {/* Title, Icon, & Tags */}
        <div className="flex items-start gap-3">
          {visualSrc && !data.imagePath && (
            <div className="w-12 h-12 rounded-xl bg-black/60 border border-dark-border p-1 flex items-center justify-center shrink-0">
              <img
                src={visualSrc}
                alt=""
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          {data.iconText && !visualSrc && !data.imagePath && (
            <div className="w-12 h-12 rounded-xl bg-violet-950/40 border border-violet-500/30 flex items-center justify-center text-xl shrink-0">
              {data.iconText}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold font-serif text-white break-words">
                {data.title}
              </h2>
              {data.tier && (
                <TierBadge tier={data.tier as PowerTierCode} size="xs" />
              )}
              {data.rarity && (
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  {data.rarity}
                </span>
              )}
            </div>
            {data.category && (
              <span className="text-[11px] font-mono text-dark-muted mt-0.5 block uppercase tracking-wider">
                Category: {data.category.replace('_', ' ')}
              </span>
            )}
          </div>
        </div>

        {/* Full Unabridged Lore & Description */}
        <div className="p-3.5 rounded-xl bg-dark-elevated/70 border border-dark-border/80">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-dark-muted mb-1.5 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            Full Description & Lore
          </h3>
          <p className="text-xs sm:text-sm text-dark-text leading-relaxed whitespace-pre-line">
            {data.description}
          </p>
        </div>

        {/* God Tier Cosmic Origin if present */}
        {data.godTierOrigin && (
          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/40">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
              <Crown className="w-3 h-3" />
              Cosmic Divine Origin
            </span>
            <p className="text-xs text-amber-100/90 mt-1 italic font-serif">
              "{data.godTierOrigin}"
            </p>
          </div>
        )}

        {/* Limitations or Drawbacks if present */}
        {data.limitations && (
          <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Cosmic Invariant & Limitations
            </span>
            <p className="text-xs text-rose-100/90 mt-1">
              {data.limitations}
            </p>
          </div>
        )}

        {/* Traits & Attributes */}
        {data.traits && data.traits.length > 0 && (
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-dark-muted mb-2 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-violet-400" />
              Innate Traits & Key Modifiers ({data.traits.length})
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {data.traits.map((t, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2.5 py-1 rounded-lg bg-dark-surface border border-dark-border text-dark-text font-medium"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* World Specific Meta: Magic System, Threats, Factions */}
        {(data.magicSystem || (data.threats && data.threats.length > 0)) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {data.magicSystem && (
              <div className="p-2.5 rounded-lg bg-dark-surface border border-dark-border">
                <span className="text-[10px] font-mono text-dark-muted block">Magic System</span>
                <span className="font-semibold text-white mt-0.5 block">{data.magicSystem}</span>
              </div>
            )}
            {data.threats && data.threats.length > 0 && (
              <div className="p-2.5 rounded-lg bg-dark-surface border border-dark-border">
                <span className="text-[10px] font-mono text-dark-muted block">Primary Threats</span>
                <span className="font-semibold text-rose-300 mt-0.5 block">{data.threats.join(', ')}</span>
              </div>
            )}
            {data.era && (
              <div className="p-2.5 rounded-lg bg-dark-surface border border-dark-border">
                <span className="text-[10px] font-mono text-dark-muted block">Historical Era</span>
                <span className="font-semibold text-amber-300 mt-0.5 block">{data.era}</span>
              </div>
            )}
            {data.factions && data.factions.length > 0 && (
              <div className="p-2.5 rounded-lg bg-dark-surface border border-dark-border">
                <span className="text-[10px] font-mono text-dark-muted block">Major Factions</span>
                <span className="font-semibold text-violet-300 mt-0.5 block">{data.factions.join(', ')}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
