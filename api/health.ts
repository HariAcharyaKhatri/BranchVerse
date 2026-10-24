import type { Request, Response } from 'express';
import { CONFIG } from '../server/config.js';
import { rateLimiter } from '../server/rateLimiter.js';
import { geminiService } from '../server/geminiService.js';

export default function handler(_req: Request, res: Response) {
  const stats = rateLimiter.getStats();
  res.status(200).json({
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
}
