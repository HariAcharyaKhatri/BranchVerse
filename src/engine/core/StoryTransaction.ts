import {
  EngineAuthoritativeState,
  EngineTurnRecord,
  PlayerActionInput,
  TurnLifecycleStatus
} from '../types/engine.types';
import { StoryValidator } from './StoryValidator';
import { NarrativeProposalSchema, NarrativeProposal } from '../narrative/NarrativeSchema';

export class StoryTransaction {
  public status: TurnLifecycleStatus = 'RECEIVED';
  private originalState: EngineAuthoritativeState;
  private stagedState: EngineAuthoritativeState;
  private newTurnRecord?: EngineTurnRecord;
  private failureReason?: string;

  constructor(state: EngineAuthoritativeState) {
    this.originalState = state;
    // Deep clone to isolate mutations in staging
    this.stagedState = JSON.parse(JSON.stringify(state));
  }

  public getStagedState(): EngineAuthoritativeState {
    return this.stagedState;
  }

  public getFailureReason(): string | undefined {
    return this.failureReason;
  }

  public stageValidation(validationResult: { isValid: boolean; reason?: string }): void {
    if (this.status !== 'RECEIVED') {
      throw new Error(`Cannot validate transaction in status "${this.status}".`);
    }
    if (!validationResult.isValid) {
      this.status = 'FAILED';
      this.failureReason = validationResult.reason || 'Action failed precondition check.';
      throw new Error(this.failureReason);
    }
    this.status = 'VALIDATED';
  }

  public stagePlan(stateDelta: Partial<EngineAuthoritativeState>, _appliedConsequences: string[] = []): void {
    if (this.status !== 'VALIDATED') {
      throw new Error(`Cannot plan transaction in status "${this.status}".`);
    }

    // Apply delta to staged state
    if (typeof stateDelta.health === 'number') {
      this.stagedState.health = Math.max(0, Math.min(this.stagedState.maxHealth, stateDelta.health));
    }
    if (typeof stateDelta.stamina === 'number') {
      this.stagedState.stamina = Math.max(0, Math.min(100, stateDelta.stamina));
    }
    if (typeof stateDelta.powerLevel === 'number') {
      this.stagedState.powerLevel = Math.max(1, Math.min(100, stateDelta.powerLevel));
    }
    if (stateDelta.currentLocation) {
      this.stagedState.currentLocation = stateDelta.currentLocation;
    }
    if (stateDelta.inventory) {
      this.stagedState.inventory = [...stateDelta.inventory];
    }
    if (stateDelta.quests) {
      this.stagedState.quests = { ...stateDelta.quests };
    }
    if (stateDelta.worldFlags) {
      this.stagedState.worldFlags = { ...this.stagedState.worldFlags, ...stateDelta.worldFlags };
    }

    // Check game over
    if (this.stagedState.health <= 0) {
      this.stagedState.isStoryComplete = true;
      this.stagedState.unlockedEndingId = 'ending_tragic_sacrifice';
    }

    this.status = 'PLANNED';
  }

  public stageNarrative(proposal: unknown, playerInput: PlayerActionInput): void {
    if (this.status !== 'PLANNED') {
      throw new Error(`Cannot stage narrative in status "${this.status}".`);
    }

    // Validate narrative proposal with Zod schema
    const parsedProposal: NarrativeProposal = NarrativeProposalSchema.parse(proposal);

    const nextTurnNumber = this.stagedState.currentTurnNumber + 1;
    const nextChapter = Math.floor(nextTurnNumber / 5) + 1;

    this.newTurnRecord = {
      turnId: playerInput.turnId || `turn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      chapterNumber: nextChapter,
      sceneTitle: parsedProposal.sceneTitle,
      narrativeText: parsedProposal.narrativeText,
      dialogues: parsedProposal.dialogues,
      ambientVisual: parsedProposal.ambientVisual,
      choices: parsedProposal.proposedChoices.map(c => ({
        choiceId: c.choiceId,
        text: c.text,
        consequenceHint: c.consequenceHint,
        riskLevel: c.riskLevel,
        requiredItem: c.requiredItem,
        requiredStamina: c.requiredStamina,
        actionIntent: c.actionIntent
      })),
      playerInput,
      stateSnapshotVersion: this.stagedState.version + 1,
      timestamp: Date.now()
    };

    if (parsedProposal.unlockedEndingId) {
      this.stagedState.isStoryComplete = true;
      this.stagedState.unlockedEndingId = parsedProposal.unlockedEndingId;
    }

    this.status = 'GENERATED';
  }

  public verifyTransition(): void {
    if (this.status !== 'GENERATED' || !this.newTurnRecord) {
      throw new Error(`Cannot verify transaction in status "${this.status}".`);
    }

    // Prepare full proposed state
    const candidateState: EngineAuthoritativeState = {
      ...this.stagedState,
      version: this.originalState.version + 1,
      currentTurnNumber: this.originalState.currentTurnNumber + 1,
      currentChapter: this.newTurnRecord.chapterNumber,
      turns: [...this.originalState.turns, this.newTurnRecord],
      updatedAt: Date.now()
    };

    const transitionCheck = StoryValidator.validateTransition(this.originalState, candidateState);
    if (!transitionCheck.isValid) {
      this.status = 'FAILED';
      this.failureReason = `State transition invariant violation: ${transitionCheck.errors.join('; ')}`;
      throw new Error(this.failureReason);
    }

    this.stagedState = candidateState;
    this.status = 'VERIFIED';
  }

  public commit(): { committedState: EngineAuthoritativeState; newTurn: EngineTurnRecord } {
    if (this.status !== 'VERIFIED' || !this.newTurnRecord) {
      throw new Error(`Cannot commit transaction in unverified status "${this.status}".`);
    }

    this.status = 'COMMITTED';
    return {
      committedState: this.stagedState,
      newTurn: this.newTurnRecord
    };
  }

  public rollback(): EngineAuthoritativeState {
    this.status = 'FAILED';
    return this.originalState;
  }
}
