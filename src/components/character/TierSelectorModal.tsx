import React from 'react';
import { ALL_POWER_TIERS, PowerTierCode, PowerTierInfo } from '../../features/character/tierSystem';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Sparkles, Check, Zap } from 'lucide-react';

export interface TierSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTier?: PowerTierCode | number | string;
  onSelectTier: (tier: PowerTierInfo) => void;
  title?: string;
  subtitle?: string;
}

export const TierSelectorModal: React.FC<TierSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedTier = 'B',
  onSelectTier,
  title = 'Soul Power Tier Selection',
  subtitle = 'Choose your starting soul potential from Tier E to Tier SSS or ascend directly to God Tier.',
}) => {
  const currentCode = typeof selectedTier === 'number'
    ? (selectedTier >= 99 ? 'GOD' : selectedTier >= 93 ? 'SSS' : selectedTier >= 85 ? 'SS' : selectedTier >= 75 ? 'S' : selectedTier >= 60 ? 'A' : selectedTier >= 45 ? 'B' : selectedTier >= 35 ? 'C' : selectedTier >= 20 ? 'D' : 'E')
    : (String(selectedTier || 'B').toUpperCase().replace('TIER ', '').trim() as PowerTierCode);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="md"
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
            Close Codex
          </Button>
        </div>
      }
    >
      <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto touch-scroll">
        <p className="text-xs text-dark-muted leading-relaxed">
          {subtitle}
        </p>

        {/* 9-Tier Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {ALL_POWER_TIERS.map((tier) => {
            const isSelected = tier.code === currentCode;
            return (
              <button
                key={tier.code}
                onClick={() => {
                  onSelectTier(tier);
                  onClose();
                }}
                className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between gap-1.5 ${
                  isSelected
                    ? `${tier.bgClass} ${tier.borderClass} ${tier.glowClass} ring-1 ring-amber-400/50 scale-[1.01]`
                    : 'bg-dark-surface/60 border-dark-border/60 hover:border-violet-500/40 hover:bg-dark-surface'
                }`}
              >
                {/* Header with Icon, Name, and Check */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{tier.icon}</span>
                    <div>
                      <span className={`font-serif font-black text-sm tracking-wide ${tier.color}`}>
                        {tier.name}
                      </span>
                      <span className="text-[10px] text-dark-muted font-sans block">
                        {tier.title}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-dark-bg/80 text-dark-muted border border-dark-border">
                      {tier.minPower}–{tier.maxPower}
                    </span>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-[11px] text-dark-text/80 leading-relaxed font-sans mt-0.5">
                  {tier.description}
                </p>

                {/* Special Highlight Ribbon for God Tier & SSS */}
                {tier.isGodTier && (
                  <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-amber-300 font-serif">
                    <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
                    <span>Divine Omnipotence • Supreme Planar Authority</span>
                  </div>
                )}
                {tier.code === 'SSS' && (
                  <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-fuchsia-300 font-serif">
                    <Zap className="w-3 h-3 text-fuchsia-400 animate-pulse" />
                    <span>Cosmic Transcendence • Calamity Paragon</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};
