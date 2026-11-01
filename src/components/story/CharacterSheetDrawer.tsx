import React, { useState } from 'react';
import { HeroProfile } from '../../types/character';
import { StoryState } from '../../types/story';
import { BottomSheet } from '../ui/BottomSheet';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge } from '../ui/Badge';
import {
  Shield,
  Package,
  Scroll,
  Users,
  MapPin,
  Coins,
  Award,
  Zap,
  Briefcase,
  Sparkles,
  Compass,
  CheckCircle2
} from 'lucide-react';

interface CharacterSheetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  hero: HeroProfile;
  state: StoryState;
  genres?: string[];
  worldName?: string;
  onUseItem?: (itemId: string) => void;
}

export const CharacterSheetDrawer: React.FC<CharacterSheetDrawerProps> = ({
  isOpen,
  onClose,
  hero,
  state,
  genres = [],
  worldName = 'Current Realm',
  onUseItem
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'inventory' | 'quests' | 'lore'>('stats');

  const genreStr = (genres.length > 0 ? genres.join(' ') : 'Fantasy').toLowerCase();
  const isFantasy = /fantasy|magic|supernatural|myth|cultivation|wuxia/i.test(genreStr);
  const isBusiness = /business|commerce|trade|merchant|corporate/i.test(genreStr);
  const isSciFi = /sci-fi|cyberpunk|space|future/i.test(genreStr);

  // Authoritative dynamic fields
  const currentLocation = state.currentLocation || hero.origin || 'Unknown Realm';
  const rawRegion = state.worldFlags?.region as string;
  const rawKingdom = state.worldFlags?.kingdom as string;
  const regionOrKingdom = rawRegion && rawKingdom
    ? `${rawRegion}, ${rawKingdom}`
    : rawRegion || rawKingdom || worldName;

  const currentRank =
    (state.worldFlags?.rank as string) ||
    (state.worldFlags?.title as string) ||
    hero.origin ||
    'Adventurer';

  const rawWealth =
    state.worldFlags?.wealth ||
    state.worldFlags?.gold ||
    state.worldFlags?.credits;

  const displayWealth = rawWealth
    ? String(rawWealth)
    : undefined;

  // Extract contextual custom flags (flexible status system)
  const standardKeys = new Set(['region', 'kingdom', 'wealth', 'gold', 'credits', 'rank', 'title']);
  const customFlags = Object.entries(state.worldFlags || {}).filter(
    ([k, v]) => !standardKeys.has(k) && v !== undefined && v !== null && typeof v !== 'function'
  );

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={hero.name}
      subtitle={`${hero.race} • ${currentRank} • Lvl ${state.powerLevel}`}
    >
      <div className="space-y-4" data-testid="live-character-status-panel">
        {/* Compact Navigation Tabs */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-dark-elevated rounded-xl border border-dark-border text-xs">
          {[
            { id: 'stats', label: isBusiness ? 'Status' : 'Vitals', icon: Shield },
            { id: 'inventory', label: 'Items', icon: Package, count: state.inventory.length },
            { id: 'quests', label: 'Quests', icon: Scroll, count: state.activeQuests.length },
            { id: 'lore', label: 'Bonds', icon: Users, count: Object.keys(state.npcTrust || {}).length }
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

        {/* Tab 1: Live Status, Location, Wealth & Vitals */}
        {activeTab === 'stats' && (
          <div className="space-y-3.5">
            {/* Live Geographical & Economic Status Cards */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Location */}
              <div className="p-2.5 rounded-xl bg-dark-elevated/70 border border-dark-border flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-dark-muted font-medium block">Current Location</span>
                  <p className="font-semibold text-white truncate">{currentLocation}</p>
                  <p className="text-[10px] text-dark-muted truncate">{regionOrKingdom}</p>
                </div>
              </div>

              {/* Wealth / Economic Standing */}
              <div className="p-2.5 rounded-xl bg-dark-elevated/70 border border-dark-border flex items-center gap-2">
                <Coins className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-dark-muted font-medium block">
                    {isBusiness ? 'Liquid Capital' : 'Wealth & Coinage'}
                  </span>
                  <p className="font-semibold text-emerald-300 truncate">
                    {displayWealth || 'Provisioned'}
                  </p>
                  <p className="text-[10px] text-dark-muted truncate">Authoritative</p>
                </div>
              </div>

              {/* Title / Social Rank */}
              <div className="p-2.5 rounded-xl bg-dark-elevated/70 border border-dark-border flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-dark-muted font-medium block">Position / Rank</span>
                  <p className="font-semibold text-amber-300 truncate">{currentRank}</p>
                  <p className="text-[10px] text-dark-muted truncate">{hero.race}</p>
                </div>
              </div>

              {/* Power / Mastery */}
              <div className="p-2.5 rounded-xl bg-dark-elevated/70 border border-dark-border flex items-center gap-2">
                <Zap className="w-4 h-4 text-indigo-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-dark-muted font-medium block">
                    {isBusiness ? 'Influence Level' : 'Mastery Level'}
                  </span>
                  <p className="font-semibold text-indigo-300 truncate">Level {state.powerLevel}</p>
                  <p className="text-[10px] text-dark-muted truncate">{state.stamina} / 100 Stamina</p>
                </div>
              </div>
            </div>

            {/* Vitals Progress Bars */}
            <div className="space-y-2 bg-dark-elevated/40 p-3 rounded-2xl border border-dark-border">
              <ProgressBar
                label="Stamina & Narrative Focus"
                sublabel={`${state.stamina} / 100`}
                value={state.stamina}
                max={100}
                variant="amber"
              />
              <ProgressBar
                label={isBusiness ? 'Business Acumen & Market Reach' : 'Power Level & Mastery'}
                sublabel={`Level ${state.powerLevel}`}
                value={Math.min(100, state.powerLevel * 2)}
                max={100}
                variant="indigo"
              />
            </div>

            {/* Powers, Skills, and Gear (Genre-Adaptive) */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-dark-muted">
                {isFantasy ? 'Equipped Weapons & Arcane Abilities' : isBusiness ? 'Business Competencies & Tools' : 'Key Skills & Equipment'}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {hero.weapons && hero.weapons.map((w, idx) => (
                  <Badge key={`w-${idx}`} variant="primary" size="sm">
                    ⚔️ {w}
                  </Badge>
                ))}
                {hero.powers && hero.powers.map((p, idx) => (
                  <Badge key={`p-${idx}`} variant="amber" size="sm">
                    ✨ {p}
                  </Badge>
                ))}
                {hero.skills && hero.skills.map((s, idx) => (
                  <Badge key={`s-${idx}`} variant="emerald" size="sm">
                    🎯 {s}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Active Status Effects / Conditions */}
            {state.statusEffects && state.statusEffects.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-dark-muted">Active World Status Effects</div>
                <div className="flex flex-wrap gap-1.5">
                  {state.statusEffects.map((eff, idx) => (
                    <Badge key={idx} variant="purple" size="sm">
                      🌟 {eff}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Flexible Story Indicators: Context-dependent flags for any world or genre */}
            {customFlags.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-dark-muted flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-brand-primary" /> Story & World Indicators
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {customFlags.map(([key, val]) => (
                    <div key={key} className="p-2.5 rounded-xl bg-dark-elevated/60 border border-dark-border/80">
                      <span className="text-[10px] text-dark-muted font-medium block capitalize">
                        {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}
                      </span>
                      <p className="font-semibold text-dark-text truncate mt-0.5">
                        {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Live Inventory */}
        {activeTab === 'inventory' && (
          <div className="space-y-2">
            {state.inventory.length === 0 ? (
              <div className="text-center py-8 text-dark-muted text-xs">
                Your inventory is empty. Discover items through exploration and dialogue!
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

        {/* Tab 3: Active Quests */}
        {activeTab === 'quests' && (
          <div className="space-y-2">
            {state.activeQuests.length === 0 ? (
              <div className="text-center py-8 text-dark-muted text-xs">
                No active quests. Continue reading and taking action to accept new missions!
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
                    <p className="text-[10px] text-dark-muted/80">Given by: {quest.giver}</p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 4: Lore & Social Bonds / Reputation */}
        {activeTab === 'lore' && (
          <div className="space-y-3">
            <div className="text-xs font-semibold text-dark-muted">
              {isBusiness ? 'Commercial Partners & Reputation' : 'Companions, Contacts & NPC Trust'}
            </div>
            {Object.keys(state.npcTrust || {}).length === 0 ? (
              <div className="text-center py-6 text-dark-muted text-xs">
                No significant relationships recorded yet. Interact with nearby characters to form bonds.
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
