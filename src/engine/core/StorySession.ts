import {
  EngineAuthoritativeState,
  EngineTurnRecord,
  PlayerActionInput
} from '../types/engine.types';
import { StoryDocument } from '../../types/story';
import { WorldFactStore } from '../world/WorldFactStore';
import { CharacterManager } from '../characters/CharacterManager';
import { InventoryManager } from '../inventory/InventoryManager';
import { QuestManager } from '../quests/QuestManager';
import { ConsequenceManager } from '../consequences/ConsequenceManager';
import { EndingManager } from '../endings/EndingManager';
import { ActionParser } from '../actions/ActionParser';
import { ActionValidator } from '../actions/ActionValidator';
import { ActionResolver } from '../actions/ActionResolver';
import { NarrativeContextBuilder } from '../narrative/NarrativeContextBuilder';
import { NarrativeProvider } from '../providers/NarrativeProvider';
import { LocalNarrativeProvider } from '../providers/LocalNarrativeProvider';
import { StoryTransaction } from './StoryTransaction';

export class StorySession {
  private state: EngineAuthoritativeState;
  private factStore: WorldFactStore;
  private characterManager: CharacterManager;
  private inventoryManager: InventoryManager;
  private questManager: QuestManager;
  private consequenceManager: ConsequenceManager;
  private endingManager: EndingManager;
  private narrativeProvider: NarrativeProvider;
  private processedIdempotencyKeys: Set<string> = new Set();

  constructor(
    initialState: EngineAuthoritativeState,
    narrativeProvider?: NarrativeProvider
  ) {
    this.state = JSON.parse(JSON.stringify(initialState));
    this.factStore = new WorldFactStore(this.state.facts || []);
    this.characterManager = new CharacterManager(this.state.characters || {});
    this.inventoryManager = new InventoryManager(this.state.inventory || []);
    this.questManager = new QuestManager(this.state.quests || {});
    this.consequenceManager = new ConsequenceManager(this.state.delayedEvents || []);
    this.endingManager = new EndingManager();
    this.narrativeProvider = narrativeProvider || new LocalNarrativeProvider();
  }

  public getState(): EngineAuthoritativeState {
    return JSON.parse(JSON.stringify(this.state));
  }

  public getFactStore(): WorldFactStore {
    return this.factStore;
  }

  public getInventory(): InventoryManager {
    return this.inventoryManager;
  }

  public getQuests(): QuestManager {
    return this.questManager;
  }

  public getCharacters(): CharacterManager {
    return this.characterManager;
  }

  public setNarrativeProvider(provider: NarrativeProvider): void {
    this.narrativeProvider = provider;
  }

  /**
   * Executes a turn atomically through StoryTransaction.
   */
  public async dispatchTurn(input: PlayerActionInput): Promise<{
    updatedState: EngineAuthoritativeState;
    newTurn: EngineTurnRecord;
  }> {
    // 1. Idempotency Check
    const idempotencyKey = input.idempotencyKey || `${input.turnId}_${input.timestamp}`;
    if (this.processedIdempotencyKeys.has(idempotencyKey)) {
      const existingTurn = this.state.turns.find(t => t.turnId === input.turnId);
      if (existingTurn) {
        return {
          updatedState: this.getState(),
          newTurn: existingTurn
        };
      }
    }

    const transaction = new StoryTransaction(this.state);

    try {
      // 2. Parse action intent
      const rawText = input.customActionText || input.choiceId || 'advance';
      const parsedAction = ActionParser.parse(rawText, !!input.customActionText);

      // Precondition check
      const validation = ActionValidator.validate(
        transaction.getStagedState(),
        parsedAction,
        this.factStore
      );
      transaction.stageValidation(validation);

      // 3. Plan mechanical rules & consequences
      const resolution = ActionResolver.resolve(transaction.getStagedState(), parsedAction);

      // Evaluate delayed events
      const triggeredEvents = this.consequenceManager.evaluateDelayedEvents(
        transaction.getStagedState().currentTurnNumber + 1,
        this.factStore
      );
      for (const te of triggeredEvents) {
        resolution.consequenceSummaries.push(`[Event Triggered] ${te.narrativeHook}`);
      }

      transaction.stagePlan(resolution.stateDelta, resolution.consequenceSummaries);

      // 4. Generate narrative via Narrative Director
      const promptContext = NarrativeContextBuilder.build(
        transaction.getStagedState(),
        this.factStore
      );
      const narrativeProposal = await this.narrativeProvider.generateNarrative(promptContext);

      transaction.stageNarrative(narrativeProposal, input);

      // 5. Verify invariant preservation
      transaction.verifyTransition();

      // 6. Commit transaction atomically
      const { committedState, newTurn } = transaction.commit();

      // Apply committed state to session
      this.state = committedState;
      this.factStore.assertFact(
        this.state.hero.name,
        'executed_action',
        parsedAction.rawText,
        'historical_event',
        [],
        this.state.currentTurnNumber
      );
      this.processedIdempotencyKeys.add(idempotencyKey);

      return {
        updatedState: this.getState(),
        newTurn
      };
    } catch (error) {
      transaction.rollback();
      throw error;
    }
  }

  /**
   * Projects the authoritative engine state to a StoryDocument for storage/UI compatibility.
   */
  public toStoryDocument(): StoryDocument {
    return {
      id: this.state.storyId,
      title: this.state.title,
      createdAt: this.state.createdAt,
      updatedAt: this.state.updatedAt,
      hero: this.state.hero,
      genres: this.state.genres,
      worldId: this.state.worldId,
      worldName: this.state.worldName,
      settings: {
        tone: (this.state.tone as any) || 'Epic Fantasy',
        pacing: (this.state.pacing as any) || 'Balanced Narrative',
        difficulty: (this.state.difficulty as any) || 'Adventurer (Standard)',
      },
      state: {
        health: this.state.health,
        maxHealth: this.state.maxHealth,
        stamina: this.state.stamina,
        powerLevel: this.state.powerLevel,
        inventory: this.state.inventory.map(i => ({
          id: i.id,
          name: i.name,
          quantity: i.quantity,
          description: i.description,
          category: i.category,
          effectDescription: i.effectDescription
        })),
        activeQuests: Object.values(this.state.quests).map(q => ({
          id: q.id,
          title: q.title,
          giver: q.giverName,
          objective: q.objectives[0]?.description || q.description,
          status: q.status === 'locked' ? 'active' : (q.status as any),
          rewardDescription: q.rewardItemIds?.join(', ')
        })),
        worldFlags: { ...this.state.worldFlags },
        npcTrust: Object.fromEntries(
          Object.values(this.state.characters).map(c => [c.name, c.trustScore])
        ),
        statusEffects: [...this.state.statusEffects],
        timelineStep: this.state.currentTurnNumber,
        currentLocation: this.state.currentLocation,
        isGameOver: this.state.isStoryComplete,
        endingType: this.state.unlockedEndingId ? 'victory' : undefined
      },
      turns: this.state.turns.map(t => ({
        turnId: t.turnId,
        chapterNumber: t.chapterNumber,
        sceneTitle: t.sceneTitle,
        narrativeText: t.narrativeText,
        dialogues: t.dialogues,
        ambientVisual: t.ambientVisual,
        choices: t.choices.map(c => ({
          choiceId: c.choiceId,
          text: c.text,
          consequenceHint: c.consequenceHint,
          riskLevel: c.riskLevel,
          requiredItem: c.requiredItem,
          requiredStamina: c.requiredStamina
        })),
        selectedChoiceId: t.playerInput?.choiceId,
        customActionText: t.playerInput?.customActionText,
        timestamp: t.timestamp
      })),
      status: this.state.isStoryComplete ? 'completed' : 'active',
      version: this.state.version
    };
  }

  /**
   * Rehydrates a StorySession from an existing StoryDocument.
   */
  public static fromStoryDocument(
    doc: StoryDocument,
    narrativeProvider?: NarrativeProvider
  ): StorySession {
    const authoritativeState: EngineAuthoritativeState = {
      version: doc.version || 1,
      storyId: doc.id,
      title: doc.title,
      genre: doc.genres[0] || 'Fantasy',
      genres: doc.genres,
      worldId: doc.worldId,
      worldName: doc.worldName,
      tone: doc.settings?.tone || 'Epic Fantasy',
      difficulty: doc.settings?.difficulty || 'Adventurer (Standard)',
      pacing: doc.settings?.pacing || 'Balanced Narrative',

      currentChapter: doc.turns[doc.turns.length - 1]?.chapterNumber || 1,
      currentSceneId: 'scene_active',
      currentTurnNumber: doc.turns.length,
      currentLocation: doc.state?.currentLocation || 'Starting Outpost',
      phase: doc.state?.isGameOver ? 'resolution' : 'exploration',

      hero: doc.hero,
      health: doc.state?.health ?? 100,
      maxHealth: doc.state?.maxHealth ?? 100,
      stamina: doc.state?.stamina ?? 100,
      powerLevel: doc.state?.powerLevel ?? (doc.hero.powerLevel || 10),
      statusEffects: doc.state?.statusEffects || [],

      characters: {},
      inventory: (doc.state?.inventory || []).map(i => ({
        id: i.id,
        name: i.name,
        quantity: i.quantity,
        category: i.category,
        description: i.description,
        isUnique: i.category === 'artifact' || i.category === 'key_item',
        isEquipped: false,
        effectDescription: i.effectDescription
      })),
      quests: {},
      facts: [],
      delayedEvents: [],
      causalHistory: [],
      worldFlags: doc.state?.worldFlags || {},

      turns: doc.turns.map(t => ({
        turnId: t.turnId,
        chapterNumber: t.chapterNumber,
        sceneTitle: t.sceneTitle,
        narrativeText: t.narrativeText,
        dialogues: t.dialogues || [],
        ambientVisual: t.ambientVisual,
        choices: t.choices.map(c => ({
          choiceId: c.choiceId,
          text: c.text,
          consequenceHint: c.consequenceHint,
          riskLevel: c.riskLevel,
          requiredItem: c.requiredItem,
          requiredStamina: c.requiredStamina
        })),
        timestamp: t.timestamp,
        stateSnapshotVersion: 1
      })),

      isStoryComplete: doc.state?.isGameOver || false,
      randomSeed: Date.now(),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };

    return new StorySession(authoritativeState, narrativeProvider);
  }
}
