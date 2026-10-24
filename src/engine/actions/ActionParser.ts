import { ParsedAction } from '../types/engine.types';

export class ActionParser {
  /**
   * Parses free-form user input or predefined choice text into a structured ParsedAction.
   */
  public static parse(input: string, isCustomAction: boolean = true): ParsedAction {
    const rawText = input.trim();
    const lower = rawText.toLowerCase();

    // Intent detectors in priority order
    if (this.matchesAny(lower, ['rest', 'sleep', 'camp', 'meditate', 'wait patiently', 'take a breather'])) {
      return {
        rawText,
        intent: 'rest',
        isCustomAction,
        confidence: 0.95
      };
    }

    if (this.matchesAny(lower, ['use', 'drink', 'consume', 'quaff', 'apply', 'activate', 'equip'])) {
      const itemMatch = this.extractItemName(lower);
      return {
        rawText,
        intent: 'use_item',
        relevantItemName: itemMatch,
        isCustomAction,
        confidence: 0.9
      };
    }

    if (this.matchesAny(lower, ['talk', 'speak', 'converse', 'ask', 'greet', 'inquire', 'tell'])) {
      const target = this.extractTarget(lower, ['to', 'with', 'at']);
      return {
        rawText,
        intent: 'talk',
        target,
        isCustomAction,
        confidence: 0.88
      };
    }

    if (this.matchesAny(lower, ['persuade', 'convince', 'charm', 'bribe', 'deceive', 'lie to', 'bargain'])) {
      const target = this.extractTarget(lower, ['to', 'with']);
      return {
        rawText,
        intent: 'persuade',
        target,
        isCustomAction,
        confidence: 0.85
      };
    }

    if (this.matchesAny(lower, ['sneak', 'hide', 'creep', 'stealth', 'eavesdrop', 'lurk', 'slip past', 'shadow'])) {
      return {
        rawText,
        intent: 'stealth',
        isCustomAction,
        confidence: 0.88
      };
    }

    if (this.matchesAny(lower, ['attack', 'strike', 'slash', 'stab', 'fight', 'shoot', 'cast fireball', 'destroy', 'defeat', 'clash'])) {
      const target = this.extractTarget(lower, ['at', 'on', 'against', 'the']);
      return {
        rawText,
        intent: 'combat',
        target,
        isCustomAction,
        confidence: 0.92
      };
    }

    if (this.matchesAny(lower, ['investigate', 'inspect', 'examine', 'search', 'look closely', 'read', 'scan', 'study'])) {
      const target = this.extractTarget(lower, ['the', 'at', 'into', 'for']);
      return {
        rawText,
        intent: 'investigate',
        target,
        isCustomAction,
        confidence: 0.88
      };
    }

    if (this.matchesAny(lower, ['go to', 'travel', 'head towards', 'run to', 'walk to', 'flee to', 'enter', 'escape'])) {
      const target = this.extractTarget(lower, ['to', 'towards', 'into', 'for']);
      return {
        rawText,
        intent: 'travel',
        target,
        isCustomAction,
        confidence: 0.86
      };
    }

    if (this.matchesAny(lower, ['buy', 'sell', 'trade', 'purchase', 'barter'])) {
      return {
        rawText,
        intent: 'trade',
        isCustomAction,
        confidence: 0.85
      };
    }

    // Default to creative interaction
    return {
      rawText,
      intent: 'creative',
      desiredOutcome: rawText,
      isCustomAction,
      confidence: 0.7
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
