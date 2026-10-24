import { EngineAuthoritativeState } from '../types/engine.types';
import { WorldFactStore } from '../world/WorldFactStore';

export interface NarrativePromptContext {
  storyTitle: string;
  genre: string;
  worldName: string;
  tone: string;
  difficulty: string;
  chapterNumber: number;
  currentTurnNumber: number;
  location: string;
  hero: {
    name: string;
    race: string;
    origin: string;
    alignment: string;
    powers: string[];
    weapons: string[];
    health: number;
    maxHealth: number;
    stamina: number;
    powerLevel: number;
    statusEffects: string[];
  };
  inventoryItems: string[];
  activeQuests: Array<{
    id: string;
    title: string;
    giver: string;
    objectives: string[];
    cluesCollected: string[];
  }>;
  notableCharactersNearby: Array<{
    id: string;
    name: string;
    role: string;
    isAlive: boolean;
    currentEmotion: string;
    trustScore: number;
  }>;
  recentFacts: string[];
  recentTurnsSummary: Array<{
    chapter: number;
    sceneTitle: string;
    actionTaken?: string;
  }>;
}

export class NarrativeContextBuilder {
  /**
   * Assembles a bounded context summary from authoritative state.
   */
  public static build(
    state: EngineAuthoritativeState,
    factStore: WorldFactStore
  ): NarrativePromptContext {
    // 1. Get recent facts (up to 8 newest)
    const allFacts = factStore.getAllFacts();
    const recentFacts = allFacts
      .slice(-8)
      .map(f => `${f.subject} ${f.predicate} ${f.object} (witnesses: ${f.witnessedBy.join(', ') || 'none'})`);

    // 2. Active quests
    const activeQuests = Object.values(state.quests)
      .filter(q => q.status === 'active')
      .map(q => ({
        id: q.id,
        title: q.title,
        giver: q.giverName,
        objectives: q.objectives.map(o => `${o.description} [${o.isCompleted ? 'DONE' : 'PENDING'}]`),
        cluesCollected: q.cluesCollected
      }));

    // 3. Characters nearby or relevant
    const notableCharactersNearby = Object.values(state.characters).map(c => ({
      id: c.id,
      name: c.name,
      role: c.role,
      isAlive: c.isAlive,
      currentEmotion: c.currentEmotion,
      trustScore: c.trustScore
    }));

    // 4. Bounded rolling history (last 4 turns)
    const recentTurnsSummary = state.turns.slice(-4).map(t => ({
      chapter: t.chapterNumber,
      sceneTitle: t.sceneTitle,
      actionTaken: t.playerInput?.customActionText || t.playerInput?.choiceId
    }));

    return {
      storyTitle: state.title,
      genre: state.genre || (state.genres && state.genres[0]) || 'Fantasy',
      worldName: state.worldName,
      tone: state.tone,
      difficulty: state.difficulty,
      chapterNumber: state.currentChapter,
      currentTurnNumber: state.currentTurnNumber,
      location: state.currentLocation,
      hero: {
        name: state.hero.name,
        race: state.hero.race,
        origin: state.hero.origin,
        alignment: state.hero.alignment,
        powers: state.hero.powers,
        weapons: state.hero.weapons,
        health: state.health,
        maxHealth: state.maxHealth,
        stamina: state.stamina,
        powerLevel: state.powerLevel,
        statusEffects: state.statusEffects
      },
      inventoryItems: state.inventory.map(i => `${i.name} (x${i.quantity})`),
      activeQuests,
      notableCharactersNearby,
      recentFacts,
      recentTurnsSummary
    };
  }
}
