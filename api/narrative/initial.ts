import type { Request, Response } from 'express';
import { CONFIG } from '../../server/config';
import { rateLimiter } from '../../server/rateLimiter';
import { geminiService } from '../../server/geminiService';

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

  const modelId = CONFIG.GEMINI_INITIAL_MODEL;
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
    res.status(200).json({
      success: true,
      modelUsed: modelId,
      narrative
    });
  } catch (err: any) {
    console.error(`[Initial Story Vercel Handler Error] User: ${userId}`, err?.message || err);
    res.status(500).json({
      error: 'Failed to generate initial story scene.',
      message: err?.message?.includes('quota') ? err.message : 'AI service temporarily unavailable.',
      fallbackToDemo: true
    });
  } finally {
    slot.release?.();
  }
}
