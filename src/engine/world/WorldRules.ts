export interface WorldZone {
  id: string;
  name: string;
  dangerLevel: 'peaceful' | 'moderate' | 'perilous' | 'lethal';
  description: string;
}

export const WORLD_ZONES: Record<string, WorldZone> = {
  haven: {
    id: 'haven',
    name: 'Safe Haven / Sanctuary',
    dangerLevel: 'peaceful',
    description: 'A protected settlement where heroes rest and recover.'
  },
  wilds: {
    id: 'wilds',
    name: 'Frontier Wilderness',
    dangerLevel: 'moderate',
    description: 'Untamed lands teeming with beasts and hidden ruins.'
  },
  dungeon: {
    id: 'dungeon',
    name: 'Ruins / Restricted Sector',
    dangerLevel: 'perilous',
    description: 'Dangerous territory guarded by lethal sentinels and traps.'
  },
  void_rift: {
    id: 'void_rift',
    name: 'The Epicenter / Void Rift',
    dangerLevel: 'lethal',
    description: 'Cataclysmic anomaly where reality unravels and death is imminent.'
  }
};

export class WorldRules {
  public static getZoneDanger(zoneId: string): WorldZone {
    return WORLD_ZONES[zoneId] || WORLD_ZONES.wilds;
  }
}
