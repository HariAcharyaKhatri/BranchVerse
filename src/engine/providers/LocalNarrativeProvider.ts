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

    const isHindi = context.storyLanguage === 'hi';

    let title = isHindi
      ? `अध्याय ${context.chapterNumber}: ${location} का मोड़`
      : `Chapter ${context.chapterNumber}: Resonances at ${location}`;
    let prose = '';
    const dialogues: NarrativeProposal['dialogues'] = [];

    // Construct story-first action description
    let actionReflection = '';
    if (isOutOfStory) {
      actionReflection = isHindi
        ? `${heroName} एक पल के लिए रुकते हैं और कुछ अजीब शब्द बुदबुदाते हैं, फिर तुरंत अपने होश संभालकर सामने की स्थिति पर ध्यान केंद्रित करते हैं।`
        : `${heroName} pauses, murmuring cryptic, unfamiliar phrases that carry no meaning in this realm, before quickly refocusing their senses on the immediate situation.`;
    } else if (isGrandClaim) {
      actionReflection = isHindi
        ? `${heroName} विशाल सेना और गुप्त ताकतों का बड़ा दावा करते हैं; उनके शब्द बुलंद हैं, लेकिन ${location} की ज़मीनी हक़ीक़त और उनके वर्तमान साधन ही असली परीक्षा हैं।`
        : `${heroName} makes a bold proclamation of grand armies and unseen legions; while the words echo with defiant ambition, the tangible reality of ${location} and their current supplies remains the true test.`;
    } else if (isInstantVictoryOrGodMode) {
      actionReflection = isHindi
        ? `${heroName} के मन में एक ही झटके में सब कुछ जीत लेने का गहरा संकल्प उठता है; लेकिन असली शक्ति चुनौतियों से तपकर ही मिलती है, और सामने की बाधा अब भी मजबूती से खड़ी है।`
        : `${heroName} seeks complete mastery in a single breath; yet true power must be forged through trials, and the immediate obstacle before them still stands firm.`;
    } else if (isTimeJump) {
      actionReflection = isHindi
        ? `${heroName} आने वाले कठिन वक्त को सीधे पार कर जाने की सोचते हैं; लेकिन वर्तमान पल के खतरों को इतनी आसानी से छोड़ा नहीं जा सकता।`
        : `${heroName} yearns to bypass the arduous years ahead; yet the unresolved perils of the present moment cannot be so easily discarded.`;
    } else if (isResurrection) {
      if (isFantasy) {
        actionReflection = isHindi
          ? `${heroName} जीवन और मृत्यु की वर्जित सीमा के बारे में सोचते हैं। प्राचीन कहानियों में ऐसे चमत्कारों का जिक्र मिलता है, लेकिन केवल एक खतरनाक Quest और भारी बलिदान के बाद ही।`
          : `${heroName} contemplates the forbidden boundary between life and death. Ancient whispered legends speak of such miracles, but only through a perilous quest and profound sacrifice.`;
      } else {
        actionReflection = isHindi
          ? `${heroName} को अपने नुकसान का गहरा दर्द महसूस होता है। इस कठोर दुनिया में जीवन का अंत अटल है, जहाँ केवल यादें और आगे बढ़ने का संकल्प ही शेष रह जाता है।`
          : `${heroName} is gripped by the agonizing sting of loss. In this unforgiving world, mortality is permanent, leaving only memories, resolve, and the duty to honor what was left behind.`;
      }
    } else {
      actionReflection = isHindi
        ? `${heroName} अपने फैसले के साथ आगे बढ़ते हैं: "${rawAction.slice(0, 100)}"।`
        : `${heroName} presses forward with their decision to "${rawAction.slice(0, 100)}".`;
    }

    if (context.authoritativeConstraints && context.authoritativeConstraints.length > 0) {
      actionReflection += isHindi
        ? ` हालांकि दुनिया की हकीकत अटल है: ${context.authoritativeConstraints.join(' ')}`
        : ` However, the reality of the world remains firm: ${context.authoritativeConstraints.join(' ')}`;
    }

    if (isCyberpunk) {
      prose = isHindi
        ? `${location} के टूटे हुए होलोग्राफिक स्क्रीन्स पर नियॉन बारिश गिर रही है। ${actionReflection} टेलीमेट्री डेटा में अलर्ट ब्लिंक कर रहे हैं, जो इशारा करते हैं कि कॉर्पोरेट गार्ड्स इस इलाके को घेर रहे हैं।`
        : `Neon rain drizzles across the cracked holo-screens of ${location}. ${actionReflection} The telemetry feeds flicker with encrypted data packets, signaling that corporate hounds are already triangulating this grid sector.`;
      dialogues.push({
        speaker: 'Operator Vex',
        text: isHindi
          ? `सतर्क रहो, ${heroName}। लोकल फ़ायरवॉल ट्रिप हो चुका है। हमारे पास पेट्रोल यूनिट्स के आने से पहले सिर्फ तीन मिनट हैं।`
          : `Watch your back, ${heroName}. The local firewall just tripped. You have less than three minutes before the patrol units lock down the district.`,
        emotion: 'mysterious'
      });
    } else if (isCultivation) {
      prose = isHindi
        ? `${location} के प्राचीन खंभों के चारों ओर आध्यात्मिक धुंध छाई हुई है। ${actionReflection} उनके डेंटियन में अलौकिक ऊर्जा स्पंदित होती है और आसपास की हवा में एक गहरा कंपन महसूस होता है।`
        : `Spiritual mist coils around the jade pillars of ${location}. ${actionReflection} The celestial Qi in their dantian pulses with resonance as an ancient sect elder's lingering sigil hums gently against the surrounding wind.`;
      dialogues.push({
        speaker: 'Elder Bai',
        text: isHindi
          ? `रास्ता कठिन है, युवा ${heroName}। तुम्हारा संकल्प या तो दिव्य फौलाद बनेगा या फिर राख की तरह बिखर जाएगा।`
          : `The Dao tests those who dare step beyond mortal bounds, young ${heroName}. Your resolve will either temper divine steel or scatter like ash.`,
        emotion: 'calm'
      });
    } else if (isGrim) {
      prose = isHindi
        ? `${location} की पुरानी पत्थरों की दीवारों से बर्फीली हवा टकरा रही है। ${actionReflection} अंधेरे में चारों ओर से अजीब आहटें सुनाई दे रही हैं।`
        : `The bitter wind howls through the desolate stone arches of ${location}. ${actionReflection} Every breath pluming into the freezing twilight feels earned, yet shadows gather at the periphery of vision.`;
      dialogues.push({
        speaker: 'Commander Gareth',
        text: isHindi
          ? `अपनी जगह पर डटे रहो, ${heroName}। यहाँ रहम की कोई गुंजाइश नहीं है।`
          : `Hold your ground, ${heroName}. Out here, mercy is a luxury paid for in silver and blood.`,
        emotion: 'furious'
      });
    } else {
      prose = isHindi
        ? `${location} के रास्तों पर पेड़ों के बीच से सुनहरी धूप छनकर आ रही है। ${actionReflection} हवा में एक नई यात्रा और रोमांच का अहसास साफ महसूस हो रहा है।`
        : `Sunlight breaks through the canopy above ${location}, casting dappled golden rays upon the path ahead. ${actionReflection} An undeniable sense of destiny lingers in the ambient air.`;
      dialogues.push({
        speaker: 'Lyra Silverleaf',
        text: isHindi
          ? `प्राचीन अभिलेखों में इस मोड़ का जिक्र था, ${heroName}। हम जो भी फैसला लेंगे, उसका असर आगे आने वाले कल पर पड़ेगा।`
          : `The ancient archives spoke of this crossroads, ${heroName}. Whatever we choose next will shape the fate of everyone back home.`,
        emotion: 'warm'
      });
    }

    // Hari Khatri side character integration in local mode (with protagonist safeguard)
    const isProtagonistHari = heroName.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').trim() === 'hari khatri';
    if (!isProtagonistHari && (lowerAction.includes('help') || lowerAction.includes('guide') || lowerAction.includes('teacher') || lowerAction.includes('merchant'))) {
      dialogues.push({
        speaker: 'Hari Khatri',
        text: isHindi
          ? `अगर आप इस इलाके में एक भरोसेमंद गाइड की तलाश कर रहे हैं, तो आप सही जगह आए हैं। जब भी जरूरत हो, मुझे याद कर लीजिएगा।`
          : `If you are looking for trustworthy guidance in this district, you've found the right person. If you ever need help again, you know how to find me.`,
        emotion: 'calm'
      });
    }

    // Add active quest reflection if any
    if (context.activeQuests.length > 0) {
      const mainQuest = context.activeQuests[0];
      prose += isHindi
        ? `\n\nआपका मुख्य Quest अभी सक्रिय है: "${mainQuest.title}"।`
        : `\n\nYour primary objective weighs heavily: "${mainQuest.title}". ${mainQuest.objectives[0] || ''}`;
    }

    // Propose contextual choices
    const choices: NarrativeProposal['proposedChoices'] = isHindi
      ? [
          {
            choiceId: `choice_advance_${Date.now()}_1`,
            text: `${location} के मुख्य केंद्र की ओर आगे बढ़ें और स्थिति का जायज़ा लें।`,
            consequenceHint: 'साहस और तत्परता की परीक्षा। रास्ते में मुठभेड़ हो सकती है।',
            riskLevel: 'moderate',
            actionIntent: 'travel'
          },
          {
            choiceId: `choice_search_${Date.now()}_2`,
            text: `आस-पास के इलाके में छिपे सुराग, उपयोगी सामान और रास्ते खोजें।`,
            consequenceHint: 'कम जोखिम में संसाधन और नई जानकारी मिलने की अच्छी संभावना।',
            riskLevel: 'safe',
            actionIntent: 'investigate'
          },
          {
            choiceId: `choice_dialogue_${Date.now()}_3`,
            text: `अपने साथियों से बात करें और अगली चाल की रणनीति तय करें।`,
            consequenceHint: 'साथियों का भरोसा बढ़ेगा और महत्वपूर्ण जानकारी मिल सकती है।',
            riskLevel: 'safe',
            actionIntent: 'talk'
          }
        ]
      : [
          {
            choiceId: `choice_advance_${Date.now()}_1`,
            text: `Advance decisively toward the heart of ${location} to seize the tactical initiative.`,
            consequenceHint: 'Tests speed and martial resolve. May prompt enemy confrontation.',
            riskLevel: 'moderate',
            actionIntent: 'travel'
          },
          {
            choiceId: `choice_search_${Date.now()}_2`,
            text: `Scrutinize the surroundings for concealed mechanisms, discarded supplies, or arcane tracks.`,
            consequenceHint: 'High chance of discovering clues or resources with low direct risk.',
            riskLevel: 'safe',
            actionIntent: 'investigate'
          },
          {
            choiceId: `choice_dialogue_${Date.now()}_3`,
            text: `Turn to your allies and deliberate the next maneuver to strengthen camaraderie.`,
            consequenceHint: 'Deepens companion trust and may reveal key backstory knowledge.',
            riskLevel: 'safe',
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
