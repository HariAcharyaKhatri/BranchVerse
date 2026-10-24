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
  const userId = req.userId!;
  const modelId = CONFIG.GEMINI_INITIAL_MODEL;

  // Rate Limiting & Concurrency Guard
  const slot = rateLimiter.acquireSlot(userId, modelId);
  if (!slot.allowed) {
    res.status(429).json({
      error: slot.reason,
      retryAfterMs: slot.retryAfterMs,
      fallbackToDemo: true
    });
    return;
  }

  try {
    const narrative = await geminiService.generateInitialStory(req.body);
    res.json({
      success: true,
      modelUsed: modelId,
      narrative
    });
  } catch (err: any) {
    console.error(`[Initial Story Generation Error] User: ${userId}`, err?.message || err);
    res.status(500).json({
      error: 'Failed to generate initial story scene.',
      message: err?.message?.includes('quota') ? err.message : 'AI service temporarily unavailable.',
      fallbackToDemo: true
    });
  } finally {
    slot.release?.();
  }
});

// Model B: Subsequent Story Turns (gemini-3.1-flash-lite)
app.post('/api/narrative/turn', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const userId = req.userId!;
  const modelId = CONFIG.GEMINI_TURN_MODEL;

  // Rate Limiting & Concurrency Guard
  const slot = rateLimiter.acquireSlot(userId, modelId);
  if (!slot.allowed) {
    res.status(429).json({
      error: slot.reason,
      retryAfterMs: slot.retryAfterMs,
      fallbackToDemo: true
    });
    return;
  }

  try {
    const narrative = await geminiService.generateStoryTurn(req.body);
    res.json({
      success: true,
      modelUsed: modelId,
      narrative
    });
  } catch (err: any) {
    console.error(`[Story Turn Generation Error] User: ${userId}`, err?.message || err);
    res.status(500).json({
      error: 'Failed to generate turn narrative.',
      message: err?.message?.includes('quota') ? err.message : 'AI service temporarily unavailable.',
      fallbackToDemo: true
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
