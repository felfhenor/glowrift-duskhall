import { LoggerTimer } from 'logger-timer';

import { computed } from '@angular/core';
import { gameloopAutoTravel } from '@helpers/gameloop-autotravel';
import { gameloopCurrency } from '@helpers/gameloop-currency';
import { gameloopExplore } from '@helpers/gameloop-explore';
import { gameloopFestival } from '@helpers/gameloop-festival';
import { gameloopTimers } from '@helpers/gameloop-timers';
import { gameloopTown } from '@helpers/gameloop-town';
import { gameloopTravel } from '@helpers/gameloop-travel';
import { debug } from '@helpers/logging';
import { schedulerYield } from '@helpers/scheduler';
import { isSetup } from '@helpers/setup';
import {
  gamestateTickEnd,
  gamestateTickStart,
  isGameStateReady,
  saveGameState,
  updateGamestate,
} from '@helpers/state-game';
import { getOption, setOption } from '@helpers/state-options';
import { timerLastSaveTick, timerTicksElapsed } from '@helpers/timer';
import { victoryClaim, victoryHasWonForFirstTime } from '@helpers/victory';
import { locationAreAllClaimed } from '@helpers/world-location';
import { clamp } from 'es-toolkit/compat';

export const isGameloopPaused = computed(() => getOption('gameloopPaused'));

export function gameloopShouldRun(): boolean {
  return window.location.toString().includes('/game');
}

export async function gameloop(totalTicks: number): Promise<void> {
  if (!isSetup()) return;
  if (!isGameStateReady()) return;
  if (!gameloopShouldRun()) return;
  if (isGameloopPaused()) return;

  if (locationAreAllClaimed() && !victoryHasWonForFirstTime()) {
    victoryClaim();
    setOption('gameloopPaused', true);
    return;
  }

  gamestateTickStart();

  const ticksToCalculate = totalTicks * getOption('debugTickMultiplier');
  const numTicks = clamp(ticksToCalculate, 1, 3600);

  const timer = new LoggerTimer({
    dumpThreshold: 100,
    isActive: getOption('debugGameloopTimerUpdates'),
  });

  timer.startTimer('gameloop');

  timer.startTimer('gameloop-currency');
  gameloopCurrency(numTicks);
  timer.stopTimer('gameloop-currency');

  timer.startTimer('gameloop-festival');
  gameloopFestival(numTicks);
  timer.stopTimer('gameloop-festival');

  timer.startTimer('gameloop-timers');
  gameloopTimers(numTicks);
  timer.stopTimer('gameloop-timers');

  for (let i = 0; i < numTicks; i++) {
    timer.startTimer(`gameloop-autotravel-${i}`);
    gameloopAutoTravel();
    timer.stopTimer(`gameloop-autotravel-${i}`);

    timer.startTimer(`gameloop-town-${i}`);
    gameloopTown();
    timer.stopTimer(`gameloop-town-${i}`);

    timer.startTimer(`gameloop-travel-${i}`);
    gameloopTravel();
    timer.stopTimer(`gameloop-travel-${i}`);

    timer.startTimer(`gameloop-explore-${i}`);
    gameloopExplore();
    timer.stopTimer(`gameloop-explore-${i}`);
  }

  timer.dumpTimers((timers) => debug('Gameloop:Timers', timers));

  updateGamestate((state) => {
    state.actionClock.numTicks += numTicks;
    return state;
  });

  gamestateTickEnd();

  const currentTick = timerTicksElapsed();
  const nextSaveTick = timerLastSaveTick() + getOption('debugSaveInterval');
  if (currentTick >= nextSaveTick) {
    updateGamestate((state) => {
      state.meta.lastSaveTick = currentTick;
      return state;
    });

    await schedulerYield();
    saveGameState();
    debug('Gameloop:Save', `Saving @ tick ${currentTick}`);
  }
}
