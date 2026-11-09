import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import {
  ISEKAI_RACES,
  ISEKAI_CLASSES,
  ISEKAI_ELEMENTS,
  ISEKAI_SCENARIOS,
  ENTITY_PERSONALITY_PROFILES,
} from '../features/isekai/isekaiCatalog';
import {
  createInitialPrologueSession,
  advanceProloguePhase,
  appendDialogue,
  generateEntityResponse,
  compileHeroProfileFromSoulSculpt,
  buildIsekaiStoryLaunchParams,
  savePrologueSession,
  loadPrologueSession,
  clearPrologueSession,
} from '../features/isekai/isekaiEngine';
import { IsekaiProloguePage } from '../pages/IsekaiProloguePage';
import { WORLD_CATALOG } from '../catalogs/worlds';
import { AuthProvider } from '../contexts/AuthContext';

describe('BranchVerse Isekai Prologue System', () => {
  beforeEach(() => {
    localStorage.clear();
    clearPrologueSession();
    vi.restoreAllMocks();
  });

  describe('Catalog & Multiverse Data Integrity', () => {
    it('provides expandable race and species definitions with innate traits', () => {
      expect(ISEKAI_RACES.length).toBeGreaterThanOrEqual(8);
      const human = ISEKAI_RACES.find((r) => r.id === 'human');
      expect(human).toBeDefined();
      expect(human?.innateTraits).toContain('Versatile Adaptability');

      const highElf = ISEKAI_RACES.find((r) => r.id === 'high_elf');
      expect(highElf?.lifespan).toContain('years');
    });

    it('provides combat and profession class archetypes', () => {
      expect(ISEKAI_CLASSES.length).toBeGreaterThanOrEqual(8);
      const knight = ISEKAI_CLASSES.find((c) => c.id === 'vanguard_knight');
      expect(knight?.role).toBe('martial');
      expect(knight?.starterWeapons.length).toBeGreaterThan(0);

      const arcanist = ISEKAI_CLASSES.find((c) => c.id === 'void_arcanist');
      expect(arcanist?.role).toBe('arcane');
    });

    it('defines distinct elemental affinities with interaction dynamics', () => {
      expect(ISEKAI_ELEMENTS.length).toBeGreaterThanOrEqual(6);
      const lightning = ISEKAI_ELEMENTS.find((e) => e.id === 'lightning');
      expect(lightning?.strengths).toContain('Water');
    });

    it('defines rich starting scenarios with boon traits', () => {
      expect(ISEKAI_SCENARIOS.length).toBeGreaterThanOrEqual(4);
      const commoner = ISEKAI_SCENARIOS.find((s) => s.id === 'commoner_artisan');
      expect(commoner?.startingBonusDescription).toBeDefined();
    });

    it('defines four adaptable entity personalities with distinct voices', () => {
      const keys = Object.keys(ENTITY_PERSONALITY_PROFILES);
      expect(keys).toContain('mysterious');
      expect(keys).toContain('formal');
      expect(keys).toContain('witty');
      expect(keys).toContain('divine');
    });
  });

  describe('Prologue State Engine & Transition Mechanics', () => {
    it('creates an initial session in the first_life phase with user name pre-fill', () => {
      const session = createInitialPrologueSession('Hari Khatri', 'mysterious');
      expect(session.currentPhase).toBe('first_life');
      expect(session.soulSculpt.name).toBe('Hari Khatri');
      expect(session.dialogueHistory.length).toBe(1);
      expect(session.dialogueHistory[0].speaker).toBe('entity');
    });

    it('advances sequentially through prologue phases', () => {
      let session = createInitialPrologueSession('Test Hero');
      expect(session.currentPhase).toBe('first_life');

      session = advanceProloguePhase(session);
      expect(session.currentPhase).toBe('astral_awakening');

      session = advanceProloguePhase(session, 'soul_sculpting');
      expect(session.currentPhase).toBe('soul_sculpting');
    });

    it('appends dialogues immutably and tracks conversational history', () => {
      const session = createInitialPrologueSession('Test Hero');
      const updated = appendDialogue(session, {
        speaker: 'hero',
        text: 'Where am I?',
      });

      expect(updated.dialogueHistory.length).toBe(session.dialogueHistory.length + 1);
      expect(updated.dialogueHistory[updated.dialogueHistory.length - 1].text).toBe('Where am I?');
    });

    it('generates in-character entity responses based on current personality', () => {
      const session = createInitialPrologueSession('Hero', 'mysterious');
      const responseWhere = generateEntityResponse(session, 'Where am I?');
      expect(responseWhere).toContain('Nexus of Lost Stars');

      const responseDead = generateEntityResponse(session, 'Am I dead?');
      expect(responseDead).toContain('earthly vessel');

      // Custom question
      const customResponse = generateEntityResponse(session, 'Can I fly like a bird?');
      expect(customResponse).toContain('Can I fly like a bird?');
    });

    it('compiles soul sculpt into a fully valid HeroProfile with zero stamina dependencies', () => {
      const session = createInitialPrologueSession('Hari Khatri');
      const hero = compileHeroProfileFromSoulSculpt(session.soulSculpt, 'Hari Khatri');

      expect(hero.name).toBe('Hari Khatri');
      expect(hero.race).toBe('Human');
      expect(hero.skills.length).toBeGreaterThan(0);
      expect(hero.weapons.length).toBeGreaterThan(0);
      expect(hero.powerLevel).toBeGreaterThanOrEqual(30);
      // Ensure stamina is not set as an active requirement
      expect((hero as any).stamina).toBeUndefined();
    });

    it('builds a complete story launch package with world and settings', () => {
      const session = createInitialPrologueSession('Hari Khatri');
      const pkg = buildIsekaiStoryLaunchParams(session, WORLD_CATALOG);

      expect(pkg.hero.name).toBe('Hari Khatri');
      expect(pkg.world.id).toBe('aethelgard');
      expect(pkg.settings.mode).toBe('roleplay');
      expect(pkg.settings.userPromptDescription).toContain('[ISEKAI REBIRTH PROLOGUE]');
    });

    it('saves, loads, and clears session from localStorage seamlessly', () => {
      const session = createInitialPrologueSession('Cached Hero');
      savePrologueSession(session);

      const loaded = loadPrologueSession();
      expect(loaded).not.toBeNull();
      expect(loaded?.soulSculpt.name).toBe('Cached Hero');

      clearPrologueSession();
      expect(loadPrologueSession()).toBeNull();
    });
  });

  describe('IsekaiProloguePage Component Interactive Flow', () => {
    it('renders Phase 1 (First Life) and progresses on choice selection', () => {
      const onLaunchMock = vi.fn();
      const onBackMock = vi.fn();

      render(
        <AuthProvider>
          <IsekaiProloguePage onBack={onBackMock} onLaunchStory={onLaunchMock} />
        </AuthProvider>
      );

      // Verify Phase 1 title
      expect(screen.getByText('The Final Hours of an Ordinary World')).toBeInTheDocument();
      expect(screen.getByText('Work into the Night')).toBeInTheDocument();

      // Click "Work into the Night"
      fireEvent.click(screen.getByText('Work into the Night'));

      // Should advance to Astral Awakening
      expect(screen.getByText('Awakening Beyond Flesh and Gravity')).toBeInTheDocument();
    });

    it('allows chatting with the entity and changing personality attitude', () => {
      const onLaunchMock = vi.fn();
      const onBackMock = vi.fn();

      // Pre-seed session in entity_communion phase
      const initial = createInitialPrologueSession('Hari Khatri');
      const inPhase3 = advanceProloguePhase(initial, 'entity_communion');
      savePrologueSession(inPhase3);

      render(
        <AuthProvider>
          <IsekaiProloguePage onBack={onBackMock} onLaunchStory={onLaunchMock} />
        </AuthProvider>
      );

      // Verify Phase 3 header
      expect(screen.getAllByText('The Arbiter of Threads').length).toBeGreaterThan(0);

      // Click quick dialogue question "Where am I?"
      const whereBtn = screen.getByRole('button', { name: 'Where am I?' });
      fireEvent.click(whereBtn);

      // Dialogue should contain entity response about the Nexus
      expect(screen.getAllByText(/Nexus of Lost Stars/i).length).toBeGreaterThan(0);

      // Switch personality to 'witty'
      const wittyBtn = screen.getByRole('button', { name: /witty/i });
      fireEvent.click(wittyBtn);
      expect(screen.getAllByText(/Nyx, The Wayward Weaver/i).length).toBeGreaterThan(0);
    });

    it('progresses to soul sculpting and departs into the multiverse', async () => {
      const onLaunchMock = vi.fn().mockResolvedValue(undefined);
      const onBackMock = vi.fn();

      // Seed session in final_departure phase
      const initial = createInitialPrologueSession('Hari Khatri');
      const inDeparture = advanceProloguePhase(initial, 'final_departure');
      savePrologueSession(inDeparture);

      render(
        <AuthProvider>
          <IsekaiProloguePage onBack={onBackMock} onLaunchStory={onLaunchMock} />
        </AuthProvider>
      );

      expect(screen.getByText('The Veil Opens')).toBeInTheDocument();
      expect(screen.getByText(/Transmigrate into the Multiverse/i)).toBeInTheDocument();

      // Click departure button
      fireEvent.click(screen.getByText(/Transmigrate into the Multiverse/i));

      await waitFor(() => {
        expect(onLaunchMock).toHaveBeenCalledTimes(1);
      });
      const launchCall = onLaunchMock.mock.calls[0][0];
      expect(launchCall.overrideHero.name).toBe('Hari Khatri');
      expect(launchCall.overrideWorld.name).toBeDefined();
    });
  });
});
