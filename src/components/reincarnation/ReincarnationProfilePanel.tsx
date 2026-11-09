import React, { useState } from 'react';
import { ReincarnationProfile, ProfileFieldStatus } from '../../features/reincarnation/reincarnationTypes';
import { Badge } from '../ui/Badge';
import { Globe, User, Zap, Castle, BookOpen, Edit2, Check, X, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';

interface ReincarnationProfilePanelProps {
  profile: ReincarnationProfile;
  onUpdateField: (category: keyof ReincarnationProfile, field: string, newValue: any) => void;
  onOpenFateWheel?: (category: any) => void;
  onConfirmProfile?: () => void;
  className?: string;
}

export const ReincarnationProfilePanel: React.FC<ReincarnationProfilePanelProps> = ({
  profile,
  onUpdateField,
  onOpenFateWheel,
  onConfirmProfile,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'world' | 'character' | 'abilities' | 'circumstances' | 'preferences'>('character');
  const [editingField, setEditingField] = useState<{
    category: keyof ReincarnationProfile;
    field: string;
    label: string;
    currentValue: string;
  } | null>(null);
  const [editValue, setEditValue] = useState('');

  const renderStatusBadge = (status: ProfileFieldStatus) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            Confirmed
          </span>
        );
      case 'random':
        return (
          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">
            Fate Result
          </span>
        );
      case 'suggested':
        return (
          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
            Suggested
          </span>
        );
      case 'undecided':
      default:
        return (
          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-dark-border text-dark-muted border border-dark-border/80">
            Undecided
          </span>
        );
    }
  };

  const startEditing = (category: keyof ReincarnationProfile, field: string, label: string, value: any) => {
    const stringVal = Array.isArray(value) ? value.join(', ') : typeof value === 'object' ? JSON.stringify(value) : String(value);
    setEditingField({ category, field, label, currentValue: stringVal });
    setEditValue(stringVal);
  };

  const handleSaveEdit = () => {
    if (editingField) {
      let finalVal: any = editValue.trim();
      // If array field (e.g. affinities, themes), split by comma
      if (['magicAffinity', 'specialAbilities', 'skills', 'primaryThemes', 'races', 'kingdoms', 'personality'].includes(editingField.field)) {
        finalVal = editValue.split(',').map((s) => s.trim()).filter(Boolean);
      }
      onUpdateField(editingField.category, editingField.field, finalVal);
      setEditingField(null);
    }
  };

  // Compute total decided percentage
  const allFields = [
    profile.character.name,
    profile.character.race,
    profile.character.socialStatus,
    profile.world.genre,
    profile.world.name,
    profile.world.magicSystem,
    profile.abilities.magicAffinity,
    profile.circumstances.birthplace,
    profile.circumstances.familyStatus,
    profile.preferences.primaryThemes,
  ];
  const decidedCount = allFields.filter((f) => f.status !== 'undecided').length;
  const progressPercent = Math.round((decidedCount / allFields.length) * 100);

  const tabs = [
    { id: 'character', label: 'Character', icon: User },
    { id: 'world', label: 'World', icon: Globe },
    { id: 'abilities', label: 'Abilities', icon: Zap },
    { id: 'circumstances', label: 'Origin', icon: Castle },
    { id: 'preferences', label: 'Themes', icon: BookOpen },
  ];

  return (
    <div className={`flex flex-col bg-[#090514]/90 border border-dark-border/70 rounded-3xl p-4 sm:p-5 text-white select-none shadow-xl backdrop-blur-md overflow-hidden ${className}`}>
      {/* Panel Header & Progress */}
      <div className="flex items-center justify-between border-b border-dark-border/50 pb-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold font-serif text-white tracking-wide">
            Reincarnation Profile
          </h3>
          <p className="text-[11px] text-dark-muted font-mono">
            Live Synchronized Soul Blueprint
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-20 bg-dark-surface rounded-full h-2 overflow-hidden border border-dark-border">
            <div
              className="bg-gradient-to-r from-violet-500 to-amber-400 h-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-amber-300 font-bold">{progressPercent}%</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 py-2.5 overflow-x-auto border-b border-dark-border/40">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-dark-muted hover:text-white hover:bg-dark-elevated'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Profile Fields List */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1 text-xs max-h-[380px] sm:max-h-[460px]">
        {/* CHARACTER TAB */}
        {activeTab === 'character' && (
          <div className="space-y-2.5">
            {[
              { field: 'name', label: 'True Name', data: profile.character.name },
              { field: 'race', label: 'Species / Race', data: profile.character.race },
              { field: 'socialStatus', label: 'Social Status', data: profile.character.socialStatus },
              { field: 'gender', label: 'Gender Expression', data: profile.character.gender },
              { field: 'age', label: 'Apparent Age', data: profile.character.age },
              { field: 'personality', label: 'Personality Traits', data: profile.character.personality },
              { field: 'background', label: 'Life Memory', data: profile.character.background },
            ].map(({ field, label, data }) => (
              <div
                key={field}
                className="p-3 rounded-2xl bg-dark-surface/80 border border-dark-border/60 hover:border-violet-500/40 transition-colors flex flex-col justify-between gap-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-dark-muted font-medium">{label}</span>
                  <div className="flex items-center gap-1.5">
                    {renderStatusBadge(data.status)}
                    <button
                      onClick={() => startEditing('character', field, label, data.value)}
                      className="p-1 text-dark-muted hover:text-white rounded"
                      title="Edit manually"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="font-semibold text-white truncate">
                  {Array.isArray(data.value) ? data.value.join(', ') : String(data.value || 'Undecided')}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* WORLD TAB */}
        {activeTab === 'world' && (
          <div className="space-y-2.5">
            {[
              { field: 'name', label: 'Realm Name', data: profile.world.name },
              { field: 'genre', label: 'Genre & Type', data: profile.world.genre },
              { field: 'era', label: 'Historical Era', data: profile.world.era },
              { field: 'magicSystem', label: 'Magic / Power System', data: profile.world.magicSystem },
              { field: 'politicalStructure', label: 'Political Structure', data: profile.world.politicalStructure },
              { field: 'majorConflicts', label: 'Major Conflicts & Threats', data: profile.world.majorConflicts },
            ].map(({ field, label, data }) => (
              <div
                key={field}
                className="p-3 rounded-2xl bg-dark-surface/80 border border-dark-border/60 hover:border-violet-500/40 transition-colors flex flex-col justify-between gap-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-dark-muted font-medium">{label}</span>
                  <div className="flex items-center gap-1.5">
                    {renderStatusBadge(data.status)}
                    <button
                      onClick={() => startEditing('world', field, label, data.value)}
                      className="p-1 text-dark-muted hover:text-white rounded"
                      title="Edit manually"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="font-semibold text-white">
                  {Array.isArray(data.value) ? data.value.join(', ') : String(data.value || 'Undecided')}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ABILITIES TAB */}
        {activeTab === 'abilities' && (
          <div className="space-y-2.5">
            {[
              { field: 'magicAffinity', label: 'Magical Affinities', data: profile.abilities.magicAffinity },
              { field: 'specialAbilities', label: 'Signature Abilities', data: profile.abilities.specialAbilities },
              { field: 'skills', label: 'Combat & Mundane Skills', data: profile.abilities.skills },
              { field: 'talents', label: 'Innate Talents', data: profile.abilities.talents },
              { field: 'previousLifeKnowledge', label: 'Earth Knowledge Retained', data: profile.abilities.previousLifeKnowledge },
            ].map(({ field, label, data }) => (
              <div
                key={field}
                className="p-3 rounded-2xl bg-dark-surface/80 border border-dark-border/60 hover:border-violet-500/40 transition-colors flex flex-col justify-between gap-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-dark-muted font-medium">{label}</span>
                  <div className="flex items-center gap-1.5">
                    {renderStatusBadge(data.status)}
                    <button
                      onClick={() => startEditing('abilities', field, label, data.value)}
                      className="p-1 text-dark-muted hover:text-white rounded"
                      title="Edit manually"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="font-semibold text-white">
                  {Array.isArray(data.value) ? data.value.join(', ') : String(data.value || 'Undecided')}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CIRCUMSTANCES TAB */}
        {activeTab === 'circumstances' && (
          <div className="space-y-2.5">
            {[
              { field: 'birthplace', label: 'Awakening / Birthplace', data: profile.circumstances.birthplace },
              { field: 'familyStatus', label: 'Family Household', data: profile.circumstances.familyStatus },
              { field: 'wealth', label: 'Initial Wealth & Heirlooms', data: profile.circumstances.wealth },
              { field: 'socialPosition', label: 'Social Position', data: profile.circumstances.socialPosition },
              { field: 'initialCircumstances', label: 'Initial Situation', data: profile.circumstances.initialCircumstances },
            ].map(({ field, label, data }) => (
              <div
                key={field}
                className="p-3 rounded-2xl bg-dark-surface/80 border border-dark-border/60 hover:border-violet-500/40 transition-colors flex flex-col justify-between gap-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-dark-muted font-medium">{label}</span>
                  <div className="flex items-center gap-1.5">
                    {renderStatusBadge(data.status)}
                    <button
                      onClick={() => startEditing('circumstances', field, label, data.value)}
                      className="p-1 text-dark-muted hover:text-white rounded"
                      title="Edit manually"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="font-semibold text-white">
                  {Array.isArray(data.value) ? data.value.join(', ') : String(data.value || 'Undecided')}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PREFERENCES TAB */}
        {activeTab === 'preferences' && (
          <div className="space-y-2.5">
            {[
              { field: 'primaryThemes', label: 'Primary Narrative Themes', data: profile.preferences.primaryThemes },
              { field: 'tone', label: 'Story Tone', data: profile.preferences.tone },
              { field: 'pacing', label: 'Story Pacing', data: profile.preferences.pacing },
              { field: 'storyLanguage', label: 'Narration Language', data: profile.preferences.storyLanguage },
            ].map(({ field, label, data }) => (
              <div
                key={field}
                className="p-3 rounded-2xl bg-dark-surface/80 border border-dark-border/60 hover:border-violet-500/40 transition-colors flex flex-col justify-between gap-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-dark-muted font-medium">{label}</span>
                  <div className="flex items-center gap-1.5">
                    {renderStatusBadge(data.status)}
                    <button
                      onClick={() => startEditing('preferences', field, label, data.value)}
                      className="p-1 text-dark-muted hover:text-white rounded"
                      title="Edit manually"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="font-semibold text-white">
                  {Array.isArray(data.value) ? data.value.join(', ') : String(data.value || 'Undecided')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {onConfirmProfile && (
        <div className="pt-3 border-t border-dark-border/40 shrink-0">
          <Button
            variant="amber"
            size="md"
            onClick={onConfirmProfile}
            className="w-full justify-center font-bold shadow-lg shadow-amber-400/20"
          >
            <span>Review Detailed Profile</span>
            <ChevronRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      )}

      {/* Manual Field Edit Modal */}
      {editingField && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]">
          <div className="w-full max-w-sm bg-dark-surface border border-violet-500/50 rounded-2xl p-5 space-y-4 shadow-2xl">
            <div>
              <h4 className="text-sm font-bold text-white font-serif">Edit {editingField.label}</h4>
              <p className="text-[11px] text-dark-muted">Enter custom value to confirm choice</p>
            </div>
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-primary"
              autoFocus
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingField(null)}
                className="px-3 py-1.5 text-xs text-dark-muted hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-3 py-1.5 rounded-lg bg-brand-primary text-xs font-semibold text-white shadow-md hover:bg-brand-primary/90"
              >
                Confirm Choice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
