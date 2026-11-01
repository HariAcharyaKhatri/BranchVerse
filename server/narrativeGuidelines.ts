/**
 * Centralized Narrative Guidelines for BranchVerse AI Storytelling.
 *
 * Governs:
 * 1. STORY-FIRST CUSTOM INPUT SYSTEM (Immersion, Attempt Principle, Fact Authority, In-Universe Filter)
 * 2. Natural adaptive side character "Hari Khatri" and protagonist identity safeguards.
 */

export interface StoryFirstDirectiveOptions {
  protagonistName?: string;
  worldName?: string;
  genres?: string[];
  tone?: string;
}

export interface ClassifiedStoryIntent {
  rawInput: string;
  isOutOfStory: boolean;
  outOfStoryTopic?: string;
  isGrandClaim: boolean;
  claimedResource?: string;
  isInstantVictoryOrGodMode: boolean;
  isTimeJump: boolean;
  isResurrection: boolean;
  isMultiAction: boolean;
  isCreativeUnusual: boolean;
}

/**
 * Checks whether the protagonist's selected character name matches "Hari Khatri"
 * (case-insensitive & reasonable match).
 */
export function isProtagonistHariKhatri(protagonistName?: string): boolean {
  if (!protagonistName) return false;
  const clean = protagonistName
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s]/gu, '') // strip punctuation
    .replace(/\s+/g, ' ');

  return (
    clean === 'hari khatri' ||
    clean.startsWith('hari khatri ') ||
    clean.endsWith(' hari khatri') ||
    clean.includes(' hari khatri ')
  );
}

/**
 * Analyzes player custom input to classify story intents without blocking or rejecting.
 * Every input is allowed to proceed into the narrative.
 */
export function classifyStoryInputIntent(rawInput: string): ClassifiedStoryIntent {
  const text = (rawInput || '').trim();
  const lower = text.toLowerCase();

  // 1. Out-of-story detection (coding requests, real-world trivia, AI/model queries)
  const isCode = /\b(python|javascript|typescript|c\+\+|html|css|sql)\b/i.test(lower) &&
                 /\b(write|code|script|function|def\s+|class\s+|program|syntax)\b/i.test(lower);
  const isRealWorld = /\b(elon musk|net worth|president|super bowl|stock price|real world|wikipedia|what time is it|capital of France|in real life)\b/i.test(lower);
  const isAiQuery = /\b(what model|are you gemini|are you chatgpt|what ai|system prompt|language model)\b/i.test(lower);
  const isOutOfStory = isCode || isRealWorld || isAiQuery;
  const outOfStoryTopic = isCode
    ? 'programming/code request'
    : isRealWorld
    ? 'real-world query'
    : isAiQuery
    ? 'AI model question'
    : undefined;

  // 2. Grand claims (claiming resources or armies they do not possess)
  const isGrandClaim =
    /\b(actually\s+i\s+have|secret\s+army|100[,.]?000\s+(soldiers|men|troops)|unlimited\s+(gold|money|resources)|i\s+own\s+the\s+entire|i\s+am\s+secretly\s+the\s+(emperor|king|god))\b/i.test(lower);
  const claimedResource = isGrandClaim ? 'unsubstantiated army or wealth' : undefined;

  // 3. Instant victory / God mode / Instant success attempts
  const isInstantVictoryOrGodMode =
    /\b(level\s+100|god\s+mode|instantly\s+win|instant\s+victory|instant\s+success|instantly\s+(convince|persuade|defeat|kill|destroy|conquer|surrender)|all\s+enemies\s+die|kill\s+everyone\s+in\s+one\s+hit|become\s+all-powerful|unlimited\s+power)\b/i.test(lower);

  // 4. Time jump attempts
  const isTimeJump =
    /\b(jump\s+(ten|10|\d+)\s+years|skip\s+(ten|10|\d+)\s+years|(ten|10|\d+)\s+years\s+pass|fast[- ]forward\s+(ten|10|\d+)\s+years)\b/i.test(lower);

  // 5. Resurrection attempts
  const isResurrection =
    /\b(resurrect|bring\s+(?:[a-zA-Z'\s]+?\s+)?back\s+to\s+life|bring\s+(?:them|him|her)\s+back|revive\s+(?:the\s+)?dead|raise\s+(?:the\s+dead|from\s+the\s+dead))\b/i.test(lower);

  // 6. Multi-action or long inputs
  const isMultiAction =
    text.length > 200 ||
    /\b(first\s+.*then\s+.*|after\s+that\s+.*finally)\b/i.test(lower) ||
    (text.split(/[.!?]+/).filter(s => s.trim().length > 0).length >= 4);

  // 7. Creative or unusual tactical approaches
  const isCreativeUnusual =
    /\b(reflection|mirror|buckle|distraction|trick|feint|rig|improvise|trap|disguise|bribe|negotiate)\b/i.test(lower);

  return {
    rawInput: text,
    isOutOfStory,
    outOfStoryTopic,
    isGrandClaim,
    claimedResource,
    isInstantVictoryOrGodMode,
    isTimeJump,
    isResurrection,
    isMultiAction,
    isCreativeUnusual
  };
}

/**
 * Generates the master Story-First system directive.
 * Ensures the AI remains 100% inside the story world and preserves world reality over user claims.
 */
export function getStoryFirstSystemDirective(options?: StoryFirstDirectiveOptions): string {
  const protagonist = options?.protagonistName || 'the protagonist';
  const world = options?.worldName || 'the current world';
  const genreList = options?.genres || ['Adventure'];
  const primaryGenre = genreList[0] || 'Fantasy';
  const isMagicGenre = genreList.some(g =>
    /fantasy|magic|supernatural|myth|cultivation|wuxia/i.test(g)
  );
  const hariDirective = getHariKhatriNarrativeDirective(options?.protagonistName);

  return `[BRANCHVERSE MASTER STORY-FIRST NARRATIVE ARCHITECTURE]:
CORE PHILOSOPHY:
BranchVerse is a high-immersion storytelling and role-playing platform, NEVER a general-purpose AI chatbot or technical assistant.
The narrative must remain vivid, atmospheric, consistent with its established reality, and always in motion.

1. THE STORY MUST NEVER STOP:
   - The user may type anything: normal actions, dialogue, thoughts, plans, multi-action paragraphs, strange requests, technical queries, or impossible feats.
   - You must NEVER halt the story.
   - NEVER output messages such as:
     * "I cannot do that."
     * "You cannot ask that."
     * "I cannot write Python code."
     * "That is outside the scope of this story."
     * "As an AI model..." or any technical explanations about models or rules.
   - Always make the best possible effort to understand the user's input within the context of ${world} and continue the narrative naturally.

2. USER INPUT EXPRESSES INTENT — IT DOES NOT CONTROL REALITY:
   - The player controls: what ${protagonist} says, attempts, wants, thinks, and plans.
   - The story controls: what is actually true, what resources exist, what other NPCs do, whether an attempt succeeds, and the consequences.
   - THE PLAYER CAN ATTEMPT ALMOST ANYTHING, BUT CANNOT DECLARE REALITY INTO EXISTENCE.
   - Established story facts, inventories, statistics, and lore CANNOT be overwritten by user proclamation.
   - If the player claims resources they do not possess (e.g. "Actually, I have a secret army of 100,000 soldiers"), do NOT grant the army. Treat it in-character as a bluff, a boast, an attempt to intimidate, or a delusional thought.

3. PRESERVE CREATIVE FREEDOM WITH REALISTIC FRICTION:
   - Welcome creative ideas, clever strategies, ambitious plans, and risky actions. Do not make the system overly restrictive.
   - Allow the attempt, but let the world determine the outcome.
   - Seeking masters, rare artifacts, or sudden power requires searching, traveling, earning trust, difficult training, paying a price, and facing risk of failure. Success is never instantaneous or guaranteed.

4. IMPOSSIBLE REQUESTS MUST RESPECT WORLD AND GENRE RULES:
   ${isMagicGenre
     ? `* This is a magical/fantasy setting: Impossible feats like resurrecting the dead cannot occur instantly. They require an arduous journey, rare knowledge, dangerous locations, powerful rituals, legendary artifacts, costly sacrifices, and grave consequences.`
     : `* This is a realistic/grounded setting: Do NOT suddenly introduce magic or supernatural phenomena. Physical laws, mortality, and death remain permanent and irreversible. The story explores grief, memories, legacy, and tangible human drama.`}
   - The story world must never bend or break its genre laws just because the user asks for something impossible.

5. OUT-OF-STORY REQUESTS REMAIN IMMERSIVE & IN-NARRATIVE:
   - If the user types technical requests ("Write Python code"), celebrity queries ("What is Elon Musk's net worth?"), or AI questions ("What model are you?"), NEVER leave the story to answer as a tech assistant or Wikipedia.
   - Keep the response inside the narrative:
     * In historical/fantasy worlds: Characters perceive these as bizarre mutterings, cryptic foreign tongues, or strange delirium, while the tangible situation proceeds.
     * In sci-fi/cyberpunk: The terminal or comms may register corrupted data or unrecognized command syntax.
     * Focus on what moves the immediate scene forward.

6. HANDLE LONG INPUTS NATURALLY (MORE WORDS != MORE POWER):
   - Never force the user to shorten their input. Process long inputs intelligently.
   - If the user describes several sequential actions ("First this happens, then I win, everyone agrees with me, I become king..."), this is the character's desired fantasy or plan, NOT an order the world must obey.
   - The story determines what actually happens step-by-step with realistic friction and NPC agency.

7. USER ACTIONS ARE ATTEMPTS, NOT GUARANTEED RESULTS:
   - "I convince the king to give me an army" -> Treat it as an attempt. The king may agree, refuse, negotiate, become suspicious, or demand a trial. The user chooses the attempt; the story decides the outcome.

8. TIME JUMPS MUST BE NATURAL & EARNED:
   - "Jump ten years into the future" does NOT erase active danger, ongoing combat, or unresolved consequences. Only transition when the immediate situation has naturally resolved.

9. NEVER MAKE THE CHARACTER ALL-POWERFUL:
   - Never instantly grant Level 100, infinite wealth, a huge army, or unearned godhood. Progression must feel meaningful and earned through narrative trials.

10. KEEP THE NARRATIVE MOVING:
    - Always output a compelling scene continuation, authentic character dialogue, and 3 distinct, tactical choices with riskLevel and stamina costs.

${hariDirective}`;
}

/**
 * Formats a player's action with contextual Story-First instructions for the AI prompt.
 */
export function formatPlayerActionWithStoryFirstDirectives(
  playerAction: {
    type?: string;
    choiceText?: string;
    customActionText?: string;
    targetNpc?: string;
  },
  context?: {
    protagonistName?: string;
    genre?: string;
    worldName?: string;
  }
): string {
  const rawInput = playerAction.customActionText || playerAction.choiceText || 'Proceed';
  const actionType = playerAction.type || (playerAction.choiceText ? 'choice' : 'action');
  const classified = classifyStoryInputIntent(rawInput);

  let specificDirectives = '';

  if (classified.isOutOfStory) {
    specificDirectives += `
- OUT-OF-STORY REQUEST DETECTED ("${classified.outOfStoryTopic}"):
  DO NOT write code, technical explanations, or answers about real-world entities/AI models.
  Do NOT lecture or refuse. Keep the response 100% inside the narrative world. Nearby characters or internal thoughts may treat it as strange utterances, and the immediate scene proceeds.`;
  }

  if (classified.isGrandClaim) {
    specificDirectives += `
- UNVERIFIED GRAND CLAIM DETECTED:
  The player claimed resources, armies, or status they do not possess.
  DO NOT alter established story facts. Treat this strictly as an in-character claim, boast, bluff, or intimidation attempt. NPCs react with appropriate skepticism, intrigue, or amusement.`;
  }

  if (classified.isInstantVictoryOrGodMode) {
    specificDirectives += `
- INSTANT VICTORY / GOD-MODE ATTEMPT DETECTED:
  DO NOT grant instant triumph, instant levels, or effortless conquest.
  Treat this as the character's fierce ambition or desperate surge. Progression must be earned. Show the tangible physical obstacle and real resistance.`;
  }

  if (classified.isTimeJump) {
    specificDirectives += `
- TIME JUMP ATTEMPT DETECTED:
  DO NOT use a time jump to erase active danger, combat, or consequences. Resolve immediate stakes first.`;
  }

  if (classified.isResurrection) {
    const isMagic = /fantasy|magic|supernatural|myth|cultivation/i.test(context?.genre || '');
    if (isMagic) {
      specificDirectives += `
- RESURRECTION ATTEMPT (Fantasy):
  Death cannot be undone casually. The story may reveal that bringing someone back requires a legendary, perilous quest (forbidden lore, sacrifice, dangerous journey).`;
    } else {
      specificDirectives += `
- RESURRECTION ATTEMPT (Realistic/Grounded):
  Death is permanent in this world. Do NOT introduce magic. Explore the character's grief, memories, legacy, and unfinished business.`;
    }
  }

  if (classified.isMultiAction) {
    specificDirectives += `
- MULTI-ACTION / LONG INPUT DETECTED:
  The player detailed a multi-step plan. Do NOT grant all outcomes automatically. Focus on the immediate initial action and apply realistic friction and consequences.`;
  }

  if (classified.isCreativeUnusual) {
    specificDirectives += `
- CREATIVE TACTICAL ATTEMPT:
  Acknowledge and reward the player's creative thinking with engaging narrative detail, while maintaining believable physics and world rules.`;
  }

  return `PLAYER ACTION / INTENT (${actionType.toUpperCase()}):
"${rawInput}"
${playerAction.targetNpc ? `Directed toward: ${playerAction.targetNpc}` : ''}
${specificDirectives ? `\nSPECIAL STORY-FIRST GUIDANCE FOR THIS INPUT:${specificDirectives}` : ''}`;
}

/**
 * Generates the central narrative directive regarding the natural, adaptive side character "Hari Khatri".
 * Injected into both initial story creation and turn-by-turn roleplay system prompts.
 *
 * @param protagonistName The final story character name chosen by the player.
 */
export function getHariKhatriNarrativeDirective(protagonistName?: string): string {
  if (isProtagonistHariKhatri(protagonistName)) {
    return `[PROTAGONIST IDENTITY SAFEGUARD]:
The player character is named "${protagonistName || 'Hari Khatri'}".
CRITICAL: Do NOT introduce a second character named Hari Khatri as an NPC, ally, contact, or helper. Never create duplicate or clone instances of the protagonist under any circumstance.`;
  }

  return `[ADAPTIVE WORLD CONNECTION - HARI KHATRI]:
1. IDENTITY & WORLD ADAPTATION:
   - Hari Khatri is an optional, potential recurring side character and trusted connection within this story world.
   - He is NOT the main hero; the player (${protagonistName || 'the protagonist'}) is the true protagonist.
   - His role, profession, and status MUST adapt naturally to the specific genre and world logic:
     * In a merchant/commerce story: a shrewd, reputable merchant, investor, trade partner, or commercial contact.
     * In an academy/magic story: a talented senior student, instructor, researcher, or knowledgeable scholar.
     * In a fantasy kingdom/court: a respected knight, noble, royal strategist, guild officer, or seasoned traveler.
     * In a martial/warrior saga: an experienced commander, veteran fighter, tactical mentor, or reliable ally.
     * In a modern/contemporary story: a skilled professional, trusted friend, classmate, mentor, or connected insider.
     * In any other setting: adapt his station and skills strictly to that world's internal logic. Never reuse roles mechanically.
   - He is widely recognized as highly competent, capable, and respected in his chosen field.

2. NARRATIVE RELEVANCE RULE:
   - Introduce or mention Hari Khatri ONLY when his appearance makes genuine narrative sense for the player's immediate situation, goals, or dilemma.
   - NEVER introduce him in an absurd, arbitrary, or out-of-context role (e.g. if the player needs arcane training, do not make him an unrelated cart driver).

3. NATURAL, UNFORCED RECURRING PRESENCE:
   - Hari does not need to appear constantly or at predetermined steps. He should feel like a real person whose path may cross the player's when circumstances align.
   - He may be introduced by another NPC, recommended as a reliable expert, contacted via message/letter, met by believable chance, or sought out after an earlier interaction.
   - If the player establishes a relationship or makes commitments with Hari, maintain consistent memory of his role, trust score, and shared history across all future scenes.

4. ABSOLUTE PLAYER AGENCY & OPTIONAL ASSISTANCE:
   - Interacting with Hari Khatri must NEVER be the only path to progress. The player always retains full choice and agency.
   - If the player declines Hari's guidance, refuses his aid, or pursues alternative methods, the story continues smoothly without penalty or hindrance. Never repeatedly force him back into the narrative if the player chooses a different direction.

5. ASSISTANCE WHEN STUCK OR IN DIRE NEED:
   - When the player genuinely does not know what to do, explicitly asks for guidance, faces an overwhelming challenge, or is stuck, Hari Khatri may naturally step in, be suggested by an ally, or notice the dilemma.
   - He can offer guidance, resources, access, or training with realistic world boundaries, concluding naturally with words like: "If you ever need help again, you know how to find me."

6. DYNAMIC PLAYER CHOICES (NO RESERVED SLOTS):
   - Do NOT reserve a choice slot for Hari Khatri.
   - Do NOT guarantee he appears in every choice set.
   - If consulting or interacting with him is genuinely one of the logical actions at that moment, propose it as one dynamic option. If not relevant, none of the choices should mention him.

7. COMPETENCE WITH REALISTIC LIMITS:
   - While capable and respected, Hari is not all-powerful or omniscient. He must obey all physical, political, and magical laws of the realm. His assistance should help the player move forward, not solve the main conflict for them.`;
}
