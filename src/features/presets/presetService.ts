import { StoryPreset, CreateStoryPresetInput } from '../../types/preset';

const PRESETS_STORAGE_KEY = 'bv_story_presets';

export const BUILT_IN_STORY_PRESETS: StoryPreset[] = [
  {
    id: 'builtin_hindi_epic_saga',
    name: 'पौराणिक महाकाव्य (Epic Hindi Saga)',
    description: 'वीर रस, प्राचीन रहस्य और गहरी गाथा पर आधारित भव्य भारतीय पौराणिक कहानी।',
    selectedGenre: 'Mythological Fantasy',
    genres: ['Mythological Fantasy', 'Epic Saga'],
    tone: 'Epic Fantasy',
    pacing: 'Deep Lore Exploration',
    difficulty: 'Heroic (Tactical)',
    narrativeLength: 'detailed',
    storyLanguage: 'hi',
    timePeriod: 'Ancient Vedic Era',
    storyStyle: 'Cinematic & Immersive',
    romanceLevel: 'Light',
    actionLevel: 'High',
    mysteryLevel: 'High',
    heroArchetype: {
      race: 'Human',
      personality: 'Dharmic, Fearless, Wise',
    },
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
    isBuiltIn: true,
  },
  {
    id: 'builtin_high_fantasy_hero',
    name: 'High Fantasy Chronicle',
    description: 'Magic leylines, ancient kingdoms, and classical heroic fantasy quests.',
    selectedGenre: 'High Fantasy',
    genres: ['High Fantasy', 'Adventure'],
    tone: 'Epic Fantasy',
    pacing: 'Balanced Narrative',
    difficulty: 'Adventurer (Standard)',
    narrativeLength: 'balanced',
    storyLanguage: 'hi',
    timePeriod: 'Medieval Arcana',
    storyStyle: 'Vivid & Atmospheric',
    romanceLevel: 'Light',
    actionLevel: 'Moderate',
    mysteryLevel: 'High',
    heroArchetype: {
      race: 'Elf',
      personality: 'Curious, Principled, Bold',
    },
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
    isBuiltIn: true,
  },
  {
    id: 'builtin_cyberpunk_detective',
    name: 'Cyberpunk Neon Noir',
    description: 'Rainy neon skylines, cybernetic implants, and deep corporate espionage.',
    selectedGenre: 'Cyberpunk Noir',
    genres: ['Cyberpunk Noir', 'Sci-Fi'],
    tone: 'Dark & Gritty',
    pacing: 'Fast-paced Action',
    difficulty: 'Heroic (Tactical)',
    narrativeLength: 'concise',
    storyLanguage: 'hi',
    timePeriod: 'Far Future 2142',
    storyStyle: 'Gritty & Kinetic',
    romanceLevel: 'None',
    actionLevel: 'High',
    mysteryLevel: 'High',
    heroArchetype: {
      race: 'Cyborg Human',
      personality: 'Cynical, Perceptive, Resilient',
    },
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
    isBuiltIn: true,
  },
  {
    id: 'builtin_modern_investigation',
    name: 'Contemporary Mystery & Suspense',
    description: 'Grounded investigative thriller with realistic stakes and clues.',
    selectedGenre: 'Mystery & Suspense',
    genres: ['Mystery & Suspense', 'Crime Drama'],
    tone: 'Mystery & Suspense',
    pacing: 'Balanced Narrative',
    difficulty: 'Adventurer (Standard)',
    narrativeLength: 'balanced',
    storyLanguage: 'hi',
    timePeriod: 'Modern Day',
    storyStyle: 'Intelligent & Tense',
    romanceLevel: 'None',
    actionLevel: 'Low',
    mysteryLevel: 'High',
    heroArchetype: {
      race: 'Human',
      personality: 'Analytical, Skeptical, Thorough',
    },
    createdAt: 1700000000000,
    updatedAt: 1700000000000,
    isBuiltIn: true,
  },
];

class PresetService {
  private getStorageKey(userId?: string): string {
    return userId ? `${PRESETS_STORAGE_KEY}_${userId}` : PRESETS_STORAGE_KEY;
  }

  /**
   * Lists all available story presets (built-ins + user created).
   */
  public async listPresets(userId?: string): Promise<StoryPreset[]> {
    try {
      const storageKey = this.getStorageKey(userId);
      const raw = localStorage.getItem(storageKey);
      const userPresets: StoryPreset[] = raw ? JSON.parse(raw) : [];

      // Combine built-in presets with user presets (user presets first)
      return [...userPresets, ...BUILT_IN_STORY_PRESETS];
    } catch (e) {
      console.warn('[PresetService] Error loading presets:', e);
      return BUILT_IN_STORY_PRESETS;
    }
  }

  /**
   * Retrieves a single preset by ID.
   */
  public async getPreset(presetId: string, userId?: string): Promise<StoryPreset | null> {
    const all = await this.listPresets(userId);
    return all.find((p) => p.id === presetId) || null;
  }

  /**
   * Saves a new or updated story preset.
   */
  public async savePreset(
    input: CreateStoryPresetInput,
    presetId?: string,
    userId?: string
  ): Promise<StoryPreset> {
    const storageKey = this.getStorageKey(userId);
    let userPresets: StoryPreset[] = [];

    try {
      const raw = localStorage.getItem(storageKey);
      userPresets = raw ? JSON.parse(raw) : [];
    } catch {
      userPresets = [];
    }

    const now = Date.now();
    const targetId = presetId || `preset_${now}_${Math.random().toString(36).substring(2, 7)}`;
    const existingIndex = userPresets.findIndex((p) => p.id === targetId);

    const savedPreset: StoryPreset = {
      ...input,
      id: targetId,
      createdAt: existingIndex >= 0 ? userPresets[existingIndex].createdAt : now,
      updatedAt: now,
      isBuiltIn: false,
    };

    if (existingIndex >= 0) {
      userPresets[existingIndex] = savedPreset;
    } else {
      userPresets.unshift(savedPreset);
    }

    try {
      localStorage.setItem(storageKey, JSON.stringify(userPresets));
      if (userId) {
        // Also update default key as fallback
        localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(userPresets));
      }
    } catch (e) {
      console.error('[PresetService] Error persisting preset:', e);
    }

    return savedPreset;
  }

  /**
   * Deletes a user preset by ID.
   */
  public async deletePreset(presetId: string, userId?: string): Promise<boolean> {
    const storageKey = this.getStorageKey(userId);
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return false;
      const userPresets: StoryPreset[] = JSON.parse(raw);
      const filtered = userPresets.filter((p) => p.id !== presetId);
      localStorage.setItem(storageKey, JSON.stringify(filtered));
      if (userId) {
        localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(filtered));
      }
      return true;
    } catch (e) {
      console.error('[PresetService] Error deleting preset:', e);
      return false;
    }
  }
}

export const presetService = new PresetService();
