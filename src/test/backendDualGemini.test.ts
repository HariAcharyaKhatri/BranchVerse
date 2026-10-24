import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RateLimiter } from '../../server/rateLimiter';
import { CONFIG } from '../../server/config';
import { authMiddleware, AuthenticatedRequest } from '../../server/auth';
import { GeminiNarrativeProvider } from '../engine/providers/GeminiNarrativeProvider';
import { createNewStory, executeAdvancedStoryTurn } from '../features/story/storyEngine';
import { HeroProfile } from '../types/character';
import { AiNarrativeError, classifyAiError } from '../engine';

describe('Dual Gemini Backend Architecture & Rate Limiter', () => {

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
});
