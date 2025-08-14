import { rngUuid } from '@helpers/rng';
import { gamestate, updateGamestate } from '@helpers/state-game';
import { worldNodeGet, worldNodeUnclaim } from '@helpers/world';
import type {
  Timer,
  TimerAction,
  TimerData,
  TimerId,
  TimerUnclaimVillage,
  WorldLocation,
} from '@interfaces';

function createBaseTimer(tick: number): TimerData {
  return {
    id: rngUuid() as TimerId,
    type: 'UNKNOWN',
    tick,
  };
}

export function cleanupOldTimerEntries(): void {
  const allKeys = Object.keys(gamestate().actionClock.timers);
  const currentTick = timerTicksElapsed();
  const editState = gamestate();

  allKeys.forEach((key) => {
    const keyNum = +key;

    if (editState.actionClock.timers[keyNum]?.length === 0) {
      delete editState.actionClock.timers[keyNum];
      return;
    }

    if (keyNum >= currentTick) return;
    delete editState.actionClock.timers[keyNum];
  });

  updateGamestate((state) => {
    state.actionClock.timers = editState.actionClock.timers;
    return state;
  });
}

export function timerTicksElapsed(): number {
  return gamestate().actionClock.numTicks;
}

export function timerGetRegisterTick(ticksAway: number): number {
  return timerTicksElapsed() + ticksAway;
}

export function timerGetTickActions(ticks: number): Timer[] {
  return gamestate().actionClock.timers[ticks] ?? [];
}

function timerActionAdd(timerAction: Partial<Timer>, atTicks: number) {
  const registerTick = atTicks;
  const actions = timerGetTickActions(registerTick);

  const fullAction: Timer = {
    ...createBaseTimer(atTicks),
    ...timerAction,
  } as Timer;

  updateGamestate((state) => {
    state.actionClock.timers[registerTick] = [...actions, fullAction];
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
    UNKNOWN: () => {},
    UnclaimVillage: timerUnclaimVillage,
  };

  actions[action.type](action);
}

export function timerUnclaimVillage(action: TimerUnclaimVillage): void {
  const node = worldNodeGet(action.location.x, action.location.y);
  if (!node) return;

  if (node.unclaimTime === -1) {
    updateGamestate((state) => {
      const updateNodeData = worldNodeGet(node.x, node.y, state);
      if (updateNodeData) {
        updateNodeData.unclaimTime = 0;
      }
      return state;
    });

    return;
  }

  worldNodeUnclaim(node);
}

export function timerAddUnclaimAction(
  node: WorldLocation,
  atTicks: number,
): void {
  timerActionAdd(
    {
      type: 'UnclaimVillage',
      location: {
        x: node.x,
        y: node.y,
      },
    },
    atTicks,
  );
}

export function timerGetUnclaimActionForLocation(
  location: WorldLocation,
): TimerUnclaimVillage | undefined {
  const timers = timerGetTickActions(location.unclaimTime);
  return timers.find(
    (timer) =>
      timer.type === 'UnclaimVillage' &&
      timer.location.x === location.x &&
      timer.location.y === location.y,
  );
}

export function timerRemoveActionById(id: TimerId, tick: number): void {
  const actions = timerGetTickActions(tick);
  const updatedActions = actions.filter((action) => action.id !== id);

  updateGamestate((state) => {
    if (updatedActions.length === 0) {
      delete state.actionClock.timers[tick];
    } else {
      state.actionClock.timers[tick] = updatedActions;
    }

    return state;
  });
}

/*
export function getTimerUnclaimForLocation(location: WorldLocation): TimerUnclaimVillage | undefined {
  const tickPosition =
  const timers = timerGetTickActions(timerTicksElapsed());
  return timers.find((timer) => timer.type === 'UnclaimVillage' && timer.location === location);
}
*/
