import { describe, it, expect, vi, beforeEach } from 'vitest';
import path from 'path';
import { pathToFileURL } from 'url';
import { execSync } from 'child_process';
import healthHandler from '../../api/health.js';
import initialNarrativeHandler from '../../api/narrative/initial.js';
import turnNarrativeHandler from '../../api/narrative/turn.js';
import { geminiService } from '../../server/geminiService.js';
import { CONFIG } from '../../server/config.js';

function createMockResponse() {
  const res: any = {
    statusCode: 200,
    headersSent: false,
    body: null,
    status: vi.fn((code: number) => {
      res.statusCode = code;
      return res;
    }),
    json: vi.fn((data: any) => {
      res.body = data;
      return res;
    }),
    send: vi.fn((data: any) => {
      res.body = data;
      return res;
    })
  };
  return res;
}

function createMockToken(sub: string = 'test_user_123', expOffsetSeconds: number = 3600) {
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(JSON.stringify({
    sub,
    email: `${sub}@branchverse.dev`,
    iss: 'https://securetoken.google.com/branchverse-98173',
    exp: Math.floor(Date.now() / 1000) + expOffsetSeconds
  })).toString('base64');
  return `${header}.${payload}.mock_sig`;
}

describe('Vercel Serverless API Routes (/api)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('/api/health Serverless Endpoint', () => {
    it('returns 200 OK with model configurations and health metadata', () => {
      const req: any = { method: 'GET', headers: {} };
      const res = createMockResponse();

      healthHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.body).toBeDefined();
      expect(res.body.status).toBe('ok');
      expect(res.body.models.initialModel).toBe(CONFIG.GEMINI_INITIAL_MODEL);
      expect(res.body.models.turnModel).toBe(CONFIG.GEMINI_TURN_MODEL);
      expect(res.body.quotas).toBeDefined();
      expect(res.body.rateLimitStats).toBeDefined();
    });
  });

  describe('/api/narrative/initial Serverless Endpoint', () => {
    it('rejects non-POST HTTP methods with 405 Method Not Allowed', async () => {
      const req: any = { method: 'GET', headers: {} };
      const res = createMockResponse();

      await initialNarrativeHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.body.error).toMatch(/Method Not Allowed/i);
    });

    it('rejects unauthenticated requests missing Bearer authorization header with 401', async () => {
      const req: any = { method: 'POST', headers: {} };
      const res = createMockResponse();

      await initialNarrativeHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.body.error).toMatch(/Missing Authorization Bearer token/i);
    });

    it('rejects malformed JWT tokens with 401', async () => {
      const req: any = {
        method: 'POST',
        headers: { authorization: 'Bearer malformed.token.here' }
      };
      const res = createMockResponse();

      await initialNarrativeHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.body.error).toMatch(/Malformed JWT token/i);
    });

    it('processes initial story generation successfully with Model A (gemini-3.8-flash)', async () => {
      const token = createMockToken('user_prologue_hero');
      const req: any = {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
        body: {
          hero: {
            name: 'Kael',
            race: 'Human',
            origin: 'Citadel',
            backstory: 'A novice blade-weaver.',
            personality: ['Determined'],
            skills: ['Swordsmanship']
          },
          genres: ['High Fantasy'],
          worldName: 'Aethelgard',
          tone: 'Epic Fantasy',
          pacing: 'Balanced Narrative',
          difficulty: 'Adventurer (Standard)',
          storyLanguage: 'en'
        }
      };
      const res = createMockResponse();

      vi.spyOn(geminiService, 'generateInitialStory').mockResolvedValue({
        sceneTitle: 'The Gates of Aethelgard',
        narrativeText: 'Sunlight cascades across the high marble parapets as your journey begins.',
        dialogues: [],
        proposedChoices: [
          { choiceId: 'c1', text: 'Enter the grand sanctuary', riskLevel: 'safe' },
          { choiceId: 'c2', text: 'Seek the shadowy alleys', riskLevel: 'moderate' }
        ]
      });

      await initialNarrativeHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.body.success).toBe(true);
      expect(res.body.modelUsed).toBe('gemini-3.8-flash');
      expect(res.body.narrative.sceneTitle).toBe('The Gates of Aethelgard');
    });

    it('handles Gemini timeout and returns 504 with timedOut: true and fallbackToDemo: true', async () => {
      const token = createMockToken('user_timeout_prologue');
      const req: any = {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
        body: {}
      };
      const res = createMockResponse();

      vi.spyOn(geminiService, 'generateInitialStory').mockRejectedValue(
        new Error('Gemini API request timed out after 25000ms.')
      );

      await initialNarrativeHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(504);
      expect(res.body.timedOut).toBe(true);
      expect(res.body.fallbackToDemo).toBe(true);
      expect(res.body.error).toMatch(/timed out/i);
    });

    it('handles Gemini quota exhaustion and returns 429 with quotaExhausted: true and fallbackToDemo: true', async () => {
      const token = createMockToken('user_quota_prologue');
      const req: any = {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
        body: {}
      };
      const res = createMockResponse();

      vi.spyOn(geminiService, 'generateInitialStory').mockRejectedValue(
        new Error('Model quota exhausted for gemini-3.8-flash: 429 RESOURCE_EXHAUSTED')
      );

      await initialNarrativeHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.body.quotaExhausted).toBe(true);
      expect(res.body.fallbackToDemo).toBe(true);
      expect(res.body.message).toMatch(/quota/i);
    });

    it('handles generic server failure and returns 500 with fallbackToDemo: true', async () => {
      const token = createMockToken('user_failing_prologue');
      const req: any = {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
        body: {}
      };
      const res = createMockResponse();

      vi.spyOn(geminiService, 'generateInitialStory').mockRejectedValue(
        new Error('Internal engine crash')
      );

      await initialNarrativeHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.body.fallbackToDemo).toBe(true);
      expect(res.body.error).toMatch(/Failed to generate initial story scene/i);
    });
  });

  describe('/api/narrative/turn Serverless Endpoint', () => {
    it('rejects non-POST HTTP methods with 405 Method Not Allowed', async () => {
      const req: any = { method: 'DELETE', headers: {} };
      const res = createMockResponse();

      await turnNarrativeHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.body.error).toMatch(/Method Not Allowed/i);
    });

    it('rejects unauthenticated requests missing Bearer authorization with 401', async () => {
      const req: any = { method: 'POST', headers: {} };
      const res = createMockResponse();

      await turnNarrativeHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.body.error).toMatch(/Missing Authorization Bearer token/i);
    });

    it('processes story turn successfully with Model B (gemini-3.1-flash-lite)', async () => {
      const token = createMockToken('user_turn_hero');
      const req: any = {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
        body: {
          storyId: 'story_kael_1',
          chapterNumber: 2,
          currentLocation: 'The Sunken Crypt',
          hero: {
            name: 'Kael',
            powerLevel: 10,
            health: 90,
            stamina: 80,
            inventory: ['Iron Sword']
          },
          genre: 'High Fantasy',
          tone: 'Dark & Gritty',
          storyLanguage: 'en',
          activeQuests: [],
          recentTurns: [],
          playerAction: { choiceId: 'c1', choiceText: 'Light a torch' }
        }
      };
      const res = createMockResponse();

      vi.spyOn(geminiService, 'generateStoryTurn').mockResolvedValue({
        sceneTitle: 'Shadows Recede',
        narrativeText: 'The torch flares to life, pushing back the ancient darkness.',
        dialogues: [],
        proposedChoices: [
          { choiceId: 'c3', text: 'Examine the stone sarcophagus', riskLevel: 'moderate' },
          { choiceId: 'c4', text: 'Back away cautiously', riskLevel: 'safe' }
        ]
      });

      await turnNarrativeHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.body.success).toBe(true);
      expect(res.body.modelUsed).toBe('gemini-3.1-flash-lite');
      expect(res.body.narrative.sceneTitle).toBe('Shadows Recede');
    });

    it('handles Gemini timeout and returns 504 with timedOut: true and fallbackToDemo: true', async () => {
      const token = createMockToken('user_timeout_turn');
      const req: any = {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
        body: {}
      };
      const res = createMockResponse();

      vi.spyOn(geminiService, 'generateStoryTurn').mockRejectedValue(
        new Error('Gemini API request timed out after 25000ms.')
      );

      await turnNarrativeHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(504);
      expect(res.body.timedOut).toBe(true);
      expect(res.body.fallbackToDemo).toBe(true);
      expect(res.body.error).toMatch(/timed out/i);
    });

    it('handles Gemini quota exhaustion and returns 429 with quotaExhausted: true and fallbackToDemo: true', async () => {
      const token = createMockToken('user_quota_turn');
      const req: any = {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
        body: {}
      };
      const res = createMockResponse();

      vi.spyOn(geminiService, 'generateStoryTurn').mockRejectedValue(
        new Error('Model quota exhausted for gemini-3.1-flash-lite: 429 RESOURCE_EXHAUSTED')
      );

      await turnNarrativeHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.body.quotaExhausted).toBe(true);
      expect(res.body.fallbackToDemo).toBe(true);
      expect(res.body.message).toMatch(/quota/i);
    });

    it('handles story turn generic failure and returns 500 with fallbackToDemo: true', async () => {
      const token = createMockToken('user_failing_turn');
      const req: any = {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
        body: {}
      };
      const res = createMockResponse();

      vi.spyOn(geminiService, 'generateStoryTurn').mockRejectedValue(
        new Error('Internal turn failure')
      );

      await turnNarrativeHandler(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.body.fallbackToDemo).toBe(true);
      expect(res.body.error).toMatch(/Failed to generate turn narrative/i);
    });
  });

  describe('Node.js ESM Module Resolution Integrity', () => {
    it('dynamically loads all serverless API endpoints and server modules via explicit .js extensions', async () => {
      const [healthMod, initialMod, turnMod, configMod, rateLimiterMod, geminiMod] = await Promise.all([
        import('../../api/health.js'),
        import('../../api/narrative/initial.js'),
        import('../../api/narrative/turn.js'),
        import('../../server/config.js'),
        import('../../server/rateLimiter.js'),
        import('../../server/geminiService.js')
      ]);

      expect(typeof healthMod.default).toBe('function');
      expect(typeof initialMod.default).toBe('function');
      expect(typeof turnMod.default).toBe('function');
      expect(configMod.CONFIG).toBeDefined();
      expect(rateLimiterMod.rateLimiter).toBeDefined();
      expect(geminiMod.geminiService).toBeDefined();
    });

    it('compiles api and server to JavaScript and verifies that emitted .js files resolve under Node.js ESM', async () => {
      const outDir = path.resolve(process.cwd(), 'node_modules/.tmp/verify-emitted-api');

      execSync(`npx tsc --project api/tsconfig.json --noEmit false --outDir "${outDir}"`, {
        stdio: 'pipe'
      });

      const initialUrl = pathToFileURL(path.join(outDir, 'api/narrative/initial.js')).href;
      const turnUrl = pathToFileURL(path.join(outDir, 'api/narrative/turn.js')).href;
      const healthUrl = pathToFileURL(path.join(outDir, 'api/health.js')).href;

      const [emittedInitial, emittedTurn, emittedHealth] = await Promise.all([
        import(initialUrl),
        import(turnUrl),
        import(healthUrl)
      ]);

      expect(typeof emittedInitial.default).toBe('function');
      expect(typeof emittedTurn.default).toBe('function');
      expect(typeof emittedHealth.default).toBe('function');
    });
  });
});
