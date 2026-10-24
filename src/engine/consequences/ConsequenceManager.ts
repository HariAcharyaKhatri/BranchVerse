import { DelayedEvent, EngineAuthoritativeState } from '../types/engine.types';
import { WorldFactStore } from '../world/WorldFactStore';

export interface TriggeredDelayedEventResult {
  event: DelayedEvent;
  appliedDelta: Partial<EngineAuthoritativeState>;
  narrativeHook: string;
}

export class ConsequenceManager {
  private delayedEvents: DelayedEvent[] = [];

  constructor(initialEvents: DelayedEvent[] = []) {
    this.delayedEvents = initialEvents.map(e => ({
      ...e,
      stateDelta: { ...e.stateDelta }
    }));
  }

  public getDelayedEvents(): DelayedEvent[] {
    return this.delayedEvents.map(e => ({ ...e, stateDelta: { ...e.stateDelta } }));
  }

  public scheduleDelayedEvent(
    narrativeHook: string,
    delayTurns: number,
    stateDelta: Partial<EngineAuthoritativeState>,
    currentTurn: number,
    preconditionFact?: DelayedEvent['preconditionFact']
  ): DelayedEvent {
    const event: DelayedEvent = {
      id: `delayed_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      triggerTurnNumber: currentTurn + Math.max(1, delayTurns),
      narrativeHook,
      stateDelta,
      status: 'pending',
      createdAtTurn: currentTurn,
      preconditionFact
    };
    this.delayedEvents.push(event);
    return event;
  }

  public evaluateDelayedEvents(
    currentTurn: number,
    factStore: WorldFactStore
  ): TriggeredDelayedEventResult[] {
    const triggered: TriggeredDelayedEventResult[] = [];

    for (const event of this.delayedEvents) {
      if (event.status !== 'pending') continue;

      if (event.triggerTurnNumber <= currentTurn) {
        // Precondition check if defined
        if (event.preconditionFact) {
          const match = factStore.query({
            subject: event.preconditionFact.subject,
            predicate: event.preconditionFact.predicate,
            object: event.preconditionFact.object
          });
          if (match.length === 0) {
            // Condition not met, cancel or delay
            event.status = 'cancelled';
            continue;
          }
        }

        event.status = 'triggered';
        triggered.push({
          event,
          appliedDelta: event.stateDelta,
          narrativeHook: event.narrativeHook
        });
      }
    }

    return triggered;
  }

  public cancelEvent(id: string): boolean {
    const event = this.delayedEvents.find(e => e.id === id);
    if (!event || event.status !== 'pending') return false;
    event.status = 'cancelled';
    return true;
  }

  public clone(): ConsequenceManager {
    return new ConsequenceManager(this.getDelayedEvents());
  }
}
