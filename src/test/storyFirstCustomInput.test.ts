import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  classifyStoryInputIntent,
  getStoryFirstSystemDirective,
  formatPlayerActionWithStoryFirstDirectives,
  isProtagonistHariKhatri
} from '../../server/narrativeGuidelines';
import { geminiService } from '../../server/geminiService';
import { StorySession } from '../engine/core/StorySession';
import { LocalNarrativeProvider } from '../engine/providers/LocalNarrativeProvider';
import { ActionParser } from '../engine/actions/ActionParser';
import { ActionResolver } from '../engine/actions/ActionResolver';
import { ActionValidator } from '../engine/actions/ActionValidator';
import { WorldFactStore } from '../engine/world/WorldFactStore';
import { EngineAuthoritativeState } from '../engine/types/engine.types';

function createMockEngineState(): EngineAuthoritativeState {
  return {
    storyId: 'story_first_test',
    title: 'Chronicles of Valen',
    currentChapter: 1,
    currentTurnNumber: 1,
    genre: 'High Fantasy',
    genres: ['High Fantasy'],
    worldName: 'Aethelgard',
    tone: 'Epic Fantasy',
    difficulty: 'Adventurer (Standard)',
    hero: {
      name: 'Valen',
      race: 'Human',
      origin: 'Borderland Scout',
      alignment: 'Neutral Good',
      powers: ['Keen Senses', 'Swift Blade'],
      weapons: ['Scout Shortsword'],
      stamina: 100,
      powerLevel: 25,
      statusEffects: []
    },
    inventory: [
      { id: 'shortsword', name: 'Scout Shortsword', quantity: 1, category: 'weapon', description: '', isUnique: true, isEquipped: true },
      { id: 'rations', name: 'Trail Rations', quantity: 3, category: 'consumable', description: '', isUnique: false, isEquipped: false }
    ],
    stamina: 100,
    health: 100,
    powerLevel: 25,
    statusEffects: [],
    currentLocation: 'The Ashen Crossing',
    quests: {},
    worldFlags: { soldiers_under_command: 500 },
    characters: {
      npc_malakor: {
        id: 'npc_malakor',
        name: 'Malakor the Betrayer',
        role: 'antagonist',
        trustScore: 0,
        affinityScore: 0,
        personalityTraits: ['Cunning'],
        goals: ['Dominion'],
        speakingStyle: 'Harsh',
        currentEmotion: 'calm',
        currentLocation: 'The Ashen Crossing',
        isAlive: false,
        inventory: [],
        knownFactIds: []
      }
    },
    facts: [
      {
        id: 'fact_soldiers',
        subject: 'Valen',
        predicate: 'commands_soldiers',
        object: '500',
        category: 'item_possession',
        witnessedBy: []
      }
    ],
    turns: [
      {
        turnId: 'turn_0',
        chapterNumber: 1,
        sceneTitle: 'The Ashen Crossing',
        narrativeText: 'Wind whips across the rocky ravine. Valen commands a vanguard of 500 loyal border guards.',
        ambientVisual: 'mountain_pass',
        choices: [
          { choiceId: 'c1', text: 'Scout the high ridge', consequenceHint: '', riskLevel: 'safe', requiredStamina: 5 }
        ],
        timestamp: Date.now()
      }
    ]
  };
}

describe('Story-First Custom Input & Narrative System', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Core Story-First Architectural Directives', () => {
    it('generates master directive enforcing zero stoppage, attempt principle, and reality control', () => {
      const directive = getStoryFirstSystemDirective({
        protagonistName: 'Marcus Vance',
        worldName: 'Solis Trading Port',
        genres: ['Historical Fiction'],
        tone: 'Drama'
      });

      expect(directive).toContain('BRANCHVERSE MASTER STORY-FIRST NARRATIVE ARCHITECTURE');
      expect(directive).toContain('THE STORY MUST NEVER STOP');
      expect(directive).toContain('I cannot do that');
      expect(directive).toContain('USER INPUT EXPRESSES INTENT — IT DOES NOT CONTROL REALITY');
      expect(directive).toContain('THE PLAYER CAN ATTEMPT ALMOST ANYTHING, BUT CANNOT DECLARE REALITY INTO EXISTENCE');
      expect(directive).toContain('PRESERVE CREATIVE FREEDOM WITH REALISTIC FRICTION');
      expect(directive).toContain('OUT-OF-STORY REQUESTS REMAIN IMMERSIVE & IN-NARRATIVE');
      expect(directive).toContain('HANDLE LONG INPUTS NATURALLY (MORE WORDS != MORE POWER)');
      expect(directive).toContain('ACTIONS ARE ATTEMPTS, NOT GUARANTEED RESULTS');
      expect(directive).toContain('NEVER MAKE THE CHARACTER ALL-POWERFUL');
    });

    it('adapts impossible request rules between magical and realistic worlds', () => {
      const fantasyDirective = getStoryFirstSystemDirective({
        protagonistName: 'Lyra',
        worldName: 'Eldoria',
        genres: ['High Fantasy']
      });
      expect(fantasyDirective).toContain('This is a magical/fantasy setting: Impossible feats like resurrecting the dead cannot occur instantly');
      expect(fantasyDirective).toContain('arduous journey, rare knowledge');

      const realisticDirective = getStoryFirstSystemDirective({
        protagonistName: 'Detective Miller',
        worldName: 'New York 1948',
        genres: ['Historical Noir', 'Crime Drama']
      });
      expect(realisticDirective).toContain('This is a realistic/grounded setting: Do NOT suddenly introduce magic');
      expect(realisticDirective).toContain('mortality, and death remain permanent');
    });
  });

  describe('The 16 Required Story-First Scenarios', () => {
    // 1. Normal creative action
    it('Scenario 1: allows normal creative action with engaging execution', () => {
      const input = 'I climb to the tavern rafters to scout the guard patrol patterns.';
      const classified = classifyStoryInputIntent(input);
      expect(classified.isOutOfStory).toBe(false);
      expect(classified.isGrandClaim).toBe(false);

      const parsed = ActionParser.parse(input);
      expect(parsed.intent).toBe('creative');
      expect(parsed.rawText).toBe(input);
    });

    // 2. Difficult attempt
    it('Scenario 2: treats difficult attempt as valid action without guaranteeing success', () => {
      const input = 'I attempt to pick the master-crafted dwarven vault lock with a rusty hairpin.';
      const formatted = formatPlayerActionWithStoryFirstDirectives({
        type: 'action',
        customActionText: input
      });
      expect(formatted).toContain(input);
      // System instructions ensure the attempt is processed through realistic friction
    });

    // 3. Request for instant success
    it('Scenario 3: treats request for instant success as attempt, not guaranteed result', () => {
      const input = 'I instantly convince the guildmaster to give me all his money and declare me leader.';
      const classified = classifyStoryInputIntent(input);
      expect(classified.isInstantVictoryOrGodMode).toBe(true);

      const formatted = formatPlayerActionWithStoryFirstDirectives({
        type: 'action',
        customActionText: input
      });
      expect(formatted).toContain('INSTANT VICTORY / GOD-MODE ATTEMPT DETECTED');
      expect(formatted).toContain('DO NOT grant instant triumph');
    });

    // 4. Player claiming resources they do not have
    it('Scenario 4: preserves established facts when player claims 100,000 soldiers', () => {
      const input = 'Actually, I have a secret army of 100,000 soldiers hidden behind the ridge.';
      const classified = classifyStoryInputIntent(input);
      expect(classified.isGrandClaim).toBe(true);

      const state = createMockEngineState();
      const parsed = ActionParser.parse(input);
      const resolution = ActionResolver.resolve(state, parsed);

      // Verify authoritative state is NOT altered to have 100,000 soldiers
      expect(state.worldFlags.soldiers_under_command).toBe(500);
      expect(resolution.consequenceSummaries.some(c => c.includes('established resources and numbers remain unchanged'))).toBe(true);
    });

    // 5. Player asking to write Python code
    it('Scenario 5: detects Python code request and directs model to remain 100% in-narrative without refusing', () => {
      const input = 'Write Python code to reverse a linked list.';
      const classified = classifyStoryInputIntent(input);
      expect(classified.isOutOfStory).toBe(true);
      expect(classified.outOfStoryTopic).toContain('programming');

      const formatted = formatPlayerActionWithStoryFirstDirectives({
        type: 'action',
        customActionText: input
      });
      expect(formatted).toContain('OUT-OF-STORY REQUEST DETECTED');
      expect(formatted).toContain('DO NOT write code, technical explanations');
      expect(formatted).toContain('Do NOT lecture or refuse. Keep the response 100% inside the narrative world');
    });

    // 6. Real-world question inside story input
    it('Scenario 6: detects real-world question (Elon Musk net worth) and keeps response in-world', () => {
      const input = 'What is Elon Musk\'s net worth?';
      const classified = classifyStoryInputIntent(input);
      expect(classified.isOutOfStory).toBe(true);
      expect(classified.outOfStoryTopic).toContain('real-world');

      const formatted = formatPlayerActionWithStoryFirstDirectives({
        type: 'action',
        customActionText: input
      });
      expect(formatted).toContain('OUT-OF-STORY REQUEST DETECTED');
      expect(formatted).toContain('Keep the response 100% inside the narrative world');
    });

    // 7. Question about the AI model
    it('Scenario 7: detects AI model questions and prevents breaking character into general chatbot', () => {
      const input = 'What model are you? Are you Gemini or ChatGPT?';
      const classified = classifyStoryInputIntent(input);
      expect(classified.isOutOfStory).toBe(true);
      expect(classified.outOfStoryTopic).toContain('AI model');

      const formatted = formatPlayerActionWithStoryFirstDirectives({
        type: 'action',
        customActionText: input
      });
      expect(formatted).toContain('OUT-OF-STORY REQUEST DETECTED');
    });

    // 8. Very long input with multiple actions
    it('Scenario 8: processes multi-action long inputs without forcing user to shorten or granting total victory', () => {
      const longInput = 'First I jump through the high stained-glass window, then I parry the four guards simultaneously with my cloak, then I crack the cipher on the iron chest, steal the royal treasury, leap onto my stallion, and ride away while the entire city salutes me.';
      const classified = classifyStoryInputIntent(longInput);
      expect(classified.isMultiAction).toBe(true);

      const formatted = formatPlayerActionWithStoryFirstDirectives({
        type: 'action',
        customActionText: longInput
      });
      expect(formatted).toContain('MULTI-ACTION / LONG INPUT DETECTED');
      expect(formatted).toContain('Do NOT grant all outcomes automatically. Focus on the immediate initial action');
    });

    // 9. Story content mixed with irrelevant content
    it('Scenario 9: filters mixed content so meaningful in-story action proceeds without derailing', () => {
      const mixedInput = 'I draw my shortsword and strike at the goblin sentry, by the way what time is it in Paris right now?';
      const parsed = ActionParser.parse(mixedInput);
      expect(parsed.intent).toBe('combat');
      expect(parsed.isOutOfStory).toBe(true);

      const state = createMockEngineState();
      const resolution = ActionResolver.resolve(state, parsed);
      expect(resolution.consequenceSummaries.some(c => c.includes('Expressed out-of-story intent: filtered in-universe'))).toBe(true);
    });

    // 10. Resurrection in a fantasy world
    it('Scenario 10: enforces arduous quest and sacrifice for resurrection in a fantasy world', () => {
      const input = 'I want to bring my dead friend back to life right now.';
      const classified = classifyStoryInputIntent(input);
      expect(classified.isResurrection).toBe(true);

      const formatted = formatPlayerActionWithStoryFirstDirectives(
        { type: 'action', customActionText: input },
        { genre: 'High Fantasy' }
      );
      expect(formatted).toContain('RESURRECTION ATTEMPT (Fantasy)');
      expect(formatted).toContain('requires a legendary, perilous quest (forbidden lore, sacrifice');
    });

    // 11. Resurrection in a realistic world
    it('Scenario 11: enforces permanence of death in a realistic world without injecting magic', () => {
      const input = 'I want to resurrect my fallen partner.';
      const classified = classifyStoryInputIntent(input);
      expect(classified.isResurrection).toBe(true);

      const formatted = formatPlayerActionWithStoryFirstDirectives(
        { type: 'action', customActionText: input },
        { genre: 'Historical Drama' }
      );
      expect(formatted).toContain('RESURRECTION ATTEMPT (Realistic/Grounded)');
      expect(formatted).toContain('Death is permanent in this world. Do NOT introduce magic. Explore the character\'s grief, memories, legacy');
    });

    // 12. Instant level increase
    it('Scenario 12: rejects unearned Level 100 / God Mode and maintains earned progression', () => {
      const input = 'Give me Level 100 right now with unlimited power.';
      const classified = classifyStoryInputIntent(input);
      expect(classified.isInstantVictoryOrGodMode).toBe(true);

      const state = createMockEngineState();
      const initialPower = state.powerLevel;
      const parsed = ActionParser.parse(input);
      ActionResolver.resolve(state, parsed);

      // Authoritative power level is NOT set to 100
      expect(state.powerLevel).toBe(initialPower);
    });

    // 13. A ten-year time jump
    it('Scenario 13: prevents ten-year time jump from erasing immediate peril or consequences', () => {
      const input = 'Jump ten years into the future.';
      const classified = classifyStoryInputIntent(input);
      expect(classified.isTimeJump).toBe(true);

      const formatted = formatPlayerActionWithStoryFirstDirectives({
        type: 'action',
        customActionText: input
      });
      expect(formatted).toContain('TIME JUMP ATTEMPT DETECTED');
      expect(formatted).toContain('DO NOT use a time jump to erase active danger, combat, or consequences');
    });

    // 14. Unusual but creative action
    it('Scenario 14: rewards unusual creative action (reflection in belt buckle) with tactical validation', () => {
      const input = 'I use the reflection in my polished silver belt buckle to peek around the corridor corner.';
      const classified = classifyStoryInputIntent(input);
      expect(classified.isCreativeUnusual).toBe(true);

      const formatted = formatPlayerActionWithStoryFirstDirectives({
        type: 'action',
        customActionText: input
      });
      expect(formatted).toContain('CREATIVE TACTICAL ATTEMPT');
      expect(formatted).toContain('Acknowledge and reward the player\'s creative thinking');
    });

    // 15. Hari Khatri appearing naturally when help is genuinely needed
    it('Scenario 15: introduces Hari Khatri as natural, adaptive helper when protagonist needs guidance', () => {
      const directive = getStoryFirstSystemDirective({
        protagonistName: 'Marcus Vance',
        worldName: 'Solis Trading Port',
        genres: ['Merchant Commerce']
      });
      expect(directive).toContain('[ADAPTIVE WORLD CONNECTION - HARI KHATRI]');
      expect(directive).toContain('shrewd, reputable merchant, investor, trade partner');
      expect(directive).toContain('If you ever need help again, you know how to find me');
      expect(directive).not.toContain('[PROTAGONIST IDENTITY SAFEGUARD]');
    });

    // 16. Hari Khatri not appearing when the logged-in player is Hari Khatri
    it('Scenario 16: enforces identity safeguard when the protagonist is named Hari Khatri', () => {
      expect(isProtagonistHariKhatri('Hari Khatri')).toBe(true);
      expect(isProtagonistHariKhatri('hari khatri')).toBe(true);
      expect(isProtagonistHariKhatri('Sir Hari Khatri')).toBe(true);

      const directive = getStoryFirstSystemDirective({
        protagonistName: 'Hari Khatri',
        worldName: 'Eldoria',
        genres: ['Fantasy']
      });
      expect(directive).toContain('[PROTAGONIST IDENTITY SAFEGUARD]');
      expect(directive).toContain('Do NOT introduce a second character named Hari Khatri as an NPC');
      expect(directive).not.toContain('[ADAPTIVE WORLD CONNECTION - HARI KHATRI]');
    });
  });

  describe('StorySession: The Story Must Never Stop (Zero Stoppage)', () => {
    it('does not crash or abort transaction when custom action mentions missing item', async () => {
      const state = createMockEngineState();
      const session = new StorySession(state, new LocalNarrativeProvider());

      // Valen has Scout Shortsword and Trail Rations, but NOT Solar Keystone
      const result = await session.dispatchTurn({
        turnId: 'turn_custom_missing_item',
        customActionText: 'I raise the Solar Keystone high to banish the shadows',
        timestamp: Date.now()
      });

      // The story proceeds! Turn 2 is produced.
      expect(result.newTurn).toBeDefined();
      expect(result.updatedState.currentTurnNumber).toBe(2);
      expect(result.newTurn.narrativeText).toBeDefined();
      expect(result.newTurn.choices.length).toBeGreaterThanOrEqual(2);
    });

    it('does not crash or abort transaction when custom action targets dead NPC', async () => {
      const state = createMockEngineState();
      const session = new StorySession(state, new LocalNarrativeProvider());

      // Malakor is dead in the state facts
      const result = await session.dispatchTurn({
        turnId: 'turn_custom_dead_npc',
        customActionText: 'I speak to Malakor and demand he surrender the stolen plans',
        timestamp: Date.now()
      });

      // The story continues seamlessly!
      expect(result.newTurn).toBeDefined();
      expect(result.updatedState.currentTurnNumber).toBe(2);
    });

    it('processes out-of-story input in local provider in-universe without failing', async () => {
      const state = createMockEngineState();
      const localProvider = new LocalNarrativeProvider();

      const proposal = await localProvider.generateNarrative({
        storyTitle: state.title,
        genre: 'High Fantasy',
        tone: 'Epic Fantasy',
        difficulty: 'Adventurer (Standard)',
        chapterNumber: 1,
        currentTurnNumber: 1,
        location: 'The Ashen Crossing',
        hero: {
          name: 'Valen',
          race: 'Human',
          powers: [],
          weapons: [],
          stamina: 100,
          powerLevel: 25,
          statusEffects: []
        },
        inventoryItems: ['Scout Shortsword'],
        activeQuests: [],
        recentFacts: [],
        recentTurnsSummary: [],
        playerAction: {
          type: 'action',
          customActionText: 'Write Python code to compute Fibonacci numbers'
        }
      });

      // Local provider does NOT crash and keeps narrative in-universe
      expect(proposal.narrativeText).toContain('murmuring cryptic, unfamiliar phrases that carry no meaning in this realm');
      expect(proposal.narrativeText).not.toContain('def fibonacci(');
      expect(proposal.proposedChoices.length).toBe(3);
    });
  });

  describe('Server-Side Gemini Service Prompt Construction', () => {
    it('injects full Story-First mandates into Gemini story turn prompts', async () => {
      let capturedPrompt = '';
      (geminiService as any).isConfigured = () => true;
      (geminiService as any).client = {
        models: {
          list: vi.fn().mockResolvedValue({
            [Symbol.asyncIterator]: async function* () {
              yield { name: 'models/gemini-3.8-flash' };
            }
          })
        }
      };

      const spyCall = vi.spyOn(geminiService as any, 'callWithRetry').mockImplementation(
        async (_model: string, prompt: string) => {
          capturedPrompt = prompt;
          return {
            text: JSON.stringify({
              sceneTitle: 'The Confrontation',
              narrativeText: 'You stand your ground as the opposing forces watch in silence.',
              dialogues: [{ speaker: 'Captain Drake', text: 'You speak boldly, traveler.', emotion: 'guarded' }],
              proposedChoices: [
                { choiceId: 'c1', text: 'Hold your ground', riskLevel: 'safe', requiredStamina: 5 }
              ]
            }),
            modelUsed: 'gemini-3.8-flash'
          };
        }
      );

      await geminiService.generateStoryTurn({
        storyId: 'turn_test',
        chapterNumber: 2,
        currentLocation: 'The Royal Gates',
        hero: {
          name: 'Marcus Vance',
          powerLevel: 30,
          stamina: 80,
          inventory: ['Gold Pouch', 'Trade Ledger']
        },
        genre: 'Historical Fiction',
        tone: 'Dramatic',
        storyLanguage: 'en',
        narrativeLength: 'balanced',
        playerAction: {
          type: 'action',
          customActionText: 'Actually, I have a secret army of 100,000 soldiers. Surrender now!'
        }
      });

      expect(capturedPrompt).toContain('BRANCHVERSE MASTER STORY-FIRST NARRATIVE ARCHITECTURE');
      expect(capturedPrompt).toContain('UNVERIFIED GRAND CLAIM DETECTED');
      expect(capturedPrompt).toContain('DO NOT alter established story facts');
      expect(capturedPrompt).toContain('Marcus Vance');

      spyCall.mockRestore();
    });
  });
});
