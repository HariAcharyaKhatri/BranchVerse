import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  CANON_OPENING_SCENES,
  CANON_ANGEL,
} from '../features/reincarnation/reincarnationCanon';
import {
  FATE_WHEEL_CATEGORIES,
} from '../features/reincarnation/fateWheelCatalogs';
import {
  createInitialProfile,
  createInitialReincarnationSession,
  extractNaturalPreferences,
  generateAngelDialogue,
  applyFateWheelResult,
  spinAllUndecidedCategories,
  updateProfileFieldManually,
  buildReincarnationLaunchPackage,
  loadReincarnationSession,
  saveReincarnationSession,
  clearReincarnationSession,
} from '../features/reincarnation/reincarnationEngine';
import { IsekaiReincarnationPage } from '../pages/IsekaiReincarnationPage';
import { AuthProvider } from '../contexts/AuthContext';

describe('BranchVerse Isekai Reincarnation Experience & Engine', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  // =========================================================================
  // 1. FIXED PREDEFINED OPENING STORY CANON
  // =========================================================================
  describe('Fixed Predefined Opening Story Canon', () => {
    it('defines exactly 4 fixed sequential scenes leading up to the Angel', () => {
      expect(CANON_OPENING_SCENES).toHaveLength(4);

      const [scene1, scene2, scene3, scene4] = CANON_OPENING_SCENES;

      // Scene 1: The Previous Life
      expect(scene1.id).toBe('previous_life');
      expect(scene1.order).toBe(1);
      expect(scene1.title).toContain('Previous Life');
      expect(scene1.narrativeText).toContain('familiar world slips away');

      // Scene 2: The Transition
      expect(scene2.id).toBe('transition');
      expect(scene2.order).toBe(2);
      expect(scene2.title).toContain('Transition');
      expect(scene2.narrativeText).toContain('weightlessness');

      // Scene 3: Awakening in the Afterlife
      expect(scene3.id).toBe('afterlife_awakening');
      expect(scene3.order).toBe(3);
      expect(scene3.title).toContain('Afterlife');
      expect(scene3.narrativeText).toContain('crystallized obsidian');

      // Scene 4: Arrival Before the Angel
      expect(scene4.id).toBe('angel_arrival');
      expect(scene4.order).toBe(4);
      expect(scene4.title).toContain('Divine Angel');
      expect(scene4.narrativeText).toContain('wings of feathered starlight');
    });

    it('defines Divine Angel Seraphina with canonical identity and farewell blessing', () => {
      expect(CANON_ANGEL.name).toBe('Seraphina');
      expect(CANON_ANGEL.title).toBe('Divine Herald of the Multiverse');
      expect(CANON_ANGEL.initialGreeting).toContain('mortal traveler');
      expect(CANON_ANGEL.nameInquiry).toContain('name');
      expect(CANON_ANGEL.farewellBlessing).toContain('May your will carve constellations');
    });
  });

  // =========================================================================
  // 2. ANGEL CONVERSATIONAL ENGINE & MULTI-LINGUAL EXTRACTION
  // =========================================================================
  describe('Angel Conversational Reincarnation Engine', () => {
    it('asks for user name first and maintains it throughout the dialogue', () => {
      const session = createInitialReincarnationSession('');
      expect(session.userNameChosen).toBeUndefined();

      // First user response giving name
      const sessionAfterName = generateAngelDialogue(session, 'My name is Hari Khatri.');
      expect(sessionAfterName.userNameChosen).toBe('Hari Khatri');
      expect(sessionAfterName.profile.character.name.value).toBe('Hari Khatri');
      expect(sessionAfterName.profile.character.name.status).toBe('confirmed');

      // Angel replies addressing user by name
      const lastReply = sessionAfterName.dialogueHistory.slice(-1)[0];
      expect(lastReply.speaker).toBe('angel');
      expect(lastReply.text).toContain('Hari Khatri');
    });

    it('extracts multi-lingual (English & Hindi) preferences dynamically', () => {
      // English preferences
      const englishExtracted = extractNaturalPreferences(
        'I want an elven spellblade in a dark fantasy steampunk realm with starlight magic leylines'
      );
      expect(englishExtracted.race).toBe('High Elf');
      expect(englishExtracted.genre).toBe('Dark Fantasy');
      expect(englishExtracted.magicAffinities).toContain('Starlight');

      // Hindi preferences
      const hindiExtracted = extractNaturalPreferences(
        'मेरा नाम कबीर है और मुझे फैंटेसी दुनिया में जादूगर बनना है'
      );
      expect(hindiExtracted.name).toBe('कबीर');
      expect(hindiExtracted.genre).toBe('High Fantasy');
    });

    it('does not ask redundant questions for already confirmed fields', () => {
      let session = createInitialReincarnationSession('Aria');
      session = updateProfileFieldManually(session, 'character', 'name', 'Aria');
      session = updateProfileFieldManually(session, 'world', 'genre', 'Cyberpunk');
      session = updateProfileFieldManually(session, 'character', 'race', 'Cyborg');

      const updated = generateAngelDialogue(session, 'Tell me about the power system.');
      const lastAngelMsg = updated.dialogueHistory.slice(-1)[0].text;

      // Should not ask for name or race again since they are confirmed
      expect(lastAngelMsg).not.toContain('What shall I call you');
    });
  });

  // =========================================================================
  // 3. FATE WHEEL RANDOMIZATION SYSTEM
  // =========================================================================
  describe('Random Fate Wheel System', () => {
    it('defines 5 distinct fate wheel categories with rich options', () => {
      expect(FATE_WHEEL_CATEGORIES.world_type).toBeDefined();
      expect(FATE_WHEEL_CATEGORIES.race).toBeDefined();
      expect(FATE_WHEEL_CATEGORIES.origin).toBeDefined();
      expect(FATE_WHEEL_CATEGORIES.abilities).toBeDefined();
      expect(FATE_WHEEL_CATEGORIES.story_direction).toBeDefined();

      expect(FATE_WHEEL_CATEGORIES.world_type.options.length).toBeGreaterThanOrEqual(6);
      expect(FATE_WHEEL_CATEGORIES.race.options.length).toBeGreaterThanOrEqual(6);
      expect(FATE_WHEEL_CATEGORIES.abilities.options.length).toBeGreaterThanOrEqual(6);
    });

    it('applies fate wheel selection with status "random"', () => {
      const session = createInitialReincarnationSession('Hari');
      const selectedOption = FATE_WHEEL_CATEGORIES.race.options.find((o) => o.id === 'dragonkin')!;

      const updated = applyFateWheelResult(session, 'race', selectedOption);
      expect(updated.profile.character.race.value).toBe('Dragonkin');
      expect(updated.profile.character.race.status).toBe('random');
    });

    it('never overwrites user confirmed choices when spinning fate wheel or spin all undecided', () => {
      let session = createInitialReincarnationSession('Hari');
      // User explicitly confirms their race as High Elf
      session = updateProfileFieldManually(session, 'character', 'race', 'High Elf');
      expect(session.profile.character.race.status).toBe('confirmed');

      // Spin all undecided categories
      const spunSession = spinAllUndecidedCategories(session);

      // Race MUST remain High Elf and confirmed
      expect(spunSession.profile.character.race.value).toBe('High Elf');
      expect(spunSession.profile.character.race.status).toBe('confirmed');
    });
  });

  // =========================================================================
  // 4. STORY ENGINE INTEGRATION & CLEAN RPG MECHANICS
  // =========================================================================
  describe('Story Engine Integration & Clean RPG Mechanics', () => {
    it('compiles reincarnation profile into authoritative HeroProfile and WorldDefinition without Health or Stamina progression systems', () => {
      let session = createInitialReincarnationSession('Hari Khatri');
      session = updateProfileFieldManually(session, 'world', 'genre', 'High Fantasy');
      session = updateProfileFieldManually(session, 'character', 'race', 'Dragonkin');

      const launchPackage = buildReincarnationLaunchPackage(session);

      expect(launchPackage.hero.name).toBe('Hari Khatri');
      expect(launchPackage.hero.race).toBe('Dragonkin');
      expect(launchPackage.world).toBeDefined();
      expect(launchPackage.settings.storyLanguage).toBe('hi'); // Default language is preserved

      // CLEAN RPG VERIFICATION: No health or stamina progression mechanics
      const heroAny = launchPackage.hero as any;
      expect(heroAny.stamina).toBeUndefined();
      expect(heroAny.maxStamina).toBeUndefined();

      // No generic potions or stamina items in starting equipment
      for (const weapon of launchPackage.hero.weapons) {
        expect(weapon.toLowerCase()).not.toContain('potion');
        expect(weapon.toLowerCase()).not.toContain('salve');
        expect(weapon.toLowerCase()).not.toContain('stamina');
      }
    });
  });

  // =========================================================================
  // 5. FULL ISEKAI REINCARNATION PAGE COMPONENT FLOW
  // =========================================================================
  describe('IsekaiReincarnationPage Component', () => {
    it('renders Scene 1 on first launch and advances through Scene 4', async () => {
      const onNavigate = vi.fn();
      const onLaunchStory = vi.fn();

      render(
        <AuthProvider>
          <IsekaiReincarnationPage onNavigate={onNavigate} onLaunchStory={onLaunchStory} />
        </AuthProvider>
      );

      // Scene 1 Title
      expect(screen.getByText(/The Previous Life/i)).toBeInTheDocument();
      expect(screen.getByText(/Scene 1 of 4/i)).toBeInTheDocument();

      // Click Continue -> Scene 2
      const continueBtn = screen.getByRole('button', { name: /continue/i });
      fireEvent.click(continueBtn);
      expect(screen.getByText(/The Transition/i)).toBeInTheDocument();
      expect(screen.getByText(/Scene 2 of 4/i)).toBeInTheDocument();

      // Click Continue -> Scene 3
      fireEvent.click(screen.getByRole('button', { name: /continue/i }));
      expect(screen.getByText(/Awakening in the Afterlife/i)).toBeInTheDocument();
      expect(screen.getByText(/Scene 3 of 4/i)).toBeInTheDocument();

      // Click Continue -> Scene 4
      fireEvent.click(screen.getByRole('button', { name: /continue/i }));
      expect(screen.getByText(/Arrival Before the Divine Angel/i)).toBeInTheDocument();
      expect(screen.getByText(/Scene 4 of 4/i)).toBeInTheDocument();

      // Click "Approach the Angel" -> Transitions to Stage 2 (Angel Dialogue)
      const approachBtn = screen.getByRole('button', { name: /approach the angel/i });
      fireEvent.click(approachBtn);

      // Now in Angel Dialogue stage
      expect(screen.getAllByText(/Seraphina/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Divine Herald of the Multiverse/i)).toBeInTheDocument();
    });

    it('allows skipping directly to Angel encounter', async () => {
      render(
        <AuthProvider>
          <IsekaiReincarnationPage onNavigate={vi.fn()} onLaunchStory={vi.fn()} />
        </AuthProvider>
      );

      const skipBtn = screen.getByRole('button', { name: /skip to angel encounter/i });
      fireEvent.click(skipBtn);

      expect(screen.getAllByText(/Seraphina/i).length).toBeGreaterThan(0);
      expect(screen.getByPlaceholderText(/Seraphina awaits your name/i)).toBeInTheDocument();
    });

    it('handles interactive conversation, fate wheel opening, and review confirmation', async () => {
      const onLaunchStory = vi.fn();

      render(
        <AuthProvider>
          <IsekaiReincarnationPage onNavigate={vi.fn()} onLaunchStory={onLaunchStory} />
        </AuthProvider>
      );

      // Skip to Angel
      fireEvent.click(screen.getByRole('button', { name: /skip to angel encounter/i }));

      // Send name via chat
      const input = screen.getByPlaceholderText(/Seraphina awaits your name/i);
      fireEvent.change(input, { target: { value: 'My name is Hari Khatri.' } });
      fireEvent.click(screen.getByLabelText('Send response to Angel'));

      // Check user dialogue and Angel reply
      expect(screen.getByText('My name is Hari Khatri.')).toBeInTheDocument();
      await waitFor(() => {
        expect(screen.getAllByText(/Hari Khatri/i).length).toBeGreaterThanOrEqual(1);
      });

      // Open Fate Wheel
      const fateWheelBtn = screen.getByRole('button', { name: /fate wheel/i });
      fireEvent.click(fateWheelBtn);
      expect(screen.getByText(/Wheel of Multiverse Fate/i)).toBeInTheDocument();

      // Close Fate Wheel
      fireEvent.click(screen.getByLabelText('Close'));

      // Click Proceed to Final Review
      const reviewBtn = screen.getByRole('button', { name: /proceed to final review/i });
      fireEvent.click(reviewBtn);

      // Reincarnation Affirmation Screen
      expect(screen.getByText(/Reincarnation Affirmation/i)).toBeInTheDocument();
      expect(screen.getByText(/Dimensional Gate Primed/i)).toBeInTheDocument();

      // Confirm Reincarnation & Launch
      const awakenBtn = screen.getByRole('button', { name: /awaken in/i });
      fireEvent.click(awakenBtn);

      expect(onLaunchStory).toHaveBeenCalled();
      const launchPayload = onLaunchStory.mock.calls[0][0];
      expect(launchPayload.overrideHero.name).toBe('Hari Khatri');
      expect(launchPayload.generationMode).toBe('ai');
    });
  });
});
