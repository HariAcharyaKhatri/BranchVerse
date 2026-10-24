import { EngineAuthoritativeState, EngineTurnRecord } from '../types/engine.types';

export class ChoiceGenerator {
  /**
   * Generates balanced, context-aware choices tailored to hero status and active quests.
   */
  public static generateChoices(
    state: EngineAuthoritativeState,
    ambientLocation: string
  ): EngineTurnRecord['choices'] {
    const choices: EngineTurnRecord['choices'] = [];

    // 1. Tactical Combat / Direct Action Choice
    const hasWeapon = state.inventory.some(i => i.category === 'weapon');
    choices.push({
      choiceId: `choice_tactical_${Date.now()}_1`,
      text: hasWeapon
        ? `Draw your ${state.inventory.find(i => i.category === 'weapon')?.name} and stand your ground.`
        : 'Take an aggressive defensive stance and confront the threat directly.',
      consequenceHint: 'Tests your battle prowess and expends combat stamina.',
      riskLevel: 'moderate',
      requiredStamina: 15,
      actionIntent: 'combat'
    });

    // 2. Investigation / Tactical Analysis Choice
    choices.push({
      choiceId: `choice_investigate_${Date.now()}_2`,
      text: `Analyze the surrounding architecture and scan for tactical vantage points in ${ambientLocation}.`,
      consequenceHint: 'Uncovers hidden clues, traps, or alternative routes.',
      riskLevel: 'safe',
      requiredStamina: 5,
      actionIntent: 'investigate'
    });

    // 3. Social / Infiltration / Relic Choice
    const hasConsumable = state.inventory.some(i => i.category === 'consumable');
    if (hasConsumable) {
      const consumable = state.inventory.find(i => i.category === 'consumable')!;
      choices.push({
        choiceId: `choice_use_item_${Date.now()}_3`,
        text: `Consume ${consumable.name} to stabilize your reserves before advancing.`,
        consequenceHint: consumable.effectDescription || 'Recovers health or stamina.',
        riskLevel: 'safe',
        requiredItem: consumable.name,
        requiredStamina: 0,
        actionIntent: 'use_item'
      });
    } else {
      // Stealth / Infiltration option
      choices.push({
        choiceId: `choice_stealth_${Date.now()}_3`,
        text: 'Slip into the shadows and observe without alerting anyone.',
        consequenceHint: 'Avoids direct damage but tests your discretion.',
        riskLevel: 'moderate',
        requiredStamina: 10,
        actionIntent: 'stealth'
      });
    }

    // 4. Strategic Retreat / Rest Option if stamina is low
    if (state.stamina < 30 || state.health < 40) {
      choices.push({
        choiceId: `choice_rest_${Date.now()}_4`,
        text: 'Pull back to a fortified redoubt to mend wounds and catch your breath.',
        consequenceHint: 'Restores stamina and vitality, but time marches forward.',
        riskLevel: 'safe',
        requiredStamina: 0,
        actionIntent: 'rest'
      });
    }

    return choices;
  }
}
