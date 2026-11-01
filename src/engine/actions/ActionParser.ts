import { ParsedAction } from '../types/engine.types';

export class ActionParser {
  /**
   * Parses free-form user input or predefined choice text into a structured ParsedAction.
   */
  public static parse(input: string, isCustomAction: boolean = true): ParsedAction {
    const rawText = input.trim();
    const lower = rawText.toLowerCase();

    const flags = this.detectStoryFirstFlags(lower, rawText);

    // Intent detectors in priority order
    if (this.matchesAny(lower, ['rest', 'sleep', 'camp', 'meditate', 'wait patiently', 'take a breather'])) {
      return {
        rawText,
        intent: 'rest',
        isCustomAction,
        confidence: 0.95,
        ...flags
      };
    }

    if (this.matchesAny(lower, ['use', 'drink', 'consume', 'quaff', 'apply', 'activate', 'equip'])) {
      const itemMatch = this.extractItemName(lower);
      return {
        rawText,
        intent: 'use_item',
        relevantItemName: itemMatch,
        isCustomAction,
        confidence: 0.9,
        ...flags
      };
    }

    if (this.matchesAny(lower, ['talk', 'speak', 'converse', 'ask', 'greet', 'inquire', 'tell'])) {
      const target = this.extractTarget(lower, ['to', 'with', 'at']);
      return {
        rawText,
        intent: 'talk',
        target,
        isCustomAction,
        confidence: 0.88,
        ...flags
      };
    }

    if (this.matchesAny(lower, ['persuade', 'convince', 'charm', 'bribe', 'deceive', 'lie to', 'bargain'])) {
      const target = this.extractTarget(lower, ['to', 'with']);
      return {
        rawText,
        intent: 'persuade',
        target,
        isCustomAction,
        confidence: 0.85,
        ...flags
      };
    }

    if (this.matchesAny(lower, ['sneak', 'hide', 'creep', 'stealth', 'eavesdrop', 'lurk', 'slip past', 'shadow'])) {
      return {
        rawText,
        intent: 'stealth',
        isCustomAction,
        confidence: 0.88,
        ...flags
      };
    }

    if (this.matchesAny(lower, ['attack', 'strike', 'slash', 'stab', 'fight', 'shoot', 'cast fireball', 'destroy', 'defeat', 'clash'])) {
      const target = this.extractTarget(lower, ['at', 'on', 'against', 'the']);
      return {
        rawText,
        intent: 'combat',
        target,
        isCustomAction,
        confidence: 0.92,
        ...flags
      };
    }

    if (this.matchesAny(lower, ['investigate', 'inspect', 'examine', 'search', 'look closely', 'read', 'scan', 'study'])) {
      const target = this.extractTarget(lower, ['the', 'at', 'into', 'for']);
      return {
        rawText,
        intent: 'investigate',
        target,
        isCustomAction,
        confidence: 0.88,
        ...flags
      };
    }

    if (this.matchesAny(lower, ['go to', 'travel', 'head towards', 'run to', 'walk to', 'flee to', 'enter', 'escape'])) {
      const target = this.extractTarget(lower, ['to', 'towards', 'into', 'for']);
      return {
        rawText,
        intent: 'travel',
        target,
        isCustomAction,
        confidence: 0.86,
        ...flags
      };
    }

    if (this.matchesAny(lower, ['buy', 'sell', 'trade', 'purchase', 'barter'])) {
      return {
        rawText,
        intent: 'trade',
        isCustomAction,
        confidence: 0.85,
        ...flags
      };
    }

    // Default to creative interaction
    return {
      rawText,
      intent: 'creative',
      desiredOutcome: rawText,
      isCustomAction,
      confidence: 0.7,
      ...flags
    };
  }

  private static detectStoryFirstFlags(lower: string, rawText: string) {
    const isCode = /\b(python|javascript|typescript|c\+\+|html|css|sql)\b/i.test(lower) &&
                   /\b(write|code|script|function|def\s+|class\s+|program)\b/i.test(lower);
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

    const isGrandClaim =
      /\b(actually\s+i\s+have|secret\s+army|100[,.]?000\s+(soldiers|men|troops)|unlimited\s+(gold|money|resources)|i\s+am\s+secretly\s+the\s+(emperor|king|god))\b/i.test(lower);

    const isInstantVictoryOrGodMode =
      /\b(level\s+100|god\s+mode|instantly\s+win|instant\s+victory|instant\s+success|instantly\s+(convince|persuade|defeat|kill|destroy|conquer|surrender)|all\s+enemies\s+die|kill\s+everyone\s+in\s+one\s+hit|become\s+all-powerful|unlimited\s+power)\b/i.test(lower);

    const isTimeJumpAttempt =
      /\b(jump\s+(ten|10|\d+)\s+years|skip\s+(ten|10|\d+)\s+years|(ten|10|\d+)\s+years\s+pass|fast[- ]forward\s+(ten|10|\d+)\s+years)\b/i.test(lower);

    const isResurrectionAttempt =
      /\b(resurrect|bring\s+(?:[a-zA-Z'\s]+?\s+)?back\s+to\s+life|bring\s+(?:them|him|her)\s+back|revive\s+(?:the\s+)?dead|raise\s+(?:the\s+dead|from\s+the\s+dead))\b/i.test(lower);

    const isMultiAction =
      rawText.length > 200 ||
      /\b(first\s+.*then\s+.*|after\s+that\s+.*finally)\b/i.test(lower);

    return {
      isOutOfStory,
      outOfStoryTopic,
      isGrandClaim,
      isInstantVictoryOrGodMode,
      isTimeJumpAttempt,
      isResurrectionAttempt,
      isMultiAction
    };
  }

  private static matchesAny(text: string, patterns: string[]): boolean {
    return patterns.some(pattern => {
      const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      return regex.test(text);
    });
  }

  private static extractTarget(text: string, prepositions: string[]): string | undefined {
    for (const prep of prepositions) {
      const regex = new RegExp(`\\b${prep}\\s+(?:the\\s+|a\\s+|an\\s+)?([a-zA-Z0-9_'\\s]+?)(?:\\.|,|!|\\band\\b|\\bwith\\b|$)`, 'i');
      const match = text.match(regex);
      if (match && match[1]) {
        let clean = match[1].trim();
        clean = clean.replace(/^(the|a|an)\s+/i, '');
        return clean;
      }
    }
    return undefined;
  }

  private static extractItemName(text: string): string | undefined {
    const match = text.match(/\b(?:use|drink|consume|apply|activate|equip)\s+(?:the\s+|a\s+|an\s+)?([a-zA-Z0-9_'\s]+?)(?:\.|\bto\b|\bon\b|,|!|$)/i);
    return match && match[1] && match[1].trim().length > 0 ? match[1].trim() : undefined;
  }
}
