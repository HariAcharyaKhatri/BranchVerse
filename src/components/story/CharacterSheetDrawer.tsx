import React, { useState } from 'react';
import { HeroProfile } from '../../types/character';
import { StoryState } from '../../types/story';
import { BottomSheet } from '../ui/BottomSheet';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge } from '../ui/Badge';
import { Shield, Package, Scroll, Users } from 'lucide-react';

interface CharacterSheetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  hero: HeroProfile;
  state: StoryState;
  onUseItem?: (itemId: string) => void;
}

export const CharacterSheetDrawer: React.FC<CharacterSheetDrawerProps> = ({
  isOpen,
  onClose,
  hero,
  state,
  onUseItem
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'inventory' | 'quests' | 'lore'>('stats');

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={hero.name}
      subtitle={`${hero.race} • ${hero.skills[0] || 'Warrior'} • Level ${state.powerLevel}`}
    >
      <div className="space-y-4">
        {/* Compact Navigation Tabs */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-dark-elevated rounded-xl border border-dark-border text-xs">
          {[
            { id: 'stats', label: 'Stats', icon: Shield },
            { id: 'inventory', label: 'Items', icon: Package, count: state.inventory.length },
            { id: 'quests', label: 'Quests', icon: Scroll, count: state.activeQuests.length },
            { id: 'lore', label: 'Bonds', icon: Users }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-1.5 px-2 rounded-lg font-medium flex items-center justify-center gap-1 transition-all ${
                  isActive
                    ? 'bg-brand-primary text-white shadow-sm'
                    : 'text-dark-muted hover:text-dark-text'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="text-[10px] bg-dark-surface/60 px-1 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Stats & Vitals */}
        {activeTab === 'stats' && (
          <div className="space-y-3.5">
            <div className="space-y-2 bg-dark-elevated/40 p-3 rounded-2xl border border-dark-border">
              <ProgressBar
                label="Health Points (HP)"
                sublabel={`${state.health} / ${state.maxHealth}`}
                value={state.health}
                max={state.maxHealth}
                variant={state.health > 40 ? 'emerald' : 'red'}
              />
              <ProgressBar
                label="Stamina / Energy"
                sublabel={`${state.stamina} / 100`}
                value={state.stamina}
                max={100}
                variant="amber"
              />
            </div>

            {/* Powers & Weapons */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-dark-muted">Equipped Weapons & Abilities</div>
              <div className="flex flex-wrap gap-1.5">
                {hero.weapons.map((w, idx) => (
                  <Badge key={idx} variant="primary" size="sm">
                    ⚔️ {w}
                  </Badge>
                ))}
                {hero.powers.map((p, idx) => (
                  <Badge key={idx} variant="amber" size="sm">
                    ✨ {p}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Status Effects */}
            {state.statusEffects && state.statusEffects.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-dark-muted">Active Status Effects</div>
                <div className="flex flex-wrap gap-1.5">
                  {state.statusEffects.map((eff, idx) => (
                    <Badge key={idx} variant="purple" size="sm">
                      {eff}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Inventory */}
        {activeTab === 'inventory' && (
          <div className="space-y-2">
            {state.inventory.length === 0 ? (
              <div className="text-center py-8 text-dark-muted text-xs">
                Your satchel is empty. Explore and make choices to gather items!
              </div>
            ) : (
              state.inventory.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-dark-elevated border border-dark-border flex items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-dark-text truncate">{item.name}</span>
                      <span className="text-[10px] bg-dark-surface px-1.5 py-0.5 rounded text-brand-accent font-bold">
                        x{item.quantity}
                      </span>
                    </div>
                    <p className="text-[11px] text-dark-muted mt-0.5 leading-tight">{item.description}</p>
                    {item.effectDescription && (
                      <span className="text-[10px] text-emerald-400 font-medium">{item.effectDescription}</span>
                    )}
                  </div>
                  {item.category === 'consumable' && onUseItem && (
                    <button
                      onClick={() => onUseItem(item.id)}
                      className="px-2.5 py-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-all active:scale-95 shrink-0"
                    >
                      Use
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Quests */}
        {activeTab === 'quests' && (
          <div className="space-y-2">
            {state.activeQuests.length === 0 ? (
              <div className="text-center py-8 text-dark-muted text-xs">
                No active quests. Continue reading to accept new missions!
              </div>
            ) : (
              state.activeQuests.map((quest) => (
                <div
                  key={quest.id}
                  className="p-3 rounded-xl bg-dark-elevated border border-dark-border space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-dark-text">{quest.title}</span>
                    <Badge
                      variant={quest.status === 'completed' ? 'emerald' : quest.status === 'failed' ? 'danger' : 'amber'}
                      size="sm"
                    >
                      {quest.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-dark-muted leading-tight">{quest.objective}</p>
                  {quest.giver && (
                    <p className="text-[10px] text-dark-muted/80">Quest Giver: {quest.giver}</p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 4: Lore & NPC Trust */}
        {activeTab === 'lore' && (
          <div className="space-y-3">
            <div className="text-xs font-semibold text-dark-muted">Factions & NPC Trust</div>
            {Object.keys(state.npcTrust).length === 0 ? (
              <div className="text-center py-6 text-dark-muted text-xs">
                No NPC bonds established yet.
              </div>
            ) : (
              <div className="space-y-2">
                {Object.entries(state.npcTrust).map(([npc, trust]) => (
                  <div key={npc} className="bg-dark-elevated p-2.5 rounded-xl border border-dark-border">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-dark-text">{npc}</span>
                      <span className={`font-bold ${trust >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {trust > 0 ? `+${trust}` : trust} Trust
                      </span>
                    </div>
                    <div className="h-1.5 bg-dark-surface rounded-full overflow-hidden flex">
                      <div
                        className={`h-full ${trust >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(100, Math.abs(trust))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </BottomSheet>
  );
};
