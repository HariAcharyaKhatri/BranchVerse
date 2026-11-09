import React from 'react';
import { IsekaiReincarnationPage } from './IsekaiReincarnationPage';

export interface HomePageProps {
  onNavigate: (path: string) => void;
  onOpenStory: (storyId: string) => void;
  onQuickPlay?: () => void;
  onLaunchStory?: (params: any) => Promise<void>;
  isGenerating?: boolean;
}

/**
 * HomePage: In accordance with the Isekai Reincarnation Experience Redesign,
 * the conventional 3-card story selection dashboard is removed.
 * Every user begins with the predefined cinematic opening story (death, transition,
 * afterlife awakening, and arrival before Divine Angel Seraphina).
 * Existing library, settings, and chronicles are preserved in the top secondary header.
 */
export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onLaunchStory,
  isGenerating = false,
}) => {
  return (
    <IsekaiReincarnationPage
      onNavigate={onNavigate}
      onLaunchStory={async (params) => {
        if (onLaunchStory) {
          await onLaunchStory(params);
        } else {
          onNavigate('#/isekai');
        }
      }}
      isGenerating={isGenerating}
    />
  );
};
