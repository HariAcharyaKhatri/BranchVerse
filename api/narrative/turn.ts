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
    console.warn('[Narrative API] Turn generation requested but GEMINI_API_KEY is not configured on backend.');
    res.status(503).json({
      error: 'Story generation service temporarily unavailable.',
      message: 'Unable to continue the story right now. Please tap Retry or continue in Offline Mode.'
    });
    return;
  }

  const modelId = CONFIG.GEMINI_TURN_MODEL;
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
    const actualModelUsed = narrative.modelUsed || modelId;
    const elapsed = Date.now() - startTime;
    console.log(`[Narrative API] [Story Turn Success] User: ${userId}, Model: ${actualModelUsed}, Elapsed: ${elapsed}ms`);
    res.status(200).json({
      success: true,
      modelUsed: actualModelUsed,
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
    res.setHeader('x-debug-error', encodeURIComponent(msg.slice(0, 400)));
    res.status(500).json({
      error: 'Failed to generate turn narrative.',
      message: 'Unable to continue the story right now. Please tap Retry or continue in Offline Mode.'
    });
  } finally {
    slot.release?.();
  }
}
