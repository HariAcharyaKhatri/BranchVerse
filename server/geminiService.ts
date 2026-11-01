import { GoogleGenAI } from '@google/genai';
import { CONFIG } from './config.js';
import { SupportedLanguage, LANGUAGE_LABELS } from './types.js';

export type NarrativeLength = 'concise' | 'balanced' | 'detailed';

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
  narrativeLength?: NarrativeLength;
  timePeriod?: string;
  storyStyle?: string;
  romanceLevel?: string;
  actionLevel?: string;
  mysteryLevel?: string;
  supportingCharacters?: string[];
  mainObjective?: string;
  userPromptDescription?: string;
}

export interface StoryTurnContext {
  storyId: string;
  chapterNumber: number;
  currentLocation: string;
  hero: {
    name: string;
    powerLevel: number;
    stamina: number;
    inventory: string[];
  };
  genre: string;
  tone: string;
  storyLanguage: SupportedLanguage;
  narrativeLength?: NarrativeLength;
  activeQuests: Array<{ title: string; objective: string }>;
  npcRelationships?: Array<{
    name: string;
    role: string;
    trust: number;
    friendship?: number;
    fear?: number;
    respect?: number;
    memories?: string[];
  }>;
  recentTurns: Array<{
    sceneTitle: string;
    narrativeSummary: string;
    actionTaken: string;
  }>;
  memorySummary?: string;
  importantFacts?: string[];
  playerAction: {
    type?: 'choice' | 'action' | 'dialogue' | 'thought';
    choiceId?: string;
    choiceText?: string;
    customActionText?: string;
    targetNpc?: string;
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
  stateChanges?: {
    location?: string;
    inventoryChanges?: string[];
    relationshipChanges?: Array<{
      npcName: string;
      trustChange?: number;
      respectChange?: number;
      fearChange?: number;
      friendshipChange?: number;
      memory?: string;
    }>;
    questUpdates?: string[];
    importantFacts?: string[];
  };
  memorySummary?: string;
  modelUsed?: string;
}

export class GeminiService {
  private client: GoogleGenAI | null = null;
  private discoveredModelsCache: string[] | null = null;
  private discoveredModelsTimestamp: number = 0;
  private readonly CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour cache

  // Models that are known to return 404, deprecated, or unavailable to new users
  private unavailableModels: Set<string> = new Set([
    'gemini-2.5-flash',     // Explicitly excluded: returns 404 (no longer available to new users)
    'gemini-2.0-flash',     // Deprecated/shut down
    'gemini-2.0-flash-lite',// Shut down
    'gemini-1.5-flash',     // Deprecated
    'gemini-1.5-pro'        // Deprecated
  ]);

  constructor() {
    if (CONFIG.GEMINI_API_KEY) {
      this.client = new GoogleGenAI({
        apiKey: CONFIG.GEMINI_API_KEY,
        httpOptions: {
          timeout: CONFIG.GEMINI_TIMEOUT_MS,
        }
      });
    }
  }

  public isConfigured(): boolean {
    return Boolean(CONFIG.GEMINI_API_KEY && CONFIG.GEMINI_API_KEY.trim() !== '');
  }

  /**
   * Discovers currently available Gemini models via official SDK API.
   * Results are cached in memory for 1 hour to prevent latency overhead.
   */
  public async getAvailableModels(): Promise<string[]> {
    const now = Date.now();
    if (
      this.discoveredModelsCache &&
      this.discoveredModelsCache.length > 0 &&
      now - this.discoveredModelsTimestamp < this.CACHE_TTL_MS
    ) {
      return this.discoveredModelsCache.filter((m) => !this.unavailableModels.has(m));
    }

    if (!this.client || !this.isConfigured()) {
      return this.getStaticVerifiedModels();
    }

    try {
      if (this.client.models && typeof this.client.models.list === 'function') {
        console.log('[GeminiService] Discovering available Gemini models via official SDK API...');
        const discovered: string[] = [];
        const pager = await this.client.models.list();

        for await (const model of pager) {
          const rawName = (model as any)?.name;
          if (!rawName) continue;
          const normalized = rawName.replace(/^models\//, '');

          // Verify it's an active Gemini model and not in our blacklist
          if (normalized.startsWith('gemini-') && !this.unavailableModels.has(normalized)) {
            discovered.push(normalized);
          }
        }

        if (discovered.length > 0) {
          console.log(`[GeminiService] Discovered ${discovered.length} available models:`, discovered.join(', '));
          this.discoveredModelsCache = discovered;
          this.discoveredModelsTimestamp = now;
          return discovered;
        }
      }
    } catch (listErr: any) {
      console.warn('[GeminiService] Model discovery API call failed (using verified fallback list):', listErr?.message || listErr);
    }

    const staticList = this.getStaticVerifiedModels();
    this.discoveredModelsCache = staticList;
    this.discoveredModelsTimestamp = now;
    return staticList;
  }

  /**
   * Verified active Gemini 3 generation models (strictly excluding 404 deprecated models).
   */
  public getStaticVerifiedModels(): string[] {
    const activeGemini3Models = [
      'gemini-3.8-flash',
      'gemini-3.6-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.1-flash-lite'
    ];
    return activeGemini3Models.filter((m) => !this.unavailableModels.has(m));
  }

  /**
   * Builds an ordered list of candidate models for story execution:
   * 1. Primary requested model (if not blacklisted)
   * 2. Verified fallback models ordered by suitability for the role
   */
  public async buildModelCascade(primaryModel: string, role: 'initial' | 'turn'): Promise<string[]> {
    const available = await this.getAvailableModels();

    // Role-specific fallback preferences:
    // Initial scene benefits from deeper reasoning (gemini-3.8-flash, gemini-3.6-flash)
    // Story turns benefit from rapid throughput (gemini-3.1-flash-lite, gemini-3.5-flash-lite)
    const fallbackPreferences =
      role === 'initial'
        ? ['gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite']
        : ['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-3.6-flash', 'gemini-3.8-flash'];

    const candidates: string[] = [];

    if (!this.unavailableModels.has(primaryModel)) {
      candidates.push(primaryModel);
    }

    for (const pref of fallbackPreferences) {
      if (!candidates.includes(pref) && !this.unavailableModels.has(pref) && available.includes(pref)) {
        candidates.push(pref);
      }
    }

    for (const model of available) {
      if (!candidates.includes(model) && !this.unavailableModels.has(model)) {
        candidates.push(model);
      }
    }

    if (candidates.length === 0) {
      candidates.push(role === 'initial' ? 'gemini-3.8-flash' : 'gemini-3.1-flash-lite');
    }

    return candidates;
  }

  private getLanguagePromptInstruction(lang: SupportedLanguage): string {
    const info = LANGUAGE_LABELS[lang] || LANGUAGE_LABELS.en;
    return `CRITICAL LANGUAGE REQUIREMENT: You MUST deliver ALL scene titles, prose narrative, spoken dialogues, and proposed player choices in ${info.label} (${info.native}). Do NOT produce English unless the user explicitly requested English. Proper character and realm names may remain phonetically natural.`;
  }

  /**
   * Model A: Initial Story Generation (gemini-3.8-flash with dynamic fallback cascade)
   */
  public async generateInitialStory(context: InitialStoryContext): Promise<GeneratedNarrative> {
    if (!this.client || !this.isConfigured()) {
      throw new Error('Gemini API is not configured on the backend server.');
    }

    const modelId = CONFIG.GEMINI_INITIAL_MODEL;
    const langInstruction = this.getLanguagePromptInstruction(context.storyLanguage);

    const lengthSetting = context.narrativeLength || 'balanced';
    let lengthRequirement = 'Write an immersive opening prologue (180 to 280 words across 2 to 3 rich paragraphs). Keep it focused and impactful.';
    let maxTokens = 1500;
    if (lengthSetting === 'concise') {
      lengthRequirement = 'Write a concise, punchy opening scene (120 to 180 words across 2 paragraphs). Quick to read, highly engaging.';
      maxTokens = 1200;
    } else if (lengthSetting === 'detailed') {
      lengthRequirement = 'Write a detailed opening chapter (280 to 380 words across 3 to 4 atmospheric paragraphs).';
      maxTokens = 2000;
    }

    const prompt = `You are the master AI Narrative Director for BranchVerse, an interactive visual novel and role-playing platform.
Establish an engaging opening scene and inciting incident for a new chronicle.

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
- Time Period: ${context.timePeriod || 'Era of Wonders'}
- Tone: ${context.tone}
- Style: ${context.storyStyle || 'Heroic Narrative'}
- Difficulty: ${context.difficulty}
- Dynamics: Action=${context.actionLevel || 'Moderate'} | Mystery=${context.mysteryLevel || 'Moderate'} | Romance=${context.romanceLevel || 'None'}
${context.mainObjective ? `- Main Objective: ${context.mainObjective}` : ''}
${context.supportingCharacters && context.supportingCharacters.length > 0 ? `- Supporting Cast: ${context.supportingCharacters.join(', ')}` : ''}
${context.userPromptDescription ? `\nCORE PREMISE / PLAYER VISION:\n"${context.userPromptDescription}"\n(Directly realize this premise in the opening scene!)` : ''}

${langInstruction}

CRITICAL PACING & ROLE-PLAY RULES:
1. ${lengthRequirement}
2. Ground the scene with sensory atmospheric cues (weather, lighting, local architecture) and ${context.hero.name}'s perspective.
3. Include 1-2 authentic character spoken dialogues with emotion cues (calm, furious, mysterious, terrified, warm).
4. Propose 3 tactical, distinct choices with risk levels (safe, moderate, perilous) and stamina costs (4 to 12).
5. Establish 1 starting quest, 1-2 world facts, and provide initial state changes if relevant.`;

    const result = await this.callWithRetry(modelId, prompt, maxTokens, 'initial');
    const narrative = this.parseAndValidateNarrative(result.text, context.storyLanguage);
    narrative.modelUsed = result.modelUsed;
    return narrative;
  }

  /**
   * Model B: Regular Story Turns (gemini-3.1-flash-lite with dynamic fallback cascade)
   */
  public async generateStoryTurn(context: StoryTurnContext): Promise<GeneratedNarrative> {
    if (!this.client || !this.isConfigured()) {
      throw new Error('Gemini API is not configured on the backend server.');
    }

    const modelId = CONFIG.GEMINI_TURN_MODEL;
    const langInstruction = this.getLanguagePromptInstruction(context.storyLanguage);

    const lengthSetting = context.narrativeLength || 'balanced';
    let lengthRequirement = 'Write a focused narrative continuation (120 to 200 words across 2 paragraphs). Fast, vivid, and responsive.';
    let maxTokens = 1400;
    if (lengthSetting === 'concise') {
      lengthRequirement = 'Write a quick, punchy continuation (80 to 140 words across 1 to 2 paragraphs). Deliver instant feedback on the action.';
      maxTokens = 1000;
    } else if (lengthSetting === 'detailed') {
      lengthRequirement = 'Write an immersive continuation (180 to 260 words across 2 to 3 descriptive paragraphs).';
      maxTokens = 1800;
    }

    // Role-play input discrimination (Action vs Dialogue vs Thought vs Choice)
    const actionType = context.playerAction.type || (context.playerAction.choiceText ? 'choice' : 'action');
    let actionInstruction = '';

    if (actionType === 'dialogue') {
      const target = context.playerAction.targetNpc ? ` to ${context.playerAction.targetNpc}` : '';
      actionInstruction = `PLAYER DIALOGUE (Spoken aloud${target}):
"${context.playerAction.customActionText || ''}"
-> ROLE-PLAY DIRECTIVE: Treat this as spoken conversation. Nearby NPCs MUST hear, react, and reply verbally in dialogue with authentic emotion!`;
    } else if (actionType === 'thought') {
      actionInstruction = `PLAYER INNER THOUGHT:
"${context.playerAction.customActionText || ''}"
-> INNER MONOLOGUE DIRECTIVE: The protagonist is contemplating or reflecting silently. Advance the scene accordingly.`;
    } else if (actionType === 'action') {
      actionInstruction = `PLAYER PHYSICAL ACTION:
"${context.playerAction.customActionText || ''}"
-> KINETIC ACTION DIRECTIVE: Describe the physical outcome, kinetic impact, and how the world and enemies/allies respond.`;
    } else {
      actionInstruction = `PLAYER SELECTED CHOICE:
"${context.playerAction.choiceText || context.playerAction.customActionText || 'Proceed'}"`;
    }

    const recentHistoryText = context.recentTurns
      .slice(-3) // Limit to the 3 most recent turns to save tokens & prevent slow prompts
      .map((t, idx) => `[Turn -${Math.min(3, context.recentTurns.length) - idx}]: ${t.sceneTitle} | Action: ${t.actionTaken} | Outcome: ${t.narrativeSummary}`)
      .join('\n');

    const npcContextText = context.npcRelationships && context.npcRelationships.length > 0
      ? `\nKNOWN NPC RELATIONSHIPS:\n${context.npcRelationships.map(n => `- ${n.name} (${n.role}): Trust=${n.trust}, Friendship=${n.friendship || 0}, Fear=${n.fear || 0}, Respect=${n.respect || 0}. Memories: ${n.memories?.slice(-2).join('; ') || 'None'}`).join('\n')}`
      : '';

    const memoryText = context.memorySummary ? `\nPREVIOUS STORY SUMMARY:\n${context.memorySummary}` : '';
    const factsText = context.importantFacts && context.importantFacts.length > 0
      ? `\nPERMANENT WORLD FACTS:\n${context.importantFacts.slice(-4).map(f => `- ${f}`).join('\n')}`
      : '';

    const prompt = `You are the AI Narrative Director for BranchVerse, continuing an ongoing role-playing chronicle.

PROTAGONIST:
- Name: ${context.hero.name}
- Stamina: ${context.hero.stamina}/100 | Power: ${context.hero.powerLevel}
- Location: ${context.currentLocation}
- Inventory Items: ${context.hero.inventory.join(', ') || 'None'}
${npcContextText}${factsText}${memoryText}

RECENT STORY CONTEXT:
${recentHistoryText || 'Story commenced.'}

ACTIVE OBJECTIVES:
${context.activeQuests.map(q => `- ${q.title}: ${q.objective}`).join('\n') || '- Survive and discover truth.'}

${actionInstruction}

${langInstruction}

CRITICAL LENGTH & ROLE-PLAY INSTRUCTIONS:
1. ${lengthRequirement}
2. Respond with dynamic kinetic consequences or dialogue responses reflecting the player's move.
3. Include 1-2 authentic NPC dialogues with distinct emotional cues.
4. Offer 3 varied, contextual next choices with riskLevel and stamina cost.
5. In 'stateChanges', record any location shift, item acquired/spent, or NPC relationship shifts.`;

    const result = await this.callWithRetry(modelId, prompt, maxTokens, 'turn');
    const narrative = this.parseAndValidateNarrative(result.text, context.storyLanguage);
    narrative.modelUsed = result.modelUsed;
    return narrative;
  }

  private async callWithRetry(
    model: string,
    input: string,
    maxTokens: number = 1500,
    role: 'initial' | 'turn' = 'initial'
  ): Promise<{ text: string; modelUsed: string }> {
    const candidateModels = await this.buildModelCascade(model, role);
    let candidateIndex = 0;
    const timeoutMs = CONFIG.GEMINI_TIMEOUT_MS;
    const deadline = Date.now() + timeoutMs;
    let attempt = 0;
    const maxRetries = Math.max(CONFIG.GEMINI_MAX_RETRIES, candidateModels.length > 1 ? candidateModels.length - 1 : 1);
    let lastError: any = null;

    while (candidateIndex < candidateModels.length) {
      const currentModel = candidateModels[candidateIndex];

      if (this.unavailableModels.has(currentModel)) {
        candidateIndex++;
        continue;
      }

      const remainingTime = deadline - Date.now();
      if (remainingTime <= 0) {
        console.warn(`[GeminiService] [Timeout] Total budget exhausted (${timeoutMs}ms) before attempt for model: ${currentModel}`);
        throw new Error(`Gemini API request timed out after ${timeoutMs}ms.`);
      }

      const attemptTimeout = Math.min(remainingTime, timeoutMs);
      const controller = new AbortController();
      const timer = setTimeout(() => {
        controller.abort(new Error(`Gemini request timed out after ${attemptTimeout}ms`));
      }, attemptTimeout);

      const requestStart = Date.now();
      console.log(`[GeminiService] [Request Started] Model: ${currentModel}, Attempt: ${attempt + 1}, TimeoutBudget: ${attemptTimeout}ms`);

      const narrativeSchema = {
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
          },
          stateChanges: {
            type: 'object',
            properties: {
              location: { type: 'string' },
              inventoryChanges: { type: 'array', items: { type: 'string' } },
              relationshipChanges: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    npcName: { type: 'string' },
                    trustChange: { type: 'number' },
                    respectChange: { type: 'number' },
                    fearChange: { type: 'number' },
                    friendshipChange: { type: 'number' },
                    memory: { type: 'string' }
                  },
                  required: ['npcName']
                }
              },
              questUpdates: { type: 'array', items: { type: 'string' } },
              importantFacts: { type: 'array', items: { type: 'string' } }
            }
          },
          memorySummary: { type: 'string' }
        },
        required: ['sceneTitle', 'narrativeText', 'proposedChoices']
      };

      try {
        let outputText = '';

        if (this.client!.models && typeof this.client!.models.generateContent === 'function') {
          try {
            const response = await this.client!.models.generateContent({
              model: currentModel,
              contents: input,
              config: {
                responseMimeType: 'application/json',
                responseSchema: narrativeSchema,
                maxOutputTokens: maxTokens,
                abortSignal: controller.signal,
                httpOptions: {
                  timeout: attemptTimeout
                }
              }
            });
            outputText = response.text || '';
          } catch (modelErr: any) {
            if (controller.signal.aborted || modelErr?.name === 'AbortError') {
              throw modelErr;
            }
            if (this.client!.interactions && typeof this.client!.interactions.create === 'function') {
              const interaction = await this.client!.interactions.create(
                {
                  model: currentModel,
                  input,
                  response_format: {
                    type: 'text',
                    mime_type: 'application/json',
                    schema: narrativeSchema
                  }
                },
                {
                  timeout: attemptTimeout,
                  fetchOptions: { signal: controller.signal },
                  retries: { strategy: 'none' }
                }
              );
              outputText = interaction.output_text || '';
            } else {
              throw modelErr;
            }
          }
        } else if (this.client!.interactions && typeof this.client!.interactions.create === 'function') {
          const interaction = await this.client!.interactions.create(
            {
              model: currentModel,
              input,
              response_format: {
                type: 'text',
                mime_type: 'application/json',
                schema: narrativeSchema
              }
            },
            {
              timeout: attemptTimeout,
              fetchOptions: { signal: controller.signal },
              retries: { strategy: 'none' }
            }
          );
          outputText = interaction.output_text || '';
        } else {
          throw new Error('Gemini API client has no supported generation method.');
        }

        clearTimeout(timer);
        const elapsed = Date.now() - requestStart;
        if (!outputText) {
          throw new Error(`Gemini API returned an empty response for model ${currentModel}.`);
        }

        console.log(`[GeminiService] [Request Success] Model Used: ${currentModel}, Elapsed: ${elapsed}ms, OutputChars: ${outputText.length}`);
        return { text: outputText, modelUsed: currentModel };
      } catch (err: any) {
        clearTimeout(timer);
        const elapsed = Date.now() - requestStart;
        lastError = err;

        const isTimeout =
          controller.signal.aborted ||
          err?.name === 'AbortError' ||
          err?.name === 'APIUserAbortError' ||
          err?.name === 'APIConnectionTimeoutError' ||
          err?.name === 'TimeoutError' ||
          err?.message?.toLowerCase().includes('timeout') ||
          err?.message?.toLowerCase().includes('aborted');

        if (isTimeout) {
          console.warn(`[GeminiService] [Request Timeout] Model: ${currentModel}, Attempt: ${attempt + 1}, Elapsed: ${elapsed}ms`);
          throw new Error(`Gemini API request timed out after ${attemptTimeout}ms.`);
        }

        // 1. Check for 404 Model Unavailable / Deprecated / No longer available to new users
        const is404 =
          err?.status === 404 ||
          err?.message?.includes('404') ||
          err?.message?.toLowerCase().includes('no longer available') ||
          err?.message?.toLowerCase().includes('not found') ||
          err?.message?.toLowerCase().includes('is not supported for this api');

        if (is404) {
          console.warn(`[GeminiService] Model '${currentModel}' is unavailable (404 / no longer available). Blacklisting and skipping immediately.`);
          this.unavailableModels.add(currentModel);
          candidateIndex++;
          // Skip immediately to the next candidate model without consuming a retry!
          continue;
        }

        // 2. Fail fast on Quota Exhaustion (429 RESOURCE_EXHAUSTED)
        if (err?.status === 429 || err?.message?.includes('RESOURCE_EXHAUSTED')) {
          console.warn(`[GeminiService] [Quota Exhausted] Model: ${currentModel}, Elapsed: ${elapsed}ms, Status: 429`);
          throw new Error(`Model quota exhausted for ${currentModel}: ${err.message}`);
        }

        // 3. Fail fast on Invalid / Unauthorized API Key (do not retry endlessly)
        const isAuthError =
          err?.status === 401 ||
          err?.status === 403 ||
          err?.message?.includes('API_KEY_INVALID') ||
          err?.message?.includes('API key not valid') ||
          (err?.status === 400 && err?.message?.toLowerCase().includes('api key'));

        if (isAuthError) {
          console.warn(`[GeminiService] [Auth Error] Status: ${err?.status || 401}, Message: ${err.message}`);
          throw new Error(`Gemini API key is invalid or unauthorized: ${err.message}`);
        }

        // 4. Fail fast on other client bad request errors (4xx)
        if (err?.status && err.status >= 400 && err.status < 500) {
          console.warn(`[GeminiService] [Client Error] Model: ${currentModel}, Status: ${err.status}, Elapsed: ${elapsed}ms`);
          throw new Error(`Gemini API request rejected with status ${err.status}: ${err.message}`);
        }

        attempt++;
        const timeLeft = deadline - Date.now();

        // 5. Check for 503 High Demand / Model Overloaded
        const is503 =
          err?.status === 503 ||
          err?.message?.includes('503') ||
          err?.message?.toLowerCase().includes('high demand') ||
          err?.message?.toLowerCase().includes('overloaded') ||
          err?.message?.toLowerCase().includes('service unavailable');

        if (is503) {
          console.warn(`[GeminiService] Model '${currentModel}' returned 503 (high demand / overloaded). Switching to next verified fallback in cascade.`);
          candidateIndex++;
          if (candidateIndex < candidateModels.length && timeLeft > 1000) {
            await new Promise((r) => setTimeout(r, 150));
            continue;
          }
        }

        console.warn(`[GeminiService] [Attempt Failed] Model: ${currentModel}, Attempt: ${attempt}/${maxRetries + 1}, Elapsed: ${elapsed}ms, Error: ${err?.message || err}`);

        // For other transient errors (500, 502, network glitch), try fallback model or retry
        candidateIndex++;
        if (candidateIndex < candidateModels.length && timeLeft > 1000) {
          const delay = Math.min(attempt * 300, Math.max(0, timeLeft - 500));
          if (delay > 0) {
            console.log(`[GeminiService] [Retrying] Switching to next fallback model, Waiting: ${delay}ms`);
            await new Promise((r) => setTimeout(r, delay));
          }
          continue;
        }

        break;
      }
    }

    console.error(`[GeminiService] All narrative generation attempts failed. Total attempts: ${attempt}. Last error:`, lastError?.message || lastError);
    throw new Error(`AI narrative service temporarily unavailable (failed after ${attempt} attempt(s): ${lastError?.message || 'unknown error'})`);
  }

  private parseAndValidateNarrative(raw: string, _storyLanguage: SupportedLanguage): GeneratedNarrative {
    try {
      let cleaned = raw.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      let parsed: any;
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        // Attempt lightweight repair if JSON is wrapped in extra prose or brackets
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No valid JSON structure found in Gemini output.');
        }
      }

      const rawDialogues = parsed.dialogues || parsed.dialogue;
      const rawChoices = parsed.proposedChoices || parsed.choices;
      const narrativeText = String(parsed.narrativeText || parsed.narrative || '');

      return {
        sceneTitle: String(parsed.sceneTitle || 'Chronicle Chapter'),
        narrativeText,
        dialogues: Array.isArray(rawDialogues)
          ? rawDialogues.map((d: any) => ({
              speaker: String(d.speaker || 'Voice in the Mist'),
              text: String(d.text || ''),
              emotion: d.emotion || 'calm'
            }))
          : [],
        ambientVisual: parsed.ambientVisual || undefined,
        proposedChoices: Array.isArray(rawChoices) && rawChoices.length > 0
          ? rawChoices.map((c: any, idx: number) => ({
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
        stateChanges: parsed.stateChanges || undefined,
        memorySummary: parsed.memorySummary || undefined,
      };
    } catch (parseErr: any) {
      throw new Error(`Failed to parse structured JSON from Gemini response: ${parseErr.message}`);
    }
  }
}

export const geminiService = new GeminiService();
