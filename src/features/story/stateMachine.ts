import { StoryState, InventoryItem } from '../../types/story';

export interface StateValidationResult {
  isValid: boolean;
  reason?: string;
}

export function validateActionFeasibility(
  state: StoryState,
  action: {
    requiredItem?: string;
    requiredStamina?: number;
    healthCost?: number;
  }
): StateValidationResult {
  if (state.isGameOver) {
    return { isValid: false, reason: 'The story has ended. Restart or load a prior chapter to continue.' };
  }

  if (state.health <= 0) {
    return { isValid: false, reason: 'Hero is incapacitated and cannot perform rigorous actions.' };
  }

  if (action.requiredStamina && state.stamina < action.requiredStamina) {
    return {
      isValid: false,
      reason: `Insufficient stamina! Requires ${action.requiredStamina} stamina, but you only have ${state.stamina}.`
    };
  }

  if (action.requiredItem) {
    const hasItem = state.inventory.some(item =>
      item.id.toLowerCase() === action.requiredItem!.toLowerCase() ||
      item.name.toLowerCase().includes(action.requiredItem!.toLowerCase())
    );
    if (!hasItem) {
      return {
        isValid: false,
        reason: `Required item "${action.requiredItem}" is missing from your inventory.`
      };
    }
  }

  return { isValid: true };
}

export function applyStateDelta(
  currentState: StoryState,
  delta: Partial<StoryState> & {
    itemsAdded?: InventoryItem[];
    itemsRemoved?: string[];
    consumeItemId?: string;
  }
): StoryState {
  const next: StoryState = {
    ...currentState,
    inventory: [...currentState.inventory],
    activeQuests: [...currentState.activeQuests],
    worldFlags: { ...currentState.worldFlags },
    npcTrust: { ...currentState.npcTrust },
    statusEffects: [...currentState.statusEffects]
  };

  // 1. Health adjustment with clamping
  if (typeof delta.health === 'number') {
    next.health = Math.max(0, Math.min(next.maxHealth, delta.health));
  }

  // 2. Stamina adjustment
  if (typeof delta.stamina === 'number') {
    next.stamina = Math.max(0, Math.min(100, delta.stamina));
  }

  // 3. Power level
  if (typeof delta.powerLevel === 'number') {
    next.powerLevel = Math.max(1, Math.min(100, delta.powerLevel));
  }

  // 4. Items added
  if (delta.itemsAdded && delta.itemsAdded.length > 0) {
    for (const newItem of delta.itemsAdded) {
      const existing = next.inventory.find(i => i.id === newItem.id);
      if (existing) {
        existing.quantity += newItem.quantity;
      } else {
        next.inventory.push({ ...newItem });
      }
    }
  }

  // 5. Items removed or consumed
  if (delta.itemsRemoved && delta.itemsRemoved.length > 0) {
    next.inventory = next.inventory.filter(i => !delta.itemsRemoved!.includes(i.id));
  }

  if (delta.consumeItemId) {
    const idx = next.inventory.findIndex(i => i.id === delta.consumeItemId);
    if (idx !== -1) {
      if (next.inventory[idx].quantity > 1) {
        next.inventory[idx].quantity -= 1;
      } else {
        next.inventory.splice(idx, 1);
      }
    }
  }

  // 6. Quests update
  if (delta.activeQuests) {
    next.activeQuests = delta.activeQuests;
  }

  // 7. NPC trust adjustments
  if (delta.npcTrust) {
    for (const [npc, trustValue] of Object.entries(delta.npcTrust)) {
      next.npcTrust[npc] = Math.max(-100, Math.min(100, trustValue));
    }
  }

  // 8. World flags
  if (delta.worldFlags) {
    next.worldFlags = { ...next.worldFlags, ...delta.worldFlags };
  }

  // 9. Timeline step
  if (typeof delta.timelineStep === 'number') {
    next.timelineStep = delta.timelineStep;
  } else {
    next.timelineStep += 1;
  }

  // 10. Check game over conditions
  if (next.health <= 0) {
    next.isGameOver = true;
    next.endingType = 'tragedy';
  }

  return next;
}
