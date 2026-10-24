import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import http from 'http';
import { GoogleGenAI } from '@google/genai';
import { RateLimiter } from '../../server/rateLimiter.js';
import { CONFIG } from '../../server/config.js';
import { authMiddleware, AuthenticatedRequest } from '../../server/auth.js';
import { GeminiNarrativeProvider } from '../engine/providers/GeminiNarrativeProvider';
import { createNewStory, executeAdvancedStoryTurn } from '../features/story/storyEngine';
import { HeroProfile } from '../types/character';
import { AiNarrativeError, classifyAiError } from '../engine';
import { geminiService } from '../../server/geminiService.js';

const originalFetch = global.fetch;

describe('Dual Gemini Backend Architecture & Rate Limiter', () => {
  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe('Rate Limiter Safeguards', () => {
    let limiter: RateLimiter;

    beforeEach(() => {
      limiter = new RateLimiter();
    });

    it('allows requests within the 3 requests per minute limit per user', () => {
      const res1 = limiter.acquireSlot('user_alpha', 'gemini-3.8-flash');
      expect(res1.allowed).toBe(true);
      res1.release?.(); // Release concurrent lock

      const res2 = limiter.acquireSlot('user_alpha', 'gemini-3.8-flash');
      expect(res2.allowed).toBe(true);
      res2.release?.();

      const res3 = limiter.acquireSlot('user_alpha', 'gemini-3.8-flash');
      expect(res3.allowed).toBe(true);
      res3.release?.();

      // 4th request in the same minute should be blocked
      const res4 = limiter.acquireSlot('user_alpha', 'gemini-3.8-flash');
      expect(res4.allowed).toBe(false);
      expect(res4.reason).toMatch(/Rate limit reached/i);
    });

    it('enforces 1 active generation at a time per user', () => {
      const res1 = limiter.acquireSlot('user_beta', 'gemini-3.8-flash');
      expect(res1.allowed).toBe(true);

      // Attempting concurrent second request while res1 is active
      const res2 = limiter.acquireSlot('user_beta', 'gemini-3.1-flash-lite');
      expect(res2.allowed).toBe(false);
      expect(res2.reason).toMatch(/already have a story turn generating/i);

      // Once res1 finishes and calls release, the user can start another generation
      res1.release?.();
      const res3 = limiter.acquireSlot('user_beta', 'gemini-3.1-flash-lite');
      expect(res3.allowed).toBe(true);
      res3.release?.();
    });

    it('enforces global maximum 3 concurrent generations', () => {
      const r1 = limiter.acquireSlot('user_1', 'gemini-3.1-flash-lite');
      const r2 = limiter.acquireSlot('user_2', 'gemini-3.1-flash-lite');
      const r3 = limiter.acquireSlot('user_3', 'gemini-3.1-flash-lite');

      expect(r1.allowed).toBe(true);
      expect(r2.allowed).toBe(true);
      expect(r3.allowed).toBe(true);

      // 4th concurrent user across the globe is queued/blocked
      const r4 = limiter.acquireSlot('user_4', 'gemini-3.1-flash-lite');
      expect(r4.allowed).toBe(false);
      expect(r4.reason).toMatch(/Global AI generation queue is full/i);

      // Release one global slot
      r2.release?.();

      // Now user 4 can proceed
      const r4Retry = limiter.acquireSlot('user_4', 'gemini-3.1-flash-lite');
      expect(r4Retry.allowed).toBe(true);

      r1.release?.();
      r3.release?.();
      r4Retry.release?.();
    });

    it('immediately blocks requests when AI kill switch is disabled', () => {
      const original = CONFIG.AI_ENABLED;
      (CONFIG as any).AI_ENABLED = false;

      const res = limiter.acquireSlot('user_gamma', 'gemini-3.8-flash');
      expect(res.allowed).toBe(false);
      expect(res.reason).toMatch(/disabled by administrator/i);

      (CONFIG as any).AI_ENABLED = original;
    });
  });

  describe('Official Gemini Model Verification', () => {
    it('uses the verified official model ID for initial story generation (Model A)', () => {
      expect(CONFIG.GEMINI_INITIAL_MODEL).toBe('gemini-3.8-flash');
      expect(CONFIG.MODEL_QUOTAS['gemini-3.8-flash'].rpd).toBe(20);
      expect(CONFIG.MODEL_QUOTAS['gemini-3.8-flash'].rpm).toBe(5);
    });

    it('uses the verified official model ID for regular story turns (Model B)', () => {
      expect(CONFIG.GEMINI_TURN_MODEL).toBe('gemini-3.1-flash-lite');
      expect(CONFIG.MODEL_QUOTAS['gemini-3.1-flash-lite'].rpd).toBe(500);
      expect(CONFIG.MODEL_QUOTAS['gemini-3.1-flash-lite'].rpm).toBe(15);
    });

    it('configures safe timeout and retry limits for outbound Gemini requests', () => {
      expect(CONFIG.GEMINI_TIMEOUT_MS).toBeGreaterThanOrEqual(5000);
      expect(CONFIG.GEMINI_TIMEOUT_MS).toBeLessThanOrEqual(60000);
      expect(CONFIG.GEMINI_MAX_RETRIES).toBeGreaterThanOrEqual(0);
      expect(CONFIG.GEMINI_MAX_RETRIES).toBeLessThanOrEqual(2);
    });
  });

  describe('Auth Token Verification Middleware', () => {
    it('rejects missing or non-Bearer authorization header with 401', () => {
      const req = { headers: {} } as AuthenticatedRequest;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      } as any;
      const next = vi.fn();

      authMiddleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('extracts userId from valid JWT token payload', () => {
      // Construct a valid test JWT with subject claim
      const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64');
      const payload = Buffer.from(JSON.stringify({
        sub: 'test_firebase_user_789',
        email: 'hero@branchverse.dev',
        iss: 'https://securetoken.google.com/branchverse',
        exp: Math.floor(Date.now() / 1000) + 3600
      })).toString('base64');
      const token = `${header}.${payload}.signature_bytes`;

      const req = {
        headers: { authorization: `Bearer ${token}` }
      } as AuthenticatedRequest;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      } as any;
      const next = vi.fn();

      authMiddleware(req, res, next);
      expect(req.userId).toBe('test_firebase_user_789');
      expect(req.userEmail).toBe('hero@branchverse.dev');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Story Engine Provider Routing & Demo Mode Independence', () => {
    const mockHero: HeroProfile = {
      id: 'hero_1',
      name: 'Eldrin',
      age: '24',
      gender: 'Male',
      race: 'Elf',
      origin: 'Silverwood',
      backstory: 'Exiled ranger seeking the lost astral core.',
      appearance: { hair: 'Silver', eyes: 'Emerald', clothing: 'Leather cloak', distinguishingFeatures: 'Lunar rune' },
      personality: ['Cautious', 'Observant'],
      skills: ['Archery', 'Tracking'],
      powers: ['Astral Vision'],
      weapons: ['Composite Bow'],
      weaknesses: ['Vulnerable to iron'],
      powerLevel: 15,
      goals: ['Restore Silverwood'],
      motivations: ['Justice'],
      fears: ['Corruption'],
      secrets: ['Keeper of the seal'],
      alignment: 'Neutral Good',
      relationships: [],
      createdAt: Date.now()
    };

    it('creates a Local Demo chronicle that executes offline with zero API calls', async () => {
      const demoStory = createNewStory({
        title: 'Trial of Silverwood',
        hero: mockHero,
        genres: ['High Fantasy'],
        worldId: 'aethelgard',
        worldName: 'Aethelgard',
        settings: {
          tone: 'Epic Fantasy',
          pacing: 'Balanced Narrative',
          difficulty: 'Adventurer (Standard)',
          storyLanguage: 'en'
        },
        generationMode: 'demo',
        storyLanguage: 'en'
      });

      expect(demoStory.generationMode).toBe('demo');
      expect(demoStory.turns.length).toBe(1);

      // Execute a turn in Demo Mode
      const result = await executeAdvancedStoryTurn(demoStory, {
        customActionText: 'Inspect the ancient elven shrine'
      });

      expect(result.updatedStory.generationMode).toBe('demo');
      expect(result.updatedStory.turns.length).toBe(2);
      expect(result.newTurn.narrativeText.length).toBeGreaterThan(10);
    });

    it('does NOT silently fall back to demo mode when Gemini fails; throws classified AiNarrativeError', async () => {
      const geminiProvider = new GeminiNarrativeProvider();

      // Mock network connection failure
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error: Connection refused'));

      await expect(
        geminiProvider.generateNarrative({
          storyTitle: 'Test Chronicle',
          genre: 'Cyberpunk',
          worldName: 'Neo-Arcadia',
          tone: 'Cyberpunk Noir',
          difficulty: 'Standard',
          chapterNumber: 1,
          currentTurnNumber: 1,
          location: 'Sector 4',
          hero: {
            name: 'Vex',
            race: 'Cyborg',
            origin: 'Lower District',
            alignment: 'Chaotic Neutral',
            powers: [],
            weapons: [],
            health: 100,
            maxHealth: 100,
            stamina: 100,
            powerLevel: 10,
            statusEffects: []
          },
          inventoryItems: [],
          activeQuests: [],
          notableCharactersNearby: [],
          recentFacts: [],
          recentTurnsSummary: []
        })
      ).rejects.toThrow(AiNarrativeError);
    });

    it('classifies errors accurately into quota, network, auth, rate limit, and server', () => {
      const authErr = classifyAiError('Unauthorized: invalid token', 401);
      expect(authErr.failureType).toBe('auth');
      expect(authErr.retryable).toBe(false);

      const quotaErr = classifyAiError('RESOURCE_EXHAUSTED: daily quota exceeded', 429);
      expect(quotaErr.failureType).toBe('quota');
      expect(quotaErr.retryable).toBe(false);

      const rateLimitErr = classifyAiError('Rate limit reached: too many requests per minute', 429);
      expect(rateLimitErr.failureType).toBe('rate_limit');
      expect(rateLimitErr.retryable).toBe(true);

      const netErr = classifyAiError(new TypeError('Failed to fetch'));
      expect(netErr.failureType).toBe('network');
      expect(netErr.retryable).toBe(true);

      const timeoutErr = classifyAiError('Gemini API request timed out after 25000ms', 504);
      expect(timeoutErr.failureType).toBe('network');
      expect(timeoutErr.title).toMatch(/Timed Out/i);
      expect(timeoutErr.retryable).toBe(true);

      const serverErr = classifyAiError('Internal server error', 500);
      expect(serverErr.failureType).toBe('server');
    });

    it('preserves story state without turn duplication when Live AI action fails and retries', async () => {
      const aiStory = createNewStory({
        title: 'Echoes of Neon',
        hero: mockHero,
        genres: ['Cyberpunk'],
        worldId: 'neo_tokyo',
        worldName: 'Neo Tokyo',
        settings: {
          tone: 'Cyberpunk Noir',
          pacing: 'Fast-paced Action',
          difficulty: 'Heroic (Tactical)',
          storyLanguage: 'en'
        },
        generationMode: 'ai',
        storyLanguage: 'en'
      });

      expect(aiStory.generationMode).toBe('ai');
      const initialTurnCount = aiStory.turns.length;
      expect(initialTurnCount).toBe(1);

      // 1. Simulate failure during turn execution (e.g. 429 Quota Exhaustion)
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({ error: 'Resource has been exhausted (check quota).' })
      });

      let failed = false;
      try {
        await executeAdvancedStoryTurn(aiStory, {
          customActionText: 'Hack into the central data core'
        });
      } catch (err) {
        failed = true;
        expect(err).toBeInstanceOf(AiNarrativeError);
        expect((err as AiNarrativeError).details.failureType).toBe('quota');
      }

      expect(failed).toBe(true);
      // Verify story state was NOT modified on failure (prevents duplicate turns / corrupted state)
      expect(aiStory.turns.length).toBe(initialTurnCount);

      // 2. Retry with successful AI response (simulating user tapping "Retry Turn with Gemini")
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          narrative: {
            sceneTitle: 'Core Breached',
            narrativeText: 'The security matrix dissolves under your cyber-deck assault.',
            proposedChoices: [
              { choiceId: 'c1', text: 'Download encrypted ledger', riskLevel: 'safe' },
              { choiceId: 'c2', text: 'Purge facility cameras', riskLevel: 'moderate' }
            ]
          }
        })
      });

      const retryResult = await executeAdvancedStoryTurn(aiStory, {
        customActionText: 'Hack into the central data core'
      });

      expect(retryResult.updatedStory.turns.length).toBe(initialTurnCount + 1);
      expect(retryResult.newTurn.sceneTitle).toBe('Core Breached');

      // 3. Alternatively, switch to Local Demo Mode (simulating user tapping "Switch to Demo Mode")
      const switchedStory = { ...aiStory, generationMode: 'demo' as const };
      const demoResult = await executeAdvancedStoryTurn(switchedStory, {
        customActionText: 'Search the control room for physical evidence'
      });

      expect(demoResult.updatedStory.generationMode).toBe('demo');
      expect(demoResult.updatedStory.turns.length).toBe(initialTurnCount + 1);
      expect(demoResult.newTurn.narrativeText.length).toBeGreaterThan(0);
    });
  });

  describe('GeminiService Outbound Safeguards & Timeouts', () => {
    it('verifies configuration state and throws immediately if API is unconfigured', async () => {
      expect(typeof geminiService.isConfigured()).toBe('boolean');

      if (!geminiService.isConfigured()) {
        await expect(
          geminiService.generateInitialStory({
            hero: {
              name: 'Tester',
              race: 'Human',
              origin: 'Testland',
              backstory: 'Testing',
              personality: [],
              skills: []
            },
            genres: ['Fantasy'],
            worldName: 'World',
            tone: 'Epic',
            pacing: 'Fast',
            difficulty: 'Normal',
            storyLanguage: 'en'
          })
        ).rejects.toThrow(/Gemini API is not configured/i);
      }
    });

    it('parses structured JSON even if wrapped in markdown code fences', () => {
      const wrappedJson = '```json\n{\n  "sceneTitle": "Sanctuary Reached",\n  "narrativeText": "The ancient doors swing open.",\n  "dialogues": [],\n  "proposedChoices": [\n    { "choiceId": "c1", "text": "Step inside", "riskLevel": "safe" }\n  ]\n}\n```';

      const narrative = (geminiService as any).parseAndValidateNarrative(wrappedJson, 'en');
      expect(narrative.sceneTitle).toBe('Sanctuary Reached');
      expect(narrative.narrativeText).toBe('The ancient doors swing open.');
      expect(narrative.proposedChoices.length).toBe(1);
    });

    it('aborts hanging network request and closes underlying socket within timeout', async () => {
      let socketClosed = false;
      let requestReceived = false;

      const server = http.createServer((req, res) => {
        requestReceived = true;
        res.on('close', () => {
          socketClosed = true;
        });
        req.on('close', () => {
          socketClosed = true;
        });
      });

      await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
      const port = (server.address() as any).port;

      const testClient = new GoogleGenAI({
        apiKey: 'dummy_key',
        httpOptions: { baseUrl: `http://127.0.0.1:${port}` }
      });

      const originalClient = (geminiService as any).client;
      const originalTimeout = CONFIG.GEMINI_TIMEOUT_MS;

      (geminiService as any).client = testClient;
      (CONFIG as any).GEMINI_TIMEOUT_MS = 300; // 300ms test budget

      const start = Date.now();
      let errorThrown: any = null;

      try {
        await (geminiService as any).callWithRetry('gemini-3.8-flash', 'Test prompt');
      } catch (err: any) {
        errorThrown = err;
      } finally {
        (geminiService as any).client = originalClient;
        (CONFIG as any).GEMINI_TIMEOUT_MS = originalTimeout;
      }

      // Wait a tick for close event propagation
      await new Promise((r) => setTimeout(r, 50));
      server.closeAllConnections?.();
      server.close();

      const elapsed = Date.now() - start;

      expect(requestReceived).toBe(true);
      expect(socketClosed).toBe(true);
      expect(errorThrown).toBeDefined();
      expect(errorThrown.message).toMatch(/timed out/i);
      expect(elapsed).toBeLessThan(1500); // Exited promptly around ~300ms, not 25s or 300s
    });

    it('enforces total deadline and aborts retry loop when deadline budget is depleted', async () => {
      const originalClient = (geminiService as any).client;
      const originalTimeout = CONFIG.GEMINI_TIMEOUT_MS;
      const originalRetries = CONFIG.GEMINI_MAX_RETRIES;

      (CONFIG as any).GEMINI_TIMEOUT_MS = 250;
      (CONFIG as any).GEMINI_MAX_RETRIES = 2;

      let callCount = 0;
      const mockInteractions = {
        create: vi.fn().mockImplementation(async () => {
          callCount++;
          // Simulate a transient delay of 200ms before failing with 503
          await new Promise((r) => setTimeout(r, 200));
          const err: any = new Error('Service Unavailable');
          err.status = 503;
          throw err;
        })
      };

      (geminiService as any).client = {
        interactions: mockInteractions
      };

      const start = Date.now();
      let errorThrown: any = null;

      try {
        await (geminiService as any).callWithRetry('gemini-3.8-flash', 'Test retry deadline');
      } catch (err: any) {
        errorThrown = err;
      } finally {
        (geminiService as any).client = originalClient;
        (CONFIG as any).GEMINI_TIMEOUT_MS = originalTimeout;
        (CONFIG as any).GEMINI_MAX_RETRIES = originalRetries;
      }

      const elapsed = Date.now() - start;

      // Because remaining budget (50ms) < 1000ms threshold, it stops immediately after attempt 1
      expect(callCount).toBe(1);
      expect(errorThrown).toBeDefined();
      expect(errorThrown.message).toMatch(/failed after 1 attempt|timed out/i);
      expect(elapsed).toBeLessThan(1000);
    });

    it('successfully generates initial story narrative with Model A (gemini-3.8-flash) and parses structured schema', async () => {
      const originalClient = (geminiService as any).client;
      vi.spyOn(geminiService, 'isConfigured').mockReturnValue(true);

      const mockResponseJson = JSON.stringify({
        sceneTitle: 'Dawn of the Eclipse',
        narrativeText: 'Two moons eclipse above the obsidian spire as ancient drums reverberate.',
        dialogues: [
          { speaker: 'Archon Vael', text: 'The time has arrived.', emotion: 'mysterious' }
        ],
        proposedChoices: [
          { choiceId: 'c1', text: 'Step through the rift', riskLevel: 'safe', requiredStamina: 6 },
          { choiceId: 'c2', text: 'Draw your blade and hold ground', riskLevel: 'moderate', requiredStamina: 10 }
        ]
      });

      const mockCreate = vi.fn().mockResolvedValue({
        output_text: mockResponseJson
      });

      (geminiService as any).client = {
        interactions: { create: mockCreate }
      };

      try {
        const result = await geminiService.generateInitialStory({
          hero: {
            name: 'Kaelen',
            race: 'Human',
            origin: 'Citadel',
            backstory: 'Lone warden',
            personality: ['Brave'],
            skills: ['Swordsmanship']
          },
          genres: ['High Fantasy'],
          worldName: 'Aethelgard',
          tone: 'Epic Fantasy',
          pacing: 'Balanced Narrative',
          difficulty: 'Standard',
          storyLanguage: 'en'
        });

        expect(mockCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            model: 'gemini-3.8-flash',
            input: expect.stringContaining('Kaelen')
          }),
          expect.objectContaining({
            retries: { strategy: 'none' }
          })
        );

        expect(result.sceneTitle).toBe('Dawn of the Eclipse');
        expect(result.narrativeText).toContain('Two moons eclipse');
        expect(result.dialogues.length).toBe(1);
        expect(result.dialogues[0].speaker).toBe('Archon Vael');
        expect(result.proposedChoices.length).toBe(2);
      } finally {
        (geminiService as any).client = originalClient;
      }
    });

    it('successfully generates story turn narrative with Model B (gemini-3.1-flash-lite) and parses structured schema', async () => {
      const originalClient = (geminiService as any).client;
      vi.spyOn(geminiService, 'isConfigured').mockReturnValue(true);

      const mockResponseJson = JSON.stringify({
        sceneTitle: 'Rift Traversed',
        narrativeText: 'You step through the swirling vortex, emerging in the forgotten ruins of Solaria.',
        dialogues: [
          { speaker: 'Spectral Guide', text: 'You survived the threshold, traveler.', emotion: 'calm' }
        ],
        proposedChoices: [
          { choiceId: 'c3', text: 'Investigate glowing glyphs', riskLevel: 'safe', requiredStamina: 5 },
          { choiceId: 'c4', text: 'Climb the crumbling staircase', riskLevel: 'perilous', requiredStamina: 12 }
        ]
      });

      const mockCreate = vi.fn().mockResolvedValue({
        output_text: mockResponseJson
      });

      (geminiService as any).client = {
        interactions: { create: mockCreate }
      };

      try {
        const result = await geminiService.generateStoryTurn({
          storyId: 'story_kaelen_1',
          chapterNumber: 2,
          currentLocation: 'The Obsidian Spire',
          hero: {
            name: 'Kaelen',
            powerLevel: 15,
            health: 95,
            stamina: 80,
            inventory: ['Runeblade']
          },
          genre: 'High Fantasy',
          tone: 'Epic Fantasy',
          storyLanguage: 'en',
          activeQuests: [{ title: 'Cross the Veil', objective: 'Survive the crossing' }],
          recentTurns: [],
          playerAction: { choiceText: 'Step through the rift' }
        });

        expect(mockCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            model: 'gemini-3.1-flash-lite',
            input: expect.stringContaining('Step through the rift')
          }),
          expect.objectContaining({
            retries: { strategy: 'none' }
          })
        );

        expect(result.sceneTitle).toBe('Rift Traversed');
        expect(result.narrativeText).toContain('emerging in the forgotten ruins');
        expect(result.dialogues.length).toBe(1);
        expect(result.proposedChoices.length).toBe(2);
      } finally {
        (geminiService as any).client = originalClient;
      }
    });
  });
});
