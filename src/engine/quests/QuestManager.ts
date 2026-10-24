import { QuestEntity } from '../types/engine.types';

export class QuestManager {
  private quests: Map<string, QuestEntity> = new Map();

  constructor(initialQuests: Record<string, QuestEntity> = {}) {
    for (const [id, q] of Object.entries(initialQuests)) {
      this.quests.set(id, {
        ...q,
        objectives: q.objectives.map(o => ({ ...o, requiredClueIds: o.requiredClueIds ? [...o.requiredClueIds] : [] })),
        cluesCollected: [...q.cluesCollected],
        rewardItemIds: q.rewardItemIds ? [...q.rewardItemIds] : [],
        trustReward: q.trustReward ? { ...q.trustReward } : {}
      });
    }
  }

  public getQuest(id: string): QuestEntity | undefined {
    return this.quests.get(id);
  }

  public getAllQuests(): QuestEntity[] {
    return Array.from(this.quests.values());
  }

  public getActiveQuests(): QuestEntity[] {
    return this.getAllQuests().filter(q => q.status === 'active');
  }

  public getCompletedQuests(): QuestEntity[] {
    return this.getAllQuests().filter(q => q.status === 'completed');
  }

  public toRecord(): Record<string, QuestEntity> {
    const result: Record<string, QuestEntity> = {};
    for (const [id, q] of this.quests.entries()) {
      result[id] = {
        ...q,
        objectives: q.objectives.map(o => ({ ...o, requiredClueIds: o.requiredClueIds ? [...o.requiredClueIds] : [] })),
        cluesCollected: [...q.cluesCollected],
        rewardItemIds: q.rewardItemIds ? [...q.rewardItemIds] : [],
        trustReward: q.trustReward ? { ...q.trustReward } : {}
      };
    }
    return result;
  }

  public registerQuest(quest: QuestEntity): void {
    this.quests.set(quest.id, {
      ...quest,
      objectives: quest.objectives.map(o => ({ ...o, requiredClueIds: o.requiredClueIds ? [...o.requiredClueIds] : [] })),
      cluesCollected: [...quest.cluesCollected],
      rewardItemIds: quest.rewardItemIds ? [...quest.rewardItemIds] : [],
      trustReward: quest.trustReward ? { ...quest.trustReward } : {}
    });
  }

  public startQuest(id: string, currentTurn: number): boolean {
    const quest = this.quests.get(id);
    if (!quest || quest.status !== 'locked') return false;
    quest.status = 'active';
    quest.unlockedAtTurn = currentTurn;
    return true;
  }

  public completeObjective(questId: string, objectiveId: string, currentTurn: number): {
    objectiveCompleted: boolean;
    questCompleted: boolean;
  } {
    const quest = this.quests.get(questId);
    if (!quest || quest.status !== 'active') {
      return { objectiveCompleted: false, questCompleted: false };
    }

    const obj = quest.objectives.find(o => o.id === objectiveId);
    if (!obj || obj.isCompleted) {
      return { objectiveCompleted: false, questCompleted: false };
    }

    obj.isCompleted = true;
    const allDone = quest.objectives.every(o => o.isCompleted);
    if (allDone) {
      quest.status = 'completed';
      quest.completedAtTurn = currentTurn;
      return { objectiveCompleted: true, questCompleted: true };
    }

    return { objectiveCompleted: true, questCompleted: false };
  }

  public addClue(questId: string, clueText: string, currentTurn: number): { added: boolean; questCompleted: boolean } {
    const quest = this.quests.get(questId);
    if (!quest) return { added: false, questCompleted: false };

    if (!quest.cluesCollected.includes(clueText)) {
      quest.cluesCollected.push(clueText);
    }

    // Auto-check objectives that require clues
    for (const obj of quest.objectives) {
      if (!obj.isCompleted && obj.requiredClueIds && obj.requiredClueIds.length > 0) {
        const hasAllClues = obj.requiredClueIds.every(cid => quest.cluesCollected.includes(cid));
        if (hasAllClues) {
          obj.isCompleted = true;
        }
      }
    }

    const allDone = quest.objectives.every(o => o.isCompleted);
    if (allDone && quest.status === 'active') {
      quest.status = 'completed';
      quest.completedAtTurn = currentTurn;
      return { added: true, questCompleted: true };
    }

    return { added: true, questCompleted: false };
  }

  public failQuest(id: string): boolean {
    const quest = this.quests.get(id);
    if (!quest || quest.status === 'completed') return false;
    quest.status = 'failed';
    return true;
  }

  public clone(): QuestManager {
    return new QuestManager(this.toRecord());
  }
}
