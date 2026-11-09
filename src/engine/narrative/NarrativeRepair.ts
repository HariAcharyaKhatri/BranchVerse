import { NarrativeProposal, NarrativeProposalSchema } from './NarrativeSchema';

export interface RepairDiagnostics {
  repaired: boolean;
  hasUsableNarrative: boolean;
  repairedFields: string[];
  rejectedStateFields: string[];
  errors: string[];
  summary: {
    sceneTitle: string;
    narrativeTextLength: number;
    choiceCount: number;
    dialogueCount: number;
    hasStateDelta: boolean;
    stateDeltaKeys?: string[];
  };
}

/**
 * Normalizes riskLevel strings to the accepted engine enum ('safe' | 'moderate' | 'perilous').
 */
export function normalizeRiskLevel(raw?: any): 'safe' | 'moderate' | 'perilous' {
  if (typeof raw !== 'string') return 'moderate';
  const val = raw.trim().toLowerCase();
  if (['safe', 'low', 'easy', 'minimal', 'trivial', 'cautious'].includes(val)) return 'safe';
  if (['perilous', 'hard', 'high', 'dangerous', 'deadly', 'critical', 'risky'].includes(val)) return 'perilous';
  return 'moderate';
}

/**
 * Normalizes actionIntent to the accepted engine enum.
 */
export function normalizeActionIntent(
  raw?: any
): 'talk' | 'investigate' | 'travel' | 'combat' | 'use_item' | 'trade' | 'persuade' | 'stealth' | 'interact' | 'quest' | 'rest' | 'creative' {
  if (typeof raw !== 'string') return 'investigate';
  const val = raw.trim().toLowerCase();

  const validIntents = [
    'talk',
    'investigate',
    'travel',
    'combat',
    'use_item',
    'trade',
    'persuade',
    'stealth',
    'interact',
    'quest',
    'rest',
    'creative',
  ] as const;

  if (validIntents.includes(val as any)) {
    return val as any;
  }

  // Common AI synonyms mapping
  if (['explore', 'search', 'look', 'examine', 'scout', 'inspect', 'observe', 'read', 'scan'].includes(val)) return 'investigate';
  if (['attack', 'fight', 'strike', 'strike_back', 'cast', 'spells', 'defend', 'shoot', 'slash'].includes(val)) return 'combat';
  if (['flee', 'run', 'escape', 'move', 'go', 'leave', 'walk', 'advance', 'journey'].includes(val)) return 'travel';
  if (['speak', 'say', 'ask', 'chat', 'shout', 'call', 'reply', 'question'].includes(val)) return 'talk';
  if (['bribe', 'buy', 'sell', 'haggle', 'merchant', 'shop', 'pay'].includes(val)) return 'trade';
  if (['hide', 'sneak', 'sneak_past', 'creep', 'shadow', 'evade'].includes(val)) return 'stealth';
  if (['persuade', 'convince', 'charm', 'negotiate', 'deceive', 'lie'].includes(val)) return 'persuade';
  if (['use', 'equip', 'consume', 'drink', 'apply', 'activate'].includes(val)) return 'use_item';
  if (['rest', 'sleep', 'wait', 'meditate', 'camp'].includes(val)) return 'rest';

  return 'investigate';
}

/**
 * Safely repairs and normalizes an AI narrative proposal object.
 * Separates critical narrative requirements from optional/recoverable state updates.
 */
export function repairNarrativeProposal(
  rawInput: any,
  context?: { heroName?: string; worldName?: string; turnNumber?: number }
): { proposal: NarrativeProposal | null; diagnostics: RepairDiagnostics } {
  const repairedFields: string[] = [];
  const rejectedStateFields: string[] = [];
  const errors: string[] = [];

  // 1. Unpack string or nested object
  let raw = rawInput;
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw);
      repairedFields.push('unpacked_json_string');
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          raw = JSON.parse(match[0]);
          repairedFields.push('extracted_json_from_prose');
        } catch {
          raw = null;
        }
      } else {
        raw = null;
      }

      // If JSON parsing failed, check if raw string contains narrativeText in truncated JSON or is raw prose
      if (!raw && typeof rawInput === 'string') {
        const isHtmlOrHttpError =
          rawInput.trim().startsWith('<') ||
          /\b(bad gateway|internal server error|service unavailable|gateway timeout|not found)\b/i.test(rawInput);

        const narrativeMatch = rawInput.match(/"(?:narrativeText|narrative|story|text)"\s*:\s*"((?:[^"\\]|\\.)*)"?/);
        if (narrativeMatch && narrativeMatch[1] && narrativeMatch[1].trim().length >= 10) {
          raw = {
            narrativeText: narrativeMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').trim(),
          };
          repairedFields.push('extracted_narrative_from_truncated_json');
        } else if (!isHtmlOrHttpError && rawInput.trim().length >= 25) {
          // The AI returned raw storytelling prose without JSON structure
          raw = {
            narrativeText: rawInput.trim(),
          };
          repairedFields.push('converted_prose_string_to_narrative');
        }
      }
    }
  }

  if (!raw || typeof raw !== 'object') {
    return {
      proposal: null,
      diagnostics: {
        repaired: false,
        hasUsableNarrative: false,
        repairedFields,
        rejectedStateFields,
        errors: ['Raw input was null or not a valid object.'],
        summary: {
          sceneTitle: '',
          narrativeTextLength: 0,
          choiceCount: 0,
          dialogueCount: 0,
          hasStateDelta: false,
        },
      },
    };
  }

  // 2. Extract Narrative Text (Critical)
  let rawNarrative =
    raw.narrativeText ??
    raw.narrative ??
    raw.story ??
    raw.storyText ??
    raw.text ??
    raw.content ??
    raw.narration ??
    raw.description ??
    raw.prose ??
    raw.passage ??
    raw.chapterText ??
    raw.chapterContent ??
    raw.sceneText ??
    raw.sceneContent ??
    raw.response ??
    (raw.scene && typeof raw.scene === 'object' ? (raw.scene.text || raw.scene.narrative) : undefined);

  if (typeof rawNarrative !== 'string') {
    rawNarrative = '';
  }
  const narrativeText = rawNarrative.trim();
  const hasUsableNarrative = narrativeText.length >= 10;

  if (!hasUsableNarrative) {
    errors.push(`Narrative text missing or too short (${narrativeText.length} chars, minimum 10 required).`);
    return {
      proposal: null,
      diagnostics: {
        repaired: false,
        hasUsableNarrative: false,
        repairedFields,
        rejectedStateFields,
        errors,
        summary: {
          sceneTitle: String(raw.sceneTitle || ''),
          narrativeTextLength: narrativeText.length,
          choiceCount: 0,
          dialogueCount: 0,
          hasStateDelta: false,
        },
      },
    };
  }

  if (rawNarrative !== raw.narrativeText) {
    repairedFields.push('narrativeText_alias_resolved');
  }

  // 3. Extract & Repair Scene Title (Optional / Recoverable)
  let rawTitle =
    raw.sceneTitle ??
    raw.title ??
    raw.chapterTitle ??
    raw.scene ??
    raw.chapter;

  let sceneTitle = typeof rawTitle === 'string' ? rawTitle.trim() : '';
  if (sceneTitle.length < 2) {
    sceneTitle = context?.worldName ? `${context.worldName} Encounter` : 'Chronicle Scene';
    repairedFields.push('sceneTitle_fallback_applied');
  } else if (rawTitle !== raw.sceneTitle) {
    repairedFields.push('sceneTitle_alias_resolved');
  }

  // 4. Extract & Repair Dialogues (Optional / Recoverable)
  const rawDialogues = raw.dialogues ?? raw.dialogue ?? raw.conversation ?? raw.quotes;
  const dialogues: Array<{ speaker: string; text: string; emotion?: string }> = [];

  if (Array.isArray(rawDialogues)) {
    for (const d of rawDialogues) {
      if (d && typeof d === 'object') {
        const text = typeof d.text === 'string' ? d.text.trim() : '';
        if (text) {
          const speaker = typeof d.speaker === 'string' && d.speaker.trim() ? d.speaker.trim() : 'Voice';
          dialogues.push({
            speaker,
            text,
            emotion: typeof d.emotion === 'string' ? d.emotion.trim() : undefined,
          });
        }
      }
    }
  }

  // 5. Extract & Repair Proposed Choices (Optional / Recoverable)
  const rawChoices = raw.proposedChoices ?? raw.choices ?? raw.options ?? raw.nextChoices;
  const proposedChoices: Array<{
    choiceId: string;
    text: string;
    consequenceHint?: string;
    riskLevel: 'safe' | 'moderate' | 'perilous';
    requiredStamina?: number;
    actionIntent: 'talk' | 'investigate' | 'travel' | 'combat' | 'use_item' | 'trade' | 'persuade' | 'stealth' | 'interact' | 'quest' | 'rest' | 'creative';
  }> = [];

  if (Array.isArray(rawChoices)) {
    for (let idx = 0; idx < rawChoices.length; idx++) {
      const c = rawChoices[idx];
      if (c && typeof c === 'object') {
        const rawText = typeof c.text === 'string' ? c.text.trim() : typeof c.choiceText === 'string' ? c.choiceText.trim() : '';
        const choiceText = rawText.length >= 3 ? rawText : 'Carefully assess your surroundings and move forward.';
        if (rawText.length < 3) repairedFields.push(`choice_${idx}_text_padded`);

        const stamina = typeof c.requiredStamina === 'number'
          ? c.requiredStamina
          : typeof c.requiredStamina === 'string'
            ? parseInt(c.requiredStamina, 10)
            : undefined;

        proposedChoices.push({
          choiceId: typeof c.choiceId === 'string' && c.choiceId.trim() ? c.choiceId.trim() : `choice_ai_${Date.now()}_${idx}`,
          text: choiceText,
          consequenceHint: typeof c.consequenceHint === 'string' ? c.consequenceHint.trim() : undefined,
          riskLevel: normalizeRiskLevel(c.riskLevel),
          ...(typeof stamina === 'number' && !isNaN(stamina) ? { requiredStamina: stamina } : {}),
          actionIntent: normalizeActionIntent(c.actionIntent),
        });
      }
    }
  }

  // Ensure 2 to 5 choices
  if (proposedChoices.length < 2) {
    repairedFields.push('choices_padded_to_minimum');
    if (proposedChoices.length === 0) {
      proposedChoices.push({
        choiceId: `choice_recovery_${Date.now()}_1`,
        text: 'Proceed carefully through the current obstacle.',
        riskLevel: 'safe',
        actionIntent: 'investigate',
      });
    }
    proposedChoices.push({
      choiceId: `choice_recovery_${Date.now()}_2`,
      text: 'Take decisive action to shift the advantage in your favor.',
      riskLevel: 'moderate',
      actionIntent: 'combat',
    });
  } else if (proposedChoices.length > 5) {
    proposedChoices.length = 4;
    repairedFields.push('choices_truncated_to_maximum');
  }

  // 6. Extract & Safely Normalize Proposed State Delta (Optional / Recoverable)
  let proposedStateDelta: Record<string, any> | undefined = undefined;
  const rawState = raw.proposedStateDelta ?? raw.stateChanges ?? raw.stateDelta ?? raw.state;

  if (rawState && typeof rawState === 'object' && !Array.isArray(rawState)) {
    const normalizedDelta: Record<string, any> = {};

    // Location / City normalization
    const loc = rawState.currentLocation ?? rawState.location ?? rawState.city ?? rawState.zone ?? rawState.area;
    if (typeof loc === 'string' && loc.trim()) {
      normalizedDelta.currentLocation = loc.trim();
    } else if (loc !== undefined && loc !== null) {
      rejectedStateFields.push('currentLocation (non-string)');
    }

    // Region normalization
    const reg = rawState.region ?? rawState.province ?? rawState.district;
    if (typeof reg === 'string' && reg.trim()) {
      normalizedDelta.region = reg.trim();
    } else if (reg !== undefined && reg !== null) {
      rejectedStateFields.push('region (non-string)');
    }

    // Kingdom normalization
    const kng = rawState.kingdom ?? rawState.realm ?? rawState.country;
    if (typeof kng === 'string' && kng.trim()) {
      normalizedDelta.kingdom = kng.trim();
    } else if (kng !== undefined && kng !== null) {
      rejectedStateFields.push('kingdom (non-string)');
    }

    // Wealth normalization: accepts number, numeric string, formatted string (e.g. "150 gold"), or object { amount, currency }
    const wth = rawState.wealth ?? rawState.gold ?? rawState.credits ?? rawState.money ?? rawState.funds;
    if (typeof wth === 'number') {
      normalizedDelta.wealth = wth;
    } else if (typeof wth === 'string' && wth.trim()) {
      normalizedDelta.wealth = wth.trim();
    } else if (Array.isArray(wth)) {
      rejectedStateFields.push('wealth (unsupported type)');
    } else if (wth && typeof wth === 'object') {
      if (wth.amount !== undefined) {
        normalizedDelta.wealth = `${wth.amount} ${wth.currency || wth.unit || 'Gold'}`.trim();
        repairedFields.push('wealth_object_to_string');
      } else {
        rejectedStateFields.push('wealth (malformed object)');
      }
    } else if (wth !== undefined && wth !== null) {
      rejectedStateFields.push('wealth (unsupported type)');
    }

    // Rank / Title normalization
    const rnk = rawState.rank ?? rawState.title ?? rawState.standing ?? rawState.position;
    if (typeof rnk === 'string' && rnk.trim()) {
      normalizedDelta.rank = rnk.trim();
    } else if (rnk !== undefined && rnk !== null) {
      rejectedStateFields.push('rank (non-string)');
    }

    // Status Effects Added normalization
    const effAdded = rawState.statusEffectsAdded ?? rawState.statusEffects ?? rawState.statusEffect ?? rawState.status;
    if (Array.isArray(effAdded)) {
      normalizedDelta.statusEffectsAdded = effAdded.filter((e: any) => typeof e === 'string' && e.trim()).map((e: any) => e.trim());
    } else if (typeof effAdded === 'string' && effAdded.trim()) {
      normalizedDelta.statusEffectsAdded = [effAdded.trim()];
      repairedFields.push('statusEffectsAdded_string_to_array');
    }

    // Status Effects Removed normalization
    if (Array.isArray(rawState.statusEffectsRemoved)) {
      normalizedDelta.statusEffectsRemoved = rawState.statusEffectsRemoved.filter((e: any) => typeof e === 'string' && e.trim());
    }

    // Items / Inventory Added normalization
    const items = rawState.itemsAdded ?? rawState.inventoryChanges ?? rawState.inventory ?? rawState.items;
    if (Array.isArray(items)) {
      const parsedItems: any[] = [];
      for (const item of items) {
        if (typeof item === 'string' && item.trim()) {
          const name = item.trim();
          const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || `item_${Date.now()}`;
          parsedItems.push({
            id,
            name,
            quantity: 1,
            category: 'material',
            description: `Gathered during the adventure.`
          });
          repairedFields.push('itemsAdded_string_to_object');
        } else if (item && typeof item === 'object' && item.name) {
          const name = String(item.name).trim();
          const id = String(item.id || name.toLowerCase().replace(/[^a-z0-9]+/g, '_') || `item_${Date.now()}`);
          parsedItems.push({
            id,
            name,
            quantity: typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1,
            category: item.category || 'material',
            description: item.description || ''
          });
        }
      }
      if (parsedItems.length > 0) {
        normalizedDelta.itemsAdded = parsedItems;
      }
    }

    if (Object.keys(normalizedDelta).length > 0) {
      proposedStateDelta = normalizedDelta;
    }
  } else if (rawState !== undefined && rawState !== null) {
    rejectedStateFields.push('proposedStateDelta (non-object, discarded safely)');
  }

  // 7. Compose Final Proposal Candidate
  const candidateProposal: NarrativeProposal = {
    sceneTitle,
    narrativeText,
    dialogues,
    ambientVisual: typeof raw.ambientVisual === 'string' ? raw.ambientVisual.trim() : undefined,
    proposedChoices,
    proposedStateDelta,
    unlockedEndingId: typeof raw.unlockedEndingId === 'string' ? raw.unlockedEndingId.trim() : undefined,
  };

  const parsed = NarrativeProposalSchema.safeParse(candidateProposal);
  if (parsed.success) {
    return {
      proposal: parsed.data,
      diagnostics: {
        repaired: repairedFields.length > 0 || rejectedStateFields.length > 0,
        hasUsableNarrative: true,
        repairedFields,
        rejectedStateFields,
        errors: [],
        summary: {
          sceneTitle: parsed.data.sceneTitle,
          narrativeTextLength: parsed.data.narrativeText.length,
          choiceCount: parsed.data.proposedChoices.length,
          dialogueCount: parsed.data.dialogues?.length || 0,
          hasStateDelta: Boolean(parsed.data.proposedStateDelta),
          stateDeltaKeys: parsed.data.proposedStateDelta ? Object.keys(parsed.data.proposedStateDelta) : undefined,
        },
      },
    };
  }

  // If Zod validation failed on some detail, log and perform emergency fallback:
  // Since narrativeText is guaranteed valid, salvage the narrative with sanitized choices and drop any bad delta.
  const emergencyProposal: NarrativeProposal = {
    sceneTitle: sceneTitle || 'Chronicle Scene',
    narrativeText,
    dialogues: [],
    proposedChoices: [
      {
        choiceId: `choice_salvage_${Date.now()}_1`,
        text: 'Proceed carefully through the current area.',
        riskLevel: 'safe',
        actionIntent: 'investigate',
      },
      {
        choiceId: `choice_salvage_${Date.now()}_2`,
        text: 'Take decisive action to overcome the immediate obstacle.',
        riskLevel: 'moderate',
        actionIntent: 'interact',
      },
    ],
    proposedStateDelta: undefined,
  };

  repairedFields.push('emergency_narrative_salvage_engaged');

  return {
    proposal: emergencyProposal,
    diagnostics: {
      repaired: true,
      hasUsableNarrative: true,
      repairedFields,
      rejectedStateFields,
      errors: parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`),
      summary: {
        sceneTitle: emergencyProposal.sceneTitle,
        narrativeTextLength: emergencyProposal.narrativeText.length,
        choiceCount: emergencyProposal.proposedChoices.length,
        dialogueCount: 0,
        hasStateDelta: false,
      },
    },
  };
}
