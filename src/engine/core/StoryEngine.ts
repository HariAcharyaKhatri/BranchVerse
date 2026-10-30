import { HeroProfile } from '../../types/character';
import { StoryDocument, StorySettings } from '../../types/story';
import { EngineAuthoritativeState } from '../types/engine.types';
import { StorySession } from './StorySession';
import { NarrativeProvider } from '../providers/NarrativeProvider';
import { LocalNarrativeProvider } from '../providers/LocalNarrativeProvider';

export interface InitializeStoryParams {
  hero: HeroProfile;
  worldId: string;
  worldName: string;
  genres: string[];
  settings: StorySettings;
  title?: string;
  narrativeProvider?: NarrativeProvider;
}

export class StoryEngine {
  private activeSessions: Map<string, StorySession> = new Map();
  private defaultNarrativeProvider: NarrativeProvider;

  constructor(defaultNarrativeProvider?: NarrativeProvider) {
    this.defaultNarrativeProvider = defaultNarrativeProvider || new LocalNarrativeProvider();
  }

  /**
   * Initializes a brand-new story session with full authoritative state.
   */
  public createStorySession(params: InitializeStoryParams): StorySession {
    const storyId = `story_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = Date.now();

    const initialState: EngineAuthoritativeState = {
      version: 1,
      storyId,
      title: params.title || `${params.hero.name}'s Awakening`,
      genre: params.genres[0] || 'Fantasy',
      genres: params.genres,
      worldId: params.worldId,
      worldName: params.worldName,
      tone: params.settings.tone,
      difficulty: params.settings.difficulty,
      pacing: params.settings.pacing,

      currentChapter: 1,
      currentSceneId: 'prologue_awakening',
      currentTurnNumber: 0,
      currentLocation: params.hero.origin || 'Frontier Citadel',
      phase: 'opening',

      hero: params.hero,
      health: 100,
      maxHealth: 100,
      stamina: 100,
      powerLevel: params.hero.powerLevel || 10,
      statusEffects: [],

      characters: {},
      inventory: [
        {
          id: 'item_starting_weapon',
          name: params.hero.weapons[0] || 'Iron Sidearm',
          quantity: 1,
          category: 'weapon',
          description: 'A reliable arm honed through countless skirmishes.',
          isUnique: false,
          isEquipped: true
        },
        {
          id: 'item_healing_stim',
          name: 'Restorative Salve',
          quantity: 2,
          category: 'consumable',
          description: 'Herbal compound that revitalizes fatigue (+35 Stamina).',
          isUnique: false,
          isEquipped: false,
          effectDescription: 'Restores 35 Stamina on consumption.'
        }
      ],
      quests: {
        quest_main_awakening: {
          id: 'quest_main_awakening',
          title: `The Call of ${params.worldName}`,
          description: `Unravel the anomaly threatening ${params.worldName}.`,
          giverId: 'npc_mentor',
          giverName: 'The Chronicler',
          category: 'main',
          status: 'active',
          objectives: [
            {
              id: 'obj_1',
              description: 'Investigate the strange resonance at the perimeter.',
              isCompleted: false
            }
          ],
          cluesCollected: [],
          rewardItemIds: ['item_ancient_relic'],
          unlockedAtTurn: 1
        }
      },
      facts: [],
      delayedEvents: [],
      causalHistory: [],
      worldFlags: {
        awakening_commenced: true
      },

      turns: [],
      isStoryComplete: false,
      randomSeed: now,
      createdAt: now,
      updatedAt: now
    };

    const session = new StorySession(
      initialState,
      params.narrativeProvider || this.defaultNarrativeProvider
    );

    this.activeSessions.set(storyId, session);
    return session;
  }

  /**
   * Loads an existing StoryDocument into a live StorySession.
   */
  public loadStorySession(doc: StoryDocument, provider?: NarrativeProvider): StorySession {
    const session = StorySession.fromStoryDocument(
      doc,
      provider || this.defaultNarrativeProvider
    );
    this.activeSessions.set(doc.id, session);
    return session;
  }

  /**
   * Retrieves an active in-memory session by storyId.
   */
  public getSession(storyId: string): StorySession | undefined {
    return this.activeSessions.get(storyId);
  }

  /**
   * Evicts an in-memory session.
   */
  public closeSession(storyId: string): void {
    this.activeSessions.delete(storyId);
  }
}

export const globalStoryEngine = new StoryEngine();
