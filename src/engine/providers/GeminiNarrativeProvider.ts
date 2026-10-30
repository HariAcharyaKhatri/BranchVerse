import { NarrativeProvider } from './NarrativeProvider';
import { NarrativePromptContext } from '../narrative/NarrativeContextBuilder';
import { NarrativeProposal, NarrativeProposalSchema } from '../narrative/NarrativeSchema';
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
          storyLanguage: context.storyLanguage || 'en',
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
          storyLanguage: context.storyLanguage || 'en',
          activeQuests: context.activeQuests.map((q) => ({
            title: q.title,
            objective: q.objectives[0] || 'Survive',
          })),
          recentTurns: context.recentTurnsSummary.map((t) => ({
            sceneTitle: t.sceneTitle,
            narrativeSummary: t.actionTaken || '',
            actionTaken: t.actionTaken || 'Explored area',
          })),
          playerAction: {
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
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        const rawMsg = errJson.error || errJson.message || `AI generation failed with status ${response.status}`;
        const details = classifyAiError(rawMsg, response.status);
        throw new AiNarrativeError(details);
      }

      const data = await response.json();
      if (!data.narrative) {
        throw new AiNarrativeError({
          failureType: 'server',
          title: 'Invalid AI Response',
          message: 'The AI backend returned an invalid response structure. Please retry.',
          retryable: true,
        });
      }

      const proposal = {
        sceneTitle: data.narrative.sceneTitle,
        narrativeText: data.narrative.narrativeText,
        dialogues: data.narrative.dialogues || [],
        ambientVisual: data.narrative.ambientVisual,
        proposedChoices: (data.narrative.proposedChoices || []).map((c: any, idx: number) => ({
          choiceId: c.choiceId || `choice_ai_${Date.now()}_${idx}`,
          text: c.text,
          consequenceHint: c.consequenceHint,
          riskLevel: c.riskLevel || 'moderate',
          requiredStamina: c.requiredStamina || 8,
          actionIntent: c.actionIntent || 'investigate',
        })),
      };

      const parsed = NarrativeProposalSchema.safeParse(proposal);
      if (parsed.success) {
        return parsed.data;
      }

      throw new AiNarrativeError({
        failureType: 'server',
        title: 'Malformed AI Proposal',
        message: 'The generated AI narrative proposal did not meet validation rules. Please retry.',
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
