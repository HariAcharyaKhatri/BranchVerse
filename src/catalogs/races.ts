export interface RaceOption {
  id: string;
  name: string;
  description: string;
  innateBonus: string;
  commonOrigin: string;
}

export const RACE_CATALOG: RaceOption[] = [
  {
    id: 'human',
    name: 'Human',
    description: 'Adaptable, resilient, and fueled by unyielding willpower.',
    innateBonus: '+10% bonus to adaptability and skill learning speed.',
    commonOrigin: 'Frontier Kingdoms or Urban Metropolises'
  },
  {
    id: 'high_elf',
    name: 'High Elf',
    description: 'Long-lived beings endowed with natural affinity for arcane leylines.',
    innateBonus: 'Increased maximum mana and resistance to mental illusions.',
    commonOrigin: 'Elderwood Spires or Star Citadels'
  },
  {
    id: 'kitsune',
    name: 'Kitsune / Beastkin',
    description: 'Agile shapeshifters with spiritual foxfire and heightened instincts.',
    innateBonus: 'Superior night vision and deceptive illusionary arts.',
    commonOrigin: 'Hidden Spirit Shrines or Untamed Wilds'
  },
  {
    id: 'cyborg',
    name: 'Augmented Cyborg',
    description: 'Humans modified with cybernetic limbs, neural wiring, and titanium plating.',
    innateBonus: 'Immunity to organic toxins and superhuman reflex processing.',
    commonOrigin: 'Subterranean Labs or Neon Megacities'
  },
  {
    id: 'dragonborn',
    name: 'Dragonborn',
    description: 'Fierce warriors carrying the blood of primordial dragons and elemental breath.',
    innateBonus: 'Draconic scale armor and elemental resistance.',
    commonOrigin: 'Volcanic Calderas or Craggy Mountain Peaks'
  },
  {
    id: 'demonkin',
    name: 'Demonkin / Tiefling',
    description: 'Bearing horns and obsidian eyes, walking the line between curse and power.',
    innateBonus: 'Dark vision and intimidation presence.',
    commonOrigin: 'The Abyssal Rift or Underworld Enclaves'
  },
  {
    id: 'celestial',
    name: 'Star-Touched Celestial',
    description: 'Beings woven from fallen stardust with natural restorative light.',
    innateBonus: 'Passive health regeneration and radiant warding.',
    commonOrigin: 'Astral Sanctuaries or Celestial Temples'
  }
];
