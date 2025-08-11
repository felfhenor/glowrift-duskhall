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
import { isSetup } from '@helpers/setup';
import {
  beginGameStateCommits,
  endGameStateCommits,
  isGameStateReady,
  updateGamestate,
} from '@helpers/state-game';
import { getOption, setOption } from '@helpers/state-options';
import { victoryClaim, victoryHasWonForFirstTime } from '@helpers/victory';
import { worldNodeAreAllClaimed } from '@helpers/world';

export const isGameloopPaused = computed(() => getOption('gameloopPaused'));

export function gameloopShouldRun(): boolean {
  return window.location.toString().includes('/game');
}

export function gameloop(totalTicks: number): void {
  if (!isSetup()) return;
  if (!isGameStateReady()) return;
  if (isGameloopPaused()) return;

  if (worldNodeAreAllClaimed() && !victoryHasWonForFirstTime()) {
    victoryClaim();
    setOption('gameloopPaused', true);
    return;
  }

  beginGameStateCommits();

  const numTicks = totalTicks * getOption('debugTickMultiplier');

  const timer = new LoggerTimer({
    dumpThreshold: 100,
    isActive: getOption('debugGameloopTimerUpdates'),
  });

  timer.startTimer('gameloop');

  timer.startTimer('gameloop-autotravel');
  gameloopAutoTravel();
  timer.stopTimer('gameloop-autotravel');

  timer.startTimer('gameloop-currency');
  gameloopCurrency(numTicks);
  timer.stopTimer('gameloop-currency');

  timer.startTimer('gameloop-town');
  gameloopTown(numTicks);
  timer.stopTimer('gameloop-town');

  timer.startTimer('gameloop-travel');
  gameloopTravel(numTicks);
  timer.stopTimer('gameloop-travel');

  timer.startTimer('gameloop-explore');
  gameloopExplore(numTicks);
  timer.stopTimer('gameloop-explore');

  timer.startTimer('gameloop-festival');
  gameloopFestival(numTicks);
  timer.stopTimer('gameloop-festival');

  timer.startTimer('gameloop-timers');
  gameloopTimers(numTicks);
  timer.stopTimer('gameloop-timers');

  timer.dumpTimers((timers) => debug('Gameloop:Timers', timers));

  updateGamestate((state) => {
    state.actionClock.numTicks += numTicks;
    return state;
  });

  endGameStateCommits();
}
