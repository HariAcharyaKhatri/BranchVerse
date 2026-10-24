import { EndingDefinition, EngineAuthoritativeState } from '../types/engine.types';

export const STANDARD_ENDINGS: EndingDefinition[] = [
  {
    id: 'ending_heroic_victory',
    title: 'The Dawn of Renewal',
    synopsis: 'With courage and tactical wisdom, the realm was preserved. Songs will echo your name for generations.',
    type: 'victory',
    requiredFlags: {
      rift_sealed: true
    }
  },
  {
    id: 'ending_secret_master',
    title: 'Shadow Sovereign',
    synopsis: 'By gathering every forgotten relic and earning the unwavering loyalty of key conspirators, you claimed mastery over both light and darkness.',
    type: 'secret',
    requiredFlags: {
      all_relics_gathered: true
    }
  },
  {
    id: 'ending_tragic_sacrifice',
    title: 'The Fallen Guardian',
    synopsis: 'You stood alone at the gate, buying time for your allies to survive while your own spark faded into the aether.',
    type: 'tragedy',
    requiredFlags: {
      ultimate_sacrifice: true
    }
  },
  {
    id: 'ending_open_wanderer',
    title: 'The Eternal Horizon',
    synopsis: 'The immediate crisis has settled, but the wide world still calls to your restless spirit.',
    type: 'open'
  }
];

export class EndingManager {
  private endings: Map<string, EndingDefinition> = new Map();

  constructor(customEndings: EndingDefinition[] = []) {
    for (const ending of [...STANDARD_ENDINGS, ...customEndings]) {
      this.endings.set(ending.id, { ...ending });
    }
  }

  public registerEnding(ending: EndingDefinition): void {
    this.endings.set(ending.id, { ...ending });
  }

  public getEnding(id: string): EndingDefinition | undefined {
    return this.endings.get(id);
  }

  public evaluateEligibleEndings(state: EngineAuthoritativeState): EndingDefinition[] {
    const eligible: EndingDefinition[] = [];

    for (const ending of this.endings.values()) {
      let isMatch = true;

      // Check required flags
      if (ending.requiredFlags) {
        for (const [flagKey, expectedVal] of Object.entries(ending.requiredFlags)) {
          if (state.worldFlags[flagKey] !== expectedVal) {
            isMatch = false;
            break;
          }
        }
      }
      if (!isMatch) continue;

      // Check completed quests
      if (ending.requiredCompletedQuests && ending.requiredCompletedQuests.length > 0) {
        for (const questId of ending.requiredCompletedQuests) {
          const quest = state.quests[questId];
          if (!quest || quest.status !== 'completed') {
            isMatch = false;
            break;
          }
        }
      }
      if (!isMatch) continue;

      // Check minimum trust with NPCs
      if (ending.minimumTrustWith) {
        for (const [npcId, minTrust] of Object.entries(ending.minimumTrustWith)) {
          const char = state.characters[npcId];
          if (!char || char.trustScore < minTrust) {
            isMatch = false;
            break;
          }
        }
      }
      if (!isMatch) continue;

      eligible.push(ending);
    }

    return eligible;
  }
}
