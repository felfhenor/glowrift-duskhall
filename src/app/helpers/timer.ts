import { Timer, TimerAction, TimerUnclaimVillage } from '@interfaces';
import { gamestate, updateGamestate } from '@helpers/state-game';
import { getWorldNode, unclaimNode } from '@helpers/world';

export function totalTicksElapsed(): number {
  return gamestate().actionClock.numTicks;
}

export function getRegisterTick(ticksAway: number): number {
  return totalTicksElapsed() + ticksAway;
}

export function getTickActions(ticks: number): Timer[] {
  return gamestate().actionClock.timers[ticks] ?? [];
}

export function addTimerAndAction(timerAction: Timer, ticksAway: number) {
  const registerTick = getRegisterTick(ticksAway);
  const actions = getTickActions(registerTick);

  updateGamestate((state) => {
    state.actionClock.timers[registerTick] = [...actions, timerAction];
    return state;
  });
}

export function doTimerActions(actions: Timer[], atTime: number): void {
  actions.forEach((action) => {
    doTimerAction(action);
  });

  updateGamestate((state) => {
    delete state.actionClock.timers[atTime];
    return state;
  });
}

export function doTimerAction(action: Timer) {
  const actions: Record<TimerAction, (action: Timer) => void> = {
    UnclaimVillage: timerUnclaimVillage,
  };

  actions[action.type](action);
}

export function timerUnclaimVillage(action: TimerUnclaimVillage): void {
  const node = getWorldNode(action.location.x, action.location.y);
  if (!node) return;

  unclaimNode(node);
}
