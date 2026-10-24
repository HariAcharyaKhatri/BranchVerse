import { CONFIG } from './config.js';

interface RateLimitResult {
  allowed: boolean;
  reason?: string;
  retryAfterMs?: number;
  release?: () => void;
}

export class RateLimiter {
  private userMinuteRequests = new Map<string, number[]>();
  private userDayRequests = new Map<string, number[]>();
  private activeUsers = new Set<string>();

  private globalMinuteRequests: number[] = [];
  private globalDayRequests: number[] = [];
  private activeGlobalCount = 0;

  private modelDayRequests = new Map<string, number[]>();

  private cleanWindow(timestamps: number[], windowMs: number, now: number): number[] {
    const cutoff = now - windowMs;
    return timestamps.filter((t) => t > cutoff);
  }

  public acquireSlot(userId: string, modelId: string): RateLimitResult {
    const now = Date.now();
    const MINUTE_MS = 60 * 1000;
    const DAY_MS = 24 * 60 * 60 * 1000;

    // 1. Check AI Kill Switch
    if (!CONFIG.AI_ENABLED) {
      return {
        allowed: false,
        reason: 'Live AI storytelling is currently disabled by administrator. Please play in Local Demo Mode.'
      };
    }

    // 2. Check User Active Concurrent Generation (Max 1 active generation per user)
    if (this.activeUsers.has(userId)) {
      return {
        allowed: false,
        reason: 'You already have a story turn generating. Please wait for it to complete.'
      };
    }

    // 3. Check Global Active Concurrency (Max 3 concurrent generations globally)
    if (this.activeGlobalCount >= CONFIG.LIMITS.MAX_GLOBAL_CONCURRENT) {
      return {
        allowed: false,
        reason: 'Global AI generation queue is full. Please retry in a few seconds.',
        retryAfterMs: 3000
      };
    }

    // 4. Clean and Check User Requests per Minute (Max 3 RPM)
    const userMin = this.cleanWindow(this.userMinuteRequests.get(userId) || [], MINUTE_MS, now);
    this.userMinuteRequests.set(userId, userMin);
    if (userMin.length >= CONFIG.LIMITS.MAX_USER_RPM) {
      const oldest = userMin[0];
      const waitMs = Math.max(1000, oldest + MINUTE_MS - now);
      return {
        allowed: false,
        reason: `Rate limit reached: Max ${CONFIG.LIMITS.MAX_USER_RPM} requests per minute.`,
        retryAfterMs: waitMs
      };
    }

    // 5. Clean and Check User Requests per Day (Max 30 RPD)
    const userDay = this.cleanWindow(this.userDayRequests.get(userId) || [], DAY_MS, now);
    this.userDayRequests.set(userId, userDay);
    if (userDay.length >= CONFIG.LIMITS.MAX_USER_RPD) {
      return {
        allowed: false,
        reason: `Daily limit reached: Max ${CONFIG.LIMITS.MAX_USER_RPD} requests per user per day. Local Demo Mode is available!`
      };
    }

    // 6. Clean and Check Global Requests per Minute (Max 12 RPM)
    this.globalMinuteRequests = this.cleanWindow(this.globalMinuteRequests, MINUTE_MS, now);
    if (this.globalMinuteRequests.length >= CONFIG.LIMITS.MAX_GLOBAL_RPM) {
      return {
        allowed: false,
        reason: 'Global system limit reached (12 req/min). Please retry in a few moments.',
        retryAfterMs: 5000
      };
    }

    // 7. Clean and Check Global Requests per Day (Max 400 RPD)
    this.globalDayRequests = this.cleanWindow(this.globalDayRequests, DAY_MS, now);
    if (this.globalDayRequests.length >= CONFIG.LIMITS.MAX_GLOBAL_RPD) {
      return {
        allowed: false,
        reason: 'Global daily AI capacity reached (400 req/day). Please enjoy Local Demo Mode.'
      };
    }

    // 8. Clean and Check Model-Specific Quota Safeguard
    const modelTarget = CONFIG.MODEL_QUOTAS[modelId as keyof typeof CONFIG.MODEL_QUOTAS];
    if (modelTarget) {
      const modelDay = this.cleanWindow(this.modelDayRequests.get(modelId) || [], DAY_MS, now);
      this.modelDayRequests.set(modelId, modelDay);
      if (modelDay.length >= modelTarget.rpd) {
        return {
          allowed: false,
          reason: `Daily quota for model "${modelId}" has been reached (${modelTarget.rpd} RPD). Try continuing in Local Demo Mode.`
        };
      }
    }

    // Acquire slot
    this.activeUsers.add(userId);
    this.activeGlobalCount++;
    userMin.push(now);
    userDay.push(now);
    this.globalMinuteRequests.push(now);
    this.globalDayRequests.push(now);

    const modelLog = this.modelDayRequests.get(modelId) || [];
    modelLog.push(now);
    this.modelDayRequests.set(modelId, modelLog);

    let released = false;
    const release = () => {
      if (!released) {
        released = true;
        this.activeUsers.delete(userId);
        this.activeGlobalCount = Math.max(0, this.activeGlobalCount - 1);
      }
    };

    return { allowed: true, release };
  }

  public getStats() {
    const now = Date.now();
    const MINUTE_MS = 60 * 1000;
    const DAY_MS = 24 * 60 * 60 * 1000;

    return {
      activeGlobalConcurrent: this.activeGlobalCount,
      globalMinuteCount: this.cleanWindow(this.globalMinuteRequests, MINUTE_MS, now).length,
      globalDayCount: this.cleanWindow(this.globalDayRequests, DAY_MS, now).length,
      initialModelDayCount: this.cleanWindow(this.modelDayRequests.get(CONFIG.GEMINI_INITIAL_MODEL) || [], DAY_MS, now).length,
      turnModelDayCount: this.cleanWindow(this.modelDayRequests.get(CONFIG.GEMINI_TURN_MODEL) || [], DAY_MS, now).length,
    };
  }
}

export const rateLimiter = new RateLimiter();
