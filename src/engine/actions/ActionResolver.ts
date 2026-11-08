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
        consequences.push('Rested and gathered focus, surveying the surroundings.');
        break;
      }

      case 'combat': {
        if (state.powerLevel < 25) {
          consequences.push('Engaged in fierce combat against overwhelming odds.');
        } else {
          // Combat victory
          delta.powerLevel = Math.min(100, state.powerLevel + 2);
          consequences.push('Fought decisively, honing battle prowess (+2 Power).');
        }
        break;
      }

      case 'stealth': {
        consequences.push('Moved unseen through shadows, maintaining keen vigilance.');
        break;
      }

      case 'travel': {
        if (action.target) {
          delta.currentLocation = action.target;
          consequences.push(`Traveled toward "${action.target}".`);
        } else {
          consequences.push('Advanced deeper into the uncharted terrain.');
        }
        break;
      }

      case 'talk':
      case 'persuade': {
        consequences.push('Engaged in dialogue, assessing intentions and forging social bonds.');
        break;
      }

      case 'investigate': {
        consequences.push('Scoured the surroundings for clues, tracks, and latent anomalies.');
        break;
      }

      default: {
        consequences.push(`Executed action: "${action.rawText}".`);
        break;
      }
    }

    // Story-First Invariant Guards on State Alteration
    if (action.isGrandClaim) {
      consequences.push('Expressed grand claim: established resources and numbers remain unchanged.');
    }
    if (action.isInstantVictoryOrGodMode) {
      consequences.push('Attempted instant god-mode: progression must be earned through story trials.');
    }
    if (action.isTimeJumpAttempt) {
      consequences.push('Attempted time jump: immediate unresolved stakes must first be addressed.');
    }
    if (action.isOutOfStory) {
      consequences.push('Expressed out-of-story intent: filtered in-universe without altering world facts.');
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
