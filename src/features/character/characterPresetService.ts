import { CharacterPreset, CharacterProfile } from '../../types/talent';
import { getDB } from '../../lib/storage/indexedDb';
import { DEFAULT_ATTRIBUTES } from '../../catalogs/characterCatalogs';

const LOCAL_STORAGE_PRESETS_KEY = 'bv_character_presets_cache';

export const CANONICAL_PRESETS: CharacterPreset[] = [
  {
    id: 'preset_solomon_merchant',
    name: 'Solomon Vane — Merchant Sovereign',
    summary: 'A shrewd economic visionary who dominates empires through cartels, trade treaties, and gold rather than blades.',
    version: 1,
    isBuiltIn: true,
    tags: ['Merchant', 'Non-Combat', 'Economy', 'Human'],
    createdAt: 1730000000000,
    updatedAt: 1730000000000,
    profile: {
      id: 'hero_solomon_vane',
      name: 'Solomon Vane',
      age: '34',
      gender: 'Male',
      appearance: {
        hair: 'Slicked Jet Black',
        eyes: 'Gilded Amber',
        clothing: 'Velvet Silk Merchant Robes with Gold Trim',
        distinguishingFeatures: 'Gold Signet Ring of the Continental Exchange',
      },
      personality: ['Pragmatic', 'Charismatic', 'Calculative', 'Unflappable'],
      race: 'Human',
      species: 'Human',
      origin: 'Golden Port of Oakhaven',
      backstory: 'Born to an impoverished bookkeeper, Solomon transformed a single cargo barge into a multi-realm shipping consortium.',
      skills: ['Ledger Accounting', 'Contract Negotiation', 'Currency Speculation', 'Appraisal'],
      powers: ['Economic Monopoly Aura', 'Price Foresight'],
      weapons: ['Concealed Golden Stiletto'],
      weaknesses: ['Poor Extended Melee Stamina', 'Avoids Solo Dungeon Incursions'],
      powerLevel: 32, // Acquired Level 32
      characterLevel: 32,
      tier: 'SS', // Primary Talent Tier
      socialStatus: 'Merchant Dynasty',
      professions: ['Merchant / Trade Magnate', 'Diplomat / Negotiator'],
      attributes: {
        ...DEFAULT_ATTRIBUTES,
        intelligence: 78,
        wisdom: 72,
        charisma: 85,
        luck: 65,
        strength: 18,
        agility: 22,
        vitality: 25,
      },
      talents: [
        {
          id: 'prod_business',
          name: 'Business & Merchant Genius',
          category: 'production',
          tier: 'SS',
          mastery: 'Master',
          description: 'Supreme economic acumen and monopoly formation commanding national debt.',
          source: 'Innate',
          specialization: 'Golden Sovereign Monopolies',
        },
        {
          id: 'int_genius',
          name: 'Analytical Mind & Ledger Logic',
          category: 'intellectual',
          tier: 'A',
          mastery: 'Expert',
          description: 'Calculates thousand-variable market supply fluctuations in seconds.',
          source: 'Rigorous Training',
        },
      ],
      abilitiesList: [
        {
          id: 'ab_monopoly',
          name: 'Market Price Embargo',
          category: 'production',
          mastery: 'Master',
          description: 'Freezes merchant commodity prices across regional hubs.',
        },
      ],
      goals: ['Establish the first planar currency exchange', 'Buy out the imperial treasury debt'],
      motivations: ['Economic sovereignty', 'Protecting free market integrity'],
      fears: ['Total continental bankruptcy and war collapse'],
      secrets: ['Holds private blackmail ledgers on seven dukes'],
      alignment: 'Neutral Good',
      relationships: [],
      createdAt: 1730000000000,
    },
  },
  {
    id: 'preset_elora_jack',
    name: 'Elora Vance — Jack of All Trades',
    summary: 'A versatile wanderer combining agile twin blades, elemental flame sparks, and alchemy survival.',
    version: 1,
    isBuiltIn: true,
    tags: ['Jack of All Trades', 'Versatile', 'Adventurer', 'Human'],
    createdAt: 1730000001000,
    updatedAt: 1730000001000,
    profile: {
      id: 'hero_elora_vance',
      name: 'Elora Vance',
      age: '21',
      gender: 'Female',
      appearance: {
        hair: 'Tumbled Chestnut Brown',
        eyes: 'Emerald Green',
        clothing: 'Reinforced Travel Leathers with Utility Bandolier',
        distinguishingFeatures: 'Dual Dagger Scabbards at Hip',
      },
      personality: ['Inquisitive', 'Resourceful', 'Adaptable', 'Brave'],
      race: 'Human',
      species: 'Human',
      origin: 'Riverwatch Crossing',
      backstory: 'Refusing to settle into a single guild profession, Elora apprenticed to bladesmiths, mages, and frontier scouts.',
      skills: ['Dual Dagger Combat', 'Camp Herbalism', 'Lockpicking', 'Survival Foraging'],
      powers: ['Jack of All Trades', 'Flickering Flame Blade'],
      weapons: ['Twin Steel Dirk Blades', 'Hunting Shortbow'],
      weaknesses: ['Divided Focus in Initial Training', 'Lacks Single-Discipline Grandmastery'],
      powerLevel: 20, // Acquired Level 20
      characterLevel: 20,
      tier: 'A', // Innate Talent Tier A
      socialStatus: 'Commoner / Free Citizen',
      professions: ['Licensed Adventurer / Explorer', 'Alchemist / Apothecary'],
      attributes: {
        ...DEFAULT_ATTRIBUTES,
        agility: 55,
        dexterity: 58,
        perception: 50,
        intelligence: 48,
        magicalControl: 35,
        vitality: 40,
        strength: 32,
      },
      talents: [
        {
          id: 'uniq_jack_of_all_trades',
          name: 'Jack of All Trades',
          category: 'unique',
          tier: 'A',
          mastery: 'Adept',
          description: 'Allows simultaneous study of multiple incompatible arts without biological rejection.',
          source: 'Innate',
          specialization: 'Universal Synergy',
        },
        {
          id: 'elem_fire',
          name: 'Fire Magic',
          category: 'elemental',
          tier: 'C',
          mastery: 'Novice',
          description: 'Basic thermal ignition and weapon flame infusion.',
          source: 'Awakened',
        },
      ],
      abilitiesList: [
        {
          id: 'ab_flame_edge',
          name: 'Ignited Edge Strike',
          category: 'combat',
          mastery: 'Adept',
          description: 'Enchants daggers with cutting thermal flame for 60 seconds.',
        },
      ],
      jackOfAllTrades: {
        isAcquired: true,
        tier: 'A',
        mastery: 'Adept',
        disciplines: ['Dual Blading', 'Fire Arcana', 'Field Medicine', 'Cartography'],
        advantages: ['Adapts instantly to party gaps', 'Unique cross-skill combo moves'],
        limitations: ['Requires double practice time to advance single mastery levels'],
      },
      goals: ['Map the Uncharted Whispering Rift', 'Master a third magic school'],
      motivations: ['Freedom of the open road', 'Curiosity for unknown planar biomes'],
      fears: ['Being trapped in a rigid courtly role'],
      secrets: ['Discovered an ancient portal blueprint in an old ruins cache'],
      alignment: 'Chaotic Good',
      relationships: [],
      createdAt: 1730000001000,
    },
  },
  {
    id: 'preset_lyra_scholar',
    name: 'Lady Lyra — High Elf Arch-Scholar',
    summary: 'A noble researcher possessing grand mana reserves, studying space-time anomalies and forgotten civilizations.',
    version: 1,
    isBuiltIn: true,
    tags: ['High Elf', 'Scholar', 'Space-Time', 'Magic'],
    createdAt: 1730000002000,
    updatedAt: 1730000002000,
    profile: {
      id: 'hero_lyra_starweaver',
      name: 'Lady Lyra Starweaver',
      age: '142',
      gender: 'Female',
      appearance: {
        hair: 'Silvery Platinum Braided',
        eyes: 'Star-flecked Violet',
        clothing: 'Midnight Blue Astral Stole over Silver Spun Robes',
        distinguishingFeatures: 'Ancient Monocle of Truesight',
      },
      personality: ['Scholarly', 'Measured', 'Diplomatic', 'Perceptive'],
      race: 'Elf',
      species: 'High Elf',
      origin: 'Astral Spire of Celadria',
      backstory: 'Keeper of the Millennium Archive, Lyra has dedicated decades to studying the dimensional leylines connecting realms.',
      skills: ['Arcane Script Deciphering', 'Leyline Calibration', 'Ancient History', 'Formal Rhetoric'],
      powers: ['Spatial Blink', 'Starlight Conduction', 'Dimensional Archive'],
      weapons: ['Moon-Quartz Starlight Staff'],
      weaknesses: ['Low Physical Body Density', 'Reluctant to Engage in Brute Melee'],
      powerLevel: 48,
      characterLevel: 48,
      tier: 'S', // Primary Talent Tier S
      socialStatus: 'Noble House',
      professions: ['Scholar / Sage / Researcher', 'Mage / Elementalist'],
      attributes: {
        ...DEFAULT_ATTRIBUTES,
        intelligence: 82,
        wisdom: 78,
        magicalCapacity: 88,
        magicalControl: 80,
        strength: 14,
        agility: 28,
        vitality: 30,
      },
      talents: [
        {
          id: 'sp_teleport',
          name: 'Spatial Magic & Dimensional Storage',
          category: 'space_time',
          tier: 'S',
          mastery: 'Expert',
          description: 'Instant tactical folding of coordinates and pocket dimensional storage.',
          source: 'Bloodline',
          specialization: 'Dimensional Pocket Archive',
        },
        {
          id: 'elem_light',
          name: 'Light Magic & Photon Lances',
          category: 'elemental',
          tier: 'A',
          mastery: 'Adept',
          description: 'Beams of concentrated starlight that pierce darkness.',
          source: 'Innate',
        },
      ],
      abilitiesList: [
        {
          id: 'ab_astral_blink',
          name: 'Astral Step',
          category: 'space_time',
          mastery: 'Expert',
          description: 'Instant line-of-sight teleportation up to 50 meters.',
        },
      ],
      goals: ['Reconstruct the Shattered Astrolabe', 'Preserve ancient libraries from war'],
      motivations: ['Safeguarding cosmological knowledge', 'Enlightenment'],
      fears: ['Annihilation of recorded history by void incursions'],
      secrets: ['Knows of a hidden gate connecting to Earth'],
      alignment: 'Lawful Good',
      relationships: [],
      createdAt: 1730000002000,
    },
  },
  {
    id: 'preset_kaelen_god_touched',
    name: 'Kaelen — God-Gifted Starlight Sovereign',
    summary: 'A mortal youth touched at birth by a dying cosmic star, holding dormant God-Tier starlight but raw Level 1 control.',
    version: 1,
    isBuiltIn: true,
    tags: ['God Tier', 'Divine Origin', 'Cosmic Gift', 'Novice'],
    createdAt: 1730000003000,
    updatedAt: 1730000003000,
    profile: {
      id: 'hero_kaelen_god_touched',
      name: 'Kaelen',
      age: '18',
      gender: 'Male',
      appearance: {
        hair: 'Inky Black with Faint Silver Leyline Tips',
        eyes: 'Luminous Solar Gold',
        clothing: 'Frayed Roughspun Linen Tunic',
        distinguishingFeatures: 'Constellation Birthmark Across Left Arm',
      },
      personality: ['Humble', 'Steadfast', 'Cautious', 'Observant'],
      race: 'Human',
      species: 'Human',
      origin: 'Village of Solitude',
      backstory: 'Born during the celestial alignment of the Twin Primordial Stars, Kaelen holds a divine spark of cosmic creation.',
      skills: ['Basic Farming', 'Hunting Spear', 'Animal Empathy'],
      powers: ['Primordial Cosmic Starlight (God-Tier, Raw Potential)'],
      weapons: ['Weathered Ashwood Staff'],
      weaknesses: ['Zero Combat Experience', 'Unstable Mana Rebound if Pushed Beyond Limits'],
      powerLevel: 1, // ACQUIRED LEVEL 1! (Proving Level != Talent Tier!)
      characterLevel: 1,
      tier: 'GOD', // INNATE TALENT TIER: GOD TIER!
      socialStatus: 'Commoner / Free Citizen',
      professions: ['Agronomist / Master Farmer'],
      attributes: {
        ...DEFAULT_ATTRIBUTES,
        strength: 12,
        agility: 14,
        vitality: 15,
        intelligence: 16,
        wisdom: 18,
        magicalControl: 8, // Poor control as Level 1 novice!
        magicalCapacity: 45, // Latent capacity
        luck: 80,
      },
      talents: [
        {
          id: 'con_god_starlight',
          name: 'Primordial Cosmic Starlight',
          category: 'conceptual',
          tier: 'GOD',
          mastery: 'Beginner', // Raw Level 1 novice mastery!
          description: 'A transcendent seed of divine cosmic creation planted by a dying star deity.',
          source: 'Cosmic Phenomenon',
          isGodTier: true,
          godTierOrigin: 'Direct celestial blessing during the Great Convergence of Primordial Star Deities',
          specialization: 'Dormant Cosmic Awakening',
          limitations: 'Cannot be commanded at will without severe physical strain until Level 50+ is attained.',
        },
        {
          id: 'prod_farming',
          name: 'Agrarian Earth Vitality',
          category: 'production',
          tier: 'E',
          mastery: 'Novice',
          description: 'Modest understanding of crop irrigation and soil cultivation.',
          source: 'Rigorous Training',
        },
      ],
      abilitiesList: [
        {
          id: 'ab_dormant_pulse',
          name: 'Involuntary Starlight Aura',
          category: 'conceptual',
          mastery: 'Beginner',
          description: 'Emits a faint starlight pulse when mortal danger threatens.',
        },
      ],
      goals: ['Learn to control the divine spark without harming others', 'Protect my adoptive village'],
      motivations: ['Surviving the attention of ancient gods and planar inquisitors'],
      fears: ['Accidental cataclysmic awakening destroying his home'],
      secrets: ['The constellation on his arm pulses when divine entities approach'],
      alignment: 'Neutral Good',
      relationships: [],
      createdAt: 1730000003000,
    },
  },
];

export class CharacterPresetService {
  /**
   * Retrieves all presets (built-ins + user presets, user presets first).
   */
  public async listPresets(userId?: string): Promise<CharacterPreset[]> {
    const userPresets = await this.loadUserPresetsFromStorage(userId);
    return [...userPresets, ...CANONICAL_PRESETS];
  }

  /**
   * Retrieves a single preset by ID.
   */
  public async getPreset(presetId: string, userId?: string): Promise<CharacterPreset | null> {
    const all = await this.listPresets(userId);
    return all.find((p) => p.id === presetId) || null;
  }

  /**
   * Saves a new or modified user preset.
   */
  public async savePreset(
    profile: CharacterProfile,
    presetName: string,
    summary?: string,
    tagsOrPresetId?: string[] | string,
    userId?: string
  ): Promise<CharacterPreset> {
    const now = Date.now();
    let targetId = `preset_char_${now}_${Math.random().toString(36).substring(2, 7)}`;
    let customTags: string[] = [];

    if (Array.isArray(tagsOrPresetId)) {
      customTags = tagsOrPresetId;
    } else if (typeof tagsOrPresetId === 'string' && tagsOrPresetId.trim()) {
      targetId = tagsOrPresetId.trim();
    }

    const defaultTags = [profile.race, profile.species, ...(profile.professions || [])].filter(Boolean) as string[];
    const mergedTags = Array.from(new Set([...defaultTags, ...customTags]));

    const newPreset: CharacterPreset = {
      id: targetId,
      name: presetName.trim(),
      summary: summary?.trim() || `${profile.name} (${profile.race} ${profile.professions?.[0] || 'Hero'} - Level ${profile.characterLevel || profile.powerLevel}, Tier ${profile.tier || 'B'})`,
      version: 1,
      profile: {
        ...profile,
        characterLevel: profile.characterLevel || profile.powerLevel || 1,
      },
      tags: mergedTags,
      isBuiltIn: false,
      createdAt: now,
      updatedAt: now,
      userId,
    };

    // 1. Save to IndexedDB
    try {
      const db = await getDB();
      await db.put('character_presets', newPreset);
    } catch (e) {
      console.warn('[CharacterPresetService] IndexedDB write failed, falling back to localStorage:', e);
    }

    // 2. Save to LocalStorage fallback cache
    try {
      const current = this.getLocalStoragePresets();
      const existingIdx = current.findIndex((p) => p.id === targetId);
      if (existingIdx >= 0) {
        current[existingIdx] = newPreset;
      } else {
        current.unshift(newPreset);
      }
      localStorage.setItem(LOCAL_STORAGE_PRESETS_KEY, JSON.stringify(current));
    } catch (e) {
      console.warn('[CharacterPresetService] LocalStorage write failed:', e);
    }

    return newPreset;
  }

  /**
   * Duplicates an existing preset.
   */
  public async duplicatePreset(
    presetId: string,
    newName?: string,
    userId?: string
  ): Promise<CharacterPreset | null> {
    const original = await this.getPreset(presetId, userId);
    if (!original) return null;

    const duplicatedName = newName || `${original.name} (Copy)`;
    const duplicatedProfile: CharacterProfile = {
      ...JSON.parse(JSON.stringify(original.profile)),
      id: `hero_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };

    return this.savePreset(duplicatedProfile, duplicatedName, original.summary, undefined, userId);
  }

  /**
   * Deletes a user preset (canonical built-in presets cannot be deleted).
   */
  public async deletePreset(presetId: string, _userId?: string): Promise<boolean> {
    if (CANONICAL_PRESETS.some((p) => p.id === presetId)) {
      console.warn('[CharacterPresetService] Cannot delete built-in canonical preset.');
      return false;
    }

    // Delete from IndexedDB
    try {
      const db = await getDB();
      await db.delete('character_presets', presetId);
    } catch (e) {
      console.warn('[CharacterPresetService] IndexedDB delete error:', e);
    }

    // Delete from LocalStorage cache
    try {
      const current = this.getLocalStoragePresets();
      const filtered = current.filter((p) => p.id !== presetId);
      localStorage.setItem(LOCAL_STORAGE_PRESETS_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.warn('[CharacterPresetService] LocalStorage delete error:', e);
    }

    return true;
  }

  private async loadUserPresetsFromStorage(_userId?: string): Promise<CharacterPreset[]> {
    let fromDb: CharacterPreset[] = [];
    try {
      const db = await getDB();
      fromDb = await db.getAllFromIndex('character_presets', 'by-updatedAt');
      fromDb.reverse(); // Newest first
    } catch (e) {
      // IndexedDB might not be available in headless test environments
    }

    const fromLocal = this.getLocalStoragePresets();
    // Merge without duplicates
    const mergedMap = new Map<string, CharacterPreset>();
    for (const p of fromLocal) mergedMap.set(p.id, p);
    for (const p of fromDb) mergedMap.set(p.id, p);

    return Array.from(mergedMap.values()).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  private getLocalStoragePresets(): CharacterPreset[] {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_PRESETS_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }
}

export const characterPresetService = new CharacterPresetService();
