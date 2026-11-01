import { NarrativeProvider } from './NarrativeProvider';
import { NarrativePromptContext } from '../narrative/NarrativeContextBuilder';
import { NarrativeProposal } from '../narrative/NarrativeSchema';
import { repairNarrativeProposal } from '../narrative/NarrativeRepair';
import { auth } from '../../lib/firebase/firebase';
import { SupportedLanguage } from '../../types/story';
import { AiNarrativeError, classifyAiError } from '../errors/AiNarrativeError';

export class GeminiNarrativeProvider implements NarrativeProvider {
  public readonly name = 'Dual Gemini Narrative Engine (3.8 Flash & 3.1 Flash-Lite)';
  public readonly isLocal = false;

  public async generateNarrative(
    context: NarrativePromptContext & { storyLanguage?: SupportedLanguage }
  ): Promise<NarrativeProposal> {
    const isInitial = context.currentTurnNumber <= 1;
    const endpoint = isInitial ? '/api/narrative/initial' : '/api/narrative/turn';

    let token = '';
    try {
      if (auth && auth.currentUser) {
        token = await auth.currentUser.getIdToken();
      }
    } catch {
      // Local or mock token
    }

    const payload = isInitial
      ? {
          hero: {
            name: context.hero.name,
            race: context.hero.race,
            origin: context.hero.origin,
            backstory: context.hero.powers.join(', '),
            personality: context.hero.statusEffects,
            skills: context.hero.weapons,
          },
          genres: [context.genre],
          worldName: context.worldName,
          tone: context.tone,
          pacing: 'Balanced Narrative',
          difficulty: context.difficulty,
          storyLanguage: context.storyLanguage || 'hi',
          narrativeLength: context.narrativeLength || 'balanced',
        }
      : {
          storyId: context.storyTitle,
          chapterNumber: context.chapterNumber,
          currentLocation: context.location,
          hero: {
            name: context.hero.name,
            powerLevel: context.hero.powerLevel,
            stamina: context.hero.stamina,
            inventory: context.inventoryItems,
          },
          genre: context.genre,
          tone: context.tone,
          storyLanguage: context.storyLanguage || 'hi',
          narrativeLength: context.narrativeLength || 'balanced',
          activeQuests: context.activeQuests.map((q) => ({
            title: q.title,
            objective: q.objectives[0] || 'Survive',
          })),
          npcRelationships: context.npcRelationships,
          memorySummary: context.memorySummary,
          importantFacts: [
            ...(context.importantFacts || []),
            ...(context.authoritativeConstraints || [])
          ],
          recentTurns: context.recentTurnsSummary.map((t) => ({
            sceneTitle: t.sceneTitle,
            narrativeSummary: t.actionTaken || '',
            actionTaken: t.actionTaken || 'Explored area',
          })),
          playerAction: context.playerAction || {
            type: 'action',
            customActionText: context.recentTurnsSummary.slice(-1)[0]?.actionTaken,
          },
        };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
        signal: context.signal,
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        const rawMsg = errJson.message || errJson.error || `AI generation failed with status ${response.status}`;
        const details = classifyAiError(rawMsg, response.status);
        throw new AiNarrativeError(details);
      }

      const data = await response.json();
      const rawPayload = data.narrative || data;
      if (!rawPayload || typeof rawPayload !== 'object') {
        console.error('[GeminiNarrativeProvider] [Critical Failure] Empty narrative returned from API:', {
          status: response.status,
          hasData: Boolean(data),
          modelUsed: data?.modelUsed,
        });
        throw new AiNarrativeError({
          failureType: 'server',
          title: 'Invalid AI Response',
          message: 'The AI backend returned an invalid response structure. Please retry.',
          retryable: true,
        });
      }

      // Pass through repair and normalization layer (separates narrative from state delta)
      const { proposal, diagnostics } = repairNarrativeProposal(rawPayload, {
        heroName: context.hero.name,
        worldName: context.worldName,
        turnNumber: context.currentTurnNumber,
      });

      if (diagnostics.repaired) {
        console.warn('[GeminiNarrativeProvider] [Narrative Repaired & Sanitized]', {
          modelUsed: data.modelUsed,
          repairedFields: diagnostics.repairedFields,
          rejectedStateFields: diagnostics.rejectedStateFields,
          summary: diagnostics.summary,
        });
      }

      if (proposal && diagnostics.hasUsableNarrative) {
        console.log('[GeminiNarrativeProvider] [Narrative Validated]', {
          modelUsed: data.modelUsed,
          sceneTitle: proposal.sceneTitle,
          narrativeLength: proposal.narrativeText.length,
          choicesCount: proposal.proposedChoices.length,
          hasStateDelta: Boolean(proposal.proposedStateDelta),
        });
        return proposal;
      }

      // Genuinely unusable response (e.g. 0 narrative text generated)
      console.error('[GeminiNarrativeProvider] [Critical Validation Failure] Proposal has no usable narrative:', {
        modelUsed: data.modelUsed,
        errors: diagnostics.errors,
        summary: diagnostics.summary,
      });

      throw new AiNarrativeError({
        failureType: 'server',
        title: 'Story Generation Paused',
        message: 'Unable to continue the story right now. Please tap Retry or continue in Offline Mode.',
        retryable: true,
      });
    } catch (err: any) {
      if (err instanceof AiNarrativeError) {
        throw err;
      }
      const details = classifyAiError(err);
      throw new AiNarrativeError(details);
    }
  }
}
