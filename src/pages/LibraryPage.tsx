import React, { useState, useEffect } from 'react';
import { StoryDocument } from '../types/story';
import { storyRepository } from '../lib/storage/storyRepository';
import { StoryCard } from '../components/history/StoryCard';
import { ExportModal } from '../components/history/ExportModal';
import { ScreenHeader } from '../components/navigation/ScreenHeader';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Search, Download, Plus, BookOpen, Info } from 'lucide-react';

interface LibraryPageProps {
  onOpenStory: (storyId: string) => void;
  onViewTranscript: (storyId: string) => void;
  onCreateNew: () => void;
}

export const LibraryPage: React.FC<LibraryPageProps> = ({
  onOpenStory,
  onViewTranscript,
  onCreateNew
}) => {
  const [stories, setStories] = useState<StoryDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed' | 'archived'>('all');

  // Modals state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const all = await storyRepository.listStories();
      setStories(all);
    } catch (err) {
      console.error('Failed to load library:', err);
    }
  };

  const handleArchive = async (storyId: string) => {
    const target = stories.find(s => s.id === storyId);
    if (!target) return;
    if (target.status === 'archived') {
      await storyRepository.unarchiveStory(storyId);
    } else {
      await storyRepository.archiveStory(storyId);
    }
    loadStories();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    await storyRepository.deleteStory(deleteTargetId);
    setDeleteTargetId(null);
    loadStories();
  };

  const handleRenameSubmit = async () => {
    if (!renameTarget || !renameTarget.title.trim()) return;
    await storyRepository.renameStory(renameTarget.id, renameTarget.title);
    setRenameTarget(null);
    loadStories();
  };

  const filteredStories = stories.filter((story) => {
    const matchesFilter = activeFilter === 'all' || story.status === activeFilter;
    if (!matchesFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      story.title.toLowerCase().includes(q) ||
      story.hero.name.toLowerCase().includes(q) ||
      story.worldName.toLowerCase().includes(q) ||
      story.genres.some(g => g.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex flex-col h-full bg-dark-bg">
      <ScreenHeader
        title="My Stories"
        subtitle={`${stories.length} adventures recorded`}
        rightAction={
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="p-2 rounded-xl text-dark-muted hover:text-dark-text hover:bg-dark-elevated"
              aria-label="Export or Import stories"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onCreateNew}
              className="p-2 rounded-xl text-brand-primary hover:bg-dark-elevated"
              aria-label="Create new story"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        }
      />

      {/* Search and Filter bar */}
      <div className="p-4 border-b border-dark-border/60 bg-dark-surface/60 space-y-3">
        {/* Local Storage Disclaimer Note */}
        <div className="p-2.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-[11px] text-indigo-300 flex items-start gap-2">
          <Info className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
          <span>
            Stories are persisted in your local browser IndexedDB. Use <strong>Export & Backup</strong> to save JSON backups.
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-dark-muted absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, hero, genre..."
            style={{ fontSize: '16px' }}
            className="w-full bg-dark-elevated border border-dark-border rounded-xl pl-9 pr-3.5 py-2 text-xs text-dark-text placeholder:text-dark-muted/50 focus:outline-none focus:border-brand-primary"
          />
        </div>

        {/* Status Filters */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'active', label: 'Active' },
            { id: 'completed', label: 'Completed' },
            { id: 'archived', label: 'Archived' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-3 py-1 rounded-lg font-medium transition-colors shrink-0 ${
                activeFilter === tab.id
                  ? 'bg-brand-primary text-white'
                  : 'bg-dark-elevated text-dark-muted hover:text-dark-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Story Cards List */}
      <div className="flex-1 p-4 overflow-y-auto overscroll-contain max-w-md mx-auto w-full space-y-3 safe-area-bottom">
        {filteredStories.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <BookOpen className="w-8 h-8 text-dark-muted mx-auto" />
            <p className="text-xs text-dark-muted">No stories found matching your filter.</p>
            <Button size="sm" variant="primary" onClick={onCreateNew}>
              Create New Story
            </Button>
          </div>
        ) : (
          filteredStories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              onOpen={onOpenStory}
              onViewTranscript={onViewTranscript}
              onRename={(id, title) => setRenameTarget({ id, title })}
              onArchive={handleArchive}
              onDelete={(id) => setDeleteTargetId(id)}
            />
          ))
        )}
      </div>

      {/* Rename Modal */}
      <Modal
        isOpen={!!renameTarget}
        onClose={() => setRenameTarget(null)}
        title="Rename Story"
        footer={
          <>
            <Button size="sm" variant="ghost" onClick={() => setRenameTarget(null)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" onClick={handleRenameSubmit}>
              Save Title
            </Button>
          </>
        }
      >
        <div className="space-y-2">
          <label className="text-xs font-semibold text-dark-muted">New Title</label>
          <input
            type="text"
            value={renameTarget?.title || ''}
            onChange={(e) => setRenameTarget(prev => prev ? { ...prev, title: e.target.value } : null)}
            className="w-full bg-dark-elevated border border-dark-border rounded-xl px-3 py-2 text-xs text-dark-text focus:outline-none focus:border-brand-primary"
            autoFocus
          />
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        title="Delete Story?"
        footer={
          <>
            <Button size="sm" variant="ghost" onClick={() => setDeleteTargetId(null)}>
              Cancel
            </Button>
            <Button size="sm" variant="danger" onClick={handleDeleteConfirm}>
              Permanently Delete
            </Button>
          </>
        }
      >
        <p className="text-xs text-dark-muted leading-relaxed">
          Are you sure you want to delete this story? All narrative turns, choices, and character progress will be permanently erased.
        </p>
      </Modal>

      {/* Export & Import Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        allStories={stories}
        onImportSuccess={() => loadStories()}
      />
    </div>
  );
};
