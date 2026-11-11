import { HeroProfile } from '../../types/character';
import { WorldDefinition } from '../../types/world';
import { StorySettings, SupportedLanguage } from '../../types/story';
import { PowerTierCode } from '../character/tierSystem';

export type ProfileFieldStatus = 'confirmed' | 'suggested' | 'random' | 'undecided';

export interface ProfileField<T = string> {
  value: T;
  status: ProfileFieldStatus;
  sourceText?: string;
}

export interface ReincarnationProfile {
  // A. World Configuration
  world: {
    genre: ProfileField<string>;
    name: ProfileField<string>;
    era: ProfileField<string>;
    geography: ProfileField<string>;
    politicalStructure: ProfileField<string>;
    kingdoms: ProfileField<string[]>;
    magicSystem: ProfileField<string>;
    races: ProfileField<string[]>;
    culture: ProfileField<string>;
    majorConflicts: ProfileField<string>;
  };
  // B. Character Identity
  character: {
    name: ProfileField<string>;
    gender: ProfileField<string>;
    age: ProfileField<string>;
    race: ProfileField<string>;
    appearance: ProfileField<{
      hair: string;
      eyes: string;
      clothing: string;
      distinguishingFeatures: string;
    }>;
    personality: ProfileField<string[]>;
    background: ProfileField<string>;
    socialStatus: ProfileField<string>;
  };
  // C. Abilities and Knowledge
  abilities: {
    powerTier?: ProfileField<PowerTierCode>;
    magicAffinity: ProfileField<string[]>;
    specialAbilities: ProfileField<string[]>;
    skills: ProfileField<string[]>;
    previousLifeKnowledge: ProfileField<string>;
    talents: ProfileField<string[]>;
    startingLimitations: ProfileField<string[]>;
  };
  // D. Starting Circumstances
  circumstances: {
    birthplace: ProfileField<string>;
    familyStatus: ProfileField<string>;
    wealth: ProfileField<string>;
    socialPosition: ProfileField<string>;
    initialCircumstances: ProfileField<string>;
  };
  // E. Story Preferences
  preferences: {
    primaryThemes: ProfileField<string[]>;
    pacing: ProfileField<string>;
    tone: ProfileField<string>;
    storyLanguage: ProfileField<SupportedLanguage>;
  };
}

export type FixedOpeningScene =
  | 'previous_life'
  | 'transition'
  | 'afterlife_awakening'
  | 'angel_arrival';

export type ReincarnationStage =
  | 'fixed_opening'
  | 'opening_scenes'
  | 'angel_conversation'
  | 'angel_dialogue'
  | 'fate_wheel'
  | 'review_confirmation'
  | 'transmigration';

export interface AngelDialogueMessage {
  id: string;
  sender: 'angel' | 'hero' | 'narrator' | 'user';
  speaker?: 'angel' | 'hero' | 'narrator' | 'user';
  text: string;
  extractedFields?: string[];
  timestamp: number;
}

export type FateWheelCategory =
  | 'world_type'
  | 'race'
  | 'origin'
  | 'abilities'
  | 'story_direction';

export interface FateWheelCategoryDefinition {
  id: FateWheelCategory;
  name: string;
  description: string;
  options: {
    id?: string;
    label: string;
    description: string;
    data: Record<string, any>;
  }[];
}

export interface ReincarnationSession {
  sessionId: string;
  userId?: string;
  stage: ReincarnationStage;
  fixedOpeningScene: FixedOpeningScene;
  currentSceneIndex: number;
  hasSeenOpening: boolean;
  angelName: string;
  userNameChosen?: string;
  conversationHistory: AngelDialogueMessage[];
  dialogueHistory: AngelDialogueMessage[];
  profile: ReincarnationProfile;
  activeTopic: string;
  createdAt: number;
  updatedAt: number;
}

export interface ReincarnationLaunchPackage {
  hero: HeroProfile;
  world: WorldDefinition;
  settings: StorySettings;
  summaryText: string;
}
