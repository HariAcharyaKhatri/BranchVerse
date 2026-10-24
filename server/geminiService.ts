import { GoogleGenAI } from '@google/genai';
import { CONFIG } from './config.js';
import { SupportedLanguage, LANGUAGE_LABELS } from './types.js';

export interface InitialStoryContext {
  hero: {
    name: string;
    race: string;
    origin: string;
    backstory: string;
    personality: string[];
    skills: string[];
  };
  genres: string[];
  worldName: string;
  tone: string;
  pacing: string;
  difficulty: string;
  storyLanguage: SupportedLanguage;
}

export interface StoryTurnContext {
  storyId: string;
  chapterNumber: number;
  currentLocation: string;
  hero: {
    name: string;
    powerLevel: number;
    health: number;
    stamina: number;
    inventory: string[];
  };
  genre: string;
  tone: string;
  storyLanguage: SupportedLanguage;
  activeQuests: Array<{ title: string; objective: string }>;
  recentTurns: Array<{
    sceneTitle: string;
    narrativeSummary: string;
    actionTaken: string;
  }>;
  playerAction: {
    choiceId?: string;
    choiceText?: string;
    customActionText?: string;
  };
}

export interface GeneratedNarrative {
  sceneTitle: string;
  narrativeText: string;
  dialogues: Array<{
    speaker: string;
    text: string;
    emotion?: 'calm' | 'furious' | 'mysterious' | 'terrified' | 'warm';
  }>;
  ambientVisual?: string;
  proposedChoices: Array<{
    choiceId: string;
    text: string;
    consequenceHint?: string;
    riskLevel?: 'safe' | 'moderate' | 'perilous';
    requiredStamina?: number;
    actionIntent?: string;
  }>;
  initialQuests?: Array<{
    id: string;
    title: string;
    giver: string;
    objective: string;
  }>;
  worldFacts?: Array<{
    factId: string;
    subject: string;
    predicate: string;
    object: string;
    confidence: number;
  }>;
}

export class GeminiService {
  private client: GoogleGenAI | null = null;

  constructor() {
    if (CONFIG.GEMINI_API_KEY) {
      this.client = new GoogleGenAI({ apiKey: CONFIG.GEMINI_API_KEY });
    }
  }

  public isConfigured(): boolean {
    return Boolean(CONFIG.GEMINI_API_KEY && CONFIG.GEMINI_API_KEY.trim() !== '');
  }

  private getLanguagePromptInstruction(lang: SupportedLanguage): string {
    const info = LANGUAGE_LABELS[lang] || LANGUAGE_LABELS.en;
    return `CRITICAL LANGUAGE REQUIREMENT: You MUST deliver ALL scene titles, prose narrative, spoken dialogues, and proposed player choices in ${info.label} (${info.native}). Do NOT produce English unless the user explicitly requested English. Proper character and realm names may remain phonetically natural.`;
  }

  /**
   * Model A: Initial Story Generation (gemini-3.8-flash)
   */
  public async generateInitialStory(context: InitialStoryContext): Promise<GeneratedNarrative> {
    if (!this.client || !this.isConfigured()) {
      throw new Error('Gemini API is not configured on the backend server.');
    }

    const modelId = CONFIG.GEMINI_INITIAL_MODEL;
    const langInstruction = this.getLanguagePromptInstruction(context.storyLanguage);

    const prompt = `You are the master AI Narrative Director for BranchVerse, a mobile-first interactive storytelling platform.
Establish the grand prologue and opening chapter for a new chronicle.

HERO PROFILE:
- Name: ${context.hero.name}
- Origin: ${context.hero.origin}
- Race: ${context.hero.race}
- Personality: ${context.hero.personality.join(', ')}
- Skills: ${context.hero.skills.join(', ')}
- Backstory: ${context.hero.backstory || 'A lone wanderer seeking destiny.'}

WORLD & CAMPAIGN:
- Realm: ${context.worldName}
- Genres: ${context.genres.join(', ')}
- Tone: ${context.tone}
- Pacing: ${context.pacing}
- Difficulty: ${context.difficulty}

${langInstruction}

TASKS:
1. Craft an evocative opening scene title.
2. Write 2-3 immersive paragraphs establishing the atmosphere, the immediate situation, and a compelling inciting tension.
3. Include 1-2 character dialogues with emotional cues (calm, furious, mysterious, terrified, warm).
4. Propose 3 distinct, meaningful first choices with varied risk levels (safe, moderate, perilous) and stamina costs (4 to 15).
5. Establish 1 starting quest and 1-2 core world facts.`;

    const rawJson = await this.callWithRetry(modelId, prompt);
    return this.parseAndValidateNarrative(rawJson, context.storyLanguage);
  }

  /**
   * Model B: Regular Story Turns (gemini-3.1-flash-lite)
   */
  public async generateStoryTurn(context: StoryTurnContext): Promise<GeneratedNarrative> {
    if (!this.client || !this.isConfigured()) {
      throw new Error('Gemini API is not configured on the backend server.');
    }

    const modelId = CONFIG.GEMINI_TURN_MODEL;
    const langInstruction = this.getLanguagePromptInstruction(context.storyLanguage);

    const actionDescription = context.playerAction.choiceText
      ? `Selected Choice: "${context.playerAction.choiceText}"`
      : `Custom Action: "${context.playerAction.customActionText}"`;

    const recentHistoryText = context.recentTurns
      .map((t, idx) => `[Turn -${context.recentTurns.length - idx}]: ${t.sceneTitle} | Action: ${t.actionTaken} | Outcome: ${t.narrativeSummary}`)
      .join('\n');

    const prompt = `You are the AI Narrative Director for BranchVerse, continuing an ongoing chronicle.

PROTAGONIST:
- Name: ${context.hero.name}
- Health: ${context.hero.health}/100 | Stamina: ${context.hero.stamina}/100 | Power: ${context.hero.powerLevel}
- Location: ${context.currentLocation}
- Inventory Items: ${context.hero.inventory.join(', ') || 'None'}

RECENT STORY CONTEXT:
${recentHistoryText || 'Story commenced.'}

ACTIVE OBJECTIVES:
${context.activeQuests.map(q => `- ${q.title}: ${q.objective}`).join('\n') || '- Survive and discover truth.'}

PLAYER'S NEW ACTION:
${actionDescription}

${langInstruction}

INSTRUCTIONS:
1. Describe the immediate dramatic outcome of the player's action.
2. Advance the plot logically without resetting the world or repeating earlier introductions.
3. Include 1-2 character dialogues reacting authentically to the player's choice.
4. Offer 3 varied, contextual next choices reflecting the new situation.`;

    const rawJson = await this.callWithRetry(modelId, prompt);
    return this.parseAndValidateNarrative(rawJson, context.storyLanguage);
  }

  private async callWithRetry(model: string, input: string): Promise<string> {
    const maxRetries = 2;
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        const interaction = await this.client!.interactions.create({
          model,
          input,
          response_format: {
            type: 'text',
            mime_type: 'application/json',
            schema: {
              type: 'object',
              properties: {
                sceneTitle: { type: 'string' },
                narrativeText: { type: 'string' },
                dialogues: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      speaker: { type: 'string' },
                      text: { type: 'string' },
                      emotion: { type: 'string' }
                    },
                    required: ['speaker', 'text']
                  }
                },
                ambientVisual: { type: 'string' },
                proposedChoices: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      choiceId: { type: 'string' },
                      text: { type: 'string' },
                      consequenceHint: { type: 'string' },
                      riskLevel: { type: 'string' },
                      requiredStamina: { type: 'number' },
                      actionIntent: { type: 'string' }
                    },
                    required: ['choiceId', 'text']
                  }
                }
              },
              required: ['sceneTitle', 'narrativeText', 'proposedChoices']
            }
          }
        });

        const outputText = interaction.output_text;
        if (!outputText) {
          throw new Error('Gemini API returned an empty response.');
        }

        return outputText;
      } catch (err: any) {
        attempt++;

        // Fail fast on quota exhaustion (do not retry 429)
        if (err?.status === 429 || err?.message?.includes('RESOURCE_EXHAUSTED')) {
          throw new Error(`Model quota exhausted for ${model}: ${err.message}`);
        }

        // Retry transient errors with backoff
        if (attempt <= maxRetries) {
          const delay = attempt * 1500;
          await new Promise((r) => setTimeout(r, delay));
        } else {
          throw new Error(`Gemini API call failed after ${maxRetries + 1} attempts: ${err.message}`);
        }
      }
    }

    throw new Error('Unexpected execution end in callWithRetry.');
  }

  private parseAndValidateNarrative(raw: string, _storyLanguage: SupportedLanguage): GeneratedNarrative {
    try {
      const parsed = JSON.parse(raw);

      return {
        sceneTitle: String(parsed.sceneTitle || 'Chronicle Chapter'),
        narrativeText: String(parsed.narrativeText || ''),
        dialogues: Array.isArray(parsed.dialogues)
          ? parsed.dialogues.map((d: any) => ({
              speaker: String(d.speaker || 'Voice in the Mist'),
              text: String(d.text || ''),
              emotion: d.emotion || 'calm'
            }))
          : [],
        ambientVisual: parsed.ambientVisual || undefined,
        proposedChoices: Array.isArray(parsed.proposedChoices) && parsed.proposedChoices.length > 0
          ? parsed.proposedChoices.map((c: any, idx: number) => ({
              choiceId: c.choiceId || `choice_ai_${Date.now()}_${idx}`,
              text: String(c.text || 'Advance with caution'),
              consequenceHint: c.consequenceHint || undefined,
              riskLevel: ['safe', 'moderate', 'perilous'].includes(c.riskLevel) ? c.riskLevel : 'moderate',
              requiredStamina: typeof c.requiredStamina === 'number' ? c.requiredStamina : 8,
              actionIntent: c.actionIntent || 'explore'
            }))
          : [
              {
                choiceId: `choice_fallback_${Date.now()}_1`,
                text: 'Press onward cautiously into the unknown.',
                riskLevel: 'safe',
                requiredStamina: 5
              }
            ],
        initialQuests: parsed.initialQuests || undefined,
        worldFacts: parsed.worldFacts || undefined,
      };
    } catch (parseErr: any) {
      throw new Error(`Failed to parse structured JSON from Gemini response: ${parseErr.message}`);
    }
  }
}

export const geminiService = new GeminiService();
