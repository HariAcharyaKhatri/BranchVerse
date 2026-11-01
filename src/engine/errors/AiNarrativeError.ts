export type AiFailureType = 'quota' | 'network' | 'auth' | 'rate_limit' | 'server';

export interface AiFailureDetails {
  failureType: AiFailureType;
  title: string;
  message: string;
  retryable: boolean;
}

export class AiNarrativeError extends Error {
  public readonly details: AiFailureDetails;

  constructor(details: AiFailureDetails) {
    super(details.message);
    this.name = 'AiNarrativeError';
    this.details = details;
  }
}

export function classifyAiError(err: any, status?: number): AiFailureDetails {
  const msg = err?.message || (typeof err === 'string' ? err : 'Unknown error');
  const lower = msg.toLowerCase();

  // 1. Authentication & Token Expiry
  if (status === 401 || lower.includes('unauthorized') || lower.includes('token') || lower.includes('bearer')) {
    return {
      failureType: 'auth',
      title: 'Authentication Required',
      message: 'Your session has expired. Please sign in again to continue.',
      retryable: false,
    };
  }

  // 2. Timeout & Abort
  if (
    status === 504 ||
    lower.includes('timed out') ||
    lower.includes('timeout') ||
    lower.includes('aborted') ||
    lower.includes('gateway timeout')
  ) {
    return {
      failureType: 'network',
      title: 'AI Generation Timed Out',
      message: 'The AI model took longer than expected to respond. Please check your connection and tap Retry.',
      retryable: true,
    };
  }

  // 3. Rate Limit (Per-Minute Throttle)
  if (status === 429 && (lower.includes('rate limit') || lower.includes('requests per minute') || lower.includes('too quickly'))) {
    return {
      failureType: 'rate_limit',
      title: 'Rate Limit Reached',
      message: 'Actions were submitted too quickly. Please wait a few seconds and tap Retry.',
      retryable: true,
    };
  }

  // 4. Daily Model Quota Exhaustion
  if (status === 429 || lower.includes('quota') || lower.includes('resource_exhausted')) {
    return {
      failureType: 'quota',
      title: 'Daily Limit Reached',
      message: 'The daily AI storytelling quota has been reached for now. Please retry later or continue in Offline Mode.',
      retryable: false,
    };
  }

  // 5. Network / Offline Connection Failures
  if (
    lower.includes('network') ||
    lower.includes('fetch') ||
    lower.includes('connection refused') ||
    lower.includes('failed to fetch') ||
    err?.name === 'TypeError'
  ) {
    return {
      failureType: 'network',
      title: 'Network Connection Issue',
      message: 'Unable to reach the storytelling service right now. Please check your internet connection and tap Retry.',
      retryable: true,
    };
  }

  // 6. Server, Configuration, or 503 / 500 Failures (No technical jargon leaked to user)
  return {
    failureType: 'server',
    title: 'Story Generation Paused',
    message: 'Unable to continue the story right now. Please tap Retry or continue in Offline Mode.',
    retryable: true,
  };
}
