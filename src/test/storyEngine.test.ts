import { describe, it, expect } from 'vitest';
import { parseHeroPrompt, completeHeroProfile } from '../features/story/naturalPromptParser';
import { validateActionFeasibility, applyStateDelta } from '../features/story/stateMachine';
import { createNewStory, executeStoryTurn } from '../features/story/storyEngine';
import { storyRepository } from '../lib/storage/storyRepository';
import { exportStoryToMarkdown, exportStoriesToJson, importStoriesFromJson } from '../lib/storage/exportImport';

describe('BranchVerse Story Engine & Validation Tests', () => {

  describe('Natural Prompt Parser', () => {
    it('extracts name, age, hair, origin, personality, and powers from free-form prompt', () => {
      const prompt = "Create Hari, a 20-year-old white-haired swordsman from a forgotten village. He has god-level swordsmanship, a calm personality, and a mysterious past.";
      const parsed = parseHeroPrompt(prompt);

      expect(parsed.name).toBe('Hari');
      expect(parsed.age).toBe('20');
      expect(parsed.appearance?.hair).toBe('white hair');
      expect(parsed.origin).toContain('forgotten village');
      expect(parsed.personality).toContain('Calm');
      expect(parsed.weapons).toContain('Sword');
      expect(parsed.powers).toContain('Swordsmanship');
      expect(parsed.backstory).toBeTruthy();
    });

    it('completes missing details without overwriting user-provided attributes', () => {
      const partial = {
        name: 'Hari',
        age: '22',
        personality: ['Stoic']
      };
      const completed = completeHeroProfile(partial);

      expect(completed.name).toBe('Hari');
      expect(completed.age).toBe('22');
      expect(completed.personality).toContain('Stoic');
      expect(completed.race).toBeTruthy();
      expect(completed.weapons.length).toBeGreaterThan(0);
      expect(completed.appearance.clothing).toBeTruthy();
      expect(completed.relationships.length).toBeGreaterThan(0);
    });
  });

  describe('State Machine & Deterministic Invariant Rules', () => {
    it('prevents actions when hero is incapacitated or lacks stamina', () => {
      const deadState = {
        health: 0,
        maxHealth: 100,
        stamina: 50,
        powerLevel: 30,
        inventory: [],
        activeQuests: [],
        worldFlags: {},
        npcTrust: {},
        statusEffects: [],
        timelineStep: 1,
        currentLocation: 'Nowhere',
        isGameOver: true
      };

      const check1 = validateActionFeasibility(deadState, { requiredStamina: 10 });
      expect(check1.isValid).toBe(false);

      const exhaustedState = { ...deadState, health: 100, stamina: 5, isGameOver: false };
      const check2 = validateActionFeasibility(exhaustedState, { requiredStamina: 20 });
      expect(check2.isValid).toBe(false);
      expect(check2.reason).toContain('Insufficient stamina');
    });

    it('enforces item possession check when action requires a specific item', () => {
      const stateWithSword = {
        health: 100,
        maxHealth: 100,
        stamina: 80,
        powerLevel: 30,
        inventory: [{ id: 'moon_key', name: 'Moonlight Key', quantity: 1, description: 'Opens temple', category: 'key_item' as const }],
        activeQuests: [],
        worldFlags: {},
        npcTrust: {},
        statusEffects: [],
        timelineStep: 1,
        currentLocation: 'Temple Gates',
        isGameOver: false
      };

      const pass = validateActionFeasibility(stateWithSword, { requiredItem: 'Moonlight Key' });
      expect(pass.isValid).toBe(true);

      const fail = validateActionFeasibility(stateWithSword, { requiredItem: 'Sunlight Key' });
      expect(fail.isValid).toBe(false);
      expect(fail.reason).toContain('Required item');
    });

    it('applies state delta with bounded health and stamina clamping', () => {
      const baseState = {
        health: 50,
        maxHealth: 100,
        stamina: 40,
        powerLevel: 30,
        inventory: [],
        activeQuests: [],
        worldFlags: {},
        npcTrust: {},
        statusEffects: [],
        timelineStep: 1,
        currentLocation: 'Valen',
        isGameOver: false
      };

      const next = applyStateDelta(baseState, { health: 150, stamina: -10 });
      expect(next.health).toBe(100); // clamped to maxHealth
      expect(next.stamina).toBe(0);   // clamped to 0
      expect(next.timelineStep).toBe(2);
    });
  });

  describe('Story Engine Turn Execution', () => {
    it('creates a new story and executes a predefined branching choice', () => {
      const hero = completeHeroProfile({ name: 'Hari' });
      const story = createNewStory({
        title: 'Chronicles of Valen',
        hero,
        genres: ['fantasy'],
        worldId: 'aethelgard',
        worldName: 'Aethelgard High Realm',
        settings: {
          tone: 'Epic Fantasy',
          pacing: 'Balanced Narrative',
          difficulty: 'Adventurer (Standard)'
        }
      });

      expect(story.turns.length).toBe(1);
      const firstTurn = story.turns[0];
      expect(firstTurn.choices.length).toBeGreaterThan(0);

      const choice = firstTurn.choices[0];
      const { updatedStory, newTurn } = executeStoryTurn(story, { choiceId: choice.choiceId });

      expect(updatedStory.turns.length).toBe(2);
      expect(newTurn.chapterNumber).toBe(2);
      expect(updatedStory.turns[0].selectedChoiceId).toBe(choice.choiceId);
    });

    it('processes custom user actions, updates narrative, and generates subsequent choices', () => {
      const hero = completeHeroProfile({ name: 'Hari' });
      const story = createNewStory({
        title: 'Chronicles of Valen',
        hero,
        genres: ['fantasy'],
        worldId: 'aethelgard',
        worldName: 'Aethelgard High Realm',
        settings: {
          tone: 'Epic Fantasy',
          pacing: 'Balanced Narrative',
          difficulty: 'Adventurer (Standard)'
        }
      });

      const customInput = "I distract the guards, rescue the villagers, and secretly search for evidence.";
      const { updatedStory, newTurn } = executeStoryTurn(story, { customActionText: customInput });

      expect(updatedStory.turns.length).toBe(2);
      expect(newTurn.customActionText).toBe(customInput);
      expect(newTurn.narrativeText).toContain(hero.name);
      expect(newTurn.choices.length).toBeGreaterThan(0);
      expect(updatedStory.state.inventory.some(i => i.id === 'secret_orders')).toBe(true);
    });
  });

  describe('Storage, Export and Import Persistence', () => {
    it('persists and retrieves stories from IndexedDB', async () => {
      const hero = completeHeroProfile({ name: 'Hari' });
      const story = createNewStory({
        title: 'Saved Adventure',
        hero,
        genres: ['fantasy'],
        worldId: 'aethelgard',
        worldName: 'Aethelgard High Realm',
        settings: {
          tone: 'Epic Fantasy',
          pacing: 'Balanced Narrative',
          difficulty: 'Adventurer (Standard)'
        }
      });

      await storyRepository.saveStory(story);
      const retrieved = await storyRepository.getStory(story.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.title).toBe('Saved Adventure');
      expect(retrieved?.hero.name).toBe('Hari');

      const all = await storyRepository.listStories();
      expect(all.some(s => s.id === story.id)).toBe(true);

      await storyRepository.renameStory(story.id, 'Renamed Adventure');
      const renamed = await storyRepository.getStory(story.id);
      expect(renamed?.title).toBe('Renamed Adventure');

      await storyRepository.deleteStory(story.id);
      const deleted = await storyRepository.getStory(story.id);
      expect(deleted).toBeNull();
    });

    it('exports story to Markdown and JSON and successfully validates import', async () => {
      const hero = completeHeroProfile({ name: 'Hari' });
      const story = createNewStory({
        title: 'Export Test',
        hero,
        genres: ['fantasy'],
        worldId: 'aethelgard',
        worldName: 'Aethelgard High Realm',
        settings: {
          tone: 'Epic Fantasy',
          pacing: 'Balanced Narrative',
          difficulty: 'Adventurer (Standard)'
        }
      });

      const md = exportStoryToMarkdown(story);
      expect(md).toContain('# Export Test');
      expect(md).toContain('Hari');
      expect(md).toContain('Chapter 1');

      const json = exportStoriesToJson([story]);
      expect(json).toContain('"app": "BranchVerse"');

      const count = await importStoriesFromJson(json);
      expect(count).toBe(1);

      // Verify malformed JSON throws proper error
      await expect(importStoriesFromJson('{"invalid": true}')).rejects.toThrow('Data validation failed');
    });
  });
});
