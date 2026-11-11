import type { Request, Response } from 'express';
import { CONFIG } from '../../server/config.js';
import { rateLimiter } from '../../server/rateLimiter.js';
import { geminiService } from '../../server/geminiService.js';

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  // Extract auth bearer token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing Authorization Bearer token.' });
    return;
  }

  let userId = 'anonymous';
  try {
    const token = authHeader.split('Bearer ')[1]?.trim();
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
      userId = payload.sub || payload.user_id || 'anonymous';
    }
  } catch {
    res.status(401).json({ error: 'Unauthorized: Malformed JWT token.' });
    return;
  }

  if (!geminiService.isConfigured()) {
    console.warn('[Character Architect API] Requested but GEMINI_API_KEY is not configured on backend.');
    res.status(503).json({
      error: 'Character Architect service temporarily unavailable.',
      message: 'Unable to commune with Angel right now. Please tap Retry.'
    });
    return;
  }

  const modelId = CONFIG.GEMINI_TURN_MODEL || 'gemini-3.1-flash-lite';
  const slot = rateLimiter.acquireSlot(userId, modelId);
  if (!slot.allowed) {
    res.status(429).json({
      error: slot.reason,
      retryAfterMs: slot.retryAfterMs
    });
    return;
  }

  const startTime = Date.now();
  console.log(`[Character Architect API] [Start] User: ${userId}, Model: ${modelId}`);

  try {
    const architectResponse = await geminiService.generateAngelArchitectTurn(req.body);
    const actualModelUsed = architectResponse.modelUsed || modelId;
    const elapsed = Date.now() - startTime;
    console.log(`[Character Architect API] [Success] User: ${userId}, Model: ${actualModelUsed}, Elapsed: ${elapsed}ms`);
    res.status(200).json({
      success: true,
      modelUsed: actualModelUsed,
      response: architectResponse
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
      console.warn(`[Character Architect API] [Timeout] User: ${userId}, Elapsed: ${elapsed}ms`);
      res.status(504).json({
        error: 'Angel communion timed out.',
        message: 'The celestial realm took longer than expected to respond. Please check your connection and tap Retry.',
        timedOut: true
      });
      return;
    }

    if (isQuota) {
      console.warn(`[Character Architect API] [Quota Exhausted] User: ${userId}, Elapsed: ${elapsed}ms`);
      res.status(429).json({
        error: 'AI model quota exceeded.',
        message: msg,
        quotaExhausted: true
      });
      return;
    }

    console.error(`[Character Architect API] [Error] User: ${userId}, Model: ${modelId}, Elapsed: ${elapsed}ms, Error: ${msg}`);
    res.status(500).json({
      error: 'Failed to commune with Angel.',
      message: 'Unable to continue character creation right now. Please tap Retry.'
    });
  } finally {
    slot.release?.();
  }
}
