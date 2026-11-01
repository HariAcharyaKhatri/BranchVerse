import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createNewStory, executeAdvancedStoryTurn } from '../features/story/storyEngine';
import { StorySession } from '../engine/core/StorySession';
import { NarrativeContextBuilder } from '../engine/narrative/NarrativeContextBuilder';
import { GeminiNarrativeProvider } from '../engine/providers/GeminiNarrativeProvider';
import { LocalNarrativeProvider } from '../engine/providers/LocalNarrativeProvider';
import { WorldFactStore } from '../engine/world/WorldFactStore';
import { preferencesService } from '../features/preferences/preferencesService';
import { geminiService } from '../../server/geminiService';
import { StoryDocument } from '../types/story';

describe('Story Language Persistence & Natural Hindi Narration', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  const mockHero = {
    name: 'Kaelen',
    race: 'Human',
    origin: 'Outcast Wanderer',
    alignment: 'Chaotic Good',
    powers: ['Shadow Step', 'Frost Nova'],
    weapons: ['Silver Dagger'],
    stamina: 100,
    powerLevel: 25,
    statusEffects: [],
    personality: ['Perceptive', 'Tenacious'],
    skills: ['Stealth', 'Alchemy'],
  };

  it('1. Initializes new story with explicit Hindi language persisted in document and settings', () => {
    const story = createNewStory({
      title: 'Journey to the Citadel',
      hero: mockHero,
      genres: ['Fantasy'],
      worldId: 'aethelgard',
      worldName: 'Aethelgard',
      settings: {
        tone: 'Epic Fantasy',
        pacing: 'Balanced Narrative',
        difficulty: 'Adventurer (Standard)',
        storyLanguage: 'hi',
      },
      storyLanguage: 'hi',
    });

    expect(story.storyLanguage).toBe('hi');
    expect(story.settings.storyLanguage).toBe('hi');
  });

  it('2. Defaults new story to Hindi when storyLanguage is not explicitly specified', () => {
    const story = createNewStory({
      title: 'Journey to the Citadel',
      hero: mockHero,
      genres: ['Fantasy'],
      worldId: 'aethelgard',
      worldName: 'Aethelgard',
      settings: {
        tone: 'Epic Fantasy',
        pacing: 'Balanced Narrative',
        difficulty: 'Adventurer (Standard)',
      },
    });

    expect(story.storyLanguage).toBe('hi');
    expect(story.settings.storyLanguage).toBe('hi');
  });

  it('3. Rehydrates StorySession from StoryDocument and preserves Hindi in authoritative engine state', () => {
    const story = createNewStory({
      title: 'The Silent Ruins',
      hero: mockHero,
      genres: ['Fantasy'],
      worldId: 'aethelgard',
      worldName: 'Aethelgard',
      settings: {
        tone: 'Epic Fantasy',
        pacing: 'Balanced Narrative',
        difficulty: 'Adventurer (Standard)',
        storyLanguage: 'hi',
      },
      storyLanguage: 'hi',
    });

    const session = StorySession.fromStoryDocument(story);
    const engineState = session.getState();

    expect(engineState.storyLanguage).toBe('hi');
    const projectedDoc = session.toStoryDocument();
    expect(projectedDoc.storyLanguage).toBe('hi');
    expect(projectedDoc.settings.storyLanguage).toBe('hi');
  });

  it('4. Rehydrates legacy StoryDocument without language metadata and defaults gracefully to user preference (Hindi)', () => {
    const legacyDoc: any = {
      id: 'legacy_story_123',
      title: 'Ancient Chronicles',
      hero: mockHero,
      genres: ['Fantasy'],
      worldId: 'aethelgard',
      worldName: 'Aethelgard',
      settings: {
        tone: 'Epic Fantasy',
        pacing: 'Balanced Narrative',
        difficulty: 'Adventurer (Standard)',
      },
      state: {
        stamina: 100,
        powerLevel: 20,
        inventory: [],
        activeQuests: [],
        worldFlags: {},
        npcTrust: {},
        statusEffects: [],
        timelineStep: 1,
        currentLocation: 'Outpost',
        isGameOver: false,
      },
      turns: [
        {
          turnId: 'turn_1',
          chapterNumber: 1,
          sceneTitle: 'The Beginning',
          narrativeText: 'Prose',
          choices: [{ choiceId: 'c1', text: 'Go' }],
          timestamp: Date.now(),
        },
      ],
      status: 'active',
      version: 1,
    };

    const session = StorySession.fromStoryDocument(legacyDoc);
    expect(session.getState().storyLanguage).toBe('hi');
    const doc = session.toStoryDocument();
    expect(doc.storyLanguage).toBe('hi');
    expect(doc.settings.storyLanguage).toBe('hi');
  });

  it('5. NarrativeContextBuilder propagates storyLanguage into promptContext', () => {
    const story = createNewStory({
      title: 'The Mystic Cavern',
      hero: mockHero,
      genres: ['Fantasy'],
      worldId: 'aethelgard',
      worldName: 'Aethelgard',
      settings: {
        tone: 'Epic Fantasy',
        pacing: 'Balanced Narrative',
        difficulty: 'Adventurer (Standard)',
        storyLanguage: 'hi',
      },
      storyLanguage: 'hi',
    });

    const session = StorySession.fromStoryDocument(story);
    const factStore = new WorldFactStore([]);
    const context = NarrativeContextBuilder.build(session.getState(), factStore);

    expect(context.storyLanguage).toBe('hi');
  });

  it('6. Story turns via executeAdvancedStoryTurn preserve storyLanguage across consecutive turns', async () => {
    const initialStory = createNewStory({
      title: 'Chronicle of Aethelgard',
      hero: mockHero,
      genres: ['Fantasy'],
      worldId: 'aethelgard',
      worldName: 'Aethelgard',
      settings: {
        tone: 'Epic Fantasy',
        pacing: 'Balanced Narrative',
        difficulty: 'Adventurer (Standard)',
        storyLanguage: 'hi',
      },
      storyLanguage: 'hi',
    });

    // Turn 1: Predefined choice
    const turn1Result = await executeAdvancedStoryTurn(
      initialStory,
      { choiceId: initialStory.turns[0].choices[0].choiceId },
      new LocalNarrativeProvider()
    );

    expect(turn1Result.updatedStory.storyLanguage).toBe('hi');
    expect(turn1Result.updatedStory.settings.storyLanguage).toBe('hi');

    // Turn 2: Custom action
    const turn2Result = await executeAdvancedStoryTurn(
      turn1Result.updatedStory,
      { customActionText: 'I examine the ancient glyphs on the altar' },
      new LocalNarrativeProvider()
    );

    expect(turn2Result.updatedStory.storyLanguage).toBe('hi');
    expect(turn2Result.updatedStory.settings.storyLanguage).toBe('hi');
    expect(turn2Result.updatedStory.turns.length).toBe(3);
  });

  it('7. GeminiNarrativeProvider sends storyLanguage: "hi" in API request payload for subsequent turns', async () => {
    let capturedPayload: any = null;
    global.fetch = vi.fn().mockImplementation(async (_url, opts) => {
      capturedPayload = JSON.parse(opts.body);
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          modelUsed: 'gemini-3.1-flash-lite',
          narrative: {
            sceneTitle: 'रहस्यमयी गुफा',
            narrativeText: 'कैलेन ने आगे कदम बढ़ाया। अंधेरे में मशाल की रोशनी चमक रही थी।',
            proposedChoices: [
              {
                choiceId: 'c_hi_1',
                text: 'गुफा के भीतर और आगे बढ़ें',
                riskLevel: 'moderate',
                requiredStamina: 10,
              },
            ],
          },
        }),
      };
    });

    const story = createNewStory({
      title: 'Chronicle of Aethelgard',
      hero: mockHero,
      genres: ['Fantasy'],
      worldId: 'aethelgard',
      worldName: 'Aethelgard',
      generationMode: 'ai',
      settings: {
        tone: 'Epic Fantasy',
        pacing: 'Balanced Narrative',
        difficulty: 'Adventurer (Standard)',
        storyLanguage: 'hi',
      },
      storyLanguage: 'hi',
    });

    const geminiProvider = new GeminiNarrativeProvider();
    const result = await executeAdvancedStoryTurn(
      story,
      { choiceId: story.turns[0].choices[0].choiceId },
      geminiProvider
    );

    expect(capturedPayload).not.toBeNull();
    expect(capturedPayload.storyLanguage).toBe('hi');
    expect(result.updatedStory.storyLanguage).toBe('hi');
  });

  it('8. LocalNarrativeProvider outputs natural Devanagari Hindi text and choices when storyLanguage is Hindi', async () => {
    const localProvider = new LocalNarrativeProvider();
    const proposal = await localProvider.generateNarrative({
      storyTitle: 'Test Hindi Story',
      genre: 'Fantasy',
      worldName: 'Aethelgard',
      tone: 'Epic Fantasy',
      difficulty: 'Adventurer',
      storyLanguage: 'hi',
      chapterNumber: 2,
      currentTurnNumber: 2,
      location: 'प्राचीन किला',
      hero: {
        name: 'कैलेन',
        race: 'Human',
        origin: 'Wanderer',
        alignment: 'Good',
        powers: [],
        weapons: [],
        stamina: 80,
        powerLevel: 25,
        statusEffects: [],
      },
      inventoryItems: [],
      activeQuests: [],
      notableCharactersNearby: [],
      recentFacts: [],
      recentTurnsSummary: [],
    });

    // Contains Hindi Devanagari characters
    expect(/[\u0900-\u097F]/.test(proposal.sceneTitle)).toBe(true);
    expect(/[\u0900-\u097F]/.test(proposal.narrativeText)).toBe(true);
    expect(proposal.proposedChoices.length).toBeGreaterThan(0);
    expect(/[\u0900-\u097F]/.test(proposal.proposedChoices[0].text)).toBe(true);
  });

  it('9. geminiService.getLanguagePromptInstruction contains natural modern Hindi and English genre loanword rules', () => {
    const instruction = geminiService.getLanguagePromptInstruction('hi');

    expect(instruction).toContain('natural, modern Hindi using Devanagari script');
    expect(instruction).toContain('Avoid unnecessarily difficult, overly formal, highly Sanskritized, or archaic vocabulary');
    expect(instruction).toContain('Magic, Mage, Guild, Quest, Kingdom, Level, Skill, Boss, Dungeon, Portal');
    expect(instruction).toContain('Maintain this language consistently throughout the entire story');
  });

  it('10. English story language is preserved when user explicitly selects English', async () => {
    const englishStory = createNewStory({
      title: 'Chronicle of Albion',
      hero: mockHero,
      genres: ['Fantasy'],
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

    expect(englishStory.storyLanguage).toBe('en');
    expect(englishStory.settings.storyLanguage).toBe('en');

    const result = await executeAdvancedStoryTurn(
      englishStory,
      { choiceId: englishStory.turns[0].choices[0].choiceId },
      new LocalNarrativeProvider()
    );

    expect(result.updatedStory.storyLanguage).toBe('en');
    expect(result.updatedStory.settings.storyLanguage).toBe('en');
  });

  it('11. Dynamic in-story language switch (e.g. switch language to english) updates and persists', async () => {
    const hindiStory = createNewStory({
      title: 'Bilingual Chronicle',
      hero: mockHero,
      genres: ['Fantasy'],
      worldId: 'aethelgard',
      worldName: 'Aethelgard',
      settings: {
        tone: 'Epic Fantasy',
        pacing: 'Balanced Narrative',
        difficulty: 'Adventurer (Standard)',
        storyLanguage: 'hi',
      },
      storyLanguage: 'hi',
    });

    const result = await executeAdvancedStoryTurn(
      hindiStory,
      { customActionText: 'Please switch the story language to English from now on.' },
      new LocalNarrativeProvider()
    );

    expect(result.updatedStory.storyLanguage).toBe('en');
    expect(result.updatedStory.settings.storyLanguage).toBe('en');
  });

  it('12. Prevents Story Generation Paused crash when player stamina is depleted after many turns', async () => {
    const exhaustedStory = createNewStory({
      title: 'Exhausted Hero Chronicle',
      hero: mockHero,
      genres: ['Fantasy'],
      worldId: 'aethelgard',
      worldName: 'Aethelgard',
      settings: {
        tone: 'Epic Fantasy',
        pacing: 'Balanced Narrative',
        difficulty: 'Adventurer (Standard)',
        storyLanguage: 'hi',
      },
      storyLanguage: 'hi',
    });

    // Artificially deplete stamina to 0 (simulating 15+ turns of continuous adventuring)
    exhaustedStory.state.stamina = 0;

    // Player selects a choice costing stamina
    const choiceId = exhaustedStory.turns[0].choices[0].choiceId;
    const result = await executeAdvancedStoryTurn(
      exhaustedStory,
      { choiceId },
      new LocalNarrativeProvider()
    );

    expect(result.updatedStory.turns.length).toBe(2);
    expect(result.updatedStory.storyLanguage).toBe('hi');
    expect(result.updatedStory.state.stamina).toBeGreaterThanOrEqual(10);
  });
});
