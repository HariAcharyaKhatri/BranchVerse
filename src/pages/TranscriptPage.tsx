import React, { useState, useEffect } from 'react';
import { StoryDocument } from '../types/story';
import { storyRepository } from '../lib/storage/storyRepository';
import { TranscriptView } from '../components/history/TranscriptView';
import { ExportModal } from '../components/history/ExportModal';

interface TranscriptPageProps {
  storyId: string;
  onBack: () => void;
}

export const TranscriptPage: React.FC<TranscriptPageProps> = ({ storyId, onBack }) => {
  const [story, setStory] = useState<StoryDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExportOpen, setIsExportOpen] = useState(false);

  useEffect(() => {
    storyRepository.getStory(storyId).then(doc => {
      setStory(doc);
      setIsLoading(false);
    });
  }, [storyId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-dark-bg text-xs text-dark-muted">
        Loading transcript...
      </div>
    );
  }

  if (!story) {
    return (
      <div className="p-6 text-center text-xs text-dark-muted">
        Story not found.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-dark-bg">
      <TranscriptView
        story={story}
        onBack={onBack}
        onExport={() => setIsExportOpen(true)}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        story={story}
      />
    </div>
  );
};
