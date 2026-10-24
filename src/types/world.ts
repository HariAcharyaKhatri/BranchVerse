export interface GenreDefinition {
  id: string;
  name: string;
  tagline: string;
  icon: string; // Lucide icon identifier
  description: string;
  compatibleWith: string[]; // List of genre IDs that blend well
  color: string; // Tailwind color token or hex
}

export interface LocationDefinition {
  id: string;
  name: string;
  type: 'kingdom' | 'village' | 'sanctuary' | 'citadel' | 'wasteland' | 'dungeon' | 'academy';
  description: string;
  dangerLevel: 'Safe' | 'Moderate' | 'Hazardous' | 'Lethal';
}

export interface FactionDefinition {
  id: string;
  name: string;
  alignment: string;
  description: string;
  motto?: string;
}

export interface MagicSystemDefinition {
  id: string;
  name: string;
  source: string; // e.g. "Mana Ley Lines", "Spiritual Qi", "Cybernetic Neural Net"
  rules: string[];
  limitations: string[];
}

export interface WorldDefinition {
  id: string;
  name: string;
  primaryGenreId: string;
  synopsis: string;
  locations: LocationDefinition[];
  factions: FactionDefinition[];
  magicSystem: MagicSystemDefinition;
  races: string[];
  classes: string[];
  powerSystems: string[];
  commonWeapons: string[];
  commonAbilities: string[];
  threats: string[];
}
