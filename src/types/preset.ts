import { SupportedLanguage } from './story';

export interface StoryPreset {
  id: string;
  name: string;
  description?: string;
  selectedGenre: string;
  genres: string[];
  tone: string;
  pacing: string;
  difficulty: string;
  narrativeLength: 'concise' | 'balanced' | 'detailed';
  storyLanguage: SupportedLanguage;
  worldName?: string;
  timePeriod?: string;
  storyStyle?: string;
  romanceLevel?: string;
  actionLevel?: string;
  mysteryLevel?: string;
  heroArchetype?: {
    race?: string;
    personality?: string;
  };
  createdAt: number;
  updatedAt: number;
  isBuiltIn?: boolean;
}

export type CreateStoryPresetInput = Omit<StoryPreset, 'id' | 'createdAt' | 'updatedAt' | 'isBuiltIn'>;
