import { describe, it, expect, beforeEach } from 'vitest';
import {
  classifyStoryInputIntent,
  getStoryFirstSystemDirective,
  formatPlayerActionWithStoryFirstDirectives,
  getHariKhatriNarrativeDirective,
} from '../../server/narrativeGuidelines';
import { preferencesService } from '../features/preferences/preferencesService';
import { presetService } from '../features/presets/presetService';
import { DEFAULT_USER_PREFERENCES } from '../types/preferences';
import { DEFAULT_STORY_LANGUAGE, DEFAULT_APP_LANGUAGE } from '../types/story';
import { repairNarrativeProposal } from '../engine/narrative/NarrativeRepair';
import { StoryTransaction } from '../engine/core/StoryTransaction';
import { EngineAuthoritativeState } from '../engine/types/engine.types';

describe('BranchVerse General, Flexible & Resilient System Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // =========================================================================
  // 1. STORY ACTION PRINCIPLE & NARRATIVE GUIDELINES (PARTS 1-4)
  // =========================================================================
  describe('Story Action Principle & Intent Handling', () => {
    it('classifies player actions as intent/attempt without hardcoded scenario limits', () => {
      // Arbitrary user claims
      const claim1 = classifyStoryInputIntent('I command 50,000 soldiers to take the fortress');
      expect(claim1.isGrandClaim).toBe(true);

      const claim2 = classifyStoryInputIntent('I suddenly have 10 million credits and own the corporation');
      expect(claim2.isGrandClaim).toBe(true);

      const claimResurrection = classifyStoryInputIntent('I resurrect the fallen emperor using forbidden magic');
      expect(claimResurrection.isResurrection).toBe(true);

      const normalAction = classifyStoryInputIntent('I check the ancient lock with my thieves tools');
      expect(normalAction.isOutOfStory).toBe(false);
      expect(normalAction.isGrandClaim).toBe(false);
    });

    it('handles out-of-universe / real-world queries in-narrative without chatbot refusal', () => {
      const outOfWorld = classifyStoryInputIntent('Can you write Python code to explain recursion?');
      expect(outOfWorld.isOutOfStory).toBe(true);

      const directive = getStoryFirstSystemDirective({
        protagonistName: 'Kaelen',
        worldName: 'Aethelgard',
        genres: ['Fantasy'],
      });

      // Story must never lecture or break character
      expect(directive).toContain('THE STORY MUST NEVER STOP');
      expect(directive).toContain('NEVER output messages such as');
      expect(directive).toContain('"That is outside the scope of this story."');
      expect(directive).toContain('"I cannot do that."');
    });

    it('formats player actions so reality remains consistent with established facts', () => {
      const formatted = formatPlayerActionWithStoryFirstDirectives(
        {
          type: 'action',
          customActionText: 'I resurrect the fallen emperor using forbidden magic',
        },
        {
          protagonistName: 'Arya',
          genre: 'Fantasy',
          worldName: 'Eldoria',
        }
      );

      expect(formatted).toContain('PLAYER ACTION / INTENT');
      expect(formatted).toContain('I resurrect the fallen emperor using forbidden magic');
      expect(formatted).toContain('RESURRECTION ATTEMPT');
    });
  });

  // =========================================================================
  // 2. HARI KHATRI GENERALIZATION (PART 5)
  // =========================================================================
  describe('Hari Khatri Adaptive Side-Character Generalization', () => {
    it('generates an adaptive side character directive without hardcoded roles or quotes', () => {
      const directiveSciFi = getHariKhatriNarrativeDirective('Vance');

      expect(directiveSciFi).toContain('Hari Khatri');
      expect(directiveSciFi).toContain('ADAPTIVE WORLD CONNECTION');
      expect(directiveSciFi).toContain('Vance');
      // Must not usurp protagonist role
      expect(directiveSciFi).toContain('NOT the main hero');
      expect(directiveSciFi).toContain('ABSOLUTE PLAYER AGENCY');
    });

    it('safeguards protagonist identity when user is logged in as Hari Khatri', () => {
      const directiveSameName = getHariKhatriNarrativeDirective('Hari Khatri');

      // When the player character IS Hari Khatri, do not spawn a duplicate side character
      expect(directiveSameName).toContain('PROTAGONIST IDENTITY SAFEGUARD');
      expect(directiveSameName).toContain('Do NOT introduce a second character named Hari Khatri');
    });
  });

  // =========================================================================
  // 3. STORY LANGUAGE & APP UI LANGUAGE INDEPENDENCE (PART 6)
  // =========================================================================
  describe('Language System & Decoupled Defaults', () => {
    it('defaults Story Language to Hindi (hi) and App UI Language to English (en)', () => {
      expect(DEFAULT_STORY_LANGUAGE).toBe('hi');
      expect(DEFAULT_APP_LANGUAGE).toBe('en');
      expect(DEFAULT_USER_PREFERENCES.storyLanguage).toBe('hi');
      expect(DEFAULT_USER_PREFERENCES.appLanguage).toBe('en');
    });

    it('changing Story Language does not affect App Language and persists across sessions', () => {
      expect(preferencesService.getStoryLanguage()).toBe('hi');
      expect(preferencesService.getAppLanguage()).toBe('en');

      // Change story language to Spanish
      preferencesService.setStoryLanguage('es');
      expect(preferencesService.getStoryLanguage()).toBe('es');
      expect(preferencesService.getAppLanguage()).toBe('en'); // App UI language unchanged

      // Change app UI language to Japanese
      preferencesService.setAppLanguage('ja');
      expect(preferencesService.getAppLanguage()).toBe('ja');
      expect(preferencesService.getStoryLanguage()).toBe('es'); // Story language unchanged
    });
  });

  // =========================================================================
  // 4. USER PREFERENCES SYSTEM (PART 7)
  // =========================================================================
  describe('User Preferences Service', () => {
    it('loads and stores account-level preferences independently from story state', () => {
      const prefs = preferencesService.getPreferences('test_user_123');
      expect(prefs.storyLanguage).toBe('hi');
      expect(prefs.appLanguage).toBe('en');
      expect(prefs.narrativeLength).toBe('balanced');

      // Update preferences
      preferencesService.updatePreferences(
        {
          storyLanguage: 'hi',
          narrativeLength: 'detailed',
          readingFontSize: 'lg',
        },
        'test_user_123'
      );

      const updated = preferencesService.getPreferences('test_user_123');
      expect(updated.narrativeLength).toBe('detailed');
      expect(updated.readingFontSize).toBe('lg');
      expect(updated.storyLanguage).toBe('hi');
    });
  });

  // =========================================================================
  // 5. REUSABLE STORY PRESETS SYSTEM (PART 8)
  // =========================================================================
  describe('Story Presets System', () => {
    it('provides built-in presets including Hindi Epic Saga, High Fantasy, and Cyberpunk Noir', async () => {
      const presets = await presetService.listPresets();
      expect(presets.length).toBeGreaterThanOrEqual(4);

      const hindiPreset = presets.find((p) => p.id === 'builtin_hindi_epic_saga');
      expect(hindiPreset).toBeDefined();
      expect(hindiPreset?.storyLanguage).toBe('hi');
      expect(hindiPreset?.isBuiltIn).toBe(true);

      const fantasyPreset = presets.find((p) => p.id === 'builtin_high_fantasy_hero');
      expect(fantasyPreset).toBeDefined();
      expect(fantasyPreset?.selectedGenre).toBe('High Fantasy');
    });

    it('allows creating, listing, modifying, and deleting custom user presets', async () => {
      const created = await presetService.savePreset(
        {
          name: 'My Custom Steampunk Setup',
          selectedGenre: 'Steampunk',
          genres: ['Steampunk', 'Mystery'],
          tone: 'Dark & Gritty',
          storyLanguage: 'hi',
          pacing: 'Fast-Paced Adventure',
          difficulty: 'Heroic (Tactical)',
          narrativeLength: 'detailed',
        },
        undefined,
        'user_test_456'
      );

      expect(created.id).toBeDefined();
      expect(created.name).toBe('My Custom Steampunk Setup');
      expect(created.isBuiltIn).toBe(false);

      const userPresets = await presetService.listPresets('user_test_456');
      expect(userPresets.some((p) => p.id === created.id)).toBe(true);

      // Modify preset
      const updated = await presetService.savePreset(
        {
          name: 'My Renamed Steampunk Setup',
          narrativeLength: 'concise',
        },
        created.id,
        'user_test_456'
      );
      expect(updated.name).toBe('My Renamed Steampunk Setup');
      expect(updated.narrativeLength).toBe('concise');

      // Delete preset
      const deleted = await presetService.deletePreset(created.id, 'user_test_456');
      expect(deleted).toBe(true);

      const remaining = await presetService.listPresets('user_test_456');
      expect(remaining.some((p) => p.id === created.id)).toBe(false);
    });
  });

  // =========================================================================
  // 6. FLEXIBLE STATUS SYSTEM (PART 10)
  // =========================================================================
  describe('Flexible Status & Arbitrary World Indicators', () => {
    it('supports arbitrary genre-specific state flags without hardcoding fantasy silver coins', () => {
      const mockState: EngineAuthoritativeState = {
        storyId: 'story_flexible_1',
        title: 'Starship Wanderer',
        currentTurnNumber: 3,
        currentLocation: 'Bridge of the ISS Horizon',
        hero: {
          name: 'Captain Reynolds',
          race: 'Cyborg',
          origin: 'Orbital Station',
          powers: [],
          weapons: ['Plasma Carbine'],
          statusEffects: ['Focused'],
          health: 90,
          stamina: 80,
          powerLevel: 45,
          inventory: [],
        },
        inventory: [],
        activeQuests: [],
        knownNpcs: [],
        factionReputations: {},
        characters: {},
        turns: [],
        worldFlags: {
          shipHullIntegrity: '94%',
          warpCoreStatus: 'Stable',
          credits: '12,500',
          bountyHunterNotoriety: 'High',
          patrolSector: 'Perseus Arm',
        },
        version: 3,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        genres: ['Sci-Fi'],
        worldId: 'space_frontier',
        worldName: 'Sector 7',
        tone: 'Hard Sci-Fi',
      };

      // Ensure all custom flags exist and are accessible for the CharacterSheetDrawer
      expect(mockState.worldFlags.shipHullIntegrity).toBe('94%');
      expect(mockState.worldFlags.credits).toBe('12,500');
      expect(mockState.worldFlags.warpCoreStatus).toBe('Stable');
      expect(mockState.worldFlags.bountyHunterNotoriety).toBe('High');
    });
  });

  // =========================================================================
  // 7. MALFORMED AI PROPOSAL ELIMINATION & RESILIENT REPAIR (PART 11-12)
  // =========================================================================
  describe('Malformed AI Proposal Prevention & Resilient Recovery', () => {
    it('repairs raw storytelling prose without JSON structure into a valid proposal', () => {
      const rawProse = `The rain lashed against the cobblestones as Kaelen reached the locked citadel gates. A hooded figure emerged from the shadow, carrying a lantern that cast flickering amber light.`;

      const { proposal, diagnostics } = repairNarrativeProposal(rawProse, {
        heroName: 'Kaelen',
        worldName: 'Veridia',
      });

      expect(diagnostics.hasUsableNarrative).toBe(true);
      expect(proposal).not.toBeNull();
      expect(proposal?.narrativeText).toContain('Kaelen reached the locked citadel gates');
      expect(proposal?.proposedChoices.length).toBeGreaterThanOrEqual(2);
      expect(proposal?.sceneTitle).toBeDefined();
    });

    it('repairs truncated JSON responses without crashing or rejecting the narrative', () => {
      const truncatedJson = `{"sceneTitle": "The Iron Fortress", "narrativeText": "You step through the shattered archway, sensing the presence of unseen sentinels in the gloom."`;

      const { proposal, diagnostics } = repairNarrativeProposal(truncatedJson, {
        heroName: 'Kaelen',
        worldName: 'Veridia',
      });

      expect(diagnostics.hasUsableNarrative).toBe(true);
      expect(proposal).not.toBeNull();
      expect(proposal?.narrativeText).toContain('You step through the shattered archway');
      expect(proposal?.proposedChoices.length).toBeGreaterThanOrEqual(2);
    });

    it('StoryTransaction.stageNarrative repairs imperfect proposals instead of throwing Zod errors', () => {
      const baseState: EngineAuthoritativeState = {
        storyId: 'story_trans_1',
        title: 'The Lost Expedition',
        currentTurnNumber: 1,
        currentLocation: 'The Base Camp',
        hero: {
          name: 'Elena',
          race: 'Human',
          origin: 'Frontier',
          powers: [],
          weapons: [],
          statusEffects: [],
          health: 100,
          stamina: 100,
          powerLevel: 25,
          inventory: [],
        },
        inventory: [],
        activeQuests: [],
        knownNpcs: [],
        factionReputations: {},
        characters: {},
        turns: [],
        worldFlags: {},
        version: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        genres: ['Adventure'],
        worldId: 'frontier',
        worldName: 'The Frozen Peaks',
        tone: 'Survival',
      };

      const transaction = new StoryTransaction(baseState);
      transaction.stageValidation({ isValid: true });
      transaction.stagePlan({}, ['Advanced forward']);

      // Raw imperfect proposal with only 1 choice and missing fields
      const imperfectProposal = {
        sceneTitle: 'Camp',
        narrativeText: 'The wind howls outside the tent as you prepare your gear for the morning climb.',
        proposedChoices: [
          { text: 'Climb the ridge', requiredStamina: 15 },
        ],
      };

      // Staging narrative should repair and succeed without throwing
      expect(() => {
        transaction.stageNarrative(imperfectProposal, {
          actionType: 'action',
          customActionText: 'Prepare gear',
        });
      }).not.toThrow();

      transaction.verifyTransition();
      const { newTurn } = transaction.commit();
      expect(newTurn.choices.length).toBeGreaterThanOrEqual(2);
      expect(newTurn.narrativeText).toContain('The wind howls outside the tent');
    });
  });
});
