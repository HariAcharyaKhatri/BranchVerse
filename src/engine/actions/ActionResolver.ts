import {
  CausalLogEntry,
  EngineAuthoritativeState,
  ParsedAction
} from '../types/engine.types';

export interface ActionResolutionResult {
  stateDelta: Partial<EngineAuthoritativeState>;
  consequenceSummaries: string[];
  causalLog: CausalLogEntry;
}

export class ActionResolver {
  /**
   * Computes authoritative state consequences from a parsed player action.
   */
  public static resolve(
    state: EngineAuthoritativeState,
    action: ParsedAction
  ): ActionResolutionResult {
    const delta: Partial<EngineAuthoritativeState> = {};
    const consequences: string[] = [];

    switch (action.intent) {
      case 'rest': {
        const staminaGain = Math.min(35, 100 - state.stamina);
        delta.stamina = state.stamina + staminaGain;
        consequences.push(`Restored ${staminaGain} Stamina and focus through rest.`);
        break;
      }

      case 'combat': {
        const staminaCost = 15;
        delta.stamina = Math.max(0, state.stamina - staminaCost);
        if (state.powerLevel < 25) {
          const extraStrain = 10;
          delta.stamina = Math.max(0, delta.stamina - extraStrain);
          consequences.push(`Engaged in fierce combat! Spent ${staminaCost + extraStrain} stamina against overwhelming odds.`);
        } else {
          // Combat victory
          delta.powerLevel = Math.min(100, state.powerLevel + 2);
          consequences.push(`Fought decisively! Spent ${staminaCost} stamina, honing battle prowess (+2 Power).`);
        }
        break;
      }

      case 'stealth': {
        const staminaCost = 10;
        delta.stamina = Math.max(0, state.stamina - staminaCost);
        consequences.push(`Moved unseen through shadows, expending ${staminaCost} stamina to maintain vigilance.`);
        break;
      }

      case 'travel': {
        const staminaCost = 10;
        delta.stamina = Math.max(0, state.stamina - staminaCost);
        if (action.target) {
          delta.currentLocation = action.target;
          consequences.push(`Traveled toward "${action.target}", expending ${staminaCost} stamina.`);
        } else {
          consequences.push(`Advanced deeper into the uncharted terrain (-${staminaCost} stamina).`);
        }
        break;
      }

      case 'talk':
      case 'persuade': {
        const staminaCost = 5;
        delta.stamina = Math.max(0, state.stamina - staminaCost);
        consequences.push(`Engaged in dialogue, assessing intentions and forging social bonds.`);
        break;
      }

      case 'investigate': {
        const staminaCost = 5;
        delta.stamina = Math.max(0, state.stamina - staminaCost);
        consequences.push(`Scoured the surroundings for clues, tracks, and latent anomalies.`);
        break;
      }

      default: {
        const staminaCost = 5;
        delta.stamina = Math.max(0, state.stamina - staminaCost);
        consequences.push(`Executed action: "${action.rawText}" (-${staminaCost} stamina).`);
        break;
      }
    }

    const causalLog: CausalLogEntry = {
      id: `cause_${state.currentTurnNumber}_${Date.now()}`,
      turnNumber: state.currentTurnNumber,
      actionTaken: action.rawText,
      consequences: [...consequences],
      stateDeltaSummary: consequences.join(' '),
      timestamp: Date.now()
    };

    return {
      stateDelta: delta,
      consequenceSummaries: consequences,
      causalLog
    };
  }
}
