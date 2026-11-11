import { CharacterProfile, CharacterTalent, CharacterAttributes } from '../../types/talent';
import { HeroProfile, MoralAlignment } from '../../types/character';
import { PowerTierCode } from './tierSystem';
import {
  SPECIES_CATALOGUE,
  SOCIAL_BACKGROUNDS,
  PROFESSIONS_CATALOGUE,
  DEFAULT_ATTRIBUTES,
} from '../../catalogs/characterCatalogs';
import { ALL_POWER_DEFINITIONS, PowerDefinition } from '../../catalogs/powerCatalogue';

const MALE_NAMES = ['Kaelen', 'Solomon', 'Rowan', 'Alden', 'Caelum', 'Vance', 'Aric', 'Gideon', 'Hari Khatri', 'Dante'];
const FEMALE_NAMES = ['Lyra', 'Elora', 'Seraphina', 'Aria', 'Morrigan', 'Selene', 'Vespera', 'Kaelia', 'Nadia', 'Elena'];
const SURNAMES = ['Starweaver', 'Vane', 'Ironbreaker', 'Nightshade', 'Silverfall', 'Frostborne', 'Khatri', 'Valerius', 'Blackwood'];

/**
 * Creates a clean starting character profile.
 */
export function createBlankCharacter(name?: string): CharacterProfile {
  const chosenName = name?.trim() || 'Wandering Soul';
  return {
    id: `hero_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: chosenName,
    age: '20',
    gender: 'Male',
    appearance: {
      hair: 'Dark Tumbled Locks',
      eyes: 'Deep Amber',
      clothing: 'Simple Traveler Tunic and Sturdy Boots',
      distinguishingFeatures: 'Faint Arcane Starlight Mark on Wrist',
    },
    personality: ['Determined', 'Observant', 'Adaptive'],
    race: 'Human',
    species: 'Human',
    bloodline: 'None (Mortal Origin)',
    origin: 'Borderland Settlement',
    socialStatus: 'Commoner / Free Citizen',
    professions: ['Licensed Adventurer / Explorer'],
    backstory: 'A soul embarking on an unwritten path across the planar leylines of the multiverse.',
    skills: ['Swordsmanship', 'Field Survival', 'Camp Scouting'],
    powers: ['Thermal Spark Manipulation'],
    weapons: ['Forged Steel Arming Sword'],
    weaknesses: ['Unfamiliar with High Court Politics'],
    powerLevel: 15, // Acquired Level 15
    characterLevel: 15,
    tier: 'C', // Innate Talent Tier C
    attributes: { ...DEFAULT_ATTRIBUTES },
    talents: [
      {
        id: 'elem_fire',
        name: 'Fire Magic',
        category: 'elemental',
        tier: 'C',
        mastery: 'Novice',
        description: 'Basic thermal spark and flame manipulation.',
        source: 'Innate',
      },
    ],
    abilitiesList: [
      {
        id: 'ab_flame_spark',
        name: 'Spark Ignition',
        category: 'elemental',
        mastery: 'Novice',
        description: 'Creates a quick thermal ignition spark from fingertips.',
      },
    ],
    goals: ['Ascend in mastery and forge a lasting name'],
    motivations: ['Personal discovery and protecting companions'],
    fears: ['Losing former world memories'],
    secrets: ['Remembers past technological methodologies'],
    alignment: 'Neutral Good' as MoralAlignment,
    relationships: [],
    createdAt: Date.now(),
  };
}

/**
 * Weighted random picker for Talent Tier.
 * Authoritative rarity distribution:
 * E: 15%, D: 25%, C: 30%, B: 20%, A: 7%, S: 2.4%, SS: 0.5%, SSS: 0.09%, GOD: 0.01%
 */
export function rollRandomTalentTier(allowGodTier: boolean = false): PowerTierCode {
  const roll = Math.random() * 100;

  if (allowGodTier && roll >= 99.9) {
    return 'GOD'; // 0.1% chance when divine origin is allowed
  }
  if (roll >= 99.0) return 'SSS';  // 0.9%
  if (roll >= 97.5) return 'SS';   // 1.5%
  if (roll >= 92.5) return 'S';    // 5.0%
  if (roll >= 80.0) return 'A';    // 12.5%
  if (roll >= 55.0) return 'B';    // 25.0%
  if (roll >= 25.0) return 'C';    // 30.0%
  if (roll >= 10.0) return 'D';    // 15.0%
  return 'E';                      // 10.0%
}

/**
 * Random Character Generator adhering strictly to authoritative world rules.
 * Generates both combat and non-combat characters across diverse species.
 */
export function generateRandomCharacter(options?: {
  allowGodTier?: boolean;
  preferNonCombat?: boolean;
  forceProfession?: string;
  forceSpecies?: string;
  nameOverride?: string;
}): CharacterProfile {
  const isFemale = Math.random() > 0.5;
  const nameList = isFemale ? FEMALE_NAMES : MALE_NAMES;
  const firstName = options?.nameOverride || nameList[Math.floor(Math.random() * nameList.length)];
  const surname = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
  const fullName = `${firstName} ${surname}`;

  // Species
  const chosenSpecies = options?.forceSpecies
    ? SPECIES_CATALOGUE.find((s) => s.id === options.forceSpecies || s.name === options.forceSpecies) || SPECIES_CATALOGUE[0]
    : SPECIES_CATALOGUE[Math.floor(Math.random() * SPECIES_CATALOGUE.length)];

  // Social Background
  const chosenBackground = SOCIAL_BACKGROUNDS[Math.floor(Math.random() * SOCIAL_BACKGROUNDS.length)];

  // Profession (Combat or Non-Combat / Trade)
  let chosenProfession;
  if (options?.forceProfession) {
    chosenProfession =
      PROFESSIONS_CATALOGUE.find(
        (p) => p.id === options.forceProfession || p.name === options.forceProfession
      ) || PROFESSIONS_CATALOGUE[0];
  } else if (options?.preferNonCombat) {
    const nonCombatProfs = PROFESSIONS_CATALOGUE.filter((p) =>
      ['Merchant', 'Agronomist', 'Blacksmith', 'Alchemist', 'Scholar', 'Architect', 'Diplomat'].some(
        (nc) => p.name.includes(nc)
      )
    );
    chosenProfession =
      nonCombatProfs[Math.floor(Math.random() * nonCombatProfs.length)] || PROFESSIONS_CATALOGUE[0];
  } else {
    chosenProfession =
      PROFESSIONS_CATALOGUE[Math.floor(Math.random() * PROFESSIONS_CATALOGUE.length)];
  }

  // Determine Acquired Character Level (1 to 50 for generated starting heroes)
  const generatedLevel = Math.floor(Math.random() * 35) + 1; // Level 1 to 35

  // Pick 1 to 3 distinct talents from the Power Catalogue
  const shuffledPowers = [...ALL_POWER_DEFINITIONS].sort(() => 0.5 - Math.random());
  const talentCount = Math.random() > 0.6 ? 2 : 1;
  const selectedPowerDefs: PowerDefinition[] = shuffledPowers.slice(0, talentCount);

  const talents: CharacterTalent[] = selectedPowerDefs.map((def) => {
    const tier = rollRandomTalentTier(options?.allowGodTier);
    const isGodTier = tier === 'GOD';
    return {
      id: def.id,
      name: def.name,
      category: def.category,
      tier,
      mastery: (generatedLevel > 30 ? 'Adept' : generatedLevel > 15 ? 'Novice' : 'Beginner') as any,
      description: def.description,
      source: isGodTier
        ? 'Divine Blessing'
        : def.category === 'racial'
        ? 'Bloodline'
        : def.category === 'production'
        ? 'Rigorous Training'
        : 'Innate',
      isGodTier,
      godTierOrigin: isGodTier
        ? 'Direct celestial blessing of the primordial world deity.'
        : undefined,
      specialization: def.specializations[0],
    };
  });

  // Primary overall tier is the highest tier among talents
  const tierRanks: Record<PowerTierCode, number> = {
    E: 1, D: 2, C: 3, B: 4, A: 5, S: 6, SS: 7, SSS: 8, GOD: 9,
  };
  const highestTalent = talents.reduce((prev, curr) =>
    (tierRanks[curr.tier] || 0) > (tierRanks[prev.tier] || 0) ? curr : prev
  );

  // Attributes generated with level correlation
  const baseAttr = 12 + Math.floor(generatedLevel * 0.8);
  const attributes: CharacterAttributes = {
    strength: Math.min(100, baseAttr + Math.floor(Math.random() * 12)),
    agility: Math.min(100, baseAttr + Math.floor(Math.random() * 12)),
    vitality: Math.min(100, baseAttr + Math.floor(Math.random() * 12)),
    intelligence: Math.min(100, baseAttr + Math.floor(Math.random() * 12)),
    wisdom: Math.min(100, baseAttr + Math.floor(Math.random() * 12)),
    perception: Math.min(100, baseAttr + Math.floor(Math.random() * 12)),
    dexterity: Math.min(100, baseAttr + Math.floor(Math.random() * 12)),
    luck: Math.min(100, 10 + Math.floor(Math.random() * 25)),
    magicalControl: Math.min(100, baseAttr + Math.floor(Math.random() * 14)),
    magicalCapacity: Math.min(100, baseAttr + Math.floor(Math.random() * 16)),
    charisma: Math.min(100, baseAttr + Math.floor(Math.random() * 14)),
  };

  const alignments: MoralAlignment[] = [
    'Lawful Good', 'Neutral Good', 'Chaotic Good',
    'True Neutral', 'Chaotic Neutral',
  ];

  return {
    id: `hero_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: fullName,
    age: String(18 + Math.floor(Math.random() * 25)),
    gender: isFemale ? 'Female' : 'Male',
    appearance: {
      hair: isFemale ? 'Braided Obsidian Silk' : 'Tumbled Ash-Brown Hair',
      eyes: 'Alert Hazel Eyes',
      clothing: `${chosenBackground.name} traveling garments tailored for exploration`,
      distinguishingFeatures: `Bearing the crest of ${chosenSpecies.name}`,
    },
    personality: chosenSpecies.traits.concat(['Resolute', 'Honorable']).slice(0, 3),
    race: chosenSpecies.name,
    species: chosenSpecies.name,
    origin: `${chosenSpecies.name} Enclave of ${chosenBackground.name}`,
    socialStatus: chosenBackground.name,
    professions: [chosenProfession.name],
    backstory: `Born of ${chosenSpecies.name} lineage within ${chosenBackground.name}. Following the path of a ${chosenProfession.name}, seeking to master latent potential across planar frontiers.`,
    skills: chosenProfession.traits.concat(['Observation', 'Negotiation']).slice(0, 4),
    powers: talents.map((t) => `${t.name} (${t.tier} Tier)`),
    weapons: ['Forged Starlight Steel Implement', 'Utility Scouting Knife'],
    weaknesses: ['Hesitant to sacrifice innocents for strategic expedience'],
    powerLevel: generatedLevel,
    characterLevel: generatedLevel,
    tier: highestTalent.tier,
    attributes,
    talents,
    abilitiesList: [
      {
        id: `ab_${talents[0]?.id || 'basic'}`,
        name: `${talents[0]?.name || 'Basic'} Surge`,
        category: talents[0]?.category || 'elemental',
        mastery: talents[0]?.mastery || 'Novice',
        description: `Direct invocation of ${talents[0]?.name || 'basic'} potential in practical situations.`,
      },
    ],
    goals: [`Achieve mastery as a recognized ${chosenProfession.name}`, 'Uncover the planar secrets of the multiverse'],
    motivations: ['Honoring ancestral lineage', 'Protecting realm equilibrium'],
    fears: ['Premature demise before completing destiny'],
    secrets: ['Carries a family talisman engraved with ancient celestial runes'],
    alignment: alignments[Math.floor(Math.random() * alignments.length)],
    relationships: [],
    createdAt: Date.now(),
  };
}

/**
 * Partial Reroller: Allows rerolling a specific property (talents, attributes, species, or background)
 * without losing the player's carefully chosen name, age, or identity!
 */
export function rerollCharacterProperty(
  current: CharacterProfile,
  property: 'talents' | 'attributes' | 'species' | 'background' | 'profession'
): CharacterProfile {
  const fresh = generateRandomCharacter();

  switch (property) {
    case 'talents':
      return {
        ...current,
        talents: fresh.talents,
        tier: fresh.tier,
        powers: fresh.powers,
        abilitiesList: fresh.abilitiesList,
      };
    case 'attributes':
      return {
        ...current,
        attributes: fresh.attributes,
      };
    case 'species':
      return {
        ...current,
        species: fresh.species,
        race: fresh.race,
      };
    case 'background':
      return {
        ...current,
        socialStatus: fresh.socialStatus,
        origin: fresh.origin,
      };
    case 'profession':
      return {
        ...current,
        professions: fresh.professions,
        skills: fresh.skills,
      };
    default:
      return current;
  }
}

/**
 * Validates a character profile against authoritative BranchVerse engine invariants:
 * 1. God Tier must have a verified divine or cosmic origin.
 * 2. Level must be between 1 and 100.
 * 3. Attributes must be within 1 and 100.
 * 4. At least one talent must be selected.
 */
export function validateCharacterProfile(profile: CharacterProfile): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!profile.name || !profile.name.trim()) {
    errors.push('Character must possess a valid True Name.');
  }

  const level = profile.characterLevel ?? profile.powerLevel;
  if (typeof level !== 'number' || level < 1 || level > 100) {
    errors.push(`Character Level must be between 1 and 100 (current: ${level}).`);
  }

  if (!Array.isArray(profile.talents) || profile.talents.length === 0) {
    errors.push('Character must possess at least one innate talent.');
  } else {
    for (const t of profile.talents) {
      if (t.tier === 'GOD' && !t.godTierOrigin && t.source !== 'Divine Blessing' && t.source !== 'Cosmic Phenomenon') {
        errors.push(
          `God-Tier talent "${t.name}" requires an explicit divine blessing, ancient bloodline, or cosmic origin.`
        );
      }
    }
  }

  if (profile.attributes) {
    const keys: (keyof CharacterAttributes)[] = [
      'strength', 'agility', 'vitality', 'intelligence', 'wisdom',
      'perception', 'dexterity', 'luck', 'magicalControl', 'magicalCapacity', 'charisma'
    ];
    for (const k of keys) {
      const val = profile.attributes[k];
      if (typeof val === 'number' && (val < 1 || val > 100)) {
        errors.push(`Attribute "${k}" out of bounds (1-100 allowed, got ${val}).`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Converts a CharacterProfile cleanly into the canonical HeroProfile
 * expected by the Story Engine and story launch handlers.
 */
export function convertToHeroProfile(profile: CharacterProfile): HeroProfile {
  return {
    ...profile,
    powerLevel: profile.characterLevel ?? profile.powerLevel ?? 15,
    tier: profile.tier || profile.talents?.[0]?.tier || 'B',
    powers: profile.powers && profile.powers.length > 0
      ? profile.powers
      : profile.talents?.map((t) => `${t.name} (${t.tier} Tier)`) || ['Awakened Energy'],
    skills: profile.skills && profile.skills.length > 0 ? profile.skills : ['Tactical Awareness'],
  };
}
