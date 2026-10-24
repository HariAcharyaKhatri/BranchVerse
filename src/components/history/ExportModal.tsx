import React, { useState } from 'react';
import { StoryDocument } from '../../types/story';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { exportStoryToMarkdown, exportStoriesToJson, importStoriesFromJson } from '../../lib/storage/exportImport';
import { Download, Upload, Copy, Check, FileText } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  story?: StoryDocument;
  allStories?: StoryDocument[];
  onImportSuccess?: (count: number) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  story,
  allStories = [],
  onImportSuccess
}) => {
  const [copied, setCopied] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleCopyMarkdown = () => {
    if (!story) return;
    const md = exportStoryToMarkdown(story);
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadMarkdown = () => {
    if (!story) return;
    const md = exportStoryToMarkdown(story);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${story.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_branchverse.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJson = () => {
    const list = story ? [story] : allStories;
    const json = exportStoriesToJson(list);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `branchverse_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus(null);
    try {
      const text = await file.text();
      const count = await importStoriesFromJson(text);
      setImportStatus(`Successfully imported ${count} story!`);
      if (onImportSuccess) onImportSuccess(count);
    } catch (err: any) {
      setImportStatus(`Import failed: ${err.message || 'Corrupted file'}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export & Backup Stories"
      footer={
        <Button variant="ghost" size="sm" onClick={onClose}>
          Done
        </Button>
      }
    >
      <div className="space-y-4 text-xs">
        {story && (
          <div className="p-3.5 rounded-xl bg-dark-elevated border border-dark-border space-y-2.5">
            <div className="font-semibold text-dark-text flex items-center gap-1.5 text-sm">
              <FileText className="w-4 h-4 text-brand-primary" /> Export as Markdown Book
            </div>
            <p className="text-dark-muted">
              Download this complete story formatted as an interactive fantasy novel with all chapters and player decisions.
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={handleCopyMarkdown} iconLeft={copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}>
                {copied ? 'Copied!' : 'Copy Markdown'}
              </Button>
              <Button size="sm" variant="primary" onClick={handleDownloadMarkdown} iconLeft={<Download className="w-3.5 h-3.5" />}>
                Download .MD
              </Button>
            </div>
          </div>
        )}

        {/* JSON Backup & Restore */}
        <div className="p-3.5 rounded-xl bg-dark-elevated border border-dark-border space-y-2.5">
          <div className="font-semibold text-dark-text flex items-center gap-1.5 text-sm">
            <Download className="w-4 h-4 text-amber-400" /> JSON Data Backup & Restore
          </div>
          <p className="text-dark-muted">
            Export all story state and full transcripts to validated JSON, or restore stories from another device.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={handleDownloadJson} iconLeft={<Download className="w-3.5 h-3.5" />}>
              Download JSON Backup
            </Button>

            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-dark-surface hover:bg-dark-border border border-dark-border text-dark-text text-xs font-medium cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5 text-brand-primary" />
              <span>Import JSON Backup</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                disabled={isImporting}
                className="hidden"
              />
            </label>
          </div>

          {importStatus && (
            <div className={`p-2 rounded-lg font-medium text-xs mt-2 ${
              importStatus.startsWith('Success') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {importStatus}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
