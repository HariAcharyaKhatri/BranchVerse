import { NarrativeProvider } from './NarrativeProvider';
import { NarrativePromptContext } from '../narrative/NarrativeContextBuilder';
import { NarrativeProposal } from '../narrative/NarrativeSchema';

export class LocalNarrativeProvider implements NarrativeProvider {
  public readonly name = 'Local Deterministic Narrative Director';
  public readonly isLocal = true;

  public async generateNarrative(context: NarrativePromptContext): Promise<NarrativeProposal> {
    const heroName = context.hero.name;
    const location = context.location || 'The Unfolding Realm';
    const lastAction = context.recentTurnsSummary.slice(-1)[0]?.actionTaken || 'venture forth';

    // Tailor tone based on genre
    const isCyberpunk = context.genre.toLowerCase().includes('cyber') || context.genre.toLowerCase().includes('sci-fi');
    const isCultivation = context.genre.toLowerCase().includes('cultivation') || context.genre.toLowerCase().includes('wuxia');
    const isGrim = context.tone.toLowerCase().includes('dark') || context.tone.toLowerCase().includes('gritty');

    let title = `Chapter ${context.chapterNumber}: Resonances at ${location}`;
    let prose = '';
    const dialogues: NarrativeProposal['dialogues'] = [];

    if (isCyberpunk) {
      prose = `Neon rain drizzles across the cracked holo-screens of ${location}. ${heroName} takes cover under an iron overhang, analyzing the aftermath of their decision to "${lastAction}". The telemetry feeds flicker with encrypted data packets, signaling that corporate hounds are already triangulating this grid sector.`;
      dialogues.push({
        speaker: 'Operator Vex',
        text: `Watch your back, ${heroName}. The local firewall just tripped. You have less than three minutes before the patrol units lock down the district.`,
        emotion: 'mysterious'
      });
    } else if (isCultivation) {
      prose = `Spiritual mist coils around the jade pillars of ${location}. As ${heroName} steady their breath following their attempt to "${lastAction}", the celestial Qi in their dantian pulses with resonance. An ancient sect elder's lingering sigil hums gently against the surrounding wind.`;
      dialogues.push({
        speaker: 'Elder Bai',
        text: `The Dao tests those who dare step beyond mortal bounds, young ${heroName}. Your resolve will either temper divine steel or scatter like ash.`,
        emotion: 'calm'
      });
    } else if (isGrim) {
      prose = `The bitter wind howls through the desolate stone arches of ${location}. Dried blood and ancient frost cling to the gravel where ${heroName} pressed forward to "${lastAction}". Every breath pluming into the freezing twilight feels earned, yet shadows gather at the periphery of vision.`;
      dialogues.push({
        speaker: 'Commander Gareth',
        text: `Hold your ground, ${heroName}. Out here, mercy is a luxury paid for in silver and blood.`,
        emotion: 'furious'
      });
    } else {
      prose = `Sunlight breaks through the canopy above ${location}, casting dappled golden rays upon the path ahead. Following the decision to "${lastAction}", ${heroName} pauses to survey the sprawling vista. An undeniable sense of destiny lingers in the ambient air.`;
      dialogues.push({
        speaker: 'Lyra Silverleaf',
        text: `The ancient archives spoke of this crossroads, ${heroName}. Whatever we choose next will shape the fate of everyone back home.`,
        emotion: 'warm'
      });
    }

    // Add active quest reflection if any
    if (context.activeQuests.length > 0) {
      const mainQuest = context.activeQuests[0];
      prose += `\n\nYour primary objective weighs heavily: "${mainQuest.title}". ${mainQuest.objectives[0] || ''}`;
    }

    // Propose contextual choices
    const choices: NarrativeProposal['proposedChoices'] = [
      {
        choiceId: `choice_advance_${Date.now()}_1`,
        text: `Advance decisively toward the heart of ${location} to seize the tactical initiative.`,
        consequenceHint: 'Tests speed and martial resolve. May prompt enemy confrontation.',
        riskLevel: 'moderate',
        requiredStamina: 12,
        actionIntent: 'travel'
      },
      {
        choiceId: `choice_search_${Date.now()}_2`,
        text: `Scrutinize the surroundings for concealed mechanisms, discarded supplies, or arcane tracks.`,
        consequenceHint: 'High chance of discovering clues or resources with low direct risk.',
        riskLevel: 'safe',
        requiredStamina: 5,
        actionIntent: 'investigate'
      },
      {
        choiceId: `choice_dialogue_${Date.now()}_3`,
        text: `Turn to your allies and deliberate the next maneuver to strengthen camaraderie.`,
        consequenceHint: 'Deepens companion trust and may reveal key backstory knowledge.',
        riskLevel: 'safe',
        requiredStamina: 4,
        actionIntent: 'talk'
      }
    ];

    return {
      sceneTitle: title,
      narrativeText: prose,
      dialogues,
      ambientVisual: isCyberpunk ? 'cyberpunk_alley' : 'sanctuary_dawn',
      proposedChoices: choices
    };
  }
}
