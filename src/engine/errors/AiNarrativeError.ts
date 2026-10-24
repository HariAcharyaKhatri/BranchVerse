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

  if (status === 401 || lower.includes('unauthorized') || lower.includes('token') || lower.includes('bearer')) {
    return {
      failureType: 'auth',
      title: 'Authentication Required',
      message: 'Your Google sign-in session expired or is invalid. Please sign in again to continue with Live AI stories.',
      retryable: false,
    };
  }

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
      message: 'The Gemini AI model took longer than expected to respond. Please tap Retry or switch to Local Demo Mode.',
      retryable: true,
    };
  }

  if (status === 429 && (lower.includes('rate limit') || lower.includes('requests per minute') || lower.includes('too quickly'))) {
    return {
      failureType: 'rate_limit',
      title: 'Rate Limit Reached',
      message: 'You have submitted actions too quickly. Please wait a few seconds and tap Retry.',
      retryable: true,
    };
  }

  if (status === 429 || lower.includes('quota') || lower.includes('resource_exhausted')) {
    return {
      failureType: 'quota',
      title: 'AI Daily Quota Reached',
      message: 'The daily free-tier quota for this Gemini model has been exhausted. You can retry later or switch this story to Local Demo Mode to continue playing immediately.',
      retryable: false,
    };
  }

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
      message: 'Unable to reach the AI storytelling backend. Please check your internet connection and tap Retry.',
      retryable: true,
    };
  }

  return {
    failureType: 'server',
    title: 'AI Service Temporarily Unavailable',
    message: msg.length > 10 ? msg : 'The AI Narrative Director encountered an unexpected error. Please retry or switch to Demo Mode.',
    retryable: true,
  };
}
