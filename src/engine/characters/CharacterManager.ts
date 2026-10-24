import { CharacterEntity } from '../types/engine.types';
import { RelationshipManager } from './RelationshipManager';

export class CharacterManager {
  private characters: Map<string, CharacterEntity> = new Map();

  constructor(initialCharacters: Record<string, CharacterEntity> = {}) {
    for (const [id, char] of Object.entries(initialCharacters)) {
      this.characters.set(id, { ...char, inventory: [...char.inventory], knownFactIds: [...char.knownFactIds] });
    }
  }

  public getCharacter(id: string): CharacterEntity | undefined {
    return this.characters.get(id);
  }

  public getCharacterByName(name: string): CharacterEntity | undefined {
    const lower = name.toLowerCase();
    for (const char of this.characters.values()) {
      if (char.name.toLowerCase() === lower || char.id.toLowerCase() === lower) {
        return char;
      }
    }
    return undefined;
  }

  public getAllCharacters(): CharacterEntity[] {
    return Array.from(this.characters.values());
  }

  public toRecord(): Record<string, CharacterEntity> {
    const result: Record<string, CharacterEntity> = {};
    for (const [id, char] of this.characters.entries()) {
      result[id] = { ...char, inventory: [...char.inventory], knownFactIds: [...char.knownFactIds] };
    }
    return result;
  }

  public registerCharacter(char: CharacterEntity): void {
    this.characters.set(char.id, {
      ...char,
      inventory: [...char.inventory],
      knownFactIds: [...char.knownFactIds]
    });
  }

  public setAliveStatus(id: string, isAlive: boolean): boolean {
    const char = this.characters.get(id);
    if (!char) return false;
    char.isAlive = isAlive;
    if (!isAlive) {
      char.currentEmotion = 'calm';
    }
    return true;
  }

  public updateEmotion(id: string, emotion: CharacterEntity['currentEmotion']): boolean {
    const char = this.characters.get(id);
    if (!char || !char.isAlive) return false;
    char.currentEmotion = emotion;
    return true;
  }

  public adjustTrust(id: string, delta: number): number | null {
    const char = this.characters.get(id);
    if (!char) return null;
    char.trustScore = RelationshipManager.adjustTrust(char.trustScore, delta);
    return char.trustScore;
  }

  public adjustAffinity(id: string, delta: number): number | null {
    const char = this.characters.get(id);
    if (!char) return null;
    char.affinityScore = RelationshipManager.adjustAffinity(char.affinityScore, delta);
    return char.affinityScore;
  }

  public grantKnowledge(id: string, factId: string): boolean {
    const char = this.characters.get(id);
    if (!char) return false;
    if (!char.knownFactIds.includes(factId)) {
      char.knownFactIds.push(factId);
    }
    return true;
  }

  public clone(): CharacterManager {
    return new CharacterManager(this.toRecord());
  }
}
