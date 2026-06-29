export interface WorldTickPayload {
  worldId: string;
  day: number;
  tick: number;
  agents: Array<{
    id: string;
    state: string;
    positionX: number;
    positionY: number;
    health: number;
    hunger: number;
  }>;
}

export class Scheduler {
  private timers = new Map<string, ReturnType<typeof setInterval>>();

  scheduleWorld(worldId: string, tickMs: number, handler: (payload: WorldTickPayload) => void) {
    this.clearWorld(worldId);

    const payload: WorldTickPayload = {
      worldId,
      day: 1,
      tick: 0,
      agents: [],
    };

    const interval = setInterval(() => {
      payload.tick += 1;
      if (payload.tick > 0 && payload.tick % 60 === 0) {
        payload.day += 1;
      }
      handler(payload);
    }, tickMs);

    this.timers.set(worldId, interval);
  }

  clearWorld(worldId: string) {
    const timer = this.timers.get(worldId);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(worldId);
    }
  }

  has(worldId: string): boolean {
    return this.timers.has(worldId);
  }
}

export const worldScheduler = new Scheduler();
