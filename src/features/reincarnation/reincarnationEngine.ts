import {
  ReincarnationProfile,
  ReincarnationSession,
  ProfileFieldStatus,
  ReincarnationLaunchPackage,
  AngelDialogueMessage,
  ProfileField,
} from './reincarnationTypes';
import { CANON_ANGEL } from './reincarnationCanon';
import { FATE_WHEEL_CATEGORIES } from './fateWheelCatalogs';
import { HeroProfile, MoralAlignment } from '../../types/character';
import { WorldDefinition } from '../../types/world';
import { WORLD_CATALOG } from '../../catalogs/worlds';
import { StorySettings, SupportedLanguage } from '../../types/story';

const STORAGE_KEY = 'bv_reincarnation_session_v2';

export const createField = <T>(value: T, status: ProfileFieldStatus = 'undecided'): ProfileField<T> => ({
  value,
  status,
});

export const createInitialProfile = (userName?: string): ReincarnationProfile => {
  const initialName = userName?.trim() || '';
  const nameStatus: ProfileFieldStatus = initialName ? 'suggested' : 'undecided';

  return {
    world: {
      genre: createField('High Fantasy'),
      name: createField('Aethelgard High Realm'),
      era: createField('Feudal Magic Renaissance'),
      geography: createField('Crystalline spires, floating archipelagos, ancient elderwoods'),
      politicalStructure: createField('Multiple Sovereign Kingdoms & Citadel Councils'),
      kingdoms: createField(['Kingdom of Aethelgard', 'Silver Vanguard Domains']),
      magicSystem: createField('Runic Mana Leylines & Starlight Inscriptions'),
      races: createField(['Human', 'High Elf', 'Dragonkin', 'Dwarf']),
      culture: createField('Knightly chivalry, arcane academies, and celestial astrology'),
      majorConflicts: createField('Void Rift incursions and ancestral dragon awakened lords'),
    },
    character: {
      name: createField(initialName, nameStatus),
      gender: createField('Any'),
      age: createField('19'),
      race: createField('Human'),
      appearance: createField({
        hair: 'Dark Obsidian, windswept',
        eyes: 'Starlight Amber',
        clothing: 'Elegantly tailored traveler’s attire with celestial trim',
        distinguishingFeatures: 'Faint luminous starlight mark upon the right palm',
      }),
      personality: createField(['Determined', 'Pragmatic', 'Observant']),
      background: createField('Transmigrated from modern Earth; preserves worldly memories and ideals'),
      socialStatus: createField('Respected Commoner / Promising Aspirant'),
    },
    abilities: {
      magicAffinity: createField(['Lightning', 'Starlight']),
      specialAbilities: createField(['Starlight Blink', 'Tempest Infusion', 'Mana Decryption']),
      skills: createField(['Swordsmanship', 'Tactical Analysis', 'Ancient Lore Appraisal']),
      previousLifeKnowledge: createField('Modern engineering principles, scientific methodology, and strategic planning'),
      talents: createField(['Unshakable Mind', 'High Spell Resonance']),
      startingLimitations: createField(['Dimensional Anchoring Disorientation', 'Unfamiliar World Etiquette']),
    },
    circumstances: {
      birthplace: createField('Valen’s Crossing Riverside Borough'),
      familyStatus: createField('Honorable Artisan Household'),
      wealth: createField('Modest Silver Cache & Heirloom Artifact'),
      socialPosition: createField('Free Adventuring Journeyman'),
      initialCircumstances: createField('Awakens in a peaceful sanctuary after the celestial threshold transition'),
    },
    preferences: {
      primaryThemes: createField(['Adventure', 'Kingdom Building', 'Exploration']),
      pacing: createField('Balanced Narrative'),
      tone: createField('Epic Fantasy'),
      storyLanguage: createField<SupportedLanguage>('hi', 'confirmed'),
    },
  };
};

export const createInitialReincarnationSession = (userName?: string): ReincarnationSession => {
  const profile = createInitialProfile(userName);
  const initialGreeting: AngelDialogueMessage = {
    id: 'msg_greet_' + Date.now(),
    sender: 'angel',
    speaker: 'angel',
    text: CANON_ANGEL.initialGreeting,
    timestamp: Date.now(),
  };

  return {
    sessionId: 'reincarnation_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    stage: 'opening_scenes',
    fixedOpeningScene: 'previous_life',
    currentSceneIndex: 0,
    hasSeenOpening: false,
    angelName: CANON_ANGEL.name,
    userNameChosen: userName?.trim() || undefined,
    conversationHistory: [initialGreeting],
    dialogueHistory: [initialGreeting],
    profile,
    activeTopic: 'name',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
};

export interface ExtractedPreferencesResult {
  extractedUpdates: Partial<ReincarnationProfile>;
  extractedName?: string;
  extractedFields: string[];
  name?: string;
  genre?: string;
  race?: string;
  magicAffinities?: string[];
  themes?: string[];
}

/**
 * Natural language intent and preference extraction supporting English and Hindi.
 */
export const extractReincarnationPreferences = (
  text: string,
  currentProfile: ReincarnationProfile,
  hasConfirmedName: boolean
): ExtractedPreferencesResult => {
  const lower = text.toLowerCase().trim();
  const extractedFields: string[] = [];
  const updates: any = {};
  let extractedName: string | undefined;

  // 1. Name Extraction
  if (!hasConfirmedName) {
    const namePatterns = [
      /(?:मेरा नाम|नाम)\s*(?:है\s*)?([A-Za-z\u0900-\u097F']+(?:\s+[A-Za-z\u0900-\u097F']+)?)(?:\s+है|\s+हूँ|\s+और|\s+bolte|[.,!?;:]|$)/i,
      /(?:my name is|i am called|call me|name is|i am|iam)\s+([A-Za-z'\u0900-\u097F]+(?:\s+[A-Za-z'\u0900-\u097F]+)?)(?:\s+and|\s+who|[.,!?;:]|$)/i,
    ];

    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        extractedName = match[1]
          .replace(/[.,!?;:]/g, '')
          .replace(/\s+(?:है|हूँ|था|थी|थीं|and|is|am)$/i, '')
          .trim();
        break;
      }
    }

    // Fallback: If input is very short (1-3 words) and user hasn't confirmed name yet, treat it as the name
    if (!extractedName && text.split(/\s+/).length <= 3 && text.length >= 2 && !lower.includes('world') && !lower.includes('magic') && !lower.includes('fantasy') && !lower.includes('दुनिया') && !lower.includes('जादू')) {
      extractedName = text.replace(/[.,!?;:]/g, '').trim();
    }

    if (extractedName) {
      extractedFields.push('Character Name');
      updates.character = updates.character || { ...currentProfile.character };
      updates.character.name = createField(extractedName, 'confirmed');
    }
  }

  // 2. World Genre & Style Extraction
  let detectedGenre: string | undefined;
  if (lower.includes('dark fantasy') || lower.includes('eldritch') || lower.includes('grim')) {
    detectedGenre = 'Dark Fantasy';
  } else if (lower.includes('cyberpunk') || lower.includes('sci-fi') || lower.includes('neon') || lower.includes('tech') || lower.includes('साइबर')) {
    detectedGenre = 'Cyberpunk Noir';
  } else if (lower.includes('cultivation') || lower.includes('xianxia') || lower.includes('immortal') || lower.includes('dao') || lower.includes('तपस्या')) {
    detectedGenre = 'Eastern Cultivation';
  } else if (lower.includes('steampunk') || lower.includes('airship') || lower.includes('clockwork')) {
    detectedGenre = 'Steampunk Fantasy';
  } else if (lower.includes('fantasy') || lower.includes('magic') || lower.includes('dragon') || lower.includes('जादू') || lower.includes('काल्पनिक')) {
    detectedGenre = 'High Fantasy';
  }

  if (detectedGenre) {
    extractedFields.push(`World Genre: ${detectedGenre}`);
    updates.world = updates.world || { ...currentProfile.world };
    updates.world.genre = createField(detectedGenre, 'confirmed');
  }

  // 3. Race & Bloodline
  let detectedRace: string | undefined;
  if (lower.includes('dark elf')) {
    detectedRace = 'Dark Elf';
  } else if (lower.includes('elf') || lower.includes('elven') || lower.includes('एल्फ')) {
    detectedRace = 'High Elf';
  } else if (lower.includes('dragon') || lower.includes('dragonkin') || lower.includes('ड्रैगन')) {
    detectedRace = 'Dragonkin';
  } else if (lower.includes('beast') || lower.includes('wolf') || lower.includes('cat') || lower.includes('जानवर')) {
    detectedRace = 'Beastkin';
  } else if (lower.includes('vampire')) {
    detectedRace = 'Vampire Noble';
  } else if (lower.includes('human') || lower.includes('मानव') || lower.includes('इंसान')) {
    detectedRace = 'Human';
  }

  if (detectedRace) {
    extractedFields.push(`Race: ${detectedRace}`);
    updates.character = updates.character || { ...currentProfile.character };
    updates.character.race = createField(detectedRace, 'confirmed');
  }

  // 4. Magic Affinities
  const detectedAffinities: string[] = [];
  if (lower.includes('starlight') || lower.includes('stars') || lower.includes('तारों')) detectedAffinities.push('Starlight');
  if (lower.includes('lightning') || lower.includes('thunder') || lower.includes('बिजली')) detectedAffinities.push('Lightning');
  if (lower.includes('solar') || lower.includes('sun') || lower.includes('flame') || lower.includes('fire') || lower.includes('आग')) detectedAffinities.push('Solar Flame');
  if (lower.includes('void') || lower.includes('shadow') || lower.includes('अंधकार')) detectedAffinities.push('Void');
  if (lower.includes('life') || lower.includes('nature') || lower.includes('प्रकृति')) detectedAffinities.push('Verdant Life');

  if (detectedAffinities.length > 0) {
    extractedFields.push(`Magic Affinities: ${detectedAffinities.join(', ')}`);
    updates.abilities = updates.abilities || { ...currentProfile.abilities };
    updates.abilities.magicAffinity = createField(detectedAffinities, 'confirmed');
  }

  // 5. Social Origin & Family
  if (lower.includes('royal') || lower.includes('prince') || lower.includes('princess') || lower.includes('king') || lower.includes('राजकुमार') || lower.includes('राजा')) {
    extractedFields.push('Social Status: Royalty');
    updates.character = updates.character || { ...currentProfile.character };
    updates.character.socialStatus = createField('Imperial Royalty', 'confirmed');
    updates.circumstances = updates.circumstances || { ...currentProfile.circumstances };
    updates.circumstances.familyStatus = createField('Imperial Crown Lineage', 'confirmed');
    updates.circumstances.wealth = createField('Royal Treasury Access', 'confirmed');
  } else if (lower.includes('noble') || lower.includes('duke') || lower.includes('aristocrat') || lower.includes('नवाब') || lower.includes('अमीर')) {
    extractedFields.push('Social Status: High Nobility');
    updates.character = updates.character || { ...currentProfile.character };
    updates.character.socialStatus = createField('High Nobility', 'confirmed');
    updates.circumstances = updates.circumstances || { ...currentProfile.circumstances };
    updates.circumstances.familyStatus = createField('Ancient Noble House', 'confirmed');
    updates.circumstances.wealth = createField('Ancestral Estates & Silver', 'confirmed');
  }

  // 6. Story Themes & Ambitions
  const detectedThemes: string[] = [];
  if (lower.includes('kingdom building') || lower.includes('build a kingdom') || lower.includes('साम्राज्य निर्माण')) detectedThemes.push('Kingdom Building');
  if (lower.includes('intrigue') || lower.includes('politics') || lower.includes('राजनीति')) detectedThemes.push('Political Intrigue');
  if (lower.includes('adventure') || lower.includes('explore') || lower.includes('खोज')) detectedThemes.push('Adventure');
  if (lower.includes('romance') || lower.includes('love') || lower.includes('प्रेम')) detectedThemes.push('Romance');

  if (detectedThemes.length > 0) {
    extractedFields.push(`Themes: ${detectedThemes.join(', ')}`);
    updates.preferences = updates.preferences || { ...currentProfile.preferences };
    updates.preferences.primaryThemes = createField(detectedThemes, 'confirmed');
  }

  return {
    extractedUpdates: updates,
    extractedName,
    extractedFields,
    name: extractedName,
    genre: detectedGenre,
    race: detectedRace,
    magicAffinities: detectedAffinities.length > 0 ? detectedAffinities : undefined,
    themes: detectedThemes.length > 0 ? detectedThemes : undefined,
  };
};

/**
 * Convenience helper extracting preferences from plain text against a fresh profile.
 */
export const extractNaturalPreferences = (text: string) => {
  const profile = createInitialProfile();
  return extractReincarnationPreferences(text, profile, false);
};

/**
 * Natural Conversational Engine for Divine Angel Seraphina
 * Returns updated ReincarnationSession atomically.
 */
export const generateAngelDialogue = (
  session: ReincarnationSession,
  userMessage: string
): ReincarnationSession => {
  const trimmedInput = userMessage.trim();
  const lower = trimmedInput.toLowerCase();
  const hasConfirmedName = Boolean(session.userNameChosen && session.profile.character.name.status === 'confirmed');

  // 1. Extract preferences from user input
  const { extractedUpdates, extractedName, extractedFields } = extractReincarnationPreferences(
    trimmedInput,
    session.profile,
    hasConfirmedName
  );

  // 2. Deep merge extracted updates into current profile
  const updatedProfile: ReincarnationProfile = {
    world: { ...session.profile.world, ...(extractedUpdates.world || {}) },
    character: { ...session.profile.character, ...(extractedUpdates.character || {}) },
    abilities: { ...session.profile.abilities, ...(extractedUpdates.abilities || {}) },
    circumstances: { ...session.profile.circumstances, ...(extractedUpdates.circumstances || {}) },
    preferences: { ...session.profile.preferences, ...(extractedUpdates.preferences || {}) },
  };

  const newChosenName = extractedName || session.userNameChosen || (updatedProfile.character.name.status === 'confirmed' ? updatedProfile.character.name.value : undefined);
  if (extractedName) {
    updatedProfile.character.name = createField(extractedName, 'confirmed');
  }

  const currentHeroName = newChosenName || 'Drifting Soul';

  // 3. Formulate Angel's Response
  let angelReplyText = '';

  const requestsFate =
    lower.includes('wheel') ||
    lower.includes('fate') ||
    lower.includes('random') ||
    lower.includes('surprise me') ||
    lower.includes("don't know") ||
    lower.includes('dont know') ||
    lower.includes('not sure') ||
    lower.includes('kismat') ||
    lower.includes('किस्मत');

  if (requestsFate) {
    angelReplyText = `You need not carry the burden of deciding every thread yourself, ${currentHeroName}. The Great Weave of Destiny is vast. Let us spin the Wheel of Fate to reveal what the cosmos holds for you.`;
  } else if (!hasConfirmedName && extractedName) {
    angelReplyText = `It is an honor to meet you, ${extractedName}. The resonance of your true name is now inscribed upon the celestial chronicle.\n\nNow, tell me... what manner of world would you like to enter? Perhaps a realm of grand kingdoms and dragons, a high-tech arcana megalopolis, or something born of your own imagination?`;
  } else if (extractedFields.length > 0) {
    const summaryList = extractedFields.join(', ');
    const nextQuestions: string[] = [];

    if (updatedProfile.character.race.status === 'undecided') {
      nextQuestions.push('What form shall your soul take—an adaptive Human, an ancient High Elf, or perhaps a fierce Dragonkin?');
    }
    if (updatedProfile.character.socialStatus.status === 'undecided') {
      nextQuestions.push('Would you prefer to awaken into high nobility, a commercial merchant dynasty, or a humble village family?');
    }
    if (updatedProfile.abilities.magicAffinity.status === 'undecided') {
      nextQuestions.push('What primal magical affinity calls to your spirit—Lightning, Solar Flame, Starlight, or Void?');
    }

    const followUp = nextQuestions[0] || 'Your destiny takes magnificent shape. Tell me of any special talents or ambitions you carry into this life.';
    angelReplyText = `I hear your will clearly, ${currentHeroName}. I have woven these threads into your reincarnation vessel (${summaryList}).\n\n${followUp}`;
  } else if (lower.includes('who are you') || lower.includes('angel')) {
    angelReplyText = `I am Seraphina, the Divine Herald of the Multiverse. My sacred charge is to accompany souls across the threshold of mortal cessation and guide them into realms where their potential may bloom anew.`;
  } else if (lower.includes('where am i') || lower.includes('what is this place')) {
    angelReplyText = `You stand within the Nexus of Divine Grace—a tranquil sanctuary suspended between dimensional membranes where the laws of earthly time have no dominion. Here, you are safe.`;
  } else if (lower.includes('can i return') || lower.includes('go back')) {
    angelReplyText = `The thread of your former life has concluded its mortal tapestry, dear ${currentHeroName}. To force it backward would unravel those you cherished. But ahead lies a fresh canvas where your wisdom and courage may forge an unwritten legend.`;
  } else {
    angelReplyText = `I understand, ${currentHeroName}. Every detail you envision helps calibrate the resonance of your rebirth. Would you like to refine your starting circumstances, or shall we consult the Wheel of Fate for any remaining mysteries?`;
  }

  // 4. Create Message Records
  const userMsg: AngelDialogueMessage = {
    id: 'msg_user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    sender: 'hero',
    speaker: 'user',
    text: trimmedInput,
    timestamp: Date.now(),
  };

  const angelMsg: AngelDialogueMessage = {
    id: 'msg_angel_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    sender: 'angel',
    speaker: 'angel',
    text: angelReplyText,
    extractedFields,
    timestamp: Date.now() + 1,
  };

  const updatedHistory = [...(session.dialogueHistory || session.conversationHistory || []), userMsg, angelMsg];

  const updatedSession: ReincarnationSession = {
    ...session,
    stage: 'angel_dialogue',
    userNameChosen: newChosenName,
    profile: updatedProfile,
    conversationHistory: updatedHistory,
    dialogueHistory: updatedHistory,
    updatedAt: Date.now(),
  };

  saveReincarnationSession(updatedSession);
  return updatedSession;
};

/**
 * Applies a Fate Wheel spin result without overwriting confirmed choices.
 */
export const applyFateWheelResult = (
  session: ReincarnationSession,
  categoryId: string,
  option: any
): ReincarnationSession => {
  const profile = { ...session.profile };
  const optionData = option?.data || option || {};

  if (categoryId === 'world_type') {
    if (profile.world.genre.status !== 'confirmed' && optionData.genre) {
      profile.world.genre = createField(optionData.genre, 'random');
    }
    if (profile.world.era.status !== 'confirmed' && optionData.era) {
      profile.world.era = createField(optionData.era, 'random');
    }
    if (profile.world.magicSystem.status !== 'confirmed' && optionData.magicSystem) {
      profile.world.magicSystem = createField(optionData.magicSystem, 'random');
    }
  }

  if (categoryId === 'race') {
    if (profile.character.race.status !== 'confirmed' && optionData.race) {
      profile.character.race = createField(optionData.race, 'random');
    }
  }

  if (categoryId === 'origin') {
    if (profile.character.socialStatus.status !== 'confirmed' && optionData.socialStatus) {
      profile.character.socialStatus = createField(optionData.socialStatus, 'random');
    }
    if (profile.circumstances.familyStatus.status !== 'confirmed' && optionData.familyStatus) {
      profile.circumstances.familyStatus = createField(optionData.familyStatus, 'random');
    }
    if (profile.circumstances.wealth.status !== 'confirmed' && optionData.wealth) {
      profile.circumstances.wealth = createField(optionData.wealth, 'random');
    }
  }

  if (categoryId === 'abilities') {
    if (profile.abilities.magicAffinity.status !== 'confirmed' && optionData.magicAffinity) {
      profile.abilities.magicAffinity = createField(optionData.magicAffinity, 'random');
    }
    if (profile.abilities.specialAbilities.status !== 'confirmed' && optionData.specialAbilities) {
      profile.abilities.specialAbilities = createField(optionData.specialAbilities, 'random');
    }
  }

  if (categoryId === 'story_direction') {
    if (profile.preferences.primaryThemes.status !== 'confirmed' && optionData.primaryThemes) {
      profile.preferences.primaryThemes = createField(optionData.primaryThemes, 'random');
    }
    if (profile.preferences.tone.status !== 'confirmed' && optionData.tone) {
      profile.preferences.tone = createField(optionData.tone, 'random');
    }
  }

  const updated: ReincarnationSession = {
    ...session,
    profile,
    updatedAt: Date.now(),
  };

  saveReincarnationSession(updated);
  return updated;
};

/**
 * Spins all undecided categories in one divine burst of fate.
 */
export const spinAllUndecidedCategories = (session: ReincarnationSession): ReincarnationSession => {
  let current = session;
  for (const cat of FATE_WHEEL_CATEGORIES) {
    if (!cat?.options?.length) continue;
    const randomOption = cat.options[Math.floor(Math.random() * cat.options.length)];
    current = applyFateWheelResult(current, cat.id, randomOption.data || randomOption);
  }
  return current;
};

/**
 * Manually update any field in the profile with confirmed status.
 */
export const updateProfileFieldManually = (
  session: ReincarnationSession,
  category: keyof ReincarnationProfile,
  field: string,
  newValue: any
): ReincarnationSession => {
  const updatedCategory = { ...(session.profile[category] as any) };
  updatedCategory[field] = createField(newValue, 'confirmed');

  const updated: ReincarnationSession = {
    ...session,
    profile: {
      ...session.profile,
      [category]: updatedCategory,
    },
    updatedAt: Date.now(),
  };

  if (category === 'character' && field === 'name' && typeof newValue === 'string' && newValue.trim()) {
    updated.userNameChosen = newValue.trim();
  }

  saveReincarnationSession(updated);
  return updated;
};

/**
 * Compiles ReincarnationProfile into an authoritative Story Engine launch package.
 * Strict Cleanliness: Absolutely NO Health or Stamina progression mechanics,
 * NO generic healing potions/salves, and NO generic stamina restorers.
 */
export const buildReincarnationLaunchPackage = (
  session: ReincarnationSession,
  worldCatalog: WorldDefinition[] = WORLD_CATALOG
): ReincarnationLaunchPackage => {
  const p = session.profile;
  const chosenName = session.userNameChosen || p.character.name.value || 'Hari Khatri';

  // Match or generate world definition
  let matchedWorld = worldCatalog.find(
    (w) => w.primaryGenreId.toLowerCase() === p.world.genre.value.toLowerCase() || w.name.toLowerCase().includes(p.world.name.value.toLowerCase())
  );

  if (!matchedWorld) {
    matchedWorld = worldCatalog[0] || WORLD_CATALOG[0];
  }

  const hero: HeroProfile = {
    id: 'hero_' + Date.now(),
    name: chosenName,
    age: p.character.age.value || '19',
    gender: p.character.gender.value || 'Any',
    appearance: {
      hair: p.character.appearance.value.hair,
      eyes: p.character.appearance.value.eyes,
      clothing: p.character.appearance.value.clothing,
      distinguishingFeatures: p.character.appearance.value.distinguishingFeatures,
    },
    personality: p.character.personality.value || ['Determined', 'Pragmatic'],
    race: p.character.race.value || 'Human',
    species: p.character.race.value || 'Human',
    origin: p.circumstances.birthplace.value || 'The Nexus Gateway',
    backstory: `Reborn into the multiverse through the guidance of Divine Angel Seraphina. Lineage: ${p.character.socialStatus.value} (${p.circumstances.familyStatus.value}). Former world memory intact: ${p.abilities.previousLifeKnowledge.value}.`,
    skills: p.abilities.skills.value || ['Swordsmanship', 'Tactical Analysis'],
    powers: p.abilities.magicAffinity.value.map((aff) => `${aff} Manipulation`),
    weapons: ['Sunforged Longsword', 'Dimensional Signet Ring'],
    weaknesses: ['Dimensional Anchor Fluctuation', 'Unfamiliar Local Politics'],
    powerLevel: 45,
    goals: [`Establish influence in ${matchedWorld.name}`, 'Uncover the higher mysteries of the multiverse'],
    motivations: ['Protecting newly forged bonds', 'Shaping a sovereign destiny'],
    fears: ['Severing of former world memories'],
    secrets: ['Remembers high-technology and scientific methodology from Earth'],
    alignment: 'Neutral Good' as MoralAlignment,
    relationships: [],
    createdAt: Date.now(),
  };

  const settings: StorySettings = {
    tone: p.preferences.tone.value || 'Epic Fantasy',
    pacing: p.preferences.pacing.value || 'Balanced Narrative',
    difficulty: 'Adventurer (Standard)',
    storyLanguage: p.preferences.storyLanguage.value || 'hi',
    narrativeLength: 'balanced',
    mode: 'roleplay',
    userPromptDescription: `[DIVINE ANGEL ISEKAI REINCARNATION]\nHero: ${hero.name} (${hero.race}, ${p.character.socialStatus.value}).\nWorld: ${matchedWorld.name} (${p.world.genre.value}). Era: ${p.world.era.value}.\nMagic/Power: ${p.world.magicSystem.value}. Affinities: ${p.abilities.magicAffinity.value.join(', ')}.\nStarting Circumstance: ${p.circumstances.initialCircumstances.value} in ${p.circumstances.birthplace.value}.\nThemes: ${p.preferences.primaryThemes.value.join(', ')}.\nMandate: Begin immediately at the exact instant of physical awakening in the new world. Ground the narrative in sensory reality, present an immediate situation, and offer tactical choices. Do NOT introduce stamina or generic potions.`,
  };

  const summaryText = `Protagonist: ${hero.name} | Race: ${hero.race} | World: ${matchedWorld.name} (${p.world.genre.value}) | Status: ${p.character.socialStatus.value} | Magic: ${p.abilities.magicAffinity.value.join(', ')}`;

  return { hero, world: matchedWorld, settings, summaryText };
};

export const saveReincarnationSession = (session: ReincarnationSession): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch (err) {
    console.warn('[ReincarnationEngine] Storage write failed:', err);
  }
};

export const loadReincarnationSession = (): ReincarnationSession | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('[ReincarnationEngine] Storage read failed:', err);
    return null;
  }
};

export const clearReincarnationSession = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('[ReincarnationEngine] Storage clear failed:', err);
  }
};
