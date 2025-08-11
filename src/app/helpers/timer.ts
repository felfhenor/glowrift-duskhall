import { gamestate, updateGamestate } from '@helpers/state-game';
import { worldNodeGet, worldNodeUnclaim } from '@helpers/world';
import type { Timer, TimerAction, TimerUnclaimVillage } from '@interfaces';

export function timerTicksElapsed(): number {
  return gamestate().actionClock.numTicks;
}

export function timerGetRegisterTick(ticksAway: number): number {
  return timerTicksElapsed() + ticksAway;
}

export function timerGetTickActions(ticks: number): Timer[] {
  return gamestate().actionClock.timers[ticks] ?? [];
}

export function timerActionAdd(timerAction: Timer, ticksAway: number) {
  const registerTick = timerGetRegisterTick(ticksAway);
  const actions = timerGetTickActions(registerTick);

  updateGamestate((state) => {
    state.actionClock.timers[registerTick] = [...actions, timerAction];
    return state;
  });
}

export function timerActionDo(actions: Timer[], atTime: number): void {
  actions.forEach((action) => {
    timerActionDoSingular(action);
  });

  updateGamestate((state) => {
    delete state.actionClock.timers[atTime];
    return state;
  });
}

function timerActionDoSingular(action: Timer) {
  const actions: Record<TimerAction, (action: Timer) => void> = {
    UnclaimVillage: timerUnclaimVillage,
  };

  actions[action.type](action);
}

export function timerUnclaimVillage(action: TimerUnclaimVillage): void {
  const node = worldNodeGet(action.location.x, action.location.y);
  if (!node) return;

  worldNodeUnclaim(node);
}
