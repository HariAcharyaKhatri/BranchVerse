import { HeroProfile, MoralAlignment } from '../../types/character';
import { WorldDefinition } from '../../types/world';
import { StorySettings } from '../../types/story';

export type ProloguePhase =
  | 'first_life'
  | 'astral_awakening'
  | 'entity_communion'
  | 'multiverse_offer'
  | 'soul_sculpting'
  | 'gateway_selection'
  | 'final_departure'
  | 'completed';

export type EntityPersonality = 'mysterious' | 'formal' | 'witty' | 'divine';

export interface EntityDialogueEntry {
  id: string;
  speaker: 'entity' | 'hero' | 'narrator';
  text: string;
  emotion?: 'calm' | 'amused' | 'mysterious' | 'solemn' | 'intrigued';
  timestamp: number;
}

export interface RaceDefinition {
  id: string;
  name: string;
  category: 'humanoid' | 'elven' | 'bestial' | 'draconic' | 'mythic' | 'abyssal' | 'synthetic';
  description: string;
  innateTraits: string[];
  lifespan: string;
  primaryAffinities: string[];
  recommendedClasses: string[];
}

export interface ClassDefinition {
  id: string;
  name: string;
  role: 'martial' | 'arcane' | 'hybrid' | 'profession';
  description: string;
  primaryAttributes: string[];
  signatureAbilities: string[];
  starterWeapons: string[];
}

export interface ElementalAffinityDefinition {
  id: string;
  name: string;
  color: string;
  glowColor: string;
  description: string;
  rarity: 'prime' | 'rare' | 'transcendent';
  strengths: string[];
  weaknesses: string[];
}

export interface StartingScenarioDefinition {
  id: string;
  title: string;
  tagline: string;
  description: string;
  recommendedOrigins: string[];
  startingBonusDescription: string;
}

export interface SoulSculptData {
  name: string;
  title: string;
  age: string;
  gender: string;
  raceId: string;
  classId: string;
  elementalAffinities: string[];
  attributes: {
    strength: number;
    agility: number;
    constitution: number;
    intelligence: number;
    willpower: number;
    charisma: number;
  };
  personalityTraits: string[];
  startingScenarioId: string;
  appearance: {
    hair: string;
    eyes: string;
    clothing: string;
    distinguishingFeatures: string;
  };
  customFirstLifeNote?: string;
}

export interface PrologueSessionState {
  sessionId: string;
  userId?: string;
  currentPhase: ProloguePhase;
  phaseTurnIndex: number;
  dialogueHistory: EntityDialogueEntry[];
  entityPersonality: EntityPersonality;
  soulSculpt: SoulSculptData;
  selectedWorldId: string;
  selectedScenarioId: string;
  entityBoon?: string;
  isComplete: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface IsekaiLaunchPackage {
  hero: HeroProfile;
  world: WorldDefinition;
  settings: StorySettings;
  prologueSummary: {
    previousLife: string;
    entityBoon: string;
    chosenScenario: string;
    elementalResonance: string[];
  };
}
