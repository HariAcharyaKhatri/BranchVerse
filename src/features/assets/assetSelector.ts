import { LOCAL_ASSET_MANIFEST, AssetBackground, AssetCharacter } from './assetManifest';
import { HeroProfile } from '../../types/character';

/**
 * Deterministically generates a consistent positive integer hash from a string.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Returns a matching anime visual novel background for a story scene.
 * Guaranteed to be deterministic and never fail.
 */
export function getSceneBackground(params: {
  sceneTitle: string;
  narrativeText?: string;
  worldId?: string;
  genres?: string[];
}): AssetBackground {
  const backgrounds = LOCAL_ASSET_MANIFEST.backgrounds;
  const combinedText = `${params.sceneTitle} ${params.narrativeText || ''}`.toLowerCase();

  // 1. World-specific keyword matches
  if (params.worldId === 'neokyoto') {
    if (combinedText.includes('lab') || combinedText.includes('vault') || combinedText.includes('cleanroom')) {
      return backgrounds.find(b => b.id === 'bg_cyber_sublevel_lab') || backgrounds[6];
    }
    if (combinedText.includes('bar') || combinedText.includes('lounge') || combinedText.includes('clinic')) {
      return backgrounds.find(b => b.id === 'bg_undercity_bar') || backgrounds[6];
    }
    return backgrounds.find(b => b.id === 'bg_neokyoto_neon_street') || backgrounds[6];
  }

  if (params.worldId === 'kunlun') {
    if (combinedText.includes('mist') || combinedText.includes('thunder') || combinedText.includes('dragon')) {
      return backgrounds.find(b => b.id === 'bg_kunlun_mist') || backgrounds[9];
    }
    return backgrounds.find(b => b.id === 'bg_ancestral_shrine') || backgrounds[9];
  }

  // 2. High Fantasy / Aethelgard & general matches
  if (combinedText.includes('flame') || combinedText.includes('fire') || combinedText.includes('dusk')) {
    return backgrounds.find(b => b.id === 'bg_whisperwood_dusk') || backgrounds[0];
  }
  if (combinedText.includes('battle') || combinedText.includes('clash') || combinedText.includes('corps') || combinedText.includes('hound')) {
    return backgrounds.find(b => b.id === 'bg_ruined_battleground') || backgrounds[0];
  }
  if (combinedText.includes('forest') || combinedText.includes('woods') || combinedText.includes('whisperwood')) {
    return backgrounds.find(b => b.id === 'bg_whisperwood_mystic') || backgrounds[0];
  }
  if (combinedText.includes('temple') || combinedText.includes('rune') || combinedText.includes('crystal')) {
    return backgrounds.find(b => b.id === 'bg_crystal_temple') || backgrounds[0];
  }
  if (combinedText.includes('citadel') || combinedText.includes('silver spire') || combinedText.includes('king') || combinedText.includes('court')) {
    return backgrounds.find(b => b.id === 'bg_aethelgard_citadel') || backgrounds[0];
  }
  if (combinedText.includes('road') || combinedText.includes('mountain') || combinedText.includes('dawn') || combinedText.includes('journey')) {
    return backgrounds.find(b => b.id === 'bg_highland_mountains') || backgrounds[0];
  }
  if (combinedText.includes('school') || combinedText.includes('academy')) {
    if (combinedText.includes('night') || combinedText.includes('dark')) {
      return backgrounds.find(b => b.id === 'bg_academy_hallway_night') || backgrounds[11];
    }
    return backgrounds.find(b => b.id === 'bg_academy_hallway_day') || backgrounds[11];
  }

  // 3. World filter fallback
  if (params.worldId) {
    const worldMatches = backgrounds.filter(b => b.worlds.includes(params.worldId!));
    if (worldMatches.length > 0) {
      const idx = hashString(params.sceneTitle) % worldMatches.length;
      return worldMatches[idx];
    }
  }

  // 4. Deterministic hash fallback
  const fallbackIndex = hashString(params.sceneTitle) % backgrounds.length;
  return backgrounds[fallbackIndex] || backgrounds[0];
}

export interface CharacterPortraitResult {
  path: string;
  name: string;
  isProtagonist: boolean;
}

/**
 * Resolves a character portrait based on dialogue speaker, current hero, and emotion.
 */
export function getCharacterPortrait(
  speaker: string,
  hero?: HeroProfile,
  emotion?: 'calm' | 'furious' | 'mysterious' | 'terrified' | 'warm'
): CharacterPortraitResult | null {
  if (!speaker) return null;

  const normalized = speaker.toLowerCase().trim();

  // 1. Is speaker the hero?
  const isHero = hero && (
    normalized === hero.name.toLowerCase().trim() ||
    normalized === 'you' ||
    normalized === 'hero'
  );

  if (isHero) {
    // Check if hero has a specific selected avatar
    const heroGender = (hero.gender || 'male').toLowerCase();
    const avatar = heroGender.includes('female')
      ? LOCAL_ASSET_MANIFEST.characters.find(c => c.id === 'aria_spellblade')
      : LOCAL_ASSET_MANIFEST.characters.find(c => c.id === 'hari_swordsman');

    if (avatar) {
      let exprPath = avatar.defaultPath;
      if (avatar.expressions) {
        if (emotion === 'furious' && avatar.expressions.angry) {
          exprPath = avatar.expressions.angry;
        } else if (emotion === 'warm' && avatar.expressions.happy) {
          exprPath = avatar.expressions.happy;
        } else if ((emotion === 'calm' || emotion === 'mysterious') && avatar.expressions.serious) {
          exprPath = avatar.expressions.serious;
        }
      }
      return {
        path: exprPath,
        name: hero.name,
        isProtagonist: true
      };
    }
  }

  // 2. NPC Match: Ronald
  if (normalized.includes('ronald') || normalized.includes('captain') || normalized.includes('vanguard')) {
    const ronald = LOCAL_ASSET_MANIFEST.characters.find(c => c.id === 'captain_ronald');
    if (ronald) {
      return { path: ronald.defaultPath, name: 'Captain Ronald', isProtagonist: false };
    }
  }

  // 3. NPC Match: Commander / Boss
  if (normalized.includes('commander') || normalized.includes('harbinger') || normalized.includes('anthony') || normalized.includes('enforcer')) {
    const boss = LOCAL_ASSET_MANIFEST.characters.find(c => c.id === 'masked_commander');
    if (boss) {
      return { path: boss.defaultPath, name: speaker, isProtagonist: false };
    }
  }

  // 4. NPC Match: Master / Shen / Elder / Patriarch
  if (normalized.includes('shen') || normalized.includes('patriarch') || normalized.includes('master') || normalized.includes('elder')) {
    const mentor = LOCAL_ASSET_MANIFEST.characters.find(c => c.id === 'mentor_shen');
    if (mentor) {
      return { path: mentor.defaultPath, name: speaker, isProtagonist: false };
    }
  }

  // 5. Default fallback to protagonist portrait if speaking as self
  if (hero) {
    const fallbackAvatar = (hero.gender || '').toLowerCase().includes('female')
      ? '/assets/characters/protagonists/aria_default.png'
      : '/assets/characters/protagonists/hari_default.png';
    return { path: fallbackAvatar, name: speaker, isProtagonist: false };
  }

  return null;
}

/**
 * Returns available protagonist avatar choices for character creation.
 */
export function getAvailableProtagonistAvatars(): AssetCharacter[] {
  return LOCAL_ASSET_MANIFEST.characters.filter(c => c.category === 'protagonists');
}
