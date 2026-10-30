import { HeroProfile } from '../../types/character';

export type TurnLifecycleStatus =
  | 'RECEIVED'
  | 'VALIDATED'
  | 'PLANNED'
  | 'GENERATED'
  | 'VERIFIED'
  | 'COMMITTED'
  | 'FAILED';

export type ActionIntentType =
  | 'talk'
  | 'investigate'
  | 'travel'
  | 'combat'
  | 'use_item'
  | 'trade'
  | 'persuade'
  | 'stealth'
  | 'interact'
  | 'quest'
  | 'rest'
  | 'creative';

export interface PlayerActionInput {
  turnId: string;
  choiceId?: string;
  customActionText?: string;
  idempotencyKey?: string;
  timestamp: number;
}

export interface ParsedAction {
  rawText: string;
  intent: ActionIntentType;
  target?: string;
  method?: string;
  relevantItemName?: string;
  desiredOutcome?: string;
  isCustomAction: boolean;
  confidence: number;
}

export interface ActionPreconditionCheck {
  isValid: boolean;
  reason?: string;
  suggestedCorrection?: string;
}

export type FactCategory =
  | 'entity_status'    // e.g. alive, dead, injured
  | 'item_possession'  // e.g. who holds the Moon Stone
  | 'location'         // e.g. character currently at Silver Spire
  | 'secret_revealed'  // e.g. Lord Anthony is a traitor
  | 'promise_made'     // e.g. Hero swore to protect Ronald's daughter
  | 'quest_milestone'  // e.g. Void Rift core fractured
  | 'historical_event';// e.g. Valen's Crossing was defended

export interface WorldFact {
  id: string;
  entityId?: string;
  subject: string;
  predicate: string;
  object: string;
  category: FactCategory;
  witnessedBy: string[]; // character IDs who know this fact
  turnNumber: number;
  timestamp: number;
  isImmutable: boolean;
}

export interface CharacterEntity {
  id: string;
  name: string;
  role: 'protagonist' | 'companion' | 'mentor' | 'rival' | 'antagonist' | 'civilian';
  isAlive: boolean;
  personalityTraits: string[];
  goals: string[];
  speakingStyle: string;
  currentEmotion: 'calm' | 'furious' | 'mysterious' | 'terrified' | 'warm';
  currentLocation: string;
  knownFactIds: string[];
  trustScore: number;    // -100 to +100
  affinityScore: number; // -100 to +100
  inventory: string[];   // item IDs held by this NPC
}

export interface QuestObjective {
  id: string;
  description: string;
  isCompleted: boolean;
  requiredClueIds?: string[];
}

export interface QuestEntity {
  id: string;
  title: string;
  description: string;
  giverId: string;
  giverName: string;
  category: 'main' | 'side' | 'hidden';
  status: 'locked' | 'active' | 'completed' | 'failed';
  objectives: QuestObjective[];
  cluesCollected: string[];
  rewardItemIds?: string[];
  trustReward?: Record<string, number>;
  unlockedAtTurn?: number;
  completedAtTurn?: number;
}

export interface EngineInventoryItem {
  id: string;
  name: string;
  quantity: number;
  category: 'weapon' | 'consumable' | 'artifact' | 'key_item' | 'material';
  description: string;
  isUnique: boolean;
  isEquipped: boolean;
  effectDescription?: string;
  requiredStamina?: number;
}

export interface DelayedEvent {
  id: string;
  triggerTurnNumber: number;
  preconditionFact?: {
    subject: string;
    predicate: string;
    object: string;
  };
  narrativeHook: string;
  stateDelta: Partial<EngineAuthoritativeState>;
  status: 'pending' | 'triggered' | 'cancelled';
  createdAtTurn: number;
}

export interface CausalLogEntry {
  id: string;
  turnNumber: number;
  actionTaken: string;
  consequences: string[];
  stateDeltaSummary: string;
  timestamp: number;
}

export interface EndingDefinition {
  id: string;
  title: string;
  synopsis: string;
  type: 'victory' | 'tragedy' | 'secret' | 'open';
  requiredFlags?: Record<string, boolean | string | number>;
  requiredCompletedQuests?: string[];
  minimumTrustWith?: Record<string, number>;
}

export interface EngineTurnRecord {
  turnId: string;
  chapterNumber: number;
  sceneTitle: string;
  narrativeText: string;
  dialogues: Array<{
    speaker: string;
    text: string;
    emotion?: 'calm' | 'furious' | 'mysterious' | 'terrified' | 'warm';
  }>;
  ambientVisual?: string;
  choices: Array<{
    choiceId: string;
    text: string;
    consequenceHint?: string;
    riskLevel?: 'safe' | 'moderate' | 'perilous';
    requiredItem?: string;
    requiredStamina?: number;
    actionIntent?: ActionIntentType;
  }>;
  playerInput?: PlayerActionInput;
  appliedConsequences?: string[];
  stateSnapshotVersion: number;
  timestamp: number;
}

export interface EngineAuthoritativeState {
  version: number;
  storyId: string;
  title: string;
  genre: string;
  genres: string[];
  worldId: string;
  worldName: string;
  tone: string;
  difficulty: string;
  pacing: string;

  // Progression
  currentChapter: number;
  currentSceneId: string;
  currentTurnNumber: number;
  currentLocation: string;
  phase: 'opening' | 'exploration' | 'rising_tension' | 'climax' | 'resolution' | 'epilogue';

  // Protagonist
  hero: HeroProfile;
  health?: number;
  maxHealth?: number;
  stamina: number;
  powerLevel: number;
  statusEffects: string[];

  // Subsystems
  characters: Record<string, CharacterEntity>;
  inventory: EngineInventoryItem[];
  quests: Record<string, QuestEntity>;
  facts: WorldFact[];
  delayedEvents: DelayedEvent[];
  causalHistory: CausalLogEntry[];
  worldFlags: Record<string, boolean | string | number>;

  // Turns ledger
  turns: EngineTurnRecord[];

  // Ending status
  isStoryComplete: boolean;
  unlockedEndingId?: string;

  // Metadata
  randomSeed: number;
  createdAt: number;
  updatedAt: number;
}
