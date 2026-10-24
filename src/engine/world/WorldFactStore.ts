import { WorldFact, FactCategory } from '../types/engine.types';

export interface FactQuery {
  subject?: string;
  predicate?: string;
  object?: string;
  category?: FactCategory;
  witnessedBy?: string;
}

export class WorldFactStore {
  private facts: Map<string, WorldFact> = new Map();

  constructor(initialFacts: WorldFact[] = []) {
    for (const fact of initialFacts) {
      this.facts.set(fact.id, { ...fact });
    }
  }

  /**
   * Returns all recorded world facts.
   */
  public getAllFacts(): WorldFact[] {
    return Array.from(this.facts.values());
  }

  /**
   * Adds or updates a world fact. Returns true if added or changed.
   */
  public recordFact(fact: WorldFact): boolean {
    const existing = this.facts.get(fact.id);
    if (existing && existing.isImmutable && existing.object !== fact.object) {
      console.warn(`Attempted to overwrite immutable fact ${fact.id}`);
      return false;
    }
    this.facts.set(fact.id, { ...fact });
    return true;
  }

  /**
   * Records a fact with auto-generated ID if missing.
   */
  public assertFact(
    subject: string,
    predicate: string,
    object: string,
    category: FactCategory,
    witnessedBy: string[] = [],
    turnNumber: number = 1,
    isImmutable: boolean = false
  ): WorldFact {
    const id = `fact_${subject.toLowerCase().replace(/\s+/g, '_')}_${predicate.toLowerCase().replace(/\s+/g, '_')}`;
    const fact: WorldFact = {
      id,
      subject,
      predicate,
      object,
      category,
      witnessedBy,
      turnNumber,
      timestamp: Date.now(),
      isImmutable,
    };
    this.recordFact(fact);
    return fact;
  }

  /**
   * Query facts matching filter criteria.
   */
  public query(query: FactQuery): WorldFact[] {
    return this.getAllFacts().filter(fact => {
      if (query.subject && fact.subject.toLowerCase() !== query.subject.toLowerCase()) {
        return false;
      }
      if (query.predicate && fact.predicate.toLowerCase() !== query.predicate.toLowerCase()) {
        return false;
      }
      if (query.object && fact.object.toLowerCase() !== query.object.toLowerCase()) {
        return false;
      }
      if (query.category && fact.category !== query.category) {
        return false;
      }
      if (query.witnessedBy && !fact.witnessedBy.includes(query.witnessedBy)) {
        return false;
      }
      return true;
    });
  }

  /**
   * Checks if an entity is documented as dead or destroyed.
   */
  public isEntityDeadOrDestroyed(entityNameOrId: string): boolean {
    const deadFacts = this.query({
      subject: entityNameOrId,
      predicate: 'is_status',
      object: 'dead'
    });
    if (deadFacts.length > 0) return true;

    const destroyedFacts = this.query({
      subject: entityNameOrId,
      predicate: 'is_status',
      object: 'destroyed'
    });
    return destroyedFacts.length > 0;
  }

  /**
   * Validates if a proposed fact contradicts known immutable/authoritative facts.
   * e.g., if entity is dead, they cannot 'speak' or 'run' as an active agent.
   */
  public checkContradiction(proposedFact: Partial<WorldFact>): { hasContradiction: boolean; reason?: string } {
    if (!proposedFact.subject) return { hasContradiction: false };

    if (this.isEntityDeadOrDestroyed(proposedFact.subject)) {
      if (
        proposedFact.predicate === 'speaks_to' ||
        proposedFact.predicate === 'attacks' ||
        proposedFact.predicate === 'escapes'
      ) {
        return {
          hasContradiction: true,
          reason: `Entity "${proposedFact.subject}" is already dead or destroyed and cannot perform "${proposedFact.predicate}".`
        };
      }
    }

    return { hasContradiction: false };
  }

  /**
   * Clones the fact store for transaction staging.
   */
  public clone(): WorldFactStore {
    return new WorldFactStore(this.getAllFacts());
  }
}
