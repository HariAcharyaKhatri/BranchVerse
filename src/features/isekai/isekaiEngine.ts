import {
  ProloguePhase,
  PrologueSessionState,
  SoulSculptData,
  EntityPersonality,
  EntityDialogueEntry,
  IsekaiLaunchPackage,
} from './isekaiTypes';
import {
  ISEKAI_RACES,
  ISEKAI_CLASSES,
  ISEKAI_ELEMENTS,
  ISEKAI_SCENARIOS,
  ENTITY_PERSONALITY_PROFILES,
} from './isekaiCatalog';
import { HeroProfile, MoralAlignment } from '../../types/character';
import { WorldDefinition } from '../../types/world';
import { WORLD_CATALOG } from '../../catalogs/worlds';
import { StorySettings } from '../../types/story';

const STORAGE_KEY = 'bv_isekai_session_v1';

export const createDefaultSoulSculpt = (userName?: string): SoulSculptData => {
  const cleanName = userName?.trim() || 'Hari Khatri';
  return {
    name: cleanName,
    title: 'The Transmigrated Wanderer',
    age: '19',
    gender: 'Any',
    raceId: 'human',
    classId: 'vanguard_knight',
    elementalAffinities: ['lightning', 'starlight'],
    attributes: {
      strength: 14,
      agility: 13,
      constitution: 14,
      intelligence: 15,
      willpower: 16,
      charisma: 12,
    },
    personalityTraits: ['Curious', 'Pragmatic', 'Resilient'],
    startingScenarioId: 'commoner_artisan',
    appearance: {
      hair: 'Obsidian Black, ruffled',
      eyes: 'Starlight Amber',
      clothing: 'Simple traveler’s tunic with subtle astral trim',
      distinguishingFeatures: 'Faint glowing starlight brand on right palm',
    },
    customFirstLifeNote: 'A diligent student / creator caught in a fateful storm late at night.',
  };
};

export const createInitialPrologueSession = (
  userName?: string,
  personality: EntityPersonality = 'mysterious'
): PrologueSessionState => {
  const profile = ENTITY_PERSONALITY_PROFILES[personality];
  const initialDialogue: EntityDialogueEntry = {
    id: 'dlg_greet_' + Date.now(),
    speaker: 'entity',
    text: profile.greeting,
    emotion: 'mysterious',
    timestamp: Date.now(),
  };

  return {
    sessionId: 'isekai_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    currentPhase: 'first_life',
    phaseTurnIndex: 0,
    dialogueHistory: [initialDialogue],
    entityPersonality: personality,
    soulSculpt: createDefaultSoulSculpt(userName),
    selectedWorldId: 'aethelgard',
    selectedScenarioId: 'commoner_artisan',
    entityBoon: 'Omni-Linguistic Resonance & Starlight Core',
    isComplete: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
};

export const advanceProloguePhase = (
  session: PrologueSessionState,
  targetPhase?: ProloguePhase
): PrologueSessionState => {
  const phaseOrder: ProloguePhase[] = [
    'first_life',
    'astral_awakening',
    'entity_communion',
    'multiverse_offer',
    'soul_sculpting',
    'gateway_selection',
    'final_departure',
    'completed',
  ];

  let nextPhase = targetPhase;
  if (!nextPhase) {
    const currentIndex = phaseOrder.indexOf(session.currentPhase);
    nextPhase = phaseOrder[Math.min(currentIndex + 1, phaseOrder.length - 1)];
  }

  const updated: PrologueSessionState = {
    ...session,
    currentPhase: nextPhase,
    phaseTurnIndex: session.phaseTurnIndex + 1,
    isComplete: nextPhase === 'completed',
    updatedAt: Date.now(),
  };

  savePrologueSession(updated);
  return updated;
};

export const appendDialogue = (
  session: PrologueSessionState,
  dialogue: Omit<EntityDialogueEntry, 'id' | 'timestamp'>
): PrologueSessionState => {
  const newEntry: EntityDialogueEntry = {
    ...dialogue,
    id: 'dlg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
    timestamp: Date.now(),
  };

  const updated: PrologueSessionState = {
    ...session,
    dialogueHistory: [...session.dialogueHistory, newEntry],
    updatedAt: Date.now(),
  };

  savePrologueSession(updated);
  return updated;
};

export const updateSoulSculpt = (
  session: PrologueSessionState,
  updates: Partial<SoulSculptData>
): PrologueSessionState => {
  const updated: PrologueSessionState = {
    ...session,
    soulSculpt: {
      ...session.soulSculpt,
      ...updates,
      attributes: {
        ...session.soulSculpt.attributes,
        ...(updates.attributes || {}),
      },
      appearance: {
        ...session.soulSculpt.appearance,
        ...(updates.appearance || {}),
      },
    },
    updatedAt: Date.now(),
  };

  savePrologueSession(updated);
  return updated;
};

export const generateEntityResponse = (
  session: PrologueSessionState,
  playerInput: string
): string => {
  const lower = playerInput.toLowerCase();
  const profile = ENTITY_PERSONALITY_PROFILES[session.entityPersonality];
  const { sampleResponses } = profile;

  if (lower.includes('where') || lower.includes('place') || lower.includes('location')) {
    return sampleResponses.where_am_i;
  }
  if (lower.includes('dead') || lower.includes('die') || lower.includes('alive')) {
    return sampleResponses.am_i_dead;
  }
  if (lower.includes('who are you') || lower.includes('name') || lower.includes('identity')) {
    return sampleResponses.who_are_you;
  }
  if (lower.includes('return') || lower.includes('back home') || lower.includes('earth')) {
    return sampleResponses.can_i_return;
  }
  if (lower.includes('world') || lower.includes('realm') || lower.includes('universe')) {
    return sampleResponses.what_worlds;
  }

  // Adaptive contextual response based on personality
  if (session.entityPersonality === 'witty') {
    return `"${playerInput}"? Ah, fascinating question! In the grand multiverse, every question is like a stone thrown into a wishing well. Keep that sharp mind of yours ready—you’ll need it where you’re going!`;
  }
  if (session.entityPersonality === 'formal') {
    return `Query "${playerInput}" received and logged into Astral Registry Index. Your cognitive faculties appear well-preserved despite dimensional relocation. Let us proceed with identity stabilization.`;
  }
  if (session.entityPersonality === 'divine') {
    return `Your thoughts ripple through the astral light, little one. The concerns of your heart are understood. Release your burdens; a grand dawn awaits you.`;
  }

  return `The threads acknowledge your words: "${playerInput}". The old laws of your world do not bind you here. Every breath from this moment forward will be written by your own will.`;
};

export const compileHeroProfileFromSoulSculpt = (
  soulSculpt: SoulSculptData,
  fallbackName = 'Hari Khatri'
): HeroProfile => {
  const race = ISEKAI_RACES.find((r) => r.id === soulSculpt.raceId) || ISEKAI_RACES[0];
  const cls = ISEKAI_CLASSES.find((c) => c.id === soulSculpt.classId) || ISEKAI_CLASSES[0];
  const scenario =
    ISEKAI_SCENARIOS.find((s) => s.id === soulSculpt.startingScenarioId) || ISEKAI_SCENARIOS[0];

  const totalAttributes = Object.values(soulSculpt.attributes).reduce((acc, v) => acc + v, 0);
  const powerLevel = Math.min(85, Math.max(30, Math.round(totalAttributes / 1.8)));

  const cleanName = soulSculpt.name?.trim() || fallbackName;

  return {
    id: 'hero_' + Date.now(),
    name: cleanName,
    age: soulSculpt.age || '19',
    gender: soulSculpt.gender || 'Any',
    appearance: {
      hair: soulSculpt.appearance.hair,
      eyes: soulSculpt.appearance.eyes,
      clothing: soulSculpt.appearance.clothing,
      distinguishingFeatures: soulSculpt.appearance.distinguishingFeatures,
    },
    personality:
      soulSculpt.personalityTraits.length > 0
        ? soulSculpt.personalityTraits
        : ['Curious', 'Resilient'],
    race: race.name,
    species: race.category,
    origin: scenario.recommendedOrigins[0] || 'Astral Gateway Threshold',
    backstory: `Formerly of Earth, transmigrated into the Multiverse after a fateful transition. Chosen vessel: ${race.name} ${cls.name}. Scenario: ${scenario.title}. ${soulSculpt.customFirstLifeNote || ''}`,
    skills: [...cls.signatureAbilities, ...race.innateTraits],
    powers: soulSculpt.elementalAffinities.map((aff) => {
      const match = ISEKAI_ELEMENTS.find((e) => e.id === aff);
      return match ? `${match.name} Manipulation` : `${aff} Resonance`;
    }),
    weapons: cls.starterWeapons,
    weaknesses: ['Dimensional Anchoring Instability', 'Unfamiliar World Etiquette'],
    powerLevel,
    goals: ['Explore the living multiverse', 'Uncover the source of the Astral Threads', 'Survive and thrive in the new realm'],
    motivations: ['Freedom to shape own destiny', 'Mastering extraordinary powers', 'Protecting newfound companions'],
    fears: ['Severing of all memories of home', 'Cosmic void collapse'],
    secrets: ['Remembers their entire former Earth life and modern technological concepts'],
    alignment: 'True Neutral' as MoralAlignment,
    relationships: [],
    createdAt: Date.now(),
  };
};

export const buildIsekaiStoryLaunchParams = (
  session: PrologueSessionState,
  worldCatalog: WorldDefinition[] = WORLD_CATALOG
): IsekaiLaunchPackage => {
  const world =
    worldCatalog.find((w) => w.id === session.selectedWorldId) ||
    worldCatalog[0] ||
    WORLD_CATALOG[0];

  const hero = compileHeroProfileFromSoulSculpt(session.soulSculpt, 'Hari Khatri');
  const scenario =
    ISEKAI_SCENARIOS.find((s) => s.id === session.selectedScenarioId) || ISEKAI_SCENARIOS[0];

  const settings: StorySettings = {
    tone: 'Lighthearted Isekai',
    pacing: 'Balanced Narrative',
    difficulty: 'Adventurer (Standard)',
    storyLanguage: 'hi', // Defaulting to high-quality Hindi narrative with full English choice support
    narrativeLength: 'balanced',
    mode: 'roleplay',
    userPromptDescription: `[ISEKAI REBIRTH PROLOGUE]\nProtagonist ${hero.name} transmigrated from Earth. Race: ${hero.race}. Class: ${session.soulSculpt.classId}. Elemental Affinities: ${session.soulSculpt.elementalAffinities.join(', ')}. Starting Scenario: ${scenario.title} (${scenario.description}). Entity Boon: ${session.entityBoon || 'Starlight Core'}.\nBegin at the exact moment of physical arrival in ${world.name} at ${hero.origin}.`,
  };

  return {
    hero,
    world,
    settings,
    prologueSummary: {
      previousLife: session.soulSculpt.customFirstLifeNote || 'Earth inhabitant',
      entityBoon: session.entityBoon || 'Starlight Core',
      chosenScenario: scenario.title,
      elementalResonance: session.soulSculpt.elementalAffinities,
    },
  };
};

export const savePrologueSession = (session: PrologueSessionState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch (err) {
    console.warn('[IsekaiEngine] Could not persist prologue session:', err);
  }
};

export const loadPrologueSession = (): PrologueSessionState | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('[IsekaiEngine] Failed to load cached prologue session:', err);
    return null;
  }
};

export const clearPrologueSession = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('[IsekaiEngine] Could not clear prologue session:', err);
  }
};
