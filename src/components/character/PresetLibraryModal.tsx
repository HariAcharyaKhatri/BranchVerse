import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { CharacterPreset, CharacterProfile } from '../../types/talent';
import { characterPresetService } from '../../features/character/characterPresetService';
import { TierBadge } from './TierBadge';
import {
  Search,
  Bookmark,
  Sparkles,
  Copy,
  Trash2,
  Download,
  Upload,
  Check,
  Briefcase,
  Sword,
  Shield,
  Layers,
  AlertCircle,
} from 'lucide-react';

interface PresetLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (profile: CharacterProfile) => void;
  userId?: string;
}

export const PresetLibraryModal: React.FC<PresetLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
  userId,
}) => {
  const [presets, setPresets] = useState<CharacterPreset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'canonical' | 'custom' | 'non_combat'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // Load presets whenever modal opens
  const loadPresets = async () => {
    setIsLoading(true);
    try {
      const list = await characterPresetService.listPresets(userId);
      setPresets(list);
    } catch (err) {
      console.warn('[PresetLibraryModal] Error loading presets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadPresets();
      setDeletingId(null);
      setImportError(null);
    }
  }, [isOpen, userId]);

  // Filter and search presets
  const filteredPresets = useMemo(() => {
    return presets.filter((p) => {
      // Tab filter
      if (filterTab === 'canonical' && !p.isBuiltIn) return false;
      if (filterTab === 'custom' && p.isBuiltIn) return false;
      if (filterTab === 'non_combat') {
        const hasNonCombatTag = (p.tags || []).some((t) =>
          ['Non-Combat', 'Merchant', 'Economy', 'Scholar', 'Crafting'].includes(t)
        );
        const hasNonCombatProf = (p.profile?.professions || []).some((prof) =>
          ['Merchant', 'Scholar', 'Farmer', 'Blacksmith', 'Healer', 'Architect'].some((nc) =>
            prof.includes(nc)
          )
        );
        if (!hasNonCombatTag && !hasNonCombatProf) return false;
      }

      // Query filter
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const nameMatch = p.name.toLowerCase().includes(q);
      const summaryMatch = p.summary.toLowerCase().includes(q);
      const tagMatch = (p.tags || []).some((t) => t.toLowerCase().includes(q));
      const speciesMatch = (p.profile?.species || '').toLowerCase().includes(q);
      const profMatch = (p.profile?.professions || []).some((prof) => prof.toLowerCase().includes(q));
      return nameMatch || summaryMatch || tagMatch || speciesMatch || profMatch;
    });
  }, [presets, filterTab, searchQuery]);

  // Duplicate handler
  const handleDuplicate = async (preset: CharacterPreset) => {
    try {
      await characterPresetService.duplicatePreset(preset.id, `${preset.name} (Copy)`, userId);
      await loadPresets();
    } catch (err) {
      console.error('[PresetLibraryModal] Duplicate error:', err);
    }
  };

  // Delete handler
  const handleDelete = async (presetId: string) => {
    try {
      await characterPresetService.deletePreset(presetId, userId);
      setDeletingId(null);
      await loadPresets();
    } catch (err) {
      console.error('[PresetLibraryModal] Delete error:', err);
    }
  };

  // Export handler
  const handleExport = (preset: CharacterPreset) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(preset, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', `${preset.name.replace(/\s+/g, '_')}_preset.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // Import handler via file input
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const profileToSave: CharacterProfile = parsed.profile || parsed;
        if (!profileToSave.name) {
          setImportError('Invalid character preset file: missing name.');
          return;
        }
        await characterPresetService.savePreset(
          profileToSave,
          parsed.name || profileToSave.name,
          parsed.summary || `Imported profile of ${profileToSave.name}`,
          parsed.tags || ['Imported'],
          userId
        );
        await loadPresets();
      } catch (err: any) {
        setImportError(err.message || 'Failed to parse JSON preset file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Soul Codex & Preset Library"
      maxWidth="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <label className="cursor-pointer text-xs flex items-center gap-1.5 text-violet-300 hover:text-violet-200">
            <Upload className="w-3.5 h-3.5" />
            <span>Import Preset JSON</span>
            <input
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleImportFile}
            />
          </label>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
            Close Codex
          </Button>
        </div>
      }
    >
      <div className="p-4 sm:p-5 space-y-4 max-h-[72vh] overflow-y-auto touch-scroll">
        {/* Search & Filter Header */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, role, species, or trait..."
              className="w-full pl-9 pr-3 py-2 bg-dark-surface border border-dark-border rounded-xl text-xs text-white placeholder-dark-muted focus:outline-none focus:border-violet-500/60"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 touch-scroll">
            <button
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                filterTab === 'all'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-dark-surface border border-dark-border text-dark-muted hover:text-white'
              }`}
            >
              All ({presets.length})
            </button>
            <button
              onClick={() => setFilterTab('canonical')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                filterTab === 'canonical'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-dark-surface border border-dark-border text-dark-muted hover:text-white'
              }`}
            >
              Canonical Lore
            </button>
            <button
              onClick={() => setFilterTab('non_combat')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                filterTab === 'non_combat'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-dark-surface border border-dark-border text-dark-muted hover:text-white'
              }`}
            >
              Non-Combat & Trade
            </button>
            <button
              onClick={() => setFilterTab('custom')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                filterTab === 'custom'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-dark-surface border border-dark-border text-dark-muted hover:text-white'
              }`}
            >
              Custom Presets
            </button>
          </div>
        </div>

        {importError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{importError}</span>
          </div>
        )}

        {/* Preset Cards Grid */}
        {filteredPresets.length === 0 ? (
          <div className="p-8 text-center bg-dark-surface/50 rounded-2xl border border-dark-border/40">
            <Bookmark className="w-8 h-8 text-dark-muted mx-auto mb-2 opacity-50" />
            <p className="text-sm text-dark-muted font-serif">No presets matched your search criteria.</p>
            <p className="text-xs text-dark-muted/70 mt-1">Try another search keyword or switch filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredPresets.map((preset) => {
              const level = preset.profile?.characterLevel ?? preset.profile?.powerLevel ?? 1;
              const primaryTier = preset.profile?.tier || preset.profile?.talents?.[0]?.tier || 'C';
              const isBuiltIn = Boolean(preset.isBuiltIn);

              return (
                <div
                  key={preset.id}
                  className="flex flex-col justify-between p-3.5 rounded-2xl bg-dark-surface border border-dark-border/80 hover:border-violet-500/40 transition-all shadow-sm group"
                >
                  <div>
                    {/* Header: Name, Badges */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-white font-serif group-hover:text-violet-200 transition-colors">
                            {preset.name}
                          </h4>
                          {isBuiltIn ? (
                            <span className="text-[9px] font-mono font-bold text-amber-300 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                              Canonical
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono font-bold text-indigo-300 bg-indigo-400/10 px-1.5 py-0.5 rounded border border-indigo-400/20">
                              Custom
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-dark-muted font-sans mt-0.5 block">
                          {preset.profile?.species || 'Human'} • Lv. {level}
                        </span>
                      </div>
                      <TierBadge tier={primaryTier} size="xs" />
                    </div>

                    {/* Summary */}
                    <p className="text-xs text-dark-muted mt-2 leading-relaxed line-clamp-2">
                      {preset.summary}
                    </p>

                    {/* Professions & Talents preview */}
                    <div className="mt-2.5 flex flex-wrap gap-1">
                      {(preset.profile?.professions || []).slice(0, 2).map((prof, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded bg-dark-elevated text-dark-text border border-dark-border/60"
                        >
                          {prof}
                        </span>
                      ))}
                      {(preset.profile?.talents || []).slice(0, 2).map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded bg-violet-950/30 text-violet-300 border border-violet-500/20 font-mono"
                        >
                          {t.name} ({t.tier})
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-3.5 pt-2.5 border-t border-dark-border/40 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        title="Duplicate Preset"
                        onClick={() => handleDuplicate(preset)}
                        className="p-1.5 rounded-lg text-dark-muted hover:text-white hover:bg-dark-elevated transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        title="Export JSON"
                        onClick={() => handleExport(preset)}
                        className="p-1.5 rounded-lg text-dark-muted hover:text-white hover:bg-dark-elevated transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      {!isBuiltIn && (
                        <>
                          {deletingId === preset.id ? (
                            <div className="flex items-center gap-1 bg-rose-950/40 p-0.5 rounded-lg border border-rose-500/40">
                              <button
                                onClick={() => handleDelete(preset.id)}
                                className="text-[10px] text-rose-300 font-bold px-1.5 py-0.5 hover:bg-rose-600 hover:text-white rounded"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeletingId(null)}
                                className="text-[10px] text-dark-muted px-1 hover:text-white"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              title="Delete Preset"
                              onClick={() => setDeletingId(preset.id)}
                              className="p-1.5 rounded-lg text-dark-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </>
                      )}
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        onSelectPreset(preset.profile);
                        onClose();
                      }}
                      className="text-xs bg-violet-600 hover:bg-violet-500 font-bold px-3 py-1"
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Load Preset
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
};