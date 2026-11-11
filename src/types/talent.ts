import { PowerTierCode } from '../features/character/tierSystem';
import { HeroProfile, CharacterAppearance, MoralAlignment, CharacterRelationship } from './character';

export type TalentCategory =
  | 'elemental'
  | 'divine'
  | 'dark'
  | 'space_time'
  | 'conceptual'
  | 'combat'
  | 'racial'
  | 'production'
  | 'intellectual'
  | 'unique';

export type TalentMasteryLevel =
  | 'Beginner'
  | 'Novice'
  | 'Adept'
  | 'Expert'
  | 'Master'
  | 'Grandmaster';

export type TalentSource =
  | 'Innate'
  | 'Bloodline'
  | 'Awakened'
  | 'Divine Blessing'
  | 'Ancient Pact'
  | 'Cosmic Phenomenon'
  | 'Rigorous Training'
  | 'Secret Manual';

/**
 * Innate quality, rarity, and potential of a specific gift or bloodline.
 * IMPORTANT: A character's acquired Level NEVER modifies this tier automatically.
 */
export interface CharacterTalent {
  id: string;
  name: string;
  category: TalentCategory;
  tier: PowerTierCode; // Independent per talent: E, D, C, B, A, S, SS, SSS, or GOD
  mastery: TalentMasteryLevel;
  description: string;
  source: TalentSource;
  specialization?: string;
  isGodTier?: boolean;
  godTierOrigin?: string; // Required for God Tier talents (must specify divine or cosmic origin)
  limitations?: string;
}

/**
 * Concrete technique, spell, or practical action unlocked from talent or training.
 */
export interface CharacterAbility {
  id: string;
  name: string;
  talentId?: string;
  category: string;
  mastery: TalentMasteryLevel;
  description: string;
  unlockRequirements?: string;
  limitations?: string;
}

/**
 * Core character attributes (1-100 scale).
 * Note: Stamina is intentionally excluded per BranchVerse authoritative engine rules.
 */
export interface CharacterAttributes {
  strength: number;
  agility: number;
  vitality: number;
  intelligence: number;
  wisdom: number;
  perception: number;
  dexterity: number;
  luck: number;
  magicalControl: number;
  magicalCapacity: number;
  charisma: number;
}

/**
 * Complete expanded character specification for Soul Architect.
 * Integrates seamlessly with existing HeroProfile.
 */
export interface CharacterProfile extends HeroProfile {
  characterLevel: number; // 1 to 100 acquired progression (independent of talent tiers)
  species: string;
  bloodline?: string;
  socialStatus: string;
  professions: string[];
  attributes: CharacterAttributes;
  talents: CharacterTalent[];
  abilitiesList: CharacterAbility[];
  specialGifts?: string[];
  equipmentList?: string[];
  jackOfAllTrades?: {
    isAcquired: boolean;
    tier: PowerTierCode;
    mastery: TalentMasteryLevel;
    disciplines: string[];
    advantages: string[];
    limitations: string[];
  };
}

/**
 * Reusable Character Preset stored in IndexedDB and synchronized with Firebase.
 */
export interface CharacterPreset {
  id: string;
  name: string;
  summary: string;
  version: number;
  profile: CharacterProfile;
  tags?: string[];
  isBuiltIn?: boolean;
  createdAt: number;
  updatedAt: number;
  userId?: string;
}
