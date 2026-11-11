import React, { useState, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { TalentCategory, CharacterTalent } from '../../types/talent';
import { PowerTierCode } from '../../features/character/tierSystem';
import {
  ALL_POWER_DEFINITIONS,
  PowerDefinition,
  filterPowerCatalogue,
} from '../../catalogs/powerCatalogue';
import { TierBadge } from './TierBadge';
import { TierSelectorModal } from './TierSelectorModal';
import {
  Search,
  Filter,
  Check,
  Plus,
  Trash2,
  Info,
  Sparkles,
  Shield,
  Briefcase,
  Zap,
} from 'lucide-react';

interface PowerCatalogueModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTalents: CharacterTalent[];
  onAddTalent: (talent: CharacterTalent) => void;
  onRemoveTalent: (talentId: string) => void;
  onUpdateTalentTier: (talentId: string, newTier: PowerTierCode) => void;
}

const CATEGORIES: Array<{ id: TalentCategory | 'all'; label: string; icon: string }> = [
  { id: 'all', label: 'All Categories', icon: '🌌' },
  { id: 'elemental', label: 'Elemental Magic', icon: '🔥' },
  { id: 'divine', label: 'Divine & Sacred', icon: '🕊️' },
  { id: 'dark', label: 'Dark & Forbidden', icon: '💀' },
  { id: 'space_time', label: 'Space & Time', icon: '⏳' },
  { id: 'conceptual', label: 'Conceptual Arcana', icon: '🪐' },
  { id: 'combat', label: 'Combat & Martial', icon: '⚔️' },
  { id: 'racial', label: 'Racial & Biological', icon: '🧬' },
  { id: 'production', label: 'Production & Trade', icon: '💰' },
  { id: 'intellectual', label: 'Intellectual & Sage', icon: '🧠' },
  { id: 'unique', label: 'Unique (Jack of All Trades)', icon: '🎭' },
];

export const PowerCatalogueModal: React.FC<PowerCatalogueModalProps> = ({
  isOpen,
  onClose,
  selectedTalents,
  onAddTalent,
  onRemoveTalent,
  onUpdateTalentTier,
}) => {
  const [activeCategory, setActiveCategory] = useState<TalentCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [combatFilter, setCombatFilter] = useState<'all' | 'combat' | 'non_combat'>('all');
  const [inspectedPower, setInspectedPower] = useState<PowerDefinition | null>(null);
  const [tierPickerForTalent, setTierPickerForTalent] = useState<CharacterTalent | null>(null);

  const filteredPowers = useMemo(() => {
    return filterPowerCatalogue({
      category: activeCategory,
      searchQuery,
      isCombatOnly: combatFilter === 'all' ? undefined : combatFilter === 'combat',
    });
  }, [activeCategory, searchQuery, combatFilter]);

  const isSelected = (powerId: string) => selectedTalents.some((t) => t.id === powerId);
  const getSelectedInstance = (powerId: string) => selectedTalents.find((t) => t.id === powerId);

  const handleToggleTalent = (def: PowerDefinition) => {
    const existing = getSelectedInstance(def.id);
    if (existing) {
      onRemoveTalent(def.id);
    } else {
      const newTalent: CharacterTalent = {
        id: def.id,
        name: def.name,
        category: def.category,
        tier: def.defaultTier,
        mastery: 'Beginner',
        description: def.description,
        source: def.category === 'racial' ? 'Bloodline' : def.category === 'production' ? 'Rigorous Training' : 'Innate',
        specialization: def.specializations[0],
      };
      onAddTalent(newTalent);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Powers & Talents Catalogue"
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-xs text-dark-muted">
            <span className="font-semibold text-white">{selectedTalents.length}</span>
            <span>Talents Configured</span>
          </div>
          <Button variant="primary" onClick={onClose} size="sm">
            Done Selecting
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Search & Quick Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-dark-muted absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search elements, sword arts, trade genius..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-dark-muted focus:outline-none focus:border-brand-primary"
            />
          </div>

          {/* Combat vs Non-Combat Filter */}
          <div className="flex items-center gap-1 bg-dark-bg p-1 rounded-xl border border-dark-border shrink-0 self-stretch sm:self-auto justify-center">
            <button
              onClick={() => setCombatFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                combatFilter === 'all'
                  ? 'bg-dark-elevated text-white'
                  : 'text-dark-muted hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setCombatFilter('combat')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                combatFilter === 'combat'
                  ? 'bg-brand-primary text-white'
                  : 'text-dark-muted hover:text-white'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>Combat</span>
            </button>
            <button
              onClick={() => setCombatFilter('non_combat')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                combatFilter === 'non_combat'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-dark-muted hover:text-white'
              }`}
            >
              <Briefcase className="w-3 h-3" />
              <span>Production & Sage</span>
            </button>
          </div>
        </div>

        {/* Categories Horizontal Scroller */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 touch-scroll border-b border-dark-border/40">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'bg-dark-surface border border-dark-border text-dark-muted hover:text-white'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Talents Tray */}
        {selectedTalents.length > 0 && (
          <div className="p-3 rounded-xl bg-dark-bg/60 border border-dark-border/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-serif font-bold text-amber-300 uppercase tracking-wider">
                Configured Innate Talents ({selectedTalents.length})
              </span>
              <span className="text-[10px] text-dark-muted">Tap badge to customize tier</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedTalents.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-dark-surface border border-violet-500/30 text-xs"
                >
                  <span className="font-semibold text-white">{t.name}</span>
                  <TierBadge
                    tier={t.tier}
                    size="xs"
                    variant="pill"
                    onClick={() => setTierPickerForTalent(t)}
                  />
                  <button
                    onClick={() => onRemoveTalent(t.id)}
                    className="text-dark-muted hover:text-rose-400 ml-0.5"
                    title="Remove talent"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Powers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[50vh] overflow-y-auto touch-scroll pr-1">
          {filteredPowers.length === 0 ? (
            <div className="col-span-2 py-8 text-center text-dark-muted text-xs">
              No powers found matching your search.
            </div>
          ) : (
            filteredPowers.map((power) => {
              const active = isSelected(power.id);
              const selectedInst = getSelectedInstance(power.id);

              return (
                <div
                  key={power.id}
                  className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between gap-2 ${
                    active
                      ? 'bg-violet-950/20 border-violet-500/70 shadow-sm'
                      : 'bg-dark-surface/70 border-dark-border hover:border-dark-muted'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        {power.svgPath ? (
                          <div className="w-7 h-7 rounded-lg bg-black/60 border border-dark-border/80 p-1 flex items-center justify-center shrink-0">
                            <img
                              src={power.svgPath}
                              alt=""
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        ) : (
                          <span className="text-base">{power.icon}</span>
                        )}
                        <div>
                          <h4 className="font-bold text-xs sm:text-sm text-white font-serif leading-tight">
                            {power.name}
                          </h4>
                          <span className="text-[10px] text-dark-muted">{power.categoryLabel}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {active && selectedInst ? (
                          <TierBadge
                            tier={selectedInst.tier}
                            size="xs"
                            variant="pill"
                            onClick={() => setTierPickerForTalent(selectedInst)}
                          />
                        ) : (
                          <TierBadge tier={power.defaultTier} size="xs" variant="pill" />
                        )}
                        <button
                          onClick={() => setInspectedPower(power)}
                          className="p-1 text-dark-muted hover:text-white rounded"
                          title="Inspect details"
                        >
                          <Info className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-dark-text/80 line-clamp-2 leading-relaxed">
                      {power.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-dark-border/40">
                    <span className="text-[10px] text-dark-muted font-mono">
                      {power.isCombat ? 'Combat Discipline' : 'Production / Scholar'}
                    </span>

                    <button
                      onClick={() => handleToggleTalent(power)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                        active
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
                          : 'bg-brand-primary text-white hover:bg-brand-primary/90'
                      }`}
                    >
                      {active ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Selected</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" />
                          <span>Add Talent</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Inspect Detail Modal */}
      {inspectedPower && (
        <Modal
          isOpen={true}
          onClose={() => setInspectedPower(null)}
          title={`${inspectedPower.icon} ${inspectedPower.name}`}
          maxWidth="md"
        >
          <div className="space-y-3 text-xs leading-relaxed">
            <p className="text-dark-text">{inspectedPower.description}</p>

            <div className="space-y-1">
              <span className="font-bold text-amber-300 block">Practical Applications</span>
              <ul className="list-disc list-inside text-dark-muted space-y-0.5">
                {inspectedPower.applications.map((app, idx) => (
                  <li key={idx}>{app}</li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-dark-bg border border-dark-border space-y-1">
                <span className="font-semibold text-emerald-400 block">Strengths</span>
                <ul className="text-dark-muted space-y-0.5">
                  {inspectedPower.strengths.map((s, idx) => (
                    <li key={idx}>• {s}</li>
                  ))}
                </ul>
              </div>

              <div className="p-2.5 rounded-xl bg-dark-bg border border-dark-border space-y-1">
                <span className="font-semibold text-rose-400 block">Limitations</span>
                <ul className="text-dark-muted space-y-0.5">
                  {inspectedPower.limitations.map((l, idx) => (
                    <li key={idx}>• {l}</li>
                  ))}
                </ul>
              </div>
            </div>

            {inspectedPower.specializations.length > 0 && (
              <div className="space-y-1">
                <span className="font-bold text-indigo-300 block">Available Specializations</span>
                <div className="flex flex-wrap gap-1">
                  {inspectedPower.specializations.map((spec, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-lg bg-dark-bg border border-dark-border text-[11px] text-dark-muted"
                    >
                      ✦ {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Tier Selector for specific talent */}
      {tierPickerForTalent && (
        <TierSelectorModal
          isOpen={true}
          onClose={() => setTierPickerForTalent(null)}
          selectedTier={tierPickerForTalent.tier}
          onSelectTier={(newTier) => {
            onUpdateTalentTier(tierPickerForTalent.id, newTier.code);
            setTierPickerForTalent(null);
          }}
        />
      )}
    </Modal>
  );
};
