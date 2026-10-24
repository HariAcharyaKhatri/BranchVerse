export interface WorldZone {
  id: string;
  name: string;
  dangerLevel: 'peaceful' | 'moderate' | 'perilous' | 'lethal';
  staminaCostMultiplier: number;
  description: string;
}

export const WORLD_ZONES: Record<string, WorldZone> = {
  haven: {
    id: 'haven',
    name: 'Safe Haven / Sanctuary',
    dangerLevel: 'peaceful',
    staminaCostMultiplier: 0.5,
    description: 'A protected settlement where heroes rest and recover.'
  },
  wilds: {
    id: 'wilds',
    name: 'Frontier Wilderness',
    dangerLevel: 'moderate',
    staminaCostMultiplier: 1.0,
    description: 'Untamed lands teeming with beasts and hidden ruins.'
  },
  dungeon: {
    id: 'dungeon',
    name: 'Ruins / Restricted Sector',
    dangerLevel: 'perilous',
    staminaCostMultiplier: 1.5,
    description: 'Dangerous territory guarded by lethal sentinels and traps.'
  },
  void_rift: {
    id: 'void_rift',
    name: 'The Epicenter / Void Rift',
    dangerLevel: 'lethal',
    staminaCostMultiplier: 2.0,
    description: 'Cataclysmic anomaly where reality unravels and death is imminent.'
  }
};

export class WorldRules {
  public static getZoneDanger(zoneId: string): WorldZone {
    return WORLD_ZONES[zoneId] || WORLD_ZONES.wilds;
  }

  public static calculateStaminaCost(baseCost: number, zoneId: string): number {
    const zone = this.getZoneDanger(zoneId);
    return Math.round(baseCost * zone.staminaCostMultiplier);
  }
}
