import express from 'express';
import cors from 'cors';
import { CONFIG } from './config.js';
import { authMiddleware, AuthenticatedRequest } from './auth.js';
import { rateLimiter } from './rateLimiter.js';
import { geminiService } from './geminiService.js';

const app = express();

app.use(cors({
  origin: true, // Allow dev origins and production Vercel/Firebase domains
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));

// Health & Diagnostic Endpoint
app.get('/api/health', (_req, res) => {
  const stats = rateLimiter.getStats();
  res.json({
    status: 'ok',
    aiEnabled: CONFIG.AI_ENABLED,
    geminiConfigured: geminiService.isConfigured(),
    models: {
      initialModel: CONFIG.GEMINI_INITIAL_MODEL,
      turnModel: CONFIG.GEMINI_TURN_MODEL
    },
    quotas: CONFIG.MODEL_QUOTAS,
    rateLimitStats: stats,
    timestamp: Date.now()
  });
});

// Model A: Initial Story Generation (gemini-3.8-flash)
app.post('/api/narrative/initial', authMiddleware, async (req: AuthenticatedRequest, res) => {
  if (!geminiService.isConfigured()) {
    res.status(503).json({
      error: 'Gemini API key is not configured on the backend server.',
      message: 'GEMINI_API_KEY is not configured on the backend server. Please add your GEMINI_API_KEY in Vercel Project Settings > Environment Variables (or .env.local for local testing).'
    });
    return;
  }

  const userId = req.userId!;
  const modelId = CONFIG.GEMINI_INITIAL_MODEL;

  // Rate Limiting & Concurrency Guard
  const slot = rateLimiter.acquireSlot(userId, modelId);
  if (!slot.allowed) {
    res.status(429).json({
      error: slot.reason,
      retryAfterMs: slot.retryAfterMs
    });
    return;
  }

  const startTime = Date.now();
  console.log(`[Narrative API] [Initial Story Start] User: ${userId}, Model: ${modelId}`);

  try {
    const narrative = await geminiService.generateInitialStory(req.body);
    const elapsed = Date.now() - startTime;
    console.log(`[Narrative API] [Initial Story Success] User: ${userId}, Model: ${modelId}, Elapsed: ${elapsed}ms`);
    res.json({
      success: true,
      modelUsed: modelId,
      narrative
    });
  } catch (err: any) {
    const elapsed = Date.now() - startTime;
    const msg = err?.message || String(err);
    const isTimeout =
      msg.toLowerCase().includes('timed out') ||
      msg.toLowerCase().includes('timeout') ||
      msg.toLowerCase().includes('aborted') ||
      err?.name === 'AbortError' ||
      err?.name === 'APIUserAbortError' ||
      err?.name === 'APIConnectionTimeoutError';
    const isQuota =
      msg.includes('quota') ||
      msg.includes('RESOURCE_EXHAUSTED') ||
      err?.status === 429;

    if (isTimeout) {
      console.warn(`[Narrative API] [Initial Story Timeout] User: ${userId}, Elapsed: ${elapsed}ms`);
      res.status(504).json({
        error: 'AI storytelling request timed out.',
        message: 'The Gemini AI model took longer than expected to respond. Please check your connection and tap Retry.',
        timedOut: true
      });
      return;
    }

    if (isQuota) {
      console.warn(`[Narrative API] [Initial Story Quota Exhausted] User: ${userId}, Elapsed: ${elapsed}ms`);
      res.status(429).json({
        error: 'AI model quota exceeded.',
        message: msg,
        quotaExhausted: true
      });
      return;
    }

    console.error(`[Narrative API] [Initial Story Error] User: ${userId}, Elapsed: ${elapsed}ms, Error: ${msg}`);
    res.status(500).json({
      error: 'Failed to generate initial story scene.',
      message: msg.length > 5 ? msg : 'AI service temporarily unavailable.'
    });
  } finally {
    slot.release?.();
  }
});

// Model B: Subsequent Story Turns (gemini-3.1-flash-lite)
app.post('/api/narrative/turn', authMiddleware, async (req: AuthenticatedRequest, res) => {
  if (!geminiService.isConfigured()) {
    res.status(503).json({
      error: 'Gemini API key is not configured on the backend server.',
      message: 'GEMINI_API_KEY is not configured on the backend server. Please add your GEMINI_API_KEY in Vercel Project Settings > Environment Variables (or .env.local for local testing).'
    });
    return;
  }

  const userId = req.userId!;
  const modelId = CONFIG.GEMINI_TURN_MODEL;

  // Rate Limiting & Concurrency Guard
  const slot = rateLimiter.acquireSlot(userId, modelId);
  if (!slot.allowed) {
    res.status(429).json({
      error: slot.reason,
      retryAfterMs: slot.retryAfterMs
    });
    return;
  }

  const startTime = Date.now();
  console.log(`[Narrative API] [Story Turn Start] User: ${userId}, Model: ${modelId}`);

  try {
    const narrative = await geminiService.generateStoryTurn(req.body);
    const elapsed = Date.now() - startTime;
    console.log(`[Narrative API] [Story Turn Success] User: ${userId}, Model: ${modelId}, Elapsed: ${elapsed}ms`);
    res.json({
      success: true,
      modelUsed: modelId,
      narrative
    });
  } catch (err: any) {
    const elapsed = Date.now() - startTime;
    const msg = err?.message || String(err);
    const isTimeout =
      msg.toLowerCase().includes('timed out') ||
      msg.toLowerCase().includes('timeout') ||
      msg.toLowerCase().includes('aborted') ||
      err?.name === 'AbortError' ||
      err?.name === 'APIUserAbortError' ||
      err?.name === 'APIConnectionTimeoutError';
    const isQuota =
      msg.includes('quota') ||
      msg.includes('RESOURCE_EXHAUSTED') ||
      err?.status === 429;

    if (isTimeout) {
      console.warn(`[Narrative API] [Story Turn Timeout] User: ${userId}, Elapsed: ${elapsed}ms`);
      res.status(504).json({
        error: 'AI storytelling request timed out.',
        message: 'The Gemini AI model took longer than expected to respond. Please check your connection and tap Retry.',
        timedOut: true
      });
      return;
    }

    if (isQuota) {
      console.warn(`[Narrative API] [Story Turn Quota Exhausted] User: ${userId}, Elapsed: ${elapsed}ms`);
      res.status(429).json({
        error: 'AI model quota exceeded.',
        message: msg,
        quotaExhausted: true
      });
      return;
    }

    console.error(`[Narrative API] [Story Turn Error] User: ${userId}, Elapsed: ${elapsed}ms, Error: ${msg}`);
    res.status(500).json({
      error: 'Failed to generate turn narrative.',
      message: msg.length > 5 ? msg : 'AI service temporarily unavailable.'
    });
  } finally {
    slot.release?.();
  }
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(CONFIG.PORT, () => {
    console.log(`[BranchVerse Server] Running on http://localhost:${CONFIG.PORT}`);
    console.log(`[BranchVerse Server] Initial Model: ${CONFIG.GEMINI_INITIAL_MODEL} | Turn Model: ${CONFIG.GEMINI_TURN_MODEL}`);
  });
}

export default app;
