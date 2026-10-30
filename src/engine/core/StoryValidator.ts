import { EngineAuthoritativeState } from '../types/engine.types';

export interface InvariantValidationResult {
  isValid: boolean;
  errors: string[];
}

export class StoryValidator {
  /**
   * Validates internal integrity and invariant rules for an authoritative engine state.
   */
  public static validateStateInvariants(state: EngineAuthoritativeState): InvariantValidationResult {
    const errors: string[] = [];

    // 1. Stamina constraints
    if (state.stamina < 0 || state.stamina > 100) {
      errors.push(`Stamina must be between 0 and 100 (current: ${state.stamina}).`);
    }

    // 3. Power level
    if (state.powerLevel < 1 || state.powerLevel > 100) {
      errors.push(`Power level must be between 1 and 100 (current: ${state.powerLevel}).`);
    }

    // 4. Unique items invariant
    const seenUniqueIds = new Set<string>();
    for (const item of state.inventory) {
      if (item.isUnique) {
        if (seenUniqueIds.has(item.id)) {
          errors.push(`Duplicate unique item detected: "${item.name}" (ID: ${item.id}).`);
        }
        seenUniqueIds.add(item.id);
        if (item.quantity > 1) {
          errors.push(`Unique item "${item.name}" cannot have quantity > 1 (current: ${item.quantity}).`);
        }
      }
    }

    // 5. NPC consistency (dead characters cannot have active speaking roles or positive vitality)
    for (const char of Object.values(state.characters)) {
      if (!char.isAlive && char.role === 'companion') {
        // Warning or error if marked as active companion while dead
        errors.push(`Deceased character "${char.name}" cannot remain an active companion.`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates state transition between pre-state and post-state.
   */
  public static validateTransition(
    before: EngineAuthoritativeState,
    after: EngineAuthoritativeState
  ): InvariantValidationResult {
    const errors: string[] = [];

    // Version must increment
    if (after.version <= before.version) {
      errors.push(`State version did not monotonically increment (${before.version} -> ${after.version}).`);
    }

    // Story ID must never change
    if (after.storyId !== before.storyId) {
      errors.push(`Story ID mutated during transition (${before.storyId} -> ${after.storyId}).`);
    }

    // Turn number must advance
    if (after.currentTurnNumber < before.currentTurnNumber) {
      errors.push(`Turn number decreased from ${before.currentTurnNumber} to ${after.currentTurnNumber}.`);
    }

    // Validate post-state invariants
    const postInvariants = this.validateStateInvariants(after);
    if (!postInvariants.isValid) {
      errors.push(...postInvariants.errors);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
