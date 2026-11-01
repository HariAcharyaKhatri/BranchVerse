import { SupportedLanguage } from './story';

export interface UserPreferences {
  storyLanguage: SupportedLanguage;
  appLanguage: SupportedLanguage;
  narrativeLength: 'concise' | 'balanced' | 'detailed';
  pacing: string;
  difficulty: 'Adventurer (Standard)' | 'Heroic (Tactical)' | 'Hardcore Iron (Unforgiving)' | string;
  readingFontSize: number;
  readingFontFamily: 'serif' | 'sans';
  theme: 'dark' | 'light';
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  storyLanguage: 'hi', // Hindi is the DEFAULT story language
  appLanguage: 'en', // English is the DEFAULT UI app language
  narrativeLength: 'balanced',
  pacing: 'Balanced Narrative',
  difficulty: 'Adventurer (Standard)',
  readingFontSize: 18,
  readingFontFamily: 'serif',
  theme: 'dark',
};
