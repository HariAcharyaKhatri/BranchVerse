import { describe, it, expect } from 'vitest';
import { getSceneBackground, getCharacterPortrait, getAvailableProtagonistAvatars } from '../features/assets/assetSelector';
import { completeHeroProfile } from '../features/story/naturalPromptParser';

describe('BranchVerse Local Anime Asset Selector', () => {

  describe('Scene Background Resolution', () => {
    it('returns deterministic and matching backgrounds for Aethelgard fantasy scenes', () => {
      const bg1 = getSceneBackground({
        sceneTitle: 'Flames in the Night',
        narrativeText: 'Rift beasts stalk through the village square in witch-fire',
        worldId: 'aethelgard'
      });
      expect(bg1).toBeDefined();
      expect(bg1.path).toBeTruthy();
      expect(bg1.path).toMatch(/\.(jpg|png|svg)$/);

      // Deterministic check: Calling again with same title yields identical background
      const bg2 = getSceneBackground({
        sceneTitle: 'Flames in the Night',
        worldId: 'aethelgard'
      });
      expect(bg1.id).toBe(bg2.id);
      expect(bg1.path).toBe(bg2.path);
    });

    it('matches cyberpunk scenes in Neo-Kyoto to futuristic cyber environments', () => {
      const cyberBg = getSceneBackground({
        sceneTitle: 'Rain, Neon, and Gunfire',
        narrativeText: 'Acid rain cascades down holographic billboards in District 4',
        worldId: 'neokyoto'
      });
      expect(cyberBg).toBeDefined();
      expect(cyberBg.category).toBe('cyberpunk');
      expect(cyberBg.path).toContain('cyberpunk');
    });

    it('matches cultivation scenes in Mount Kunlun to shrines or misty ridges', () => {
      const kunlunBg = getSceneBackground({
        sceneTitle: 'The Thunderclouds Gather',
        narrativeText: 'Heavenly lightning dragon descends upon Azure Peak',
        worldId: 'kunlun'
      });
      expect(kunlunBg).toBeDefined();
      expect(kunlunBg.category).toBe('cultivation');
    });

    it('matches school and academy keywords to classroom or auditorium backdrops', () => {
      const schoolBg = getSceneBackground({
        sceneTitle: 'High School Tournament Entrance',
        narrativeText: 'Students gather in the main academy hallway'
      });
      expect(schoolBg).toBeDefined();
      expect(schoolBg.category).toBe('school');
    });
  });

  describe('Character Portrait & Expression Matching', () => {
    it('resolves male hero avatar and handles emotion expression variants', () => {
      const maleHero = completeHeroProfile({ name: 'Hari', gender: 'Male' });

      const defaultPortrait = getCharacterPortrait('Hari', maleHero);
      expect(defaultPortrait).toBeDefined();
      expect(defaultPortrait?.isProtagonist).toBe(true);
      expect(defaultPortrait?.path).toContain('hari_default.png');

      const angryPortrait = getCharacterPortrait('Hari', maleHero, 'furious');
      expect(angryPortrait?.path).toContain('hari_angry.png');

      const happyPortrait = getCharacterPortrait('Hari', maleHero, 'warm');
      expect(happyPortrait?.path).toContain('hari_happy.png');
    });

    it('resolves female hero avatar', () => {
      const femaleHero = completeHeroProfile({ name: 'Aria', gender: 'Female' });

      const portrait = getCharacterPortrait('Aria', femaleHero);
      expect(portrait).toBeDefined();
      expect(portrait?.isProtagonist).toBe(true);
      expect(portrait?.path).toContain('aria_default.png');
    });

    it('resolves NPC dialogues to their matching character sprites', () => {
      const ronald = getCharacterPortrait('Captain Ronald');
      expect(ronald).toBeDefined();
      expect(ronald?.name).toBe('Captain Ronald');
      expect(ronald?.path).toContain('ronald_guard.png');

      const commander = getCharacterPortrait('Masked Commander');
      expect(commander).toBeDefined();
      expect(commander?.path).toContain('masked_commander.png');

      const shen = getCharacterPortrait('Master Shen');
      expect(shen).toBeDefined();
      expect(shen?.path).toContain('mentor_shen.png');
    });
  });

  describe('Available Protagonist Avatars', () => {
    it('provides protagonist avatar options for character creation', () => {
      const avatars = getAvailableProtagonistAvatars();
      expect(avatars.length).toBeGreaterThanOrEqual(2);
      expect(avatars.some(a => a.id === 'hari_swordsman')).toBe(true);
      expect(avatars.some(a => a.id === 'aria_spellblade')).toBe(true);
    });
  });
});
