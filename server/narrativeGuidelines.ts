/**
 * Centralized Narrative Guidelines for BranchVerse AI Storytelling.
 *
 * Governs dynamic world-adaptive NPC presence, recurring connections,
 * and protagonist identity safeguards.
 */

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
