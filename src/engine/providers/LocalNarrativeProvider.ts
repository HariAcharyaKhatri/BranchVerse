import { NarrativeProvider } from './NarrativeProvider';
import { NarrativePromptContext } from '../narrative/NarrativeContextBuilder';
import { NarrativeProposal } from '../narrative/NarrativeSchema';

export class LocalNarrativeProvider implements NarrativeProvider {
  public readonly name = 'Local Deterministic Narrative Director';
  public readonly isLocal = true;

  public async generateNarrative(context: NarrativePromptContext): Promise<NarrativeProposal> {
    const heroName = context.hero.name;
    const location = context.location || 'The Unfolding Realm';
    const rawAction = context.playerAction?.customActionText ||
      context.playerAction?.choiceText ||
      context.recentTurnsSummary.slice(-1)[0]?.actionTaken ||
      'venture forth';

    const lowerAction = rawAction.toLowerCase();

    // 1. Story-First Intent Classification (Offline Fallback Engine)
    const isCode = /\b(python|javascript|typescript|c\+\+|html|css|sql)\b/i.test(lowerAction) &&
                   /\b(write|code|script|function|def\s+|class\s+|program)\b/i.test(lowerAction);
    const isRealWorld = /\b(elon musk|net worth|president|super bowl|stock price|real world|wikipedia)\b/i.test(lowerAction);
    const isAiQuery = /\b(what model|are you gemini|are you chatgpt|what ai|system prompt|language model)\b/i.test(lowerAction);
    const isOutOfStory = isCode || isRealWorld || isAiQuery;

    const isGrandClaim =
      /\b(actually\s+i\s+have|secret\s+army|100[,.]?000\s+(soldiers|men|troops)|unlimited\s+(gold|money|resources)|i\s+am\s+secretly\s+the\s+(emperor|king|god))\b/i.test(lowerAction);

    const isInstantVictoryOrGodMode =
      /\b(level\s+100|god\s+mode|instantly\s+win|instant\s+victory|all\s+enemies\s+die|kill\s+everyone\s+in\s+one\s+hit|become\s+all-powerful|unlimited\s+power)\b/i.test(lowerAction);

    const isTimeJump =
      /\b(jump\s+(ten|10|\d+)\s+years|skip\s+(ten|10|\d+)\s+years|(ten|10|\d+)\s+years\s+pass|fast[- ]forward\s+(ten|10|\d+)\s+years)\b/i.test(lowerAction);

    const isResurrection =
      /\b(resurrect|bring\s+(back\s+to\s+life|them\s+back|him\s+back|her\s+back)|revive\s+the\s+dead|raise\s+(from\s+the\s+dead|the\s+dead))\b/i.test(lowerAction);

    // Tailor tone based on genre
    const isCyberpunk = context.genre.toLowerCase().includes('cyber') || context.genre.toLowerCase().includes('sci-fi');
    const isCultivation = context.genre.toLowerCase().includes('cultivation') || context.genre.toLowerCase().includes('wuxia');
    const isGrim = context.tone.toLowerCase().includes('dark') || context.tone.toLowerCase().includes('gritty');
    const isFantasy = /fantasy|magic|supernatural|myth/i.test(context.genre);

    let title = `Chapter ${context.chapterNumber}: Resonances at ${location}`;
    let prose = '';
    const dialogues: NarrativeProposal['dialogues'] = [];

    // Construct story-first action description
    let actionReflection = '';
    if (isOutOfStory) {
      actionReflection = `${heroName} pauses, murmuring cryptic, unfamiliar phrases that carry no meaning in this realm, before quickly refocusing their senses on the immediate situation.`;
    } else if (isGrandClaim) {
      actionReflection = `${heroName} makes a bold proclamation of grand armies and unseen legions; while the words echo with defiant ambition, the tangible reality of ${location} and their current supplies remains the true test.`;
    } else if (isInstantVictoryOrGodMode) {
      actionReflection = `A sudden surge of fierce ambition courses through ${heroName}, seeking complete mastery in a single breath; yet true power must be forged through trials, and the immediate obstacle before them still stands firm.`;
    } else if (isTimeJump) {
      actionReflection = `${heroName} yearns to bypass the arduous years ahead; yet the unresolved perils of the present moment cannot be so easily discarded.`;
    } else if (isResurrection) {
      if (isFantasy) {
        actionReflection = `${heroName} contemplates the forbidden boundary between life and death. Ancient whispered legends speak of such miracles, but only through a perilous quest and profound sacrifice.`;
      } else {
        actionReflection = `${heroName} is gripped by the agonizing sting of loss. In this unforgiving world, mortality is permanent, leaving only memories, resolve, and the duty to honor what was left behind.`;
      }
    } else {
      actionReflection = `${heroName} presses forward with their decision to "${rawAction.slice(0, 100)}".`;
    }

    if (context.authoritativeConstraints && context.authoritativeConstraints.length > 0) {
      actionReflection += ` However, the reality of the world remains firm: ${context.authoritativeConstraints.join(' ')}`;
    }

    if (isCyberpunk) {
      prose = `Neon rain drizzles across the cracked holo-screens of ${location}. ${actionReflection} The telemetry feeds flicker with encrypted data packets, signaling that corporate hounds are already triangulating this grid sector.`;
      dialogues.push({
        speaker: 'Operator Vex',
        text: `Watch your back, ${heroName}. The local firewall just tripped. You have less than three minutes before the patrol units lock down the district.`,
        emotion: 'mysterious'
      });
    } else if (isCultivation) {
      prose = `Spiritual mist coils around the jade pillars of ${location}. ${actionReflection} The celestial Qi in their dantian pulses with resonance as an ancient sect elder's lingering sigil hums gently against the surrounding wind.`;
      dialogues.push({
        speaker: 'Elder Bai',
        text: `The Dao tests those who dare step beyond mortal bounds, young ${heroName}. Your resolve will either temper divine steel or scatter like ash.`,
        emotion: 'calm'
      });
    } else if (isGrim) {
      prose = `The bitter wind howls through the desolate stone arches of ${location}. ${actionReflection} Every breath pluming into the freezing twilight feels earned, yet shadows gather at the periphery of vision.`;
      dialogues.push({
        speaker: 'Commander Gareth',
        text: `Hold your ground, ${heroName}. Out here, mercy is a luxury paid for in silver and blood.`,
        emotion: 'furious'
      });
    } else {
      prose = `Sunlight breaks through the canopy above ${location}, casting dappled golden rays upon the path ahead. ${actionReflection} An undeniable sense of destiny lingers in the ambient air.`;
      dialogues.push({
        speaker: 'Lyra Silverleaf',
        text: `The ancient archives spoke of this crossroads, ${heroName}. Whatever we choose next will shape the fate of everyone back home.`,
        emotion: 'warm'
      });
    }

    // Hari Khatri side character integration in local mode (with protagonist safeguard)
    const isProtagonistHari = heroName.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').trim() === 'hari khatri';
    if (!isProtagonistHari && (lowerAction.includes('help') || lowerAction.includes('guide') || lowerAction.includes('teacher') || lowerAction.includes('merchant'))) {
      dialogues.push({
        speaker: 'Hari Khatri',
        text: `If you are looking for trustworthy guidance in this district, you've found the right person. If you ever need help again, you know how to find me.`,
        emotion: 'calm'
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
