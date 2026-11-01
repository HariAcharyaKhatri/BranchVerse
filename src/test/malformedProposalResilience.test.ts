import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  repairNarrativeProposal,
  normalizeRiskLevel,
  normalizeActionIntent,
} from '../engine/narrative/NarrativeRepair';
import { GeminiNarrativeProvider } from '../engine/providers/GeminiNarrativeProvider';
import { StorySession } from '../engine/core/StorySession';
import { StoryTransaction } from '../engine/core/StoryTransaction';
import { StoryValidator } from '../engine/core/StoryValidator';
import { EngineAuthoritativeState } from '../engine/types/engine.types';
import { AiNarrativeError } from '../engine/errors/AiNarrativeError';
import { StoryDocument } from '../types/story';

function createMockAuthoritativeState(overrides?: Partial<EngineAuthoritativeState>): EngineAuthoritativeState {
  return {
    version: 1,
    storyId: 'story_resilience_test',
    title: 'The Resilience Chronicle',
    genres: ['Fantasy'],
    worldId: 'world_test',
    worldName: 'Aethelgard',
    currentTurnNumber: 1,
    currentChapter: 1,
    currentLocation: 'Moonlit Sanctuary',
    hero: {
      id: 'hero_1',
      name: 'Elysia Swiftblade',
      age: '22',
      gender: 'Female',
      race: 'Elf',
      origin: 'High Forest',
      backstory: 'A sentinel safeguarding ancient secrets.',
      personality: ['Cautious'],
      skills: ['Archery', 'Tracking'],
      powers: ['Gale Step'],
      weapons: ['Shortbow'],
      weaknesses: ['Fire'],
      powerLevel: 25,
      goals: ['Protect the shrine'],
      motivations: ['Honor her order'],
      fears: ['Failure'],
      secrets: ['Hides an arcane mark'],
      alignment: 'Neutral Good',
      relationships: [],
      createdAt: Date.now(),
    },
    characters: {},
    inventory: [
      { id: 'item_relic', name: 'Elder Relic', quantity: 1, category: 'artifact', description: 'Ancient sacred item', isUnique: true, isEquipped: false }
    ],
    activeQuests: [],
    completedQuests: [],
    stamina: 80,
    powerLevel: 25,
    worldFlags: {
      region: 'Silverwood',
      kingdom: 'Aethelgard Realm',
      wealth: '50 Gold Coins',
      rank: 'Sentinel Scout'
    },
    statusEffects: ['Alert'],
    turns: [
      {
        turnId: 'turn_0',
        chapterNumber: 1,
        sceneTitle: 'Arrival at the Sanctuary',
        narrativeText: 'You stand before the silver arch of the ancient shrine as winds rustle the birch trees.',
        dialogues: [],
        choices: [
          { choiceId: 'c1', text: 'Scout the perimeter', riskLevel: 'safe', requiredStamina: 5 }
        ],
        stateSnapshotVersion: 1,
        timestamp: Date.now()
      }
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides
  };
}

describe('BranchVerse — AI Proposal Validation & Recovery Resilience', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // TEST 1: Completely valid AI response
  it('CASE 1: Successfully parses and accepts a completely valid AI response', () => {
    const rawAiOutput = {
      sceneTitle: 'The Whispering Grove',
      narrativeText: 'The silver leaves ripple with celestial light as an owl calls out in the gathering dusk.',
      dialogues: [{ speaker: 'Elysia', text: 'The boundary is failing.', emotion: 'urgent' }],
      proposedChoices: [
        { choiceId: 'c1', text: 'Inspect the glowing sigils on the stones', riskLevel: 'safe', requiredStamina: 6, actionIntent: 'investigate' },
        { choiceId: 'c2', text: 'Draw your bow and take up a defensive stance', riskLevel: 'moderate', requiredStamina: 8, actionIntent: 'combat' }
      ],
      proposedStateDelta: {
        currentLocation: 'The Whispering Grove',
        region: 'Silverwood Valley',
        kingdom: 'Aethelgard Realm',
        wealth: '60 Gold Coins',
        rank: 'Guardian Scout'
      }
    };

    const { proposal, diagnostics } = repairNarrativeProposal(rawAiOutput);
    expect(proposal).not.toBeNull();
    expect(diagnostics.hasUsableNarrative).toBe(true);
    expect(proposal?.sceneTitle).toBe('The Whispering Grove');
    expect(proposal?.proposedChoices).toHaveLength(2);
    expect(proposal?.proposedStateDelta?.wealth).toBe('60 Gold Coins');
    expect(diagnostics.rejectedStateFields).toHaveLength(0);
  });

  // TEST 2: Valid narrative with one malformed optional stat (e.g. malformed wealth object)
  it('CASE 2: Preserves valid narrative and choices when one optional stat is malformed', () => {
    const rawAiOutput = {
      sceneTitle: 'The Broken Bridge',
      narrativeText: 'A deep ravine cuts through the mountain pass, the suspension bridge swaying precariously in the gale.',
      dialogues: [],
      proposedChoices: [
        { choiceId: 'c1', text: 'Reinforce the guide rope with your grappling gear', riskLevel: 'safe', requiredStamina: 6 },
        { choiceId: 'c2', text: 'Leap across the narrowest fracture', riskLevel: 'perilous', requiredStamina: 14 }
      ],
      proposedStateDelta: {
        currentLocation: 'Raven Crag Pass',
        wealth: { invalidStructure: true, nestedGarbage: [1, 2, 3] } // Malformed wealth object
      }
    };

    const { proposal, diagnostics } = repairNarrativeProposal(rawAiOutput);
    expect(proposal).not.toBeNull();
    expect(diagnostics.hasUsableNarrative).toBe(true);
    expect(proposal?.narrativeText).toContain('A deep ravine cuts through');
    expect(proposal?.proposedChoices).toHaveLength(2);
    // Malformed wealth is rejected safely without stopping the turn
    expect(diagnostics.rejectedStateFields).toContain('wealth (malformed object)');
    // Valid location is retained
    expect(proposal?.proposedStateDelta?.currentLocation).toBe('Raven Crag Pass');
  });

  // TEST 3: Valid narrative with multiple malformed optional stats
  it('CASE 3: Preserves narrative when multiple optional stats are malformed', () => {
    const rawAiOutput = {
      title: 'Echoes in the Cavern', // alias for sceneTitle
      narration: 'Deep inside the limestone cave, fluorescent moss illuminates ancient dwarven glyphs etched into the granite.', // alias for narrativeText
      options: [ // alias for proposedChoices
        { text: 'Trace the dwarven runes with your fingertips', riskLevel: 'low', actionIntent: 'explore' },
        { text: 'Light a torch to reveal hidden pit traps', riskLevel: 'moderate', actionIntent: 'search' }
      ],
      proposedStateDelta: {
        location: 'Dwarven Deep Vaults', // alias for currentLocation
        wealth: ['bad', 'array', 'wealth'], // invalid wealth type
        rank: 12345, // invalid rank (number instead of string)
        region: { corrupted: true } // invalid region
      }
    };

    const { proposal, diagnostics } = repairNarrativeProposal(rawAiOutput);
    expect(proposal).not.toBeNull();
    expect(diagnostics.hasUsableNarrative).toBe(true);
    expect(proposal?.sceneTitle).toBe('Echoes in the Cavern');
    expect(proposal?.narrativeText).toContain('fluorescent moss illuminates');
    expect(proposal?.proposedChoices[0].riskLevel).toBe('safe'); // normalized from 'low'
    expect(proposal?.proposedChoices[0].actionIntent).toBe('investigate'); // normalized from 'explore'
    expect(proposal?.proposedStateDelta?.currentLocation).toBe('Dwarven Deep Vaults'); // normalized from 'location'
    expect(diagnostics.rejectedStateFields).toContain('wealth (unsupported type)');
    expect(diagnostics.rejectedStateFields).toContain('rank (non-string)');
  });

  // TEST 4: Numeric wealth returned as a string (e.g. "150 gold" or "150")
  it('CASE 4: Correctly normalizes wealth when returned as string or numeric string', () => {
    const outputWithStringWealth = {
      sceneTitle: 'The Merchant Bazaar',
      narrativeText: 'Spices and silk crowd the sunlit stalls as merchant caravans barter for rare eastern curios.',
      proposedChoices: [
        { choiceId: 'c1', text: 'Barter with the gem merchant for a focusing lens', riskLevel: 'safe' },
        { choiceId: 'c2', text: 'Listen quietly to rumors of the shadow rift', riskLevel: 'safe' }
      ],
      proposedStateDelta: {
        wealth: '250 Silver Shillings'
      }
    };

    const { proposal: p1 } = repairNarrativeProposal(outputWithStringWealth);
    expect(p1?.proposedStateDelta?.wealth).toBe('250 Silver Shillings');

    const outputWithNumericString = {
      sceneTitle: 'The Merchant Bazaar',
      narrativeText: 'Spices and silk crowd the sunlit stalls as merchant caravans barter for rare eastern curios.',
      proposedChoices: [
        { choiceId: 'c1', text: 'Barter with the gem merchant for a focusing lens', riskLevel: 'safe' },
        { choiceId: 'c2', text: 'Listen quietly to rumors of the shadow rift', riskLevel: 'safe' }
      ],
      proposedStateDelta: {
        wealth: 500
      }
    };

    const { proposal: p2 } = repairNarrativeProposal(outputWithNumericString);
    expect(p2?.proposedStateDelta?.wealth).toBe(500);
  });

  // TEST 5: Missing optional city or kingdom
  it('CASE 5: Safely continues without error when optional city or kingdom are omitted', () => {
    const outputMissingGeography = {
      sceneTitle: 'The Open Plains',
      narrativeText: 'Wind billows through tall amber grass beneath an azure sky without a single settlement in sight.',
      proposedChoices: [
        { choiceId: 'c1', text: 'Follow the riverbank eastward', riskLevel: 'safe' },
        { choiceId: 'c2', text: 'Camp and wait for dawn', riskLevel: 'safe' }
      ],
      proposedStateDelta: {
        // No currentLocation, no kingdom, no region
        rank: 'Nomad Pathfinder'
      }
    };

    const { proposal, diagnostics } = repairNarrativeProposal(outputMissingGeography);
    expect(proposal).not.toBeNull();
    expect(diagnostics.hasUsableNarrative).toBe(true);
    expect(proposal?.proposedStateDelta?.currentLocation).toBeUndefined();
    expect(proposal?.proposedStateDelta?.rank).toBe('Nomad Pathfinder');
  });

  // TEST 6: Unexpected optional fields in response
  it('CASE 6: Gracefully ignores unexpected optional fields without throwing or stopping turn', () => {
    const outputWithExtraFields = {
      sceneTitle: 'The High Observatory',
      narrativeText: 'Brass astrolabes rotate with silent precision under the glass dome of the star tower.',
      randomExtraKey: 'irrelevant value',
      aiInternalConfidence: 0.994,
      debugTelemetry: { latencyMs: 230, server: 'us-east' },
      proposedChoices: [
        { choiceId: 'c1', text: 'Align the lenses with the polar constellation', riskLevel: 'safe', extraChoiceNote: 'looks good' },
        { choiceId: 'c2', text: 'Inspect the planetary gears for rust', riskLevel: 'safe' }
      ],
      proposedStateDelta: {
        currentLocation: 'Skyreach Observatory',
        unrecognizedWorldStat: 9999
      }
    };

    const { proposal, diagnostics } = repairNarrativeProposal(outputWithExtraFields);
    expect(proposal).not.toBeNull();
    expect(diagnostics.hasUsableNarrative).toBe(true);
    expect(proposal?.sceneTitle).toBe('The High Observatory');
    expect(proposal?.proposedStateDelta?.currentLocation).toBe('Skyreach Observatory');
  });

  // TEST 7: Invalid state update attempting to change established facts or violating invariants
  it('CASE 7: Rejects invalid state update attempting to violate invariants while preserving narrative', () => {
    const originalState = createMockAuthoritativeState();
    const transaction = new StoryTransaction(originalState);
    transaction.stageValidation({ isValid: true });
    transaction.stagePlan({});

    // Staged narrative proposes an illegal invariant mutation (e.g. invalid stamina: -999)
    const proposalWithIllegalStateDelta = {
      sceneTitle: 'Cursed Altar',
      narrativeText: 'A dreadful chill seeps from the corrupted obsidian altar as dark vapors swirl around your boots.',
      dialogues: [],
      proposedChoices: [
        { choiceId: 'c1', text: 'Purify the altar with holy water', riskLevel: 'safe' },
        { choiceId: 'c2', text: 'Retreat back to the threshold', riskLevel: 'safe' }
      ],
      proposedStateDelta: {
        currentLocation: 'The Obsidian Crypt',
        stamina: 9999 // Illegal stamina!
      }
    };

    transaction.stageNarrative(proposalWithIllegalStateDelta, { actionType: 'action', customActionText: 'Approached the altar' });
    // In StoryTransaction.ts, stamina is clamped to 100 max, preserving state validity
    expect(transaction.getStagedState().stamina).toBeLessThanOrEqual(100);

    // Transaction verification succeeds safely
    expect(() => transaction.verifyTransition()).not.toThrow();
    const { committedState, newTurn } = transaction.commit();
    expect(committedState.currentLocation).toBe('The Obsidian Crypt');
    expect(newTurn.narrativeText).toContain('A dreadful chill seeps');
  });

  // TEST 8: Completely malformed AI response (e.g. non-JSON or invalid object)
  it('CASE 8: Handles completely malformed non-JSON or empty response cleanly', () => {
    const garbageResponses = [
      '',
      '   ',
      '<html>502 Bad Gateway</html>',
      null,
      undefined,
      12345
    ];

    for (const bad of garbageResponses) {
      const { proposal, diagnostics } = repairNarrativeProposal(bad);
      expect(proposal).toBeNull();
      expect(diagnostics.hasUsableNarrative).toBe(false);
      expect(diagnostics.errors.length).toBeGreaterThan(0);
    }
  });

  // TEST 9: AI response with no usable narrative text
  it('CASE 9: Fails validation cleanly when narrativeText is completely missing or empty', () => {
    const responseWithoutNarrative = {
      sceneTitle: 'Missing Story',
      narrativeText: '', // empty
      proposedChoices: [
        { choiceId: 'c1', text: 'Take choice', riskLevel: 'safe' },
        { choiceId: 'c2', text: 'Take choice 2', riskLevel: 'safe' }
      ]
    };

    const { proposal, diagnostics } = repairNarrativeProposal(responseWithoutNarrative);
    expect(proposal).toBeNull();
    expect(diagnostics.hasUsableNarrative).toBe(false);
    expect(diagnostics.errors[0]).toContain('Narrative text missing or too short');
  });

  // TEST 10: Recovery in GeminiNarrativeProvider after a partially malformed response
  it('CASE 10: GeminiNarrativeProvider repairs and delivers response without throwing Malformed AI Proposal', async () => {
    const provider = new GeminiNarrativeProvider();

    // Mock fetch returning a narrative with malformed choices and non-standard riskLevel
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        modelUsed: 'gemini-3.1-flash-lite',
        narrative: {
          scene: 'The Sunken Hall', // alias
          story: 'Water laps against moss-covered marble pillars as schools of silver fish dart through the submerged colonnade.', // alias
          choices: [
            { text: 'Dive underwater to investigate the submerged chest', riskLevel: 'dangerous', actionIntent: 'dive' },
            { text: 'Climb onto the dry capitals above', riskLevel: 'easy', actionIntent: 'climb' }
          ],
          stateChanges: {
            city: 'Sunken Ruins of Valeria', // alias
            wealth: '300 Gold'
          }
        }
      })
    } as any);

    const proposal = await provider.generateNarrative({
      storyTitle: 'Test Story',
      chapterNumber: 2,
      currentTurnNumber: 2,
      genre: 'Fantasy',
      worldName: 'Valeria',
      tone: 'Mysterious',
      difficulty: 'Adventurer (Standard)',
      location: 'Sunken Hall',
      hero: {
        id: 'h1',
        name: 'Elysia',
        race: 'Elf',
        origin: 'Forest',
        powerLevel: 25,
        stamina: 80,
        powers: [],
        weapons: [],
        statusEffects: []
      },
      inventoryItems: [],
      activeQuests: [],
      npcRelationships: [],
      memorySummary: '',
      recentTurnsSummary: [],
      authoritativeConstraints: [],
      importantFacts: []
    });

    expect(proposal).toBeDefined();
    expect(proposal.sceneTitle).toBe('The Sunken Hall');
    expect(proposal.narrativeText).toContain('Water laps against moss-covered marble pillars');
    expect(proposal.proposedChoices).toHaveLength(2);
    // Verified normalized riskLevels
    expect(proposal.proposedChoices[0].riskLevel).toBe('perilous');
    expect(proposal.proposedChoices[1].riskLevel).toBe('safe');
    // Verified normalized state delta
    expect(proposal.proposedStateDelta?.currentLocation).toBe('Sunken Ruins of Valeria');
    expect(proposal.proposedStateDelta?.wealth).toBe('300 Gold');
  });

  // TEST 11: Story state remains completely unchanged when an invalid state update is rejected
  it('CASE 11: Authoritative story state remains unchanged when an invalid state delta is rejected', () => {
    const originalState = createMockAuthoritativeState({
      stamina: 75,
      worldFlags: {
        region: 'Silverwood',
        kingdom: 'Aethelgard Realm',
        wealth: '100 Gold Coins',
        rank: 'Scout'
      }
    });

    const transaction = new StoryTransaction(originalState);
    transaction.stageValidation({ isValid: true });
    transaction.stagePlan({});

    // AI returns valid narrative, but corrupted state delta
    const proposal = {
      sceneTitle: 'Ancient Gate',
      narrativeText: 'The heavy iron portcullis rises with a groaning clatter of chains.',
      dialogues: [],
      proposedChoices: [
        { choiceId: 'c1', text: 'Step through the gate', riskLevel: 'safe' as const, requiredStamina: 5 },
        { choiceId: 'c2', text: 'Check the winch mechanism', riskLevel: 'safe' as const, requiredStamina: 5 }
      ],
      proposedStateDelta: {
        // Corrupted wealth and non-string region
        wealth: null,
        region: { corrupted: true } as any
      }
    };

    // Staging and verifying
    transaction.stageNarrative(proposal, { actionType: 'action', customActionText: 'Raised the gate' });
    transaction.verifyTransition();
    const { committedState } = transaction.commit();

    // Wealth and region remain the original authoritative values
    expect(committedState.worldFlags.wealth).toBe('100 Gold Coins');
    expect(committedState.worldFlags.region).toBe('Silverwood');
    expect(committedState.stamina).toBe(75);
  });

  // TEST 12: Valid narrative continues smoothly even when optional stats are rejected
  it('CASE 12: Valid narrative continues seamlessly in StorySession even when optional stats are rejected', async () => {
    const mockProvider = {
      name: 'Mock Narrative Provider',
      isLocal: false,
      generateNarrative: vi.fn().mockResolvedValue({
        sceneTitle: 'The Iron Bastion',
        narrativeText: 'Gargoyles stare down from the battlements as a thunderous bell tolls across the courtyard.',
        dialogues: [{ speaker: 'Watchman', text: 'Halt, who goes there?', emotion: 'stern' }],
        proposedChoices: [
          { choiceId: 'c1', text: 'Present your guild crest', riskLevel: 'safe', requiredStamina: 5 },
          { choiceId: 'c2', text: 'Slip into the shadows beneath the ramparts', riskLevel: 'moderate', requiredStamina: 8 }
        ],
        proposedStateDelta: {
          currentLocation: 'The Iron Bastion Courtyard',
          corruptedOptionalStat: { [Symbol('bad')]: 'cannot serialize' }
        }
      })
    };

    const initialStory: StoryDocument = {
      id: 'story_session_resilience',
      title: 'The Bastion Chronicles',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      hero: createMockAuthoritativeState().hero,
      genres: ['Fantasy'],
      worldId: 'world_1',
      worldName: 'Aethelgard',
      settings: {
        tone: 'Heroic Fantasy',
        pacing: 'Balanced Narrative',
        difficulty: 'Adventurer (Standard)',
        mainObjective: 'Gain entry to the citadel'
      },
      state: {
        stamina: 85,
        powerLevel: 25,
        currentLocation: 'Outer Gates',
        worldFlags: {
          region: 'Northern Wall',
          wealth: '50 Gold'
        },
        statusEffects: ['Stealthy'],
        inventory: [],
        activeQuests: [],
        npcTrust: {},
        timelineStep: 1,
        isGameOver: false
      },
      turns: [
        {
          turnId: 'turn_init',
          chapterNumber: 1,
          sceneTitle: 'Approaching the Bastion',
          narrativeText: 'You approach the imposing iron gates of the fortress.',
          choices: [
            { choiceId: 'c1', text: 'Advance to the gate', riskLevel: 'safe' }
          ],
          timestamp: Date.now()
        }
      ],
      status: 'active',
      version: 1,
      generationMode: 'ai',
      storyLanguage: 'en'
    };

    const session = StorySession.fromStoryDocument(initialStory, mockProvider);
    const result = await session.dispatchTurn({
      turnId: 'turn_2',
      choiceId: 'c1',
      actionType: 'choice',
      timestamp: Date.now()
    });

    expect(result.newTurn).toBeDefined();
    expect(result.newTurn.sceneTitle).toBe('The Iron Bastion');
    expect(result.newTurn.narrativeText).toContain('Gargoyles stare down from the battlements');
    expect(result.newTurn.choices).toHaveLength(2);
    // Updated location is applied
    expect(result.updatedState.currentLocation).toBe('The Iron Bastion Courtyard');
    // Original wealth is preserved
    expect(result.updatedState.worldFlags.wealth).toBe('50 Gold');
  });
});
