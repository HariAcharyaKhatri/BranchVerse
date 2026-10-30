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
    status === 503 ||
    lower.includes('gemini_api_key') ||
    lower.includes('api key') ||
    lower.includes('not configured') ||
    lower.includes('api_key_invalid') ||
    lower.includes('invalid api key')
  ) {
    return {
      failureType: 'server',
      title: 'Gemini API Key Required',
      message:
        msg.length > 10 && (lower.includes('api key') || lower.includes('gemini') || lower.includes('configured'))
          ? msg
          : 'GEMINI_API_KEY is not configured or is invalid on the backend server. Please add your GEMINI_API_KEY in Vercel Project Settings > Environment Variables (or .env.local).',
      retryable: true,
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
      message: 'The Gemini AI model took longer than expected to respond. Please check your connection and tap Retry.',
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
      message: 'The daily free-tier quota for this Gemini model has been exhausted. Please retry later.',
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
    message: msg.length > 10 ? msg : 'The AI Narrative Director encountered an unexpected issue. Please tap Retry.',
    retryable: true,
  };
}
