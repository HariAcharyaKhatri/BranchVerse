/**
 * BranchVerse RPG Power Tier System
 *
 * Implements the anime / isekai / webnovel power ranking ladder from Tier E to Tier SSS and God Tier.
 * Provides bidirectional mapping between numerical power ratings (1-100+) and formal Tiers,
 * alongside glowing badges, thematic rank titles, and visual color palettes.
 */

export type PowerTierCode = 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS' | 'GOD';

export interface PowerTierInfo {
  code: PowerTierCode;
  name: string;             // e.g. "Tier B" or "God Tier"
  title: string;            // e.g. "Silver Expert", "Divine Sovereign"
  rankName: string;         // e.g. "Expert", "God"
  minPower: number;
  maxPower: number;
  defaultPower: number;
  color: string;            // Text color class
  bgClass: string;          // Background class
  borderClass: string;      // Border class
  glowClass: string;        // Box-shadow glow class
  gradient: string;         // CSS gradient for ornate badges
  icon: string;             // Emoji / symbol
  isGodTier: boolean;
  description: string;
}

export const POWER_TIERS: Record<PowerTierCode, PowerTierInfo> = {
  E: {
    code: 'E',
    name: 'Tier E',
    title: 'Awakened Novice',
    rankName: 'Novice',
    minPower: 1,
    maxPower: 19,
    defaultPower: 15,
    color: 'text-slate-300',
    bgClass: 'bg-slate-500/15',
    borderClass: 'border-slate-500/40',
    glowClass: 'shadow-[0_0_8px_rgba(148,163,184,0.3)]',
    gradient: 'from-slate-600/30 to-slate-800/30',
    icon: '🛡️',
    isGodTier: false,
    description: 'A newly awakened soul taking their first tentative steps into the leylines of the multiverse.',
  },
  D: {
    code: 'D',
    name: 'Tier D',
    title: 'Iron Apprentice',
    rankName: 'Apprentice',
    minPower: 20,
    maxPower: 34,
    defaultPower: 28,
    color: 'text-amber-400',
    bgClass: 'bg-amber-900/25',
    borderClass: 'border-amber-700/50',
    glowClass: 'shadow-[0_0_8px_rgba(217,119,6,0.35)]',
    gradient: 'from-amber-800/30 to-amber-950/30',
    icon: '⚡',
    isGodTier: false,
    description: 'A seasoned apprentice capable of overcoming rogue beasts and minor planar anomalies.',
  },
  C: {
    code: 'C',
    name: 'Tier C',
    title: 'Bronze Adept',
    rankName: 'Adept',
    minPower: 35,
    maxPower: 44,
    defaultPower: 40,
    color: 'text-emerald-300',
    bgClass: 'bg-emerald-500/15',
    borderClass: 'border-emerald-500/45',
    glowClass: 'shadow-[0_0_10px_rgba(16,185,129,0.35)]',
    gradient: 'from-emerald-700/30 to-teal-900/30',
    icon: '🗡️',
    isGodTier: false,
    description: 'A competent adventurer and spellweaver trusted by kingdoms with critical frontier quests.',
  },
  B: {
    code: 'B',
    name: 'Tier B',
    title: 'Silver Expert',
    rankName: 'Expert',
    minPower: 45,
    maxPower: 59,
    defaultPower: 45, // Standard starting tier for isekai protagonist
    color: 'text-cyan-300',
    bgClass: 'bg-cyan-500/20',
    borderClass: 'border-cyan-400/50',
    glowClass: 'shadow-[0_0_12px_rgba(6,182,212,0.4)]',
    gradient: 'from-cyan-600/30 to-blue-900/30',
    icon: '✨',
    isGodTier: false,
    description: 'A recognized regional powerhouse possessing high-level battle arts and formidable arcane stamina.',
  },
  A: {
    code: 'A',
    name: 'Tier A',
    title: 'Gold Master',
    rankName: 'Master',
    minPower: 60,
    maxPower: 74,
    defaultPower: 68,
    color: 'text-indigo-200',
    bgClass: 'bg-indigo-500/25',
    borderClass: 'border-indigo-400/60',
    glowClass: 'shadow-[0_0_14px_rgba(99,102,241,0.45)]',
    gradient: 'from-indigo-600/35 to-violet-900/35',
    icon: '🔮',
    isGodTier: false,
    description: 'An elite champion of the realm commanding royal armies and ancient esoteric disciplines.',
  },
  S: {
    code: 'S',
    name: 'Tier S',
    title: 'Platinum Grandmaster',
    rankName: 'Grandmaster',
    minPower: 75,
    maxPower: 84,
    defaultPower: 80,
    color: 'text-amber-200',
    bgClass: 'bg-gradient-to-r from-amber-500/25 to-yellow-500/25',
    borderClass: 'border-amber-300/70',
    glowClass: 'shadow-[0_0_18px_rgba(251,191,36,0.55)]',
    gradient: 'from-amber-500/35 via-yellow-500/30 to-amber-700/35',
    icon: '☀️',
    isGodTier: false,
    description: 'A realm-shaking paragon whose arrival on a battlefield alters the geopolitical destiny of empires.',
  },
  SS: {
    code: 'SS',
    name: 'Tier SS',
    title: 'Mythic Calamity',
    rankName: 'Mythic',
    minPower: 85,
    maxPower: 92,
    defaultPower: 88,
    color: 'text-rose-200',
    bgClass: 'bg-gradient-to-r from-rose-500/30 to-orange-500/30',
    borderClass: 'border-rose-400/75',
    glowClass: 'shadow-[0_0_20px_rgba(244,63,94,0.65)]',
    gradient: 'from-rose-600/40 via-red-600/35 to-orange-700/35',
    icon: '🔥',
    isGodTier: false,
    description: 'An entity of legendary renown; equal in power to celestial dragons and ancient primordial spirits.',
  },
  SSS: {
    code: 'SSS',
    name: 'Tier SSS',
    title: 'Supreme Sovereign',
    rankName: 'Supreme',
    minPower: 93,
    maxPower: 98,
    defaultPower: 96,
    color: 'text-fuchsia-100',
    bgClass: 'bg-gradient-to-r from-fuchsia-600/35 via-purple-600/35 to-pink-500/35',
    borderClass: 'border-fuchsia-300/85',
    glowClass: 'shadow-[0_0_24px_rgba(217,70,239,0.75)]',
    gradient: 'from-fuchsia-600/45 via-purple-600/40 to-pink-600/45',
    icon: '🌌',
    isGodTier: false,
    description: 'A transcendent cosmic existence capable of sundering planar dimensional barriers with a thought.',
  },
  GOD: {
    code: 'GOD',
    name: 'God Tier',
    title: 'Divine Omnipotent',
    rankName: 'God',
    minPower: 99,
    maxPower: 100,
    defaultPower: 100,
    color: 'text-white',
    bgClass: 'bg-gradient-to-r from-amber-300/40 via-violet-400/40 to-cyan-300/40',
    borderClass: 'border-white',
    glowClass: 'shadow-[0_0_28px_rgba(255,255,255,0.85)]',
    gradient: 'from-amber-300/50 via-purple-400/50 to-cyan-300/50',
    icon: '👑',
    isGodTier: true,
    description: 'Divine Sovereign beyond mortal comprehension. Stands alongside the creators and architects of the multiverse.',
  },
};

export const ALL_POWER_TIERS: PowerTierInfo[] = [
  POWER_TIERS.E,
  POWER_TIERS.D,
  POWER_TIERS.C,
  POWER_TIERS.B,
  POWER_TIERS.A,
  POWER_TIERS.S,
  POWER_TIERS.SS,
  POWER_TIERS.SSS,
  POWER_TIERS.GOD,
];

/**
 * Resolves any power level number, string representation, or tier code into its authoritative PowerTierInfo.
 */
export function getPowerTier(input: number | string | undefined | null): PowerTierInfo {
  if (input === undefined || input === null) {
    return POWER_TIERS.B; // Default protagonist starting tier
  }

  // Handle tier code strings like "B", "Tier B", "SSS", "God", "God Tier"
  if (typeof input === 'string') {
    const clean = input.trim().toUpperCase();
    if (clean === 'GOD' || clean.includes('GOD')) return POWER_TIERS.GOD;
    if (clean === 'SSS' || clean.includes('SSS')) return POWER_TIERS.SSS;
    if (clean === 'SS' || clean.includes('SS')) return POWER_TIERS.SS;
    if (clean === 'S' || clean === 'TIER S') return POWER_TIERS.S;
    if (clean === 'A' || clean.includes('A')) return POWER_TIERS.A;
    if (clean === 'B' || clean.includes('B')) return POWER_TIERS.B;
    if (clean === 'C' || clean.includes('C')) return POWER_TIERS.C;
    if (clean === 'D' || clean.includes('D')) return POWER_TIERS.D;
    if (clean === 'E' || clean.includes('E')) return POWER_TIERS.E;

    const parsedNum = parseInt(input, 10);
    if (!isNaN(parsedNum)) {
      return getPowerTierByNumber(parsedNum);
    }
    return POWER_TIERS.B;
  }

  return getPowerTierByNumber(input);
}

function getPowerTierByNumber(power: number): PowerTierInfo {
  const clamped = Math.max(1, Math.min(100, Math.round(power)));

  if (clamped >= 99) return POWER_TIERS.GOD;
  if (clamped >= 93) return POWER_TIERS.SSS;
  if (clamped >= 85) return POWER_TIERS.SS;
  if (clamped >= 75) return POWER_TIERS.S;
  if (clamped >= 60) return POWER_TIERS.A;
  if (clamped >= 45) return POWER_TIERS.B;
  if (clamped >= 35) return POWER_TIERS.C;
  if (clamped >= 20) return POWER_TIERS.D;
  return POWER_TIERS.E;
}

/**
 * Returns the default numerical power level associated with a tier code.
 */
export function getPowerForTier(tier: PowerTierCode): number {
  return POWER_TIERS[tier]?.defaultPower ?? 45;
}

/**
 * Returns the next higher tier in progression, or null if already at God Tier.
 */
export function getNextTier(tier: PowerTierCode): PowerTierInfo | null {
  const index = ALL_POWER_TIERS.findIndex((t) => t.code === tier);
  if (index >= 0 && index < ALL_POWER_TIERS.length - 1) {
    return ALL_POWER_TIERS[index + 1];
  }
  return null;
}

/**
 * Calculates current tier progress toward the next tier as a percentage (0 to 100).
 */
export function getTierProgress(power: number): {
  currentTier: PowerTierInfo;
  nextTier: PowerTierInfo | null;
  percent: number;
} {
  const currentTier = getPowerTier(power);
  const nextTier = getNextTier(currentTier.code);

  if (!nextTier) {
    return { currentTier, nextTier: null, percent: 100 };
  }

  const range = currentTier.maxPower - currentTier.minPower;
  const currentOffset = Math.max(0, power - currentTier.minPower);
  const percent = range > 0 ? Math.min(100, Math.round((currentOffset / range) * 100)) : 100;

  return { currentTier, nextTier, percent };
}
