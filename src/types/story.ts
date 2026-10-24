import { HeroProfile } from './character';

export type SupportedLanguage = 'en' | 'hi' | 'es' | 'fr' | 'ja' | 'ko';

export const LANGUAGE_LABELS: Record<SupportedLanguage, { label: string; native: string; flag: string }> = {
  en: { label: 'English', native: 'English', flag: '🇬🇧' },
  hi: { label: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  es: { label: 'Spanish', native: 'Español', flag: '🇪🇸' },
  fr: { label: 'French', native: 'Français', flag: '🇫🇷' },
  ja: { label: 'Japanese', native: '日本語', flag: '🇯🇵' },
  ko: { label: 'Korean', native: '한국어', flag: '🇰🇷' },
};

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  description: string;
  category: 'weapon' | 'consumable' | 'artifact' | 'key_item' | 'material';
  effectDescription?: string;
}

export interface Quest {
  id: string;
  title: string;
  giver: string;
  objective: string;
  status: 'active' | 'completed' | 'failed';
  rewardDescription?: string;
}

export interface StoryState {
  health: number; // 0 - 100
  maxHealth: number;
  stamina: number; // 0 - 100
  powerLevel: number;
  inventory: InventoryItem[];
  activeQuests: Quest[];
  worldFlags: Record<string, boolean | string | number>;
  npcTrust: Record<string, number>; // -100 to +100
  statusEffects: string[]; // e.g. "Poisoned", "Awakened Spirit", "Wanted by Citadel Guards"
  timelineStep: number;
  currentLocation: string;
  isGameOver: boolean;
  endingType?: 'victory' | 'tragedy' | 'open' | 'secret';
}

export interface ChoiceOption {
  choiceId: string;
  text: string;
  consequenceHint?: string;
  riskLevel?: 'safe' | 'moderate' | 'perilous';
  requiredItem?: string;
  requiredStamina?: number;
  stateImpact?: Partial<StoryState>;
  nextSceneId?: string;
}

export interface StoryDialogue {
  speaker: string;
  text: string;
  emotion?: 'calm' | 'furious' | 'mysterious' | 'terrified' | 'warm';
}

export interface StoryTurn {
  turnId: string;
  chapterNumber: number;
  sceneTitle: string;
  narrativeText: string;
  dialogues?: StoryDialogue[];
  ambientVisual?: string; // Icon or scene mood badge
  choices: ChoiceOption[];
  selectedChoiceId?: string;
  customActionText?: string;
  outcomeText?: string;
  stateDelta?: {
    healthChange?: number;
    staminaChange?: number;
    itemsAdded?: InventoryItem[];
    itemsRemoved?: string[];
    questsUpdated?: string[];
    trustChanges?: Record<string, number>;
  };
  timestamp: number;
}

export interface StorySettings {
  tone: 'Anime Shonen' | 'Epic Fantasy' | 'Dark & Gritty' | 'Cyberpunk Noir' | 'Lighthearted Isekai';
  pacing: 'Fast-paced Action' | 'Balanced Narrative' | 'Deep Lore Exploration';
  difficulty: 'Adventurer (Standard)' | 'Heroic (Tactical)' | 'Hardcore Iron (Unforgiving)';
  storyLanguage?: SupportedLanguage;
}

export interface StoryDocument {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  hero: HeroProfile;
  genres: string[];
  worldId: string;
  worldName: string;
  settings: StorySettings;
  state: StoryState;
  turns: StoryTurn[];
  status: 'active' | 'completed' | 'archived';
  version: number;
  generationMode?: 'demo' | 'ai';
  storyLanguage?: SupportedLanguage;
}

export interface StoryMetadata {
  id: string;
  title: string;
  heroName: string;
  genre: string;
  chapter: number;
  status: 'active' | 'completed' | 'archived';
  updatedAt: number;
  createdAt: number;
  location: string;
}
