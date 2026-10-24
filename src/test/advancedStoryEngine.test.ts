import { describe, it, expect } from 'vitest';
import {
  WorldFactStore,
  ActionParser,
  ActionValidator,
  InventoryManager,
  QuestManager,
  ConsequenceManager,
  EndingManager,
  StoryTransaction,
  StorySession,
  LocalNarrativeProvider,
  EngineAuthoritativeState
} from '../engine';

function createMockState(): EngineAuthoritativeState {
  return {
    version: 1,
    storyId: 'story_test_1',
    title: 'Chronicle of the Void',
    genre: 'Fantasy',
    genres: ['Fantasy', 'Action'],
    worldId: 'aethelgard',
    worldName: 'Aethelgard',
    tone: 'Epic Fantasy',
    difficulty: 'Adventurer (Standard)',
    pacing: 'Balanced Narrative',
    currentChapter: 1,
    currentSceneId: 'scene_gates',
    currentTurnNumber: 1,
    currentLocation: 'The Outer Gates',
    phase: 'opening',
    hero: {
      id: 'hero_test_1',
      name: 'Kaelen',
      age: '24',
      gender: 'Male',
      appearance: { hair: 'Silver', eyes: 'Amber', clothing: 'Tunic', distinguishingFeatures: 'Rune Scar' },
      personality: ['Resolute', 'Strategic'],
      race: 'Elf',
      origin: 'Silverwood',
      backstory: 'Exiled knight seeking redemption.',
      skills: ['Swordsmanship', 'Tracking'],
      powers: ['Aether Step'],
      weapons: ['Moonblade'],
      weaknesses: ['Vulnerable to Dark Magic'],
      powerLevel: 35,
      goals: ['Seal the Void Rift'],
      motivations: ['Protect the realm'],
      fears: ['Failing his kin'],
      secrets: ['Harbors an ancient fragment'],
      alignment: 'Neutral Good',
      relationships: [
        { name: 'Lyra', role: 'ally', trust: 40, description: 'Childhood friend' }
      ],
      createdAt: Date.now()
    },
    health: 80,
    maxHealth: 100,
    stamina: 60,
    powerLevel: 35,
    statusEffects: [],
    characters: {
      npc_lyra: {
        id: 'npc_lyra',
        name: 'Lyra',
        role: 'companion',
        isAlive: true,
        personalityTraits: ['Loyal', 'Sharp-witted'],
        goals: ['Aid Kaelen'],
        speakingStyle: 'Direct and warm',
        currentEmotion: 'warm',
        currentLocation: 'The Outer Gates',
        knownFactIds: [],
        trustScore: 40,
        affinityScore: 30,
        inventory: []
      },
      npc_malakor: {
        id: 'npc_malakor',
        name: 'Malakor the Betrayer',
        role: 'antagonist',
        isAlive: false,
        personalityTraits: ['Cruel', 'Deceitful'],
        goals: ['Open the rift'],
        speakingStyle: 'Cold whisper',
        currentEmotion: 'calm',
        currentLocation: 'Catacombs',
        knownFactIds: [],
        trustScore: -90,
        affinityScore: -80,
        inventory: []
      }
    },
    inventory: [
      {
        id: 'item_moonblade',
        name: 'Moonblade',
        quantity: 1,
        category: 'weapon',
        description: 'Forged under moonlight.',
        isUnique: true,
        isEquipped: true
      },
      {
        id: 'item_healing_draught',
        name: 'Healing Draught',
        quantity: 2,
        category: 'consumable',
        description: 'Restores 30 vitality.',
        isUnique: false,
        isEquipped: false,
        effectDescription: 'Restores 30 health.'
      }
    ],
    quests: {
      quest_rift: {
        id: 'quest_rift',
        title: 'Seal the Void Rift',
        description: 'Stop the dimensional breach at the altar.',
        giverId: 'npc_elder',
        giverName: 'Elder Varis',
        category: 'main',
        status: 'active',
        objectives: [
          { id: 'obj_find_keystone', description: 'Find the Solar Keystone', isCompleted: false, requiredClueIds: ['clue_keystone_location'] },
          { id: 'obj_seal_altar', description: 'Place keystone on altar', isCompleted: false }
        ],
        cluesCollected: [],
        rewardItemIds: ['item_guardian_ring'],
        unlockedAtTurn: 1
      }
    },
    facts: [
      {
        id: 'fact_malakor_dead',
        subject: 'Malakor the Betrayer',
        predicate: 'is_status',
        object: 'dead',
        category: 'entity_status',
        witnessedBy: ['Kaelen'],
        turnNumber: 1,
        timestamp: Date.now(),
        isImmutable: true
      }
    ],
    delayedEvents: [],
    causalHistory: [],
    worldFlags: {
      gates_opened: true
    },
    turns: [],
    isStoryComplete: false,
    randomSeed: 123456,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

describe('Advanced Story Engine Tests', () => {

  describe('WorldFactStore & Canonical Memory', () => {
    it('records and queries facts accurately', () => {
      const store = new WorldFactStore();
      store.assertFact('Kaelen', 'holds', 'Moonblade', 'item_possession', ['Lyra'], 1);

      const queryResult = store.query({ subject: 'Kaelen', predicate: 'holds' });
      expect(queryResult.length).toBe(1);
      expect(queryResult[0].object).toBe('Moonblade');
      expect(queryResult[0].witnessedBy).toContain('Lyra');
    });

    it('rejects illegal actions contradicting immutable death facts', () => {
      const store = new WorldFactStore();
      store.assertFact('General Anthony', 'is_status', 'dead', 'entity_status', [], 1, true);

      expect(store.isEntityDeadOrDestroyed('General Anthony')).toBe(true);

      const contradiction = store.checkContradiction({
        subject: 'General Anthony',
        predicate: 'speaks_to',
        object: 'Kaelen'
      });
      expect(contradiction.hasContradiction).toBe(true);
      expect(contradiction.reason).toContain('is already dead');
    });
  });

  describe('ActionParser & Natural Language Intent Extraction', () => {
    it('extracts combat intent, target, and confidence', () => {
      const parsed = ActionParser.parse('Strike at the stone gargoyle with fierce momentum');
      expect(parsed.intent).toBe('combat');
      expect(parsed.target).toBe('stone gargoyle');
      expect(parsed.confidence).toBeGreaterThan(0.8);
    });

    it('extracts item use and itemName', () => {
      const parsed = ActionParser.parse('Drink the healing draught to restore vitality');
      expect(parsed.intent).toBe('use_item');
      expect(parsed.relevantItemName?.toLowerCase()).toContain('healing draught');
    });

    it('extracts stealth and rest intents', () => {
      const stealth = ActionParser.parse('Sneak past the vigilant guard tower silently');
      expect(stealth.intent).toBe('stealth');

      const rest = ActionParser.parse('Take a breather and rest by the campfire');
      expect(rest.intent).toBe('rest');
    });
  });

  describe('ActionValidator & Authoritative Preconditions', () => {
    it('rejects actions when protagonist is incapacitated or dead', () => {
      const state = createMockState();
      state.health = 0;
      const parsed = ActionParser.parse('Attack the monster');
      const factStore = new WorldFactStore(state.facts);

      const check = ActionValidator.validate(state, parsed, factStore);
      expect(check.isValid).toBe(false);
      expect(check.reason).toContain('incapacitated');
    });

    it('rejects action requiring more stamina than available', () => {
      const state = createMockState();
      state.stamina = 5;
      const parsed = ActionParser.parse('Attack with full fury'); // combat requires 15
      const factStore = new WorldFactStore(state.facts);

      const check = ActionValidator.validate(state, parsed, factStore);
      expect(check.isValid).toBe(false);
      expect(check.reason).toContain('Exhaustion');
    });

    it('rejects conversation or combat targeting an entity already dead', () => {
      const state = createMockState();
      const parsed = ActionParser.parse('Talk to Malakor the Betrayer');
      const factStore = new WorldFactStore(state.facts);

      const check = ActionValidator.validate(state, parsed, factStore);
      expect(check.isValid).toBe(false);
      expect(check.reason).toContain('already deceased');
    });

    it('rejects action if required item is missing', () => {
      const state = createMockState();
      const parsed = ActionParser.parse('Use the Solar Keystone');
      const factStore = new WorldFactStore(state.facts);

      const check = ActionValidator.validate(state, parsed, factStore, { requiredItem: 'Solar Keystone' });
      expect(check.isValid).toBe(false);
      expect(check.reason).toContain('missing from your inventory');
    });
  });

  describe('InventoryManager & Unique Relic Enforcement', () => {
    it('stacks non-unique consumables', () => {
      const inv = new InventoryManager([
        { id: 'herb', name: 'Herbal Salve', quantity: 1, category: 'consumable', description: '', isUnique: false, isEquipped: false }
      ]);
      const res = inv.addItem({ id: 'herb', name: 'Herbal Salve', quantity: 3, category: 'consumable', description: '', isUnique: false, isEquipped: false });

      expect(res.success).toBe(true);
      expect(inv.getItem('herb')?.quantity).toBe(4);
    });

    it('refuses to duplicate unique relics', () => {
      const inv = new InventoryManager([
        { id: 'relic_crown', name: 'Crown of Aethelgard', quantity: 1, category: 'artifact', description: '', isUnique: true, isEquipped: false }
      ]);
      const res = inv.addItem({ id: 'relic_crown', name: 'Crown of Aethelgard', quantity: 1, category: 'artifact', description: '', isUnique: true, isEquipped: false });

      expect(res.success).toBe(false);
      expect(res.message).toContain('Cannot duplicate unique relics');
      expect(inv.getItem('relic_crown')?.quantity).toBe(1);
    });

    it('handles item consumption and removal', () => {
      const inv = new InventoryManager([
        { id: 'potion', name: 'Vitality Tonic', quantity: 1, category: 'consumable', description: '', isUnique: false, isEquipped: false }
      ]);
      const res = inv.consumeItem('potion');
      expect(res.success).toBe(true);
      expect(inv.hasItem('potion')).toBe(false);
    });
  });

  describe('QuestManager & Dynamic Clues', () => {
    it('completes quest automatically when all objectives are fulfilled', () => {
      const state = createMockState();
      const qm = new QuestManager(state.quests);

      // Objective 1
      const res1 = qm.completeObjective('quest_rift', 'obj_find_keystone', 2);
      expect(res1.objectiveCompleted).toBe(true);
      expect(res1.questCompleted).toBe(false);

      // Objective 2
      const res2 = qm.completeObjective('quest_rift', 'obj_seal_altar', 3);
      expect(res2.objectiveCompleted).toBe(true);
      expect(res2.questCompleted).toBe(true);

      const finished = qm.getQuest('quest_rift');
      expect(finished?.status).toBe('completed');
      expect(finished?.completedAtTurn).toBe(3);
    });

    it('auto-fulfills objective when required clue is collected', () => {
      const state = createMockState();
      const qm = new QuestManager(state.quests);

      const result = qm.addClue('quest_rift', 'clue_keystone_location', 2);
      expect(result.added).toBe(true);

      const quest = qm.getQuest('quest_rift');
      const obj = quest?.objectives.find(o => o.id === 'obj_find_keystone');
      expect(obj?.isCompleted).toBe(true);
    });
  });

  describe('ConsequenceManager & Delayed Events', () => {
    it('triggers scheduled event on reaching the target turn number', () => {
      const cm = new ConsequenceManager();
      cm.scheduleDelayedEvent(
        'Reinforcements from the Northern Garrison arrive at the ramparts.',
        2, // delay 2 turns (createdAt 1 -> trigger at turn 3)
        { stamina: 80 },
        1
      );

      const factStore = new WorldFactStore();

      // At turn 2: not yet triggered
      const eventsTurn2 = cm.evaluateDelayedEvents(2, factStore);
      expect(eventsTurn2.length).toBe(0);

      // At turn 3: triggered!
      const eventsTurn3 = cm.evaluateDelayedEvents(3, factStore);
      expect(eventsTurn3.length).toBe(1);
      expect(eventsTurn3[0].narrativeHook).toContain('Reinforcements');
      expect(eventsTurn3[0].event.status).toBe('triggered');
    });
  });

  describe('EndingManager & Branch Eligibility', () => {
    it('evaluates victory ending when rift is sealed', () => {
      const em = new EndingManager();
      const state = createMockState();
      state.worldFlags['rift_sealed'] = true;

      const endings = em.evaluateEligibleEndings(state);
      const hasVictory = endings.some(e => e.id === 'ending_heroic_victory');
      expect(hasVictory).toBe(true);
    });

    it('does not qualify for victory ending if required flags are absent', () => {
      const em = new EndingManager();
      const state = createMockState();
      state.worldFlags['rift_sealed'] = false;

      const endings = em.evaluateEligibleEndings(state);
      const hasVictory = endings.some(e => e.id === 'ending_heroic_victory');
      expect(hasVictory).toBe(false);
    });
  });

  describe('StoryTransaction & Atomic State Integrity', () => {
    it('executes full atomic lifecycle successfully', () => {
      const state = createMockState();
      const transaction = new StoryTransaction(state);

      transaction.stageValidation({ isValid: true });
      transaction.stagePlan({ stamina: 45, currentLocation: 'Inner Sanctum' });
      transaction.stageNarrative(
        {
          sceneTitle: 'The Inner Sanctum',
          narrativeText: 'The ancient runes flare with bright azure illumination.',
          dialogues: [{ speaker: 'Lyra', text: 'We made it.', emotion: 'calm' }],
          proposedChoices: [
            { choiceId: 'c1', text: 'Approach the pedestal' },
            { choiceId: 'c2', text: 'Scan for concealed runes' }
          ]
        },
        { turnId: 'turn_2', customActionText: 'Advance to the inner sanctum', timestamp: Date.now() }
      );
      transaction.verifyTransition();

      const { committedState, newTurn } = transaction.commit();
      expect(committedState.version).toBe(state.version + 1);
      expect(committedState.currentLocation).toBe('Inner Sanctum');
      expect(committedState.stamina).toBe(45);
      expect(committedState.turns.length).toBe(1);
      expect(newTurn.sceneTitle).toBe('The Inner Sanctum');
    });

    it('rolls back cleanly without mutating original state on validation failure', () => {
      const state = createMockState();
      const originalStamina = state.stamina;
      const transaction = new StoryTransaction(state);

      expect(() => {
        transaction.stageValidation({
          isValid: false,
          reason: 'Hero is incapacitated.'
        });
      }).toThrow('Hero is incapacitated.');

      const rolledBack = transaction.rollback();
      expect(rolledBack.stamina).toBe(originalStamina);
      expect(state.stamina).toBe(originalStamina);
      expect(transaction.status).toBe('FAILED');
    });
  });

  describe('StorySession & Turn Idempotency', () => {
    it('dispatches turn via LocalNarrativeProvider and persists causal record', async () => {
      const state = createMockState();
      const session = new StorySession(state, new LocalNarrativeProvider());

      const result = await session.dispatchTurn({
        turnId: 'turn_idempotent_1',
        customActionText: 'Rest and catch our breath by the ancient fountain',
        idempotencyKey: 'key_turn_1',
        timestamp: Date.now()
      });

      expect(result.newTurn).toBeDefined();
      expect(result.newTurn.choices.length).toBeGreaterThanOrEqual(2);
      expect(result.updatedState.currentTurnNumber).toBe(2);

      // Verify idempotency: re-dispatching with the same key returns cached turn without double-advancing
      const repeatedResult = await session.dispatchTurn({
        turnId: 'turn_idempotent_1',
        customActionText: 'Rest and catch our breath by the ancient fountain',
        idempotencyKey: 'key_turn_1',
        timestamp: Date.now()
      });

      expect(repeatedResult.newTurn.turnId).toBe(result.newTurn.turnId);
      expect(repeatedResult.updatedState.currentTurnNumber).toBe(2);
    });

    it('projects bidirectionally between StorySession and StoryDocument', () => {
      const state = createMockState();
      const session = new StorySession(state);

      const doc = session.toStoryDocument();
      expect(doc.id).toBe(state.storyId);
      expect(doc.hero.name).toBe('Kaelen');
      expect(doc.state.health).toBe(state.health);

      const restoredSession = StorySession.fromStoryDocument(doc);
      const restoredState = restoredSession.getState();

      expect(restoredState.storyId).toBe(state.storyId);
      expect(restoredState.hero.name).toBe('Kaelen');
      expect(restoredState.health).toBe(state.health);
      expect(restoredState.inventory.length).toBe(state.inventory.length);
    });
  });

});
