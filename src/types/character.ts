export type MoralAlignment =
  | 'Lawful Good'
  | 'Neutral Good'
  | 'Chaotic Good'
  | 'True Neutral'
  | 'Chaotic Neutral'
  | 'Lawful Evil'
  | 'Neutral Evil'
  | 'Chaotic Evil';

export type RelationshipRole = 'ally' | 'rival' | 'mentor' | 'enemy' | 'family';

export interface CharacterRelationship {
  name: string;
  role: RelationshipRole;
  trust: number; // -100 (nemesis) to +100 (unbreakable bond)
  description?: string;
}

export interface CharacterAppearance {
  hair: string;
  eyes: string;
  clothing: string;
  distinguishingFeatures: string;
}

export interface HeroProfile {
  id: string;
  name: string;
  age: string;
  gender: string;
  appearance: CharacterAppearance;
  personality: string[];
  race: string;
  species?: string;
  origin: string; // Village / Kingdom / Sector
  backstory: string;
  skills: string[];
  powers: string[];
  weapons: string[];
  weaknesses: string[];
  powerLevel: number; // 1 to 100
  goals: string[];
  motivations: string[];
  fears: string[];
  secrets: string[];
  alignment: MoralAlignment;
  relationships: CharacterRelationship[];
  createdAt: number;
}

export interface PartialHeroDraft extends Partial<Omit<HeroProfile, 'appearance' | 'relationships'>> {
  appearance?: Partial<CharacterAppearance>;
  relationships?: CharacterRelationship[];
}
