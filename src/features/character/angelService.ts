import { auth } from '../../lib/firebase/firebase';
import { CharacterProfile } from '../../types/talent';
import { SupportedLanguage } from '../../types/story';

export interface AngelConversationMessage {
  id: string;
  role: 'user' | 'angel';
  text: string;
  timestamp: number;
  options?: Array<{
    id: string;
    label: string;
    action: string;
    description?: string;
  }>;
  proposedChanges?: Partial<CharacterProfile>;
  ruleFeedback?: {
    valid: boolean;
    reason?: string;
  };
}

export interface AngelCommunePayload {
  userMessage: string;
  conversationHistory: Array<{ role: 'user' | 'angel'; text: string }>;
  currentDraft: Partial<CharacterProfile>;
  worldName?: string;
  worldGenre?: string;
  worldMagicSystem?: string;
  storyLanguage?: SupportedLanguage;
}

export class AngelService {
  private endpoint = '/api/character/architect';

  /**
   * Communes with Angel via the secure backend Gemini API.
   * Throws informative error if service is unavailable so caller can show Retry.
   */
  public async communeWithAngel(payload: AngelCommunePayload): Promise<{
    angelDialogue: string;
    suggestedOptions: Array<{
      id: string;
      label: string;
      action: string;
      description?: string;
    }>;
    proposedChanges?: Partial<CharacterProfile>;
    ruleFeedback?: {
      valid: boolean;
      reason?: string;
    };
    modelUsed?: string;
  }> {
    let token = '';
    try {
      if (auth && auth.currentUser) {
        token = await auth.currentUser.getIdToken();
      }
    } catch {
      // Local development or guest token
    }

    if (!token) {
      // Generate standard mock guest token payload for authorization header
      const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
      const body = btoa(JSON.stringify({ sub: 'guest_soul', email: 'guest@branchverse.dev' }));
      token = `${header}.${body}.sig`;
    }

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      const message =
        errorJson.message ||
        errorJson.error ||
        `Angel communion failed with status ${response.status}`;
      throw new Error(message);
    }

    const data = await response.json();
    if (!data.response || typeof data.response !== 'object') {
      throw new Error('Celestial communion returned an empty or invalid structure.');
    }

    return {
      ...data.response,
      modelUsed: data.modelUsed,
    };
  }
}

export const angelService = new AngelService();
