export type RelationshipStanding =
  | 'nemesis'
  | 'hostile'
  | 'wary'
  | 'neutral'
  | 'favorable'
  | 'friendly'
  | 'unbreakable_bond';

export class RelationshipManager {
  /**
   * Evaluates standing title based on trustScore (-100 to +100).
   */
  public static evaluateStanding(trust: number): RelationshipStanding {
    if (trust <= -70) return 'nemesis';
    if (trust <= -30) return 'hostile';
    if (trust < 0) return 'wary';
    if (trust === 0) return 'neutral';
    if (trust <= 35) return 'favorable';
    if (trust <= 75) return 'friendly';
    return 'unbreakable_bond';
  }

  /**
   * Clamps trust delta into [-100, 100].
   */
  public static adjustTrust(currentTrust: number, delta: number): number {
    return Math.max(-100, Math.min(100, currentTrust + delta));
  }

  /**
   * Clamps affinity delta into [-100, 100].
   */
  public static adjustAffinity(currentAffinity: number, delta: number): number {
    return Math.max(-100, Math.min(100, currentAffinity + delta));
  }
}
