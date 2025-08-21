import { rngUuid } from '@helpers/rng';
import { gamestate, updateGamestate } from '@helpers/state-game';
import { merchantGenerateItems } from '@helpers/town-merchant';
import { locationGet, locationUnclaim } from '@helpers/world-location';
import type {
  FestivalId,
  Timer,
  TimerAction,
  TimerData,
  TimerEndFestival,
  TimerId,
  TimerMerchantRefresh,
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

export function migrateCleanupOldTimerEntries(): void {
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

export function timerLastSaveTick(): number {
  return gamestate().meta.lastSaveTick;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actions: Record<TimerAction, (action: any) => void> = {
    UNKNOWN: () => {},
    UnclaimVillage: timerUnclaimVillage,
    EndFestival: timerEndFestival,
    MerchantRefresh: timerMerchantRefresh,
  };

  actions[action.type](action);
}

export function timerEndFestival(action: TimerEndFestival): void {
  updateGamestate((state) => {
    delete state.festival.festivals[action.festivalId];
    return state;
  });
}

export function timerMerchantRefresh(action: TimerMerchantRefresh): void {
  merchantGenerateItems();
  timerAddMerchantRefreshAction(timerGetRegisterTick(action.nextTicks ?? 3600));
}

export function timerUnclaimVillage(action: TimerUnclaimVillage): void {
  const node = locationGet(action.location.x, action.location.y);
  if (!node) return;

  if (node.unclaimTime === -1) {
    updateGamestate((state) => {
      const updateNodeData = locationGet(node.x, node.y, state);
      if (updateNodeData) {
        updateNodeData.unclaimTime = 0;
      }
      return state;
    });

    return;
  }

  locationUnclaim(node);
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

export function timerAddFestivalEndAction(
  festivalId: FestivalId,
  atTicks: number,
): void {
  timerActionAdd(
    {
      type: 'EndFestival',
      festivalId,
    },
    atTicks,
  );
}

export function timerAddMerchantRefreshAction(atTicks: number): void {
  timerActionAdd(
    {
      type: 'MerchantRefresh',
      nextTicks: 3600,
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
      (timer as TimerUnclaimVillage).location.x === location.x &&
      (timer as TimerUnclaimVillage).location.y === location.y,
  ) as TimerUnclaimVillage;
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

export function timerGetMerchantRefreshTicksRemaining(): number {
  const currentTick = timerTicksElapsed();
  const allTimers = gamestate().actionClock.timers;

  // Find the next MerchantRefresh timer
  let nextRefreshTick: number | undefined;

  for (const [tickStr, timers] of Object.entries(allTimers)) {
    const tick = parseInt(tickStr, 10);
    if (tick <= currentTick) continue; // Skip past timers

    const hasMerchantRefresh = timers.some(
      (timer) => timer.type === 'MerchantRefresh',
    );
    if (hasMerchantRefresh) {
      if (nextRefreshTick === undefined || tick < nextRefreshTick) {
        nextRefreshTick = tick;
      }
    }
  }

  if (nextRefreshTick === undefined) {
    return 0; // No refresh timer found, return 0
  }

  return Math.max(0, nextRefreshTick - currentTick);
}
