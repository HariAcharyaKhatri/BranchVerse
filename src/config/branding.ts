/**
 * BranchVerse Brand Asset Configuration & Visual Identity
 *
 * Centralizes all visual brand assets, fallback handlers, typography, and
 * context-aware narrative loading messages for the fantasy RPG multiverse.
 */

export interface BrandAssetConfig {
  name: string;
  tagline: string;
  shortTagline: string;
  appTitle: string;
  assets: {
    splashArt: string;
    appIcon: string;
    logo: string;
    symbolFallback: string;
  };
  colors: {
    backgroundDark: string;
    midnightPurple: string;
    deepNavy: string;
    mysticViolet: string;
    etherealCyan: string;
    antiqueGold: string;
    starlightAmber: string;
  };
}

export const BRANDING: BrandAssetConfig = {
  name: 'BranchVerse',
  tagline: 'Your Choices. Your World. Your Story.',
  shortTagline: 'AI Interactive Multiverse RPG',
  appTitle: 'BranchVerse — Multiverse RPG',
  assets: {
    splashArt: '/assets/branding/branchverse-splash-art.jpg',
    appIcon: '/assets/branding/branchverse-app-icon.jpg',
    logo: '/assets/branding/branchverse-logo.jpg',
    symbolFallback: '/favicon.svg',
  },
  colors: {
    backgroundDark: '#080511',
    midnightPurple: '#130924',
    deepNavy: '#0a0d24',
    mysticViolet: '#7c3aed',
    etherealCyan: '#06b6d4',
    antiqueGold: '#f59e0b',
    starlightAmber: '#fbbf24',
  },
};

export type LoadingContextType =
  | 'startup'
  | 'auth'
  | 'storyLoad'
  | 'storyGenerate'
  | 'worldEnter'
  | 'saving';

export const CONTEXTUAL_LOADING_MESSAGES: Record<LoadingContextType, string[]> = {
  startup: [
    'Awakening the multiverse...',
    'Gathering the threads of forgotten worlds...',
    'Opening the gates between dimensions...',
    'Aligning the astral constellations...',
    'Preparing your infinite journey...',
  ],
  auth: [
    'Attuning hero soul signature...',
    'Verifying portal credentials...',
    'Connecting to the Akashic records...',
    'Summoning hero memory crystals...',
  ],
  storyLoad: [
    'Restoring the threads of your story...',
    'Reconnecting to the chronicle...',
    'Rebuilding world topography...',
    'Retrieving companion allegiances...',
  ],
  storyGenerate: [
    'Weaving a new destiny with Gemini AI...',
    'Synthesizing world leylines and consequences...',
    'Forging encounters across branching timelines...',
    'Breathing life into distant realms...',
  ],
  worldEnter: [
    'Crossing the dimensional threshold...',
    'Stabilizing planetary resonance...',
    'Awakening into the new world...',
    'Your destiny unfolds...',
  ],
  saving: [
    'Inscribing deeds into the eternal chronicle...',
    'Preserving branching timeline choices...',
    'Anchoring state into local memory...',
  ],
};

/**
 * Returns a deterministic or randomized contextual loading message.
 */
export function getContextualLoadingMessage(context: LoadingContextType = 'startup', seed = 0): string {
  const list = CONTEXTUAL_LOADING_MESSAGES[context] || CONTEXTUAL_LOADING_MESSAGES.startup;
  const index = Math.abs(seed) % list.length;
  return list[index];
}
