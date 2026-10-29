import { HeroProfile, MoralAlignment } from '../../types/character';
import { SupportedLanguage } from '../../types/story';
import { RACE_CATALOG } from '../../catalogs/races';
import { WEAPON_OPTIONS, POWER_OPTIONS, WEAKNESS_OPTIONS, ALIGNMENT_OPTIONS } from '../../catalogs/powers';

/**
 * Detects whether the user is requesting a language change within a story turn,
 * distinguishing between a one-turn response override vs a permanent story-language update.
 */
export function detectLanguageChangeIntent(text: string): {
  requestedLanguage: SupportedLanguage | null;
  isPermanent: boolean;
} {
  if (!text || text.trim().length === 0) {
    return { requestedLanguage: null, isPermanent: false };
  }

  const lower = text.toLowerCase();
  let lang: SupportedLanguage | null = null;

  if (/(?:^|\s)(?:in\s+)?(?:hindi|हिन्दी|हिंदी)(?:$|[.,!?\s])/i.test(lower) || /हिंदी में|हिन्दी में/i.test(lower)) {
    lang = 'hi';
  } else if (/(?:^|\s)(?:in\s+)?(?:spanish|español|espanol)(?:$|[.,!?\s])/i.test(lower) || /en español/i.test(lower)) {
    lang = 'es';
  } else if (/(?:^|\s)(?:in\s+)?(?:french|français|francais)(?:$|[.,!?\s])/i.test(lower) || /en français/i.test(lower)) {
    lang = 'fr';
  } else if (/(?:^|\s)(?:in\s+)?(?:japanese|日本語|にほんご)(?:$|[.,!?\s])/i.test(lower) || /日本語で/i.test(lower)) {
    lang = 'ja';
  } else if (/(?:^|\s)(?:in\s+)?(?:korean|한국어|조선말)(?:$|[.,!?\s])/i.test(lower) || /한국어로/i.test(lower)) {
    lang = 'ko';
  } else if (/(?:^|\s)(?:in\s+)?(?:english|अंग्रेज़ी|अंग्रेजी)(?:$|[.,!?\s])/i.test(lower) || /in english/i.test(lower)) {
    lang = 'en';
  }

  if (!lang) {
    return { requestedLanguage: null, isPermanent: false };
  }

  // Check for explicit permanence intent (e.g. "continue in...", "change to...", "from now on...")
  const isPermanent = /(?:continue|switch|from now on|permanently|change to|rest of the story|आगे से|बदलो|जारी रखें|continuar|continuer|続ける|계속)/i.test(lower);

  return { requestedLanguage: lang, isPermanent };
}

/**
 * Extracts character attributes from a natural language prompt, e.g.:
 * "Create Hari, a 20-year-old white-haired swordsman from a forgotten village.
 *  He has god-level swordsmanship, a calm personality, and a mysterious past."
 */
export function parseHeroPrompt(promptText: string): Partial<HeroProfile> {
  const result: Partial<HeroProfile> = {
    appearance: {
      hair: '',
      eyes: '',
      clothing: '',
      distinguishingFeatures: ''
    },
    personality: [],
    skills: [],
    powers: [],
    weapons: [],
    weaknesses: [],
    goals: [],
    motivations: [],
    fears: [],
    secrets: []
  };

  if (!promptText || promptText.trim().length === 0) {
    return result;
  }

  const text = promptText.trim();

  // 1. Name extraction
  // Patterns like: "Create [Name],", "My name is [Name]", "[Name] is a..."
  const nameMatch = text.match(/(?:create|named|name is|i am|play as)\s+([A-Z][a-zA-Z0-9_-]+)/i) ||
                    text.match(/^([A-Z][a-zA-Z0-9_-]+)(?:,|\s+is)/i);
  if (nameMatch && nameMatch[1]) {
    const rawName = nameMatch[1].trim();
    if (!['Create', 'Play', 'The', 'A', 'An', 'My'].includes(rawName)) {
      result.name = rawName;
    }
  }

  // 2. Age extraction
  // Pattern: "20-year-old", "age 24", "19 years old"
  const ageMatch = text.match(/(\d{1,3})\s*(?:-| )(?:year|yr)s?(?:-| )old/i) ||
                   text.match(/age\s*[:=]?\s*(\d{1,3})/i);
  if (ageMatch && ageMatch[1]) {
    result.age = ageMatch[1];
  }

  // 3. Gender extraction
  if (/\b(?:he|him|his|swordsman|man|boy|prince|lord)\b/i.test(text)) {
    result.gender = 'Male';
  } else if (/\b(?:she|her|hers|swordswoman|woman|girl|princess|lady)\b/i.test(text)) {
    result.gender = 'Female';
  } else if (/\b(?:they|them|non-binary|genderless|synthetic|android)\b/i.test(text)) {
    result.gender = 'Non-Binary';
  }

  // 4. Appearance - Hair extraction
  const hairMatch = text.match(/([a-z]+(?:-[a-z]+)?)\s*(?:-|\s*)hair(?:ed)?/i);
  if (hairMatch && hairMatch[1]) {
    result.appearance!.hair = `${hairMatch[1].toLowerCase()} hair`;
  }

  // Appearance - Eyes extraction
  const eyeMatch = text.match(/([a-z]+(?:-[a-z]+)?)\s*(?:-|\s*)eyes?/i);
  if (eyeMatch && eyeMatch[1]) {
    result.appearance!.eyes = `${eyeMatch[1].toLowerCase()} eyes`;
  }

  // 5. Origin extraction
  // Pattern: "from (a/an/the)? [Location]"
  const originMatch = text.match(/from\s+(?:a|an|the)?\s*([a-zA-Z\s'-]+?)(?:\.|,|$|with|who|and|he|she)/i);
  if (originMatch && originMatch[1]) {
    result.origin = originMatch[1].trim();
  }

  // 6. Personality extraction
  const personalityKeywords = [
    'calm', 'stoic', 'reckless', 'cheerful', 'cynical', 'mysterious',
    'brave', 'cautious', 'arrogant', 'gentle', 'fierce', 'cunning', 'loyal'
  ];
  for (const trait of personalityKeywords) {
    if (new RegExp(`\\b${trait}\\b`, 'i').test(text)) {
      result.personality!.push(trait.charAt(0).toUpperCase() + trait.slice(1));
    }
  }

  // 7. Skills & Powers extraction
  const powerKeywords = [
    'swordsmanship', 'magic', 'teleportation', 'fire', 'lightning', 'shadow',
    'healing', 'necromancy', 'flying sword', 'stealth', 'qi', 'cyberware'
  ];
  for (const kw of powerKeywords) {
    if (new RegExp(`\\b${kw}\\b`, 'i').test(text)) {
      result.powers!.push(kw.charAt(0).toUpperCase() + kw.slice(1));
    }
  }

  // 8. Weapons extraction
  const weaponKeywords = [
    { regex: /\b(?:sword|swords|swordsman|swordswoman|blade|blademaster)\b/i, name: 'Sword' },
    { regex: /\bkatana\b/i, name: 'Katana' },
    { regex: /\bdaggers?\b/i, name: 'Dagger' },
    { regex: /\bbows?\b/i, name: 'Bow' },
    { regex: /\bstaffs?\b/i, name: 'Staff' },
    { regex: /\bspears?\b/i, name: 'Spear' },
    { regex: /\b(?:revolver|pistol|gun)s?\b/i, name: 'Revolver' },
    { regex: /\bscythes?\b/i, name: 'Scythe' }
  ];
  for (const w of weaponKeywords) {
    if (w.regex.test(text)) {
      result.weapons!.push(w.name);
    }
  }

  // 9. Backstory extraction
  if (/mysterious past/i.test(text)) {
    result.backstory = 'Carries a shrouded past with forgotten memories that linger like ghosts in every reflection.';
    result.secrets!.push('Origin is tied to an ancient forgotten lineage.');
  }

  return result;
}

/**
 * Fills in missing hero fields intelligently WITHOUT replacing explicitly provided details.
 */
export function completeHeroProfile(existing: Partial<HeroProfile>): HeroProfile {
  const randomChoice = <T>(arr: readonly T[] | T[]): T => arr[Math.floor(Math.random() * arr.length)];

  const randomRace = randomChoice(RACE_CATALOG);
  const randomWeapon = randomChoice(WEAPON_OPTIONS);
  const randomPower = randomChoice(POWER_OPTIONS);
  const randomWeakness = randomChoice(WEAKNESS_OPTIONS);
  const randomAlignment: MoralAlignment = randomChoice(ALIGNMENT_OPTIONS);

  return {
    id: existing.id || `hero_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: existing.name?.trim() ? existing.name.trim() : 'Hari Khatri',
    age: existing.age || '20',
    gender: existing.gender || 'Male',
    appearance: {
      hair: existing.appearance?.hair || 'Silver-white spikes with bangs over one eye',
      eyes: existing.appearance?.eyes || 'Piercing amber irises',
      clothing: existing.appearance?.clothing || 'Dark hooded traveler’s duster over light steel mail',
      distinguishingFeatures: existing.appearance?.distinguishingFeatures || 'A faint glowing rune branded on the right palm'
    },
    personality: existing.personality && existing.personality.length > 0
      ? existing.personality
      : ['Calm', 'Observant', 'Unyielding'],
    race: existing.race || randomRace.name,
    species: existing.species,
    origin: existing.origin || 'A forgotten mountain sanctuary beyond the imperial border',
    backstory: existing.backstory || 'Raised away from the grand wars of the kingdoms, bearing an ancestral blade and a destiny yet unwritten.',
    skills: existing.skills && existing.skills.length > 0
      ? existing.skills
      : ['God-level Swordsmanship', 'Acrobatic Evasion', 'Tactical Analysis'],
    powers: existing.powers && existing.powers.length > 0
      ? existing.powers
      : [randomPower, 'Aura Perception'],
    weapons: existing.weapons && existing.weapons.length > 0
      ? existing.weapons
      : [randomWeapon],
    weaknesses: existing.weaknesses && existing.weaknesses.length > 0
      ? existing.weaknesses
      : [randomWeakness],
    powerLevel: existing.powerLevel || 35,
    goals: existing.goals && existing.goals.length > 0
      ? existing.goals
      : ['Uncover the truth behind the shattered rifts', 'Protect comrades from harm'],
    motivations: existing.motivations && existing.motivations.length > 0
      ? existing.motivations
      : ['Honor an ancient promise made to a fallen mentor'],
    fears: existing.fears && existing.fears.length > 0
      ? existing.fears
      : ['Losing control of dormant power', 'Failing those who place faith in him'],
    secrets: existing.secrets && existing.secrets.length > 0
      ? existing.secrets
      : ['He survived an abyssal incursion that wiped out his birthplace'],
    alignment: existing.alignment || randomAlignment,
    relationships: existing.relationships && existing.relationships.length > 0
      ? existing.relationships
      : [
          { name: 'Master Shen', role: 'mentor', trust: 90, description: 'The hermit blademaster who forged his early technique.' },
          { name: 'Kael', role: 'rival', trust: 15, description: 'A relentless prodigy seeking to prove himself superior.' }
        ],
    createdAt: existing.createdAt || Date.now()
  };
}
