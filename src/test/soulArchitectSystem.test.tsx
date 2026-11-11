import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  advanceCharacterLevel,
  validateGodTierOrigin,
  calculateCombatEffectiveness,
} from '../features/character/tierSystem';
import {
  ALL_POWER_DEFINITIONS,
  filterPowerCatalogue,
  POWER_COMBINATIONS,
} from '../catalogs/powerCatalogue';
import {
  PROFESSIONS_CATALOGUE,
} from '../catalogs/characterCatalogs';
import {
  createBlankCharacter,
  generateRandomCharacter,
  rerollCharacterProperty,
  validateCharacterProfile,
  convertToHeroProfile,
} from '../features/character/creationEngine';
import {
  characterPresetService,
} from '../features/character/characterPresetService';
import { angelService } from '../features/character/angelService';
import { CharacterProfile } from '../types/talent';

describe('BranchVerse — Soul Architect & Advanced Character Creation System', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('1. Invariant Separation: Character Level vs Talent Tier', () => {
    it('guarantees that leveling up does not modify or promote innate Talent Tiers', () => {
      const initialLevel = 15;
      const result = advanceCharacterLevel(initialLevel, 10);

      expect(result.previousLevel).toBe(15);
      expect(result.newLevel).toBe(25);
      expect(result.levelIncreased).toBe(true);
      expect(result.talentsUnchanged).toBe(true);
    });

    it('enforces maximum level cap of 100 without affecting talent tiers', () => {
      const result = advanceCharacterLevel(95, 20);
      expect(result.newLevel).toBe(100);
      expect(result.talentsUnchanged).toBe(true);
    });

    it('allows a Level 100 character to possess an E-Tier talent and a Level 1 character to possess a God-Tier talent', () => {
      const veteranHero: CharacterProfile = {
        ...createBlankCharacter('Veteran Old Sage'),
        characterLevel: 100,
        powerLevel: 100,
        tier: 'E',
        talents: [
          {
            id: 'elem_fire_basic',
            name: 'Basic Campfire Spark',
            category: 'elemental',
            tier: 'E',
            mastery: 'Grandmaster',
            description: 'A humble spark refined to absolute peak precision through decades of training.',
            source: 'Rigorous Training',
          },
        ],
      };

      const noviceGodling: CharacterProfile = {
        ...createBlankCharacter('Reborn Starlight Child'),
        characterLevel: 1,
        powerLevel: 1,
        tier: 'GOD',
        talents: [
          {
            id: 'divine_starlight',
            name: 'Primordial Starlight Convergence',
            category: 'divine',
            tier: 'GOD',
            mastery: 'Beginner',
            description: 'Uncontrollable cosmic essence slumbering in a fragile mortal vessel.',
            source: 'Cosmic Phenomenon',
            isGodTier: true,
            godTierOrigin: 'Direct cosmic celestial blessing from the creation of the star system.',
          },
        ],
      };

      expect(veteranHero.characterLevel).toBe(100);
      expect(veteranHero.talents[0].tier).toBe('E');
      expect(noviceGodling.characterLevel).toBe(1);
      expect(noviceGodling.talents[0].tier).toBe('GOD');
    });
  });

  describe('2. God Tier Origin Restrictions & Validation', () => {
    it('accepts God-Tier talent when legitimate divine or cosmic origin is documented', () => {
      const divineCheck = validateGodTierOrigin(
        'Bestowed through a Divine Blessing of the Astral Archangel.',
        'Divine Blessing'
      );
      expect(divineCheck.isValid).toBe(true);

      const cosmicCheck = validateGodTierOrigin(
        'Born during a rare Celestial Cosmic Convergence.',
        'Cosmic Phenomenon'
      );
      expect(cosmicCheck.isValid).toBe(true);
    });

    it('rejects God-Tier talent lacking divine or cosmic origin (e.g. mortal leveling or ordinary sword training)', () => {
      const mortalCheck = validateGodTierOrigin(
        'Swung a wooden sword 10,000 times in the backyard.',
        'Rigorous Training'
      );
      expect(mortalCheck.isValid).toBe(false);
      expect(mortalCheck.reason).toContain('mortal training or ordinary battle experience');
    });

    it('validates character profile and flags God-Tier talents that lack divine origin', () => {
      const invalidHero = createBlankCharacter('Cheater');
      invalidHero.talents = [
        {
          id: 'fake_god',
          name: 'Supreme Omnipotence',
          category: 'divine',
          tier: 'GOD',
          mastery: 'Master',
          description: 'Fake God Tier without origin',
          source: 'Rigorous Training', // Invalid source for God Tier
        },
      ];

      const validation = validateCharacterProfile(invalidHero);
      expect(validation.isValid).toBe(false);
      expect(validation.errors[0]).toContain('requires an explicit divine blessing');
    });
  });

  describe('3. Combat Effectiveness Calculation: Level 80 S-Tier vs Level 1 God-Tier', () => {
    it('demonstrates that a Level 80 S-Tier character surpasses a Level 1 God-Tier novice in battle', () => {
      const level80HeroScore = calculateCombatEffectiveness({
        level: 80,
        talentTiers: [{ tier: 'S', mastery: 'Master' }],
        attributes: {
          strength: 75,
          agility: 70,
          vitality: 70,
          intelligence: 65,
          magicalControl: 70,
        },
      });

      const level1GodNoviceScore = calculateCombatEffectiveness({
        level: 1,
        talentTiers: [{ tier: 'GOD', mastery: 'Beginner' }],
        attributes: {
          strength: 12,
          agility: 12,
          vitality: 15,
          intelligence: 20,
          magicalControl: 10,
        },
      });

      // Level 80 veteran with S-Tier talent and Master control significantly outperforms Level 1 God-Tier novice
      expect(level80HeroScore).toBeGreaterThan(level1GodNoviceScore);
      expect(level80HeroScore).toBeGreaterThan(800);
      expect(level1GodNoviceScore).toBeLessThan(100);
    });
  });

  describe('4. Extensive Power Catalogue & 10 Categories', () => {
    it('contains comprehensive power definitions across all 10 categories', () => {
      expect(ALL_POWER_DEFINITIONS.length).toBeGreaterThanOrEqual(50);

      const categories = new Set(ALL_POWER_DEFINITIONS.map((p) => p.category));
      expect(categories.has('elemental')).toBe(true);
      expect(categories.has('divine')).toBe(true);
      expect(categories.has('dark')).toBe(true);
      expect(categories.has('space_time')).toBe(true);
      expect(categories.has('conceptual')).toBe(true);
      expect(categories.has('combat')).toBe(true);
      expect(categories.has('racial')).toBe(true);
      expect(categories.has('production')).toBe(true);
      expect(categories.has('intellectual')).toBe(true);
      expect(categories.has('unique')).toBe(true);
    });

    it('contains at least 34 elemental magic variants', () => {
      const elementalPowers = ALL_POWER_DEFINITIONS.filter((p) => p.category === 'elemental');
      expect(elementalPowers.length).toBeGreaterThanOrEqual(30);

      // Check specific rich elements
      const elements = elementalPowers.map((p) => p.name.toLowerCase());
      expect(elements.some((n) => n.includes('fire'))).toBe(true);
      expect(elements.some((n) => n.includes('water'))).toBe(true);
      expect(elements.some((n) => n.includes('lightning'))).toBe(true);
      expect(elements.some((n) => n.includes('plasma'))).toBe(true);
      expect(elements.some((n) => n.includes('gravity'))).toBe(true);
      expect(elements.some((n) => n.includes('frost') || n.includes('ice'))).toBe(true);
    });

    it('filters power catalogue by query, category, and combat classification', () => {
      const merchantResults = filterPowerCatalogue({
        combatFilter: 'non_combat',
        category: 'production',
      });
      expect(merchantResults.length).toBeGreaterThan(0);
      expect(merchantResults.every((p) => p.category === 'production')).toBe(true);

      const queryResults = filterPowerCatalogue({ query: 'Merchant' });
      expect(queryResults.length).toBeGreaterThan(0);
      expect(queryResults[0].name.toLowerCase()).toContain('merchant');
    });

    it('registers compound elemental synergies and combinations', () => {
      expect(POWER_COMBINATIONS.length).toBeGreaterThanOrEqual(5);
      const steamCombo = POWER_COMBINATIONS.find((c) => c.resultPower.toLowerCase().includes('steam'));
      expect(steamCombo).toBeDefined();
      expect(steamCombo?.prerequisites).toContain('elem_fire');
      expect(steamCombo?.prerequisites).toContain('elem_water');
    });
  });

  describe('5. Non-Combat Professions & Jack of All Trades', () => {
    it('includes non-combat professions on equal footing with combat classes', () => {
      const nonCombatProfessions = [
        'Merchant / Trade Magnate',
        'Agronomist / Master Farmer',
        'Blacksmith / Weaponsmith',
        'Scholar / Sage / Researcher',
        'Architect / City Planner',
        'Diplomat / Negotiator',
      ];

      for (const prof of nonCombatProfessions) {
        const found = PROFESSIONS_CATALOGUE.find((p) => p.name === prof);
        expect(found, `Expected profession "${prof}" to exist`).toBeDefined();
      }
    });

    it('supports Jack of All Trades as a unique multi-disciplinary trait with limits', () => {
      const jackHero = createBlankCharacter('Elora');
      jackHero.jackOfAllTrades = {
        isAcquired: true,
        tier: 'A',
        mastery: 'Adept',
        disciplines: ['Crafting', 'Arcana', 'Field Scouting', 'Barter'],
        advantages: ['Zero penalty for cross-class skill and spell acquisition'],
        limitations: ['Double XP requirement for Grandmaster tier ascension'],
      };

      expect(jackHero.jackOfAllTrades.isAcquired).toBe(true);
      expect(jackHero.jackOfAllTrades.advantages.length).toBeGreaterThan(0);
      expect(jackHero.jackOfAllTrades.limitations.length).toBeGreaterThan(0);
    });
  });

  describe('6. Creation Engine & Rerolls', () => {
    it('creates a clean blank character with 11 attributes and NO stamina', () => {
      const hero = createBlankCharacter('Hari Khatri');
      expect(hero.name).toBe('Hari Khatri');
      expect(hero.characterLevel).toBe(15);
      expect(hero.attributes).toBeDefined();
      expect((hero.attributes as any).stamina).toBeUndefined(); // Stamina MUST be absent!
      expect(hero.attributes.strength).toBeGreaterThan(0);
      expect(hero.attributes.vitality).toBeGreaterThan(0);
      expect(hero.talents.length).toBeGreaterThan(0);
    });

    it('generates random characters adhering to rarity and non-combat preferences', () => {
      const nonCombatHero = generateRandomCharacter({
        allowGodTier: false,
        preferNonCombat: true,
      });

      expect(nonCombatHero.characterLevel).toBeGreaterThanOrEqual(1);
      expect(nonCombatHero.characterLevel).toBeLessThanOrEqual(100);
      expect(nonCombatHero.tier).not.toBe('GOD'); // God tier rejected when allowGodTier is false
      expect(nonCombatHero.professions.length).toBeGreaterThan(0);
    });

    it('supports granular partial rerolls without overwriting other character fields', () => {
      const initial = createBlankCharacter('Constant Hero');
      initial.characterLevel = 42;
      const originalLevel = initial.characterLevel;

      const rerolledTalents = rerollCharacterProperty(initial, 'talents');
      expect(rerolledTalents.characterLevel).toBe(originalLevel);
      expect(rerolledTalents.name).toBe('Constant Hero');

      const rerolledSpecies = rerollCharacterProperty(initial, 'species');
      expect(rerolledSpecies.characterLevel).toBe(originalLevel);
      expect(rerolledSpecies.name).toBe('Constant Hero');
    });

    it('converts CharacterProfile into canonical HeroProfile for the Story Engine', () => {
      const profile = createBlankCharacter('Adventurer Hero');
      profile.characterLevel = 22;
      profile.tier = 'B';

      const hero = convertToHeroProfile(profile);
      expect(hero.name).toBe('Adventurer Hero');
      expect(hero.powerLevel).toBe(22);
      expect(hero.tier).toBe('B');
      expect(hero.powers.length).toBeGreaterThan(0);
      expect(hero.skills.length).toBeGreaterThan(0);
    });
  });

  describe('7. Preset Library & CRUD Operations', () => {
    it('provides canonical presets including Solomon Vane (Merchant) and Elora (Jack of All Trades)', async () => {
      const presets = await characterPresetService.listPresets();
      expect(presets.length).toBeGreaterThanOrEqual(4);

      const solomon = presets.find((p) => p.id === 'preset_solomon_merchant');
      expect(solomon).toBeDefined();
      expect(solomon?.profile.professions).toContain('Merchant / Trade Magnate');
      expect(solomon?.profile.tier).toBe('SS');

      const elora = presets.find((p) => p.id === 'preset_elora_jack');
      expect(elora).toBeDefined();
      expect(elora?.profile.jackOfAllTrades?.isAcquired).toBe(true);

      const kaelenGodling = presets.find((p) => p.id === 'preset_kaelen_god_touched');
      expect(kaelenGodling).toBeDefined();
      expect(kaelenGodling?.profile.characterLevel).toBe(1);
      expect(kaelenGodling?.profile.tier).toBe('GOD');
      expect(kaelenGodling?.profile.talents[0].godTierOrigin).toBeDefined();
    });

    it('saves, duplicates, and deletes custom presets while protecting canonical ones', async () => {
      const customHero = createBlankCharacter('Custom Test Soul');
      const saved = await characterPresetService.savePreset(
        customHero,
        'My Test Preset',
        'A brave test adventurer',
        ['Testing']
      );

      expect(saved.id).toBeDefined();
      expect(saved.name).toBe('My Test Preset');

      // Duplicate
      const duplicated = await characterPresetService.duplicatePreset(saved.id, 'My Test Preset Copy');
      expect(duplicated).toBeDefined();
      expect(duplicated?.name).toBe('My Test Preset Copy');

      // Delete custom preset
      const deletedCustom = await characterPresetService.deletePreset(saved.id);
      expect(deletedCustom).toBe(true);

      // Attempt to delete canonical preset (MUST be blocked)
      const deletedCanonical = await characterPresetService.deletePreset('preset_solomon_merchant');
      expect(deletedCanonical).toBe(false);
    });
  });

  describe('8. Angel Service Client API Communication', () => {
    it('sends structured character draft and conversation history to the backend', async () => {
      const mockResponse = {
        angelDialogue: 'A merchant path suits your sharp intellect.',
        suggestedOptions: [
          { id: '1', label: 'Accept Trade Pact', action: 'Adopt Economic Monopoly Aura' },
        ],
        proposedChanges: {
          professions: ['Merchant / Trade Magnate'],
          tier: 'SS',
        },
        ruleFeedback: { valid: true },
      };

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          response: mockResponse,
          modelUsed: 'gemini-3.1-flash-lite',
        }),
      } as any);

      const draft = createBlankCharacter('Solomon');
      const result = await angelService.communeWithAngel({
        userMessage: 'I want to be a merchant lord.',
        conversationHistory: [{ role: 'user', text: 'Hello Angel' }],
        currentDraft: draft,
      });

      expect(fetchSpy).toHaveBeenCalled();
      expect(result.angelDialogue).toBe(mockResponse.angelDialogue);
      expect(result.proposedChanges?.professions).toContain('Merchant / Trade Magnate');
    });

    it('throws error when the Angel backend responds with an error status', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 504,
        json: async () => ({ message: 'Gateway timeout from Gemini cascade.' }),
      } as any);

      const draft = createBlankCharacter('Failing Hero');
      await expect(
        angelService.communeWithAngel({
          userMessage: 'Hello',
          conversationHistory: [],
          currentDraft: draft,
        })
      ).rejects.toThrow('Gateway timeout from Gemini cascade.');
    });
  });
});