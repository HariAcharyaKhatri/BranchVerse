import { GoogleGenAI } from '@google/genai';
import { CONFIG } from './config.js';
import { SupportedLanguage, LANGUAGE_LABELS } from './types.js';
import {
  getHariKhatriNarrativeDirective,
  getStoryFirstSystemDirective,
  formatPlayerActionWithStoryFirstDirectives
} from './narrativeGuidelines.js';

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
    emotion?: string;
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
  choices?: Array<{
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
  proposedStateDelta?: Record<string, any>;
  memorySummary?: string;
  modelUsed?: string;
}

export class GeminiService {
  private client: GoogleGenAI | null = null;
  private discoveredModelsCache: string[] | null = null;
  private discoveredModelsTimestamp: number = 0;
  private readonly CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour cache

  // Cooldown tracker for models experiencing temporary 503 high-demand or slow queue
  private modelCooldowns: Map<string, number> = new Map();
  private readonly COOLDOWN_DURATION_MS = 2 * 60 * 1000; // 2 minutes cooldown

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
        const listPromise = (async () => {
          const discovered: string[] = [];
          const pager = await this.client!.models.list();

          for await (const model of pager) {
            const rawName = (model as any)?.name;
            if (!rawName) continue;
            const normalized = rawName.replace(/^models\//, '');

            // Verify it's an active Gemini model and not in our blacklist
            if (normalized.startsWith('gemini-') && !this.unavailableModels.has(normalized)) {
              discovered.push(normalized);
            }
          }
          return discovered;
        })();

        const timeoutPromise = new Promise<string[]>((_, reject) =>
          setTimeout(() => reject(new Error('Model discovery list() timed out')), 2000)
        );

        const discovered = await Promise.race([listPromise, timeoutPromise]);

        if (discovered.length > 0) {
          console.log(`[GeminiService] Discovered ${discovered.length} available models:`, discovered.join(', '));
          this.discoveredModelsCache = discovered;
          this.discoveredModelsTimestamp = now;
          return discovered;
        }
      }
    } catch (listErr: any) {
      console.warn('[GeminiService] Model discovery API call failed or timed out (using verified fallback list):', listErr?.message || listErr);
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

    // Sort by cooldown state: healthy models are tried first;
    // models currently experiencing high demand/cooldown are tried after healthy models.
    const now = Date.now();
    const healthy: string[] = [];
    const cooling: string[] = [];
    for (const c of candidates) {
      const cd = this.modelCooldowns.get(c);
      if (cd && cd > now) {
        cooling.push(c);
      } else {
        healthy.push(c);
      }
    }

    const ordered = [...healthy, ...cooling];
    return ordered.length > 0 ? ordered : candidates;
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
    let lengthRequirement = 'Write an immersive opening scene (140 to 190 words across 2 engaging paragraphs).';
    let maxTokens = 700;
    if (lengthSetting === 'concise') {
      lengthRequirement = 'Write a concise, punchy opening scene (90 to 140 words across 1 to 2 paragraphs). Fast-paced and immediate.';
      maxTokens = 500;
    } else if (lengthSetting === 'detailed') {
      lengthRequirement = 'Write a detailed opening scene (190 to 250 words across 2 to 3 atmospheric paragraphs).';
      maxTokens = 900;
    }

    const storyFirstDirective = getStoryFirstSystemDirective({
      protagonistName: context.hero.name,
      worldName: context.worldName,
      genres: context.genres,
      tone: context.tone
    });

    const prompt = `You are the master AI Narrative Director for BranchVerse.
Establish an engaging opening scene and inciting incident for a new chronicle.

PROTAGONIST:
- Name: ${context.hero.name} | Race: ${context.hero.race} | Origin: ${context.hero.origin}
- Personality: ${context.hero.personality.join(', ')}
- Skills: ${context.hero.skills.join(', ')}
${context.hero.backstory ? `- Backstory: ${context.hero.backstory}` : ''}

WORLD & SETTING:
- Realm: ${context.worldName} (${context.genres.join(', ')})
- Tone: ${context.tone} | Style: ${context.storyStyle || 'Heroic Narrative'} | Difficulty: ${context.difficulty}
${context.mainObjective ? `- Objective: ${context.mainObjective}` : ''}
${context.userPromptDescription ? `\nCORE PREMISE / VISION:\n"${context.userPromptDescription}"\n(Realize this premise in the opening scene!)` : ''}

${langInstruction}

${storyFirstDirective}

PACING RULES:
1. ${lengthRequirement}
2. Ground the scene with sensory atmospheric cues and ${context.hero.name}'s perspective.
3. STORY CONTEXT & SETTING RULE: Explicitly establish WHERE ${context.hero.name} is located (city, settlement, landmark, or realm), WHAT immediate crisis or situation is occurring, and WHY this moment matters to their goals. The reader must never feel dropped into an unknown situation without context.
4. Include 1 spoken character dialogue line with emotion cue.
5. Propose 3 distinct, tactical choices with riskLevel (safe, moderate, perilous) and stamina costs (4 to 12).
Do NOT generate an entire long story. Generate only the immediate opening scene and choices needed to start playing.`;

    const result = await this.callWithRetry(modelId, prompt, maxTokens, 'initial');
    const parseStart = Date.now();
    const narrative = this.parseAndValidateNarrative(result.text, context.storyLanguage);
    console.log(`[GeminiService] [Stage: JSON Parse] Initial story parse completed in ${Date.now() - parseStart}ms`);
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
    let lengthRequirement = 'Write a focused narrative continuation (110 to 150 words across 1 to 2 paragraphs). Vivid, responsive, and kinetic.';
    let maxTokens = 600;
    if (lengthSetting === 'concise') {
      lengthRequirement = 'Write a quick continuation (70 to 110 words across 1 paragraph). Immediate feedback on the action.';
      maxTokens = 450;
    } else if (lengthSetting === 'detailed') {
      lengthRequirement = 'Write an immersive continuation (150 to 200 words across 2 paragraphs). Richly descriptive.';
      maxTokens = 800;
    }

    const heroName = context.hero?.name || 'Protagonist';
    const heroStamina = typeof context.hero?.stamina === 'number' ? context.hero.stamina : 100;
    const heroPower = typeof context.hero?.powerLevel === 'number' ? context.hero.powerLevel : 30;
    const location = context.currentLocation || 'Unknown Realm';
    const inventoryText = Array.isArray(context.hero?.inventory) && context.hero.inventory.length > 0
      ? context.hero.inventory.slice(0, 5).join(', ')
      : 'None';

    const playerAction = context.playerAction || {};
    const actionInstruction = formatPlayerActionWithStoryFirstDirectives(
      playerAction,
      {
        protagonistName: heroName,
        genre: context.genre,
        worldName: location
      }
    );

    const recentTurns = Array.isArray(context.recentTurns) ? context.recentTurns : [];
    const recentHistoryText = recentTurns
      .slice(-2) // Only 2 most recent turns to minimize latency & token budget
      .map((t: any, idx) => {
        const rawSummary = String(t.narrativeSummary || t.narrativeText || t.sceneTitle || '');
        const summary = rawSummary.slice(0, 120);
        return `[Turn -${Math.min(2, recentTurns.length) - idx}]: ${t.sceneTitle || 'Scene'} | Action: ${t.actionTaken || 'None'} -> Outcome: ${summary}`;
      })
      .join('\n');

    const npcContextText = Array.isArray(context.npcRelationships) && context.npcRelationships.length > 0
      ? `\nKNOWN NPCS: ${context.npcRelationships.slice(0, 3).map(n => `${n.name} (Trust:${n.trust})`).join(', ')}`
      : '';

    const factsText = Array.isArray(context.importantFacts) && context.importantFacts.length > 0
      ? `\nFACTS: ${context.importantFacts.slice(-2).join('; ')}`
      : '';

    const storyFirstDirective = getStoryFirstSystemDirective({
      protagonistName: heroName,
      worldName: location,
      genres: context.genre ? [context.genre] : ['Adventure'],
      tone: context.tone
    });

    const prompt = `You are the AI Narrative Director for BranchVerse, continuing an ongoing role-playing chronicle.

PROTAGONIST: ${heroName} | Stamina: ${heroStamina}/100 | Power: ${heroPower} | Location: ${location} | Items: ${inventoryText}${npcContextText}${factsText}

RECENT CONTEXT:
${recentHistoryText || 'Story commenced.'}

CURRENT ACTION:
${actionInstruction}

${langInstruction}

${storyFirstDirective}

ROLE-PLAY INSTRUCTIONS:
1. ${lengthRequirement}
2. Deliver kinetic consequences or dialogue responses to the player's move.
3. Include 1 authentic character dialogue response with emotion cue.
4. Offer 3 varied, contextual next choices with riskLevel and stamina cost.`;

    const result = await this.callWithRetry(modelId, prompt, maxTokens, 'turn');
    const parseStart = Date.now();
    const narrative = this.parseAndValidateNarrative(result.text, context.storyLanguage);
    console.log(`[GeminiService] [Stage: JSON Parse] Story turn parse completed in ${Date.now() - parseStart}ms`);
    narrative.modelUsed = result.modelUsed;
    return narrative;
  }

  private async callWithRetry(
    model: string,
    input: string,
    maxTokens: number = 700,
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
        console.warn(`[GeminiService] [Stage: Timeout] Total budget exhausted (${timeoutMs}ms) before attempt for model: ${currentModel}`);
        throw new Error(`Gemini API request timed out after ${timeoutMs}ms.`);
      }

      // Cap per-model attempt to 5500ms if there are fallback candidates, leaving ample time to try the next model
      const maxAttemptMs = candidateIndex + 1 < candidateModels.length ? 5500 : remainingTime;
      const attemptTimeout = Math.min(maxAttemptMs, remainingTime);
      const controller = new AbortController();
      const timer = setTimeout(() => {
        controller.abort(new Error(`Gemini request timed out after ${attemptTimeout}ms`));
      }, attemptTimeout);

      const requestStart = Date.now();
      console.log(`[GeminiService] [Stage: Model Dispatch] Model: ${currentModel}, Attempt: ${attempt + 1}, TimeoutBudget: ${attemptTimeout}ms, TargetTokens: ${maxTokens}`);

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
          proposedStateDelta: {
            type: 'object',
            properties: {
              currentLocation: { type: 'string' },
              region: { type: 'string' },
              kingdom: { type: 'string' },
              wealth: { type: 'string' },
              rank: { type: 'string' }
            }
          }
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

        this.modelCooldowns.delete(currentModel);
        console.log(`[GeminiService] [Stage: Model Response] Model: ${currentModel}, Latency: ${elapsed}ms, OutputChars: ${outputText.length}`);
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
          console.warn(`[GeminiService] [Stage: Model Timeout] Model: ${currentModel}, Attempt: ${attempt + 1}, Elapsed: ${elapsed}ms`);
          this.modelCooldowns.set(currentModel, Date.now() + this.COOLDOWN_DURATION_MS);
          const timeLeft = deadline - Date.now();
          if (candidateIndex + 1 < candidateModels.length && timeLeft > 2500) {
            console.warn(`[GeminiService] Model '${currentModel}' timed out after ${attemptTimeout}ms (likely high demand). Falling back to next candidate '${candidateModels[candidateIndex + 1]}'...`);
            candidateIndex++;
            attempt++;
            continue;
          }
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
          console.warn(`[GeminiService] Model '${currentModel}' returned 503 (high demand / overloaded). Putting on 2m cooldown and switching to next verified fallback.`);
          this.modelCooldowns.set(currentModel, Date.now() + this.COOLDOWN_DURATION_MS);
          candidateIndex++;
          if (candidateIndex < candidateModels.length && timeLeft > 1000) {
            await new Promise((r) => setTimeout(r, 100));
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
          try {
            parsed = JSON.parse(jsonMatch[0]);
          } catch {
            // Incomplete or truncated JSON inside match
          }
        }

        if (!parsed) {
          // Check if narrativeText can be extracted from truncated JSON
          const narrativeMatch = cleaned.match(/"(?:narrativeText|narrative|story|text)"\s*:\s*"((?:[^"\\]|\\.)*)"?/);
          if (narrativeMatch && narrativeMatch[1] && narrativeMatch[1].trim().length >= 10) {
            parsed = {
              narrativeText: narrativeMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').trim(),
              sceneTitle: 'Chronicle Chapter',
              proposedChoices: []
            };
          } else if (cleaned.length >= 10) {
            // Gemini returned raw storytelling prose without JSON structure
            parsed = {
              narrativeText: cleaned,
              sceneTitle: 'Chronicle Chapter',
              proposedChoices: []
            };
          } else {
            throw new Error('No valid narrative or JSON structure found in Gemini output.');
          }
        }
      }

      const rawDialogues = parsed.dialogues || parsed.dialogue || parsed.conversation;
      const rawChoices = parsed.proposedChoices || parsed.choices || parsed.options || parsed.nextChoices;
      const narrativeText = String(
        parsed.narrativeText ??
        parsed.narrative ??
        parsed.story ??
        parsed.text ??
        parsed.content ??
        parsed.narration ??
        ''
      );
      const sceneTitle = String(
        parsed.sceneTitle ??
        parsed.title ??
        parsed.chapterTitle ??
        parsed.scene ??
        'Chronicle Chapter'
      );
      const proposedStateDelta =
        (parsed.proposedStateDelta && typeof parsed.proposedStateDelta === 'object' && !Array.isArray(parsed.proposedStateDelta))
          ? parsed.proposedStateDelta
          : (parsed.stateChanges && typeof parsed.stateChanges === 'object' && !Array.isArray(parsed.stateChanges))
          ? parsed.stateChanges
          : undefined;

      const normalizedChoices: Array<{
        choiceId: string;
        text: string;
        consequenceHint?: string;
        riskLevel?: 'safe' | 'moderate' | 'perilous';
        requiredStamina?: number;
        actionIntent?: string;
      }> = Array.isArray(rawChoices) && rawChoices.length > 0
        ? rawChoices.map((c: any, idx: number) => ({
            choiceId: c.choiceId || `choice_ai_${Date.now()}_${idx}`,
            text: String(c.text || 'Advance with caution'),
            consequenceHint: c.consequenceHint || undefined,
            riskLevel: (['safe', 'moderate', 'perilous'].includes(c.riskLevel?.toLowerCase()) ? c.riskLevel.toLowerCase() : 'moderate') as 'safe' | 'moderate' | 'perilous',
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
          ];

      console.log(`[GeminiService] [Stage: JSON Parse] Success: ${Boolean(narrativeText && narrativeText.length >= 10)}, Title: "${sceneTitle}", Chars: ${narrativeText.length}, Choices: ${normalizedChoices.length}, StateDelta: ${Boolean(proposedStateDelta)}`);

      return {
        sceneTitle,
        narrativeText,
        dialogues: Array.isArray(rawDialogues)
          ? rawDialogues.map((d: any) => ({
              speaker: String(d.speaker || 'Voice in the Mist'),
              text: String(d.text || ''),
              emotion: d.emotion || 'calm'
            }))
          : [],
        ambientVisual: parsed.ambientVisual || undefined,
        proposedChoices: normalizedChoices,
        choices: normalizedChoices,
        initialQuests: parsed.initialQuests || undefined,
        worldFacts: parsed.worldFacts || undefined,
        stateChanges: parsed.stateChanges || undefined,
        proposedStateDelta,
        memorySummary: parsed.memorySummary || undefined,
      };
    } catch (parseErr: any) {
      throw new Error(`Failed to parse structured JSON from Gemini response: ${parseErr.message}`);
    }
  }
}

export const geminiService = new GeminiService();
