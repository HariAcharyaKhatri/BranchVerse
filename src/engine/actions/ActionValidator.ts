import { ActionPreconditionCheck, EngineAuthoritativeState, ParsedAction } from '../types/engine.types';
import { WorldFactStore } from '../world/WorldFactStore';

export class ActionValidator {
  /**
   * Validates if a parsed action can be executed in the current authoritative game state.
   */
  public static validate(
    state: EngineAuthoritativeState,
    action: ParsedAction,
    factStore: WorldFactStore,
    options?: {
      requiredItem?: string;
      requiredStamina?: number;
    }
  ): ActionPreconditionCheck {
    // 1. Is story already finished?
    if (state.isStoryComplete) {
      return {
        isValid: false,
        reason: 'This chronicle has reached its final conclusion. Start a new journey or load an earlier save to explore alternate paths.'
      };
    }

    // 2. Is protagonist alive?
    if (state.health <= 0) {
      return {
        isValid: false,
        reason: 'Your protagonist is incapacitated. You must revive or restart to take further action.'
      };
    }

    // 3. Status effects restricting action
    if (state.statusEffects.some(s => s.toLowerCase().includes('unconscious') || s.toLowerCase().includes('paralyzed'))) {
      return {
        isValid: false,
        reason: 'You are currently paralyzed or unconscious and cannot act.',
        suggestedCorrection: 'Rest or wait for the effect to wear off.'
      };
    }

    // 4. Required stamina
    const staminaCost = options?.requiredStamina ?? this.estimateStaminaRequirement(action.intent);
    if (action.intent !== 'rest' && state.stamina < staminaCost) {
      return {
        isValid: false,
        reason: `Exhaustion! This action requires at least ${staminaCost} stamina, but you only have ${state.stamina}.`,
        suggestedCorrection: 'Take a moment to rest or use an energy draught.'
      };
    }

    // 5. Required Item Check
    const requiredItemName = options?.requiredItem || action.relevantItemName;
    if (requiredItemName && (action.intent === 'use_item' || options?.requiredItem)) {
      const hasItem = state.inventory.some(item =>
        item.id.toLowerCase() === requiredItemName.toLowerCase() ||
        item.name.toLowerCase().includes(requiredItemName.toLowerCase()) ||
        requiredItemName.toLowerCase().includes(item.name.toLowerCase())
      );
      if (!hasItem) {
        return {
          isValid: false,
          reason: `Required item "${requiredItemName}" is missing from your inventory.`,
          suggestedCorrection: 'Check your inventory or seek the item through exploration.'
        };
      }
    }

    // 6. World-fact contradiction check on target
    if (action.target) {
      const targetName = action.target.trim();
      const isDead = factStore.isEntityDeadOrDestroyed(targetName);

      // Check character manager status
      let npcDead = false;
      for (const char of Object.values(state.characters)) {
        if (
          (char.name.toLowerCase().includes(targetName.toLowerCase()) ||
           targetName.toLowerCase().includes(char.name.toLowerCase())) &&
          !char.isAlive
        ) {
          npcDead = true;
          break;
        }
      }

      if (isDead || npcDead) {
        if (action.intent === 'talk' || action.intent === 'persuade') {
          return {
            isValid: false,
            reason: `Cannot converse with "${targetName}": they are already deceased in this world.`,
            suggestedCorrection: 'Speak with another companion or investigate the surroundings instead.'
          };
        }
        if (action.intent === 'combat') {
          return {
            isValid: false,
            reason: `Target "${targetName}" is already defeated or dead.`,
            suggestedCorrection: 'Redirect your blades toward active threats.'
          };
        }
      }
    }

    return { isValid: true };
  }

  private static estimateStaminaRequirement(intent: ParsedAction['intent']): number {
    switch (intent) {
      case 'combat':
        return 15;
      case 'stealth':
        return 10;
      case 'travel':
        return 10;
      case 'persuade':
        return 5;
      case 'investigate':
        return 5;
      case 'rest':
        return 0;
      case 'use_item':
        return 0;
      default:
        return 5;
    }
  }
}
