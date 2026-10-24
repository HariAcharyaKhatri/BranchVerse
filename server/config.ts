import dotenv from 'dotenv';
import path from 'path';

// Load .env.local if present in project root
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config(); // fallback to standard .env

export const CONFIG = {
  PORT: parseInt(process.env.PORT || '3001', 10),
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_INITIAL_MODEL: process.env.GEMINI_INITIAL_MODEL || 'gemini-3.8-flash',
  GEMINI_TURN_MODEL: process.env.GEMINI_TURN_MODEL || 'gemini-3.1-flash-lite',
  AI_ENABLED: process.env.AI_ENABLED !== 'false',

  // Application-Level Rate Limits (Configurable)
  LIMITS: {
    MAX_USER_RPM: 3,        // Max 3 AI requests per user per minute
    MAX_USER_RPD: 30,       // Max 30 AI requests per user per day
    MAX_GLOBAL_RPM: 12,     // Max 12 AI requests globally per minute
    MAX_GLOBAL_RPD: 400,    // Max 400 AI requests globally per day
    MAX_USER_CONCURRENT: 1, // 1 active generation per user
    MAX_GLOBAL_CONCURRENT: 3, // Max 3 concurrent generations globally
  },

  // Official Free-Tier Quota Targets (Model-specific tracking)
  MODEL_QUOTAS: {
    'gemini-3.8-flash': { rpm: 5, tpm: 250000, rpd: 20 },
    'gemini-3.1-flash-lite': { rpm: 15, tpm: 250000, rpd: 500 },
  }
};
