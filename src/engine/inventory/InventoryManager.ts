import { EngineInventoryItem } from '../types/engine.types';

export interface ItemMutationResult {
  success: boolean;
  message: string;
  item?: EngineInventoryItem;
}

export class InventoryManager {
  private items: Map<string, EngineInventoryItem> = new Map();

  constructor(initialItems: EngineInventoryItem[] = []) {
    for (const item of initialItems) {
      this.items.set(item.id, { ...item });
    }
  }

  public getItems(): EngineInventoryItem[] {
    return Array.from(this.items.values()).map(i => ({ ...i }));
  }

  public getItem(idOrName: string): EngineInventoryItem | undefined {
    const direct = this.items.get(idOrName);
    if (direct) return { ...direct };

    const lower = idOrName.toLowerCase();
    for (const item of this.items.values()) {
      if (item.name.toLowerCase() === lower || item.id.toLowerCase() === lower) {
        return { ...item };
      }
    }
    return undefined;
  }

  public hasItem(idOrName: string, minQuantity: number = 1): boolean {
    const item = this.getItem(idOrName);
    return !!item && item.quantity >= minQuantity;
  }

  public addItem(item: EngineInventoryItem): ItemMutationResult {
    const existing = this.getItem(item.id) || this.getItem(item.name);

    if (existing) {
      if (existing.isUnique || item.isUnique) {
        return {
          success: false,
          message: `Unique item "${item.name}" already exists in inventory. Cannot duplicate unique relics.`
        };
      }
      const updated: EngineInventoryItem = {
        ...existing,
        quantity: existing.quantity + (item.quantity || 1)
      };
      this.items.set(updated.id, updated);
      return {
        success: true,
        message: `Added ${item.quantity || 1} to existing ${existing.name}. Total: ${updated.quantity}`,
        item: updated
      };
    }

    const newItem: EngineInventoryItem = {
      ...item,
      quantity: item.isUnique ? 1 : Math.max(1, item.quantity || 1),
      isEquipped: !!item.isEquipped
    };
    this.items.set(newItem.id, newItem);
    return {
      success: true,
      message: `Added new item "${newItem.name}" to inventory.`,
      item: newItem
    };
  }

  public removeItem(idOrName: string, quantityToRemove: number = 1): ItemMutationResult {
    const existing = this.getItem(idOrName);
    if (!existing) {
      return {
        success: false,
        message: `Item "${idOrName}" not found in inventory.`
      };
    }

    if (existing.quantity <= quantityToRemove) {
      this.items.delete(existing.id);
      return {
        success: true,
        message: `Removed all of "${existing.name}" from inventory.`
      };
    } else {
      const updated: EngineInventoryItem = {
        ...existing,
        quantity: existing.quantity - quantityToRemove
      };
      this.items.set(updated.id, updated);
      return {
        success: true,
        message: `Removed ${quantityToRemove} of "${existing.name}". Remaining: ${updated.quantity}`,
        item: updated
      };
    }
  }

  public consumeItem(idOrName: string): ItemMutationResult {
    const existing = this.getItem(idOrName);
    if (!existing) {
      return { success: false, message: `Item "${idOrName}" is not in inventory.` };
    }
    if (existing.category !== 'consumable') {
      return {
        success: false,
        message: `Item "${existing.name}" is a ${existing.category} and cannot be consumed.`
      };
    }

    this.removeItem(existing.id, 1);
    return {
      success: true,
      message: `Consumed "${existing.name}". ${existing.effectDescription || ''}`,
      item: existing
    };
  }

  public toggleEquip(idOrName: string): ItemMutationResult {
    const existing = this.getItem(idOrName);
    if (!existing) {
      return { success: false, message: `Item "${idOrName}" is not in inventory.` };
    }
    if (existing.category !== 'weapon' && existing.category !== 'artifact') {
      return {
        success: false,
        message: `Item "${existing.name}" cannot be equipped.`
      };
    }

    const updated: EngineInventoryItem = {
      ...existing,
      isEquipped: !existing.isEquipped
    };
    this.items.set(updated.id, updated);
    return {
      success: true,
      message: updated.isEquipped ? `Equipped "${updated.name}".` : `Unequipped "${updated.name}".`,
      item: updated
    };
  }

  public clone(): InventoryManager {
    return new InventoryManager(this.getItems());
  }
}
