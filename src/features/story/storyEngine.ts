import { StoryDocument, StoryTurn, ChoiceOption, SupportedLanguage } from '../../types/story';
import { HeroProfile } from '../../types/character';
import { STARTER_SCENARIOS } from '../../catalogs/scenarios';
import { applyStateDelta, validateActionFeasibility } from './stateMachine';
import { StorySession, NarrativeProvider, LocalNarrativeProvider, GeminiNarrativeProvider } from '../../engine';
import { detectLanguageChangeIntent } from './naturalPromptParser';

export interface ProcessTurnResult {
  updatedStory: StoryDocument;
  newTurn: StoryTurn;
  message?: string;
}

/**
 * Executes a player choice or custom action and returns the updated StoryDocument with new turn.
 */
export function executeStoryTurn(
  story: StoryDocument,
  action: {
    choiceId?: string;
    customActionText?: string;
  }
): ProcessTurnResult {
  const currentTurn = story.turns[story.turns.length - 1];
  const scenario = STARTER_SCENARIOS[story.worldId] || STARTER_SCENARIOS['aethelgard'];

  // Case A: User selected a predefined choice
  if (action.choiceId) {
    const chosenOption = currentTurn?.choices.find(c => c.choiceId === action.choiceId);
    if (!chosenOption) {
      throw new Error(`Choice with ID "${action.choiceId}" not found in current scene.`);
    }

    // Check feasibility
    const feasibility = validateActionFeasibility(story.state, {
      requiredItem: chosenOption.requiredItem,
      requiredStamina: chosenOption.requiredStamina
    });

    if (!feasibility.isValid) {
      throw new Error(feasibility.reason || 'Action cannot be performed.');
    }

    // Determine target node
    const nextNodeId = chosenOption.nextSceneId || 'node_1';
    const nextNode = scenario.nodes[nextNodeId] || scenario.nodes['node_1'];

    // Update state
    const nextState = applyStateDelta(story.state, chosenOption.stateImpact || {});

    // Create new turn
    const newTurn: StoryTurn = {
      turnId: `turn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      chapterNumber: nextNode.chapterNumber || (currentTurn ? currentTurn.chapterNumber + 1 : 1),
      sceneTitle: nextNode.sceneTitle,
      narrativeText: nextNode.narrativeText,
      dialogues: nextNode.dialogues,
      ambientVisual: nextNode.ambientVisual,
      choices: nextNode.choices.map(c => ({
        choiceId: c.choiceId,
        text: c.text,
        consequenceHint: c.consequenceHint,
        riskLevel: c.riskLevel,
        stateImpact: c.stateImpact,
        nextSceneId: c.nextSceneId
      })),
      timestamp: Date.now()
    };

    // Mark previous turn with selection
    if (currentTurn) {
      currentTurn.selectedChoiceId = action.choiceId;
    }

    const updatedStory: StoryDocument = {
      ...story,
      state: nextState,
      turns: [...story.turns, newTurn],
      updatedAt: Date.now()
    };

    return { updatedStory, newTurn };
  }

  // Case B: User submitted a free-form custom action
  if (action.customActionText && action.customActionText.trim().length > 0) {
    const rawAction = action.customActionText.trim();

    if (story.state.isGameOver) {
      throw new Error('The story has ended. Please start a new story or load a checkpoint.');
    }

    if (story.state.stamina < 10) {
      throw new Error('You are completely exhausted (stamina < 10). Rest or use a consumable to recover.');
    }

    // Interpret user's custom action
    const customResult = interpretCustomAction(story, rawAction);

    // Update state based on custom action consequence
    const nextState = applyStateDelta(story.state, customResult.stateDelta);

    const newTurn: StoryTurn = {
      turnId: `turn_custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      chapterNumber: currentTurn ? currentTurn.chapterNumber + 1 : 1,
      sceneTitle: customResult.sceneTitle,
      narrativeText: customResult.narrativeText,
      dialogues: customResult.dialogues,
      ambientVisual: customResult.ambientVisual,
      customActionText: rawAction,
      outcomeText: customResult.outcomeText,
      choices: customResult.choices,
      timestamp: Date.now()
    };

    if (currentTurn) {
      currentTurn.customActionText = rawAction;
    }

    const updatedStory: StoryDocument = {
      ...story,
      state: nextState,
      turns: [...story.turns, newTurn],
      updatedAt: Date.now()
    };

    return { updatedStory, newTurn };
  }

  throw new Error('Either a choiceId or customActionText must be provided.');
}

interface CustomActionInterpretation {
  sceneTitle: string;
  narrativeText: string;
  outcomeText: string;
  dialogues?: Array<{ speaker: string; text: string; emotion?: 'calm' | 'furious' | 'mysterious' | 'terrified' | 'warm' }>;
  ambientVisual?: string;
  stateDelta: {
    stamina?: number;
    powerLevel?: number;
    itemsAdded?: any[];
    itemsRemoved?: string[];
    npcTrust?: Record<string, number>;
  };
  choices: ChoiceOption[];
}

function interpretCustomAction(story: StoryDocument, actionText: string): CustomActionInterpretation {
  const hero = story.hero;
  const lower = actionText.toLowerCase();

  const isDistract = /distract|decoy|divert|lure|trick/i.test(lower);
  const isRescue = /rescue|save|protect|shield|evacuate|defend/i.test(lower);
  const isSearch = /search|evidence|investigate|examine|inspect|find|look/i.test(lower);
  const isAttack = /attack|slash|strike|kill|fight|blade|stab|blast|shoot/i.test(lower);
  const isStealth = /sneak|hide|shadow|silent|crawl|bypass/i.test(lower);
  const isNegotiate = /talk|negotiate|persuade|bribe|convince|speak|reason/i.test(lower);

  // Example match: "I distract the guards, rescue the villagers, and secretly search for evidence."
  if (isDistract && (isRescue || isSearch)) {
    return {
      sceneTitle: 'Tactical Deception & Rescue',
      narrativeText: `Moving with the refined mastery of ${hero.name}, you execute a brilliant three-fold maneuver. You toss an explosive flash into the far courtyard, sending the enemy commanders scrambling in disarray. While the confusion reigns, you guide the trapped innocents past the barricades into safety, and silently slip into the commander's pavilion to snatch an encrypted manifest of secret orders!`,
      outcomeText: `Your cunning play succeeds flawlessly: innocents rescued, enemy baffled, and vital intelligence acquired!`,
      dialogues: [
        { speaker: 'Rescued Villager', text: `You came for us when all seemed lost! May fortune bless you!`, emotion: 'warm' },
        { speaker: 'Enemy Scout (Shouting)', text: `Intruder! Where did the prisoners go?! Sound the war horn!`, emotion: 'terrified' }
      ],
      ambientVisual: 'Sparkles',
      stateDelta: {
        stamina: Math.max(10, story.state.stamina - 25),
        powerLevel: Math.min(100, (story.state.powerLevel || 35) + 5),
        itemsAdded: [
          { id: 'secret_orders', name: 'Commander’s Sealed Orders', quantity: 1, description: 'Contains classified troop routes and names of traitors.', category: 'artifact' }
        ],
        npcTrust: { 'Rescued Civilians': 90, 'Allies': 70 }
      },
      choices: [
        {
          choiceId: 'choice_read_intel',
          text: 'Break the seal on the secret orders to read the conspirators’ names.',
          consequenceHint: 'Reveals high-stakes political intelligence.',
          riskLevel: 'safe',
          nextSceneId: 'node_secret_unmasked'
        },
        {
          choiceId: 'choice_press_counterattack',
          text: 'Leverage the enemy’s panic to mount a devastating counter-offensive.',
          consequenceHint: 'High-risk assault while the foe is disorganized.',
          riskLevel: 'moderate',
          nextSceneId: 'node_final_clash'
        }
      ]
    };
  }

  if (isAttack) {
    const weaponName = hero.weapons[0] || 'blade';
    return {
      sceneTitle: 'The Fury of Battle',
      narrativeText: `Refusing hesitation, you grip your ${weaponName} with iron determination. Channeling your skills in ${hero.skills[0] || 'combat'}, you burst through the opposition in a blur of motion. The shockwave of your offensive throws the enemy formation into total retreat!`,
      outcomeText: `Your aggressive assault breaks the enemy’s vanguard at the cost of some stamina.`,
      dialogues: [
        { speaker: hero.name, text: 'If you stand against justice, you will fall before my blade.', emotion: 'furious' }
      ],
      ambientVisual: 'Sword',
      stateDelta: {
        stamina: Math.max(10, story.state.stamina - 30),
        powerLevel: Math.min(100, story.state.powerLevel + 2)
      },
      choices: [
        {
          choiceId: 'choice_follow_up',
          text: 'Pursue the fleeing commander to eliminate the threat permanently.',
          riskLevel: 'perilous',
          nextSceneId: 'node_final_clash'
        },
        {
          choiceId: 'choice_regroup',
          text: 'Hold ground and check on wounded allies before pressing onward.',
          riskLevel: 'safe',
          nextSceneId: 'node_rift_sealed'
        }
      ]
    };
  }

  if (isStealth || isSearch) {
    return {
      sceneTitle: 'Whispers in the Dark',
      narrativeText: `Sinking into the shadows like ink in water, you observe the enemy's movements from the rafters. Your keen senses pick up the rhythmic hum of magical energy beneath the flagstones. You uncover a cache of supplies and an ancient stone etched with forbidden glyphs.`,
      outcomeText: `A stealthy reconnaissance yields hidden supplies and tactical awareness.`,
      ambientVisual: 'Eye',
      stateDelta: {
        stamina: Math.max(10, story.state.stamina - 15),
        itemsAdded: [
          { id: 'found_relic', name: 'Carved Runic Fragment', quantity: 1, description: 'A shard of forgotten knowledge.', category: 'material' }
        ]
      },
      choices: [
        {
          choiceId: 'choice_silent_takedown',
          text: 'Silently neutralize the guard sentry and open the heavy iron gate.',
          riskLevel: 'moderate',
          nextSceneId: 'node_ambush_boss'
        },
        {
          choiceId: 'choice_study_glyph',
          text: 'Transcribe the runic glyphs into your journal to harness their power.',
          riskLevel: 'safe',
          nextSceneId: 'node_barrier_hold'
        }
      ]
    };
  }

  if (isNegotiate) {
    return {
      sceneTitle: 'Words of Power',
      narrativeText: `Holding up a steady hand, you address the opposition with the charismatic presence of ${hero.name}. "${actionText}" Your piercing words strike at their doubts and allegiances, sowing hesitation across their ranks.`,
      outcomeText: `A diplomatic triumph opens dialogue and defuses immediate hostility.`,
      ambientVisual: 'Crown',
      stateDelta: {
        stamina: Math.max(10, story.state.stamina - 10),
        npcTrust: { 'Opposition': 10, 'Allies': 40 }
      },
      choices: [
        {
          choiceId: 'choice_formal_parley',
          text: 'Propose a temporary truce to exchange prisoners and intelligence.',
          riskLevel: 'safe',
          nextSceneId: 'node_rift_sealed'
        },
        {
          choiceId: 'choice_press_advantage_diplomacy',
          text: 'Demand they surrender their forbidden artifacts immediately.',
          riskLevel: 'moderate',
          nextSceneId: 'node_final_clash'
        }
      ]
    };
  }

  // General creative action fallback
  return {
    sceneTitle: `The Hero's Gambit`,
    narrativeText: `You assess the chaotic situation and take daring initiative: "${actionText}". Drawing upon your inner reserves and the distinct traits of your hero's discipline, you execute the move with deliberate precision. The world around you shifts in response to your unpredictable will!`,
    outcomeText: `Your custom action alters the flow of the encounter and opens a fresh path forward.`,
    ambientVisual: 'Sparkles',
    stateDelta: {
      stamina: Math.max(10, story.state.stamina - 20)
    },
    choices: [
      {
        choiceId: 'choice_custom_followup_a',
        text: 'Seize the initiative while your opponents are reeling from your unexpected move.',
        riskLevel: 'moderate',
        nextSceneId: 'node_final_clash'
      },
      {
        choiceId: 'choice_custom_followup_b',
        text: 'Fall back to defensive posture and analyze your next strategic step.',
        riskLevel: 'safe',
        nextSceneId: 'node_rift_sealed'
      }
    ]
  };
}

/**
 * Initializes a brand new StoryDocument from user selections.
 */
export function createNewStory(params: {
  title: string;
  hero: HeroProfile;
  genres: string[];
  worldId: string;
  worldName: string;
  settings: StoryDocument['settings'];
  generationMode?: 'demo' | 'ai';
  storyLanguage?: SupportedLanguage;
  initialNarrative?: {
    sceneTitle: string;
    narrativeText: string;
    dialogues?: StoryDocument['turns'][0]['dialogues'];
    ambientVisual?: string;
    choices: ChoiceOption[];
  };
}): StoryDocument {
  const scenario = STARTER_SCENARIOS[params.worldId] || STARTER_SCENARIOS['aethelgard'];
  const initialState = scenario.initialState(params.hero);
  const startNode = scenario.nodes['node_1'];

  const initialTurn: StoryTurn = params.initialNarrative
    ? {
        turnId: `turn_start_${Date.now()}`,
        chapterNumber: 1,
        sceneTitle: params.initialNarrative.sceneTitle,
        narrativeText: params.initialNarrative.narrativeText,
        dialogues: params.initialNarrative.dialogues,
        ambientVisual: params.initialNarrative.ambientVisual || startNode.ambientVisual,
        choices: params.initialNarrative.choices,
        timestamp: Date.now()
      }
    : {
        turnId: `turn_start_${Date.now()}`,
        chapterNumber: 1,
        sceneTitle: startNode.sceneTitle,
        narrativeText: startNode.narrativeText,
        dialogues: startNode.dialogues,
        ambientVisual: startNode.ambientVisual,
        choices: startNode.choices.map(c => ({
          choiceId: c.choiceId,
          text: c.text,
          consequenceHint: c.consequenceHint,
          riskLevel: c.riskLevel,
          stateImpact: c.stateImpact,
          nextSceneId: c.nextSceneId
        })),
        timestamp: Date.now()
      };

  return {
    id: `story_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    title: params.title || `${params.hero.name}’s Chronicle`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    hero: params.hero,
    genres: params.genres,
    worldId: params.worldId,
    worldName: params.worldName,
    settings: params.settings,
    state: initialState,
    turns: [initialTurn],
    status: 'active',
    version: 1,
    generationMode: params.generationMode || 'demo',
    storyLanguage: params.storyLanguage || params.settings.storyLanguage || 'en'
  };
}

/**
 * Dispatches a player action using the transaction-safe Advanced Story Engine.
 */
export async function executeAdvancedStoryTurn(
  story: StoryDocument,
  action: {
    choiceId?: string;
    customActionText?: string;
    turnId?: string;
    idempotencyKey?: string;
  },
  provider?: NarrativeProvider
): Promise<ProcessTurnResult> {
  let activeStory: StoryDocument = { ...story };

  // Detect dynamic language change request in user action
  if (action.customActionText) {
    const langIntent = detectLanguageChangeIntent(action.customActionText);
    if (langIntent.requestedLanguage && langIntent.isPermanent) {
      activeStory.storyLanguage = langIntent.requestedLanguage;
      if (activeStory.settings) {
        activeStory.settings = { ...activeStory.settings, storyLanguage: langIntent.requestedLanguage };
      }
    }
  }

  // Model Routing: Use Gemini provider for AI stories, Local provider for Demo stories
  const narrativeProvider =
    provider ||
    (activeStory.generationMode === 'ai'
      ? new GeminiNarrativeProvider()
      : new LocalNarrativeProvider());

  const session = StorySession.fromStoryDocument(activeStory, narrativeProvider);
  const turnId = action.turnId || `turn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const { newTurn } = await session.dispatchTurn({
    turnId,
    choiceId: action.choiceId,
    customActionText: action.customActionText,
    idempotencyKey: action.idempotencyKey,
    timestamp: Date.now()
  });

  const updatedStory = session.toStoryDocument();
  // Preserve generationMode and storyLanguage across engine state serialization
  updatedStory.generationMode = activeStory.generationMode || 'demo';
  updatedStory.storyLanguage = activeStory.storyLanguage || 'en';

  const projectedTurn: StoryTurn = {
    turnId: newTurn.turnId,
    chapterNumber: newTurn.chapterNumber,
    sceneTitle: newTurn.sceneTitle,
    narrativeText: newTurn.narrativeText,
    dialogues: newTurn.dialogues,
    ambientVisual: newTurn.ambientVisual,
    choices: newTurn.choices.map(c => ({
      choiceId: c.choiceId,
      text: c.text,
      consequenceHint: c.consequenceHint,
      riskLevel: c.riskLevel,
      requiredItem: c.requiredItem,
      requiredStamina: c.requiredStamina
    })),
    selectedChoiceId: action.choiceId,
    customActionText: action.customActionText,
    timestamp: newTurn.timestamp
  };

  return {
    updatedStory,
    newTurn: projectedTurn
  };
}

