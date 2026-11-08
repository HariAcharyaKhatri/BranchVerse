import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import {
  StorySession,
  LocalNarrativeProvider,
  ActionParser,
  ActionValidator,
  WorldFactStore,
} from '../engine';
import {
  createNewStory,
  executeStoryTurn,
  executeAdvancedStoryTurn,
} from '../features/story/storyEngine';
import { validateActionFeasibility } from '../features/story/stateMachine';
import { StoryDocument, HeroProfile } from '../types/story';
import { StoryDocumentSchema } from '../lib/validation/storySchema';
import { exportStoryToMarkdown } from '../lib/storage/exportImport';
import { CharacterSheetDrawer } from '../components/story/CharacterSheetDrawer';
import { CharacterIntroductionCard } from '../components/story/CharacterIntroductionCard';

describe('BranchVerse Stamina System Complete Removal & Gameplay Integrity', () => {
  const testHero: HeroProfile = {
    id: 'hero_aria_1',
    name: 'Aria of the Dawn',
    age: '22',
    gender: 'Female',
    race: 'Human',
    origin: 'Valen Outpost',
    alignment: 'Lawful Good',
    appearance: {
      hair: 'Silver',
      eyes: 'Amber',
      skin: 'Fair',
      height: '172cm',
      build: 'Athletic',
      clothing: 'Silver Guardian Mail',
      distinguishingMarks: 'Solar rune on left wrist',
    },
    personality: ['Unyielding', 'Compassionate'],
    backstory: 'A devoted knight sworn to protect the frontier realms.',
    powers: ['Solar Blade', 'Aegis Barrier'],
    weapons: ['Silver Longsword'],
    statusEffects: ['Vigilant'],
    powerLevel: 30,
    skills: ['Swordsmanship', 'Tactical Command'],
    weaknesses: ['Reckless devotion to allies'],
    goals: ['Defend the innocent from void rift incursions'],
    motivations: ['Honor and duty'],
    fears: ['Failing those under her protection'],
    secrets: ['Bearer of a forbidden solar crest'],
    relationships: [],
    createdAt: Date.now(),
  };

  it('1. Allows players to make consecutive decisions without stamina restrictions or depletion', async () => {
    const story = createNewStory({
      title: 'The Infinite Horizon',
      hero: testHero,
      genres: ['Epic Fantasy'],
      worldId: 'aethelgard',
      worldName: 'Aethelgard',
      settings: {
        tone: 'Epic Fantasy',
        pacing: 'Balanced Narrative',
        difficulty: 'Adventurer (Standard)',
        storyLanguage: 'en',
      },
      storyLanguage: 'en',
    });

    // Execute 5 consecutive story turns
    let currentStory: StoryDocument = story;
    for (let i = 0; i < 5; i++) {
      const choiceId = currentStory.turns[currentStory.turns.length - 1].choices[0]?.choiceId;
      expect(choiceId).toBeDefined();

      const result = await executeAdvancedStoryTurn(
        currentStory,
        { choiceId },
        new LocalNarrativeProvider()
      );

      currentStory = result.updatedStory;
      expect(currentStory.turns.length).toBe(i + 2);
      // Validate feasibility allows continued action
      const check = validateActionFeasibility(currentStory.state, {});
      expect(check.isValid).toBe(true);
    }

    expect(currentStory.turns.length).toBe(6);
  });

  it('2. Custom actions execute seamlessly without stamina checks or exhaustion penalties', () => {
    const story = createNewStory({
      title: 'Trial of Shadows',
      hero: testHero,
      genres: ['Epic Fantasy'],
      worldId: 'aethelgard',
      worldName: 'Aethelgard',
      settings: {
        tone: 'Epic Fantasy',
        pacing: 'Balanced Narrative',
        difficulty: 'Adventurer (Standard)',
        storyLanguage: 'en',
      },
      storyLanguage: 'en',
    });

    // Player inputs a demanding physical multi-action
    const result = executeStoryTurn(story, {
      customActionText: 'I scale the fortress ramparts, deflect enemy arrows, and breach the main courtyard!',
    });

    expect(result.updatedStory.turns.length).toBe(2);
    const latestTurn = result.updatedStory.turns[1];
    expect(latestTurn.narrativeText).toContain('fortress ramparts');
    // Ensure no stamina deduction consequence
    expect(latestTurn.outcomeText).not.toContain('stamina');
  });

  it('3. Preserves combat progression, power level increases, and quest tracking', async () => {
    const story = createNewStory({
      title: 'Battle for Valen',
      hero: testHero,
      genres: ['Epic Fantasy'],
      worldId: 'aethelgard',
      worldName: 'Aethelgard',
      settings: {
        tone: 'Epic Fantasy',
        pacing: 'Balanced Narrative',
        difficulty: 'Heroic (Tactical)',
        storyLanguage: 'en',
      },
      storyLanguage: 'en',
    });

    const parsed = ActionParser.parse('Attack the void marauders with Silver Longsword');
    expect(parsed.intent).toBe('combat');

    const session = StorySession.fromStoryDocument(story, new LocalNarrativeProvider());
    const factStore = new WorldFactStore(session.getState().facts);

    const validation = ActionValidator.validate(session.getState(), parsed, factStore);
    expect(validation.isValid).toBe(true);

    const turnResult = await session.dispatchTurn({
      actionType: 'action',
      customActionText: 'Strike down the void marauder commander',
    });

    expect(turnResult.newTurn.sceneTitle).toBeDefined();
    expect(session.getState().powerLevel).toBeGreaterThanOrEqual(30);
  });

  it('4. Backwards compatibility: loads older saved stories with legacy stamina fields without corruption', () => {
    const legacySavedDoc = {
      id: 'story_legacy_save_123',
      title: 'Old Chronicles of Aethelgard',
      genres: ['Epic Fantasy'],
      worldId: 'aethelgard',
      worldName: 'Aethelgard',
      hero: testHero,
      settings: {
        tone: 'Epic Fantasy',
        pacing: 'Balanced Narrative',
        difficulty: 'Adventurer (Standard)',
        storyLanguage: 'en' as const,
      },
      state: {
        health: 100,
        maxHealth: 100,
        stamina: 12, // Legacy field
        powerLevel: 35,
        inventory: [],
        activeQuests: [],
        worldFlags: { chapter: 1 },
        npcTrust: {},
        statusEffects: [],
        timelineStep: 1,
        currentLocation: 'Valen Outpost',
        isGameOver: false,
      },
      turns: [
        {
          turnId: 'turn_1',
          chapterNumber: 1,
          sceneTitle: 'Opening Skirmish',
          narrativeText: 'The sky darkens as dark forces emerge from the rift.',
          choices: [
            {
              choiceId: 'c1',
              text: 'Draw your sword and charge',
              requiredStamina: 15, // Legacy choice requirement > hero stamina (12)
            },
          ],
          timestamp: Date.now(),
        },
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'active' as const,
      generationMode: 'demo' as const,
      storyLanguage: 'en' as const,
      version: 1,
    };

    // Schema safely validates
    const schemaParsed = StoryDocumentSchema.safeParse(legacySavedDoc);
    expect(schemaParsed.success).toBe(true);

    // Engine session safely instantiates and runs
    const session = StorySession.fromStoryDocument(legacySavedDoc as any, new LocalNarrativeProvider());
    expect(session.getState().title).toBe('Old Chronicles of Aethelgard');

    // Executing the choice with legacy requiredStamina: 15 now succeeds cleanly!
    const feasibility = validateActionFeasibility(legacySavedDoc.state, {
      requiredStamina: legacySavedDoc.turns[0].choices[0].requiredStamina,
    });
    expect(feasibility.isValid).toBe(true);
  });

  it('5. Exporting markdown does not include stamina lines', () => {
    const story = createNewStory({
      title: 'The Great Expedition',
      hero: testHero,
      genres: ['Epic Fantasy'],
      worldId: 'aethelgard',
      worldName: 'Aethelgard',
      settings: {
        tone: 'Epic Fantasy',
        pacing: 'Balanced Narrative',
        difficulty: 'Adventurer (Standard)',
        storyLanguage: 'en',
      },
      storyLanguage: 'en',
    });

    const markdown = exportStoryToMarkdown(story);
    expect(markdown).toContain('## Final Hero Status');
    expect(markdown).toContain('Power Level');
    expect(markdown).not.toContain('Stamina:');
  });

  it('6. UI: CharacterSheetDrawer and CharacterIntroductionCard render without stamina bars or counters', () => {
    const story = createNewStory({
      title: 'Sanctuary of the Sun',
      hero: testHero,
      genres: ['Epic Fantasy'],
      worldId: 'aethelgard',
      worldName: 'Aethelgard',
      settings: {
        tone: 'Epic Fantasy',
        pacing: 'Balanced Narrative',
        difficulty: 'Adventurer (Standard)',
        storyLanguage: 'en',
      },
      storyLanguage: 'en',
    });

    const { container: introContainer } = render(
      <CharacterIntroductionCard
        hero={story.hero}
        state={story.state}
        worldName={story.worldName}
        genres={story.genres}
        mainObjective="Unravel the mystery of the falling stars."
      />
    );

    // Intro card does not render "Stamina"
    expect(introContainer.textContent).not.toContain('Stamina');

    const { container: drawerContainer } = render(
      <CharacterSheetDrawer
        isOpen={true}
        onClose={vi.fn()}
        hero={story.hero}
        state={story.state}
        worldName={story.worldName}
      />
    );

    // Drawer does not render "Stamina & Narrative Focus"
    expect(drawerContainer.textContent).not.toContain('Stamina & Narrative Focus');
    expect(drawerContainer.textContent).toContain('Power Level & Mastery');
  });
});
