import { LoggerTimer } from 'logger-timer';

import { computed } from '@angular/core';
import { autoTravelGameloop } from '@helpers/gameloop-autotravel';
import { currencyGameloop } from '@helpers/gameloop-currency';
import { exploreGameloop } from '@helpers/gameloop-explore';
import { festivalGameloop } from '@helpers/gameloop-festival';
import { gameloopTimers } from '@helpers/gameloop-timers';
import { townGameloop } from '@helpers/gameloop-town';
import { travelGameloop } from '@helpers/gameloop-travel';
import { debug } from '@helpers/logging';
import { isSetup } from '@helpers/setup';
import { isGameStateReady, updateGamestate } from '@helpers/state-game';
import { getOption } from '@helpers/state-options';

export const isGameloopPaused = computed(() => getOption('gameloopPaused'));

export function canRunGameloop(): boolean {
  return window.location.toString().includes('/game');
}

export function doGameloop(totalTicks: number): void {
  if (!isSetup()) return;
  if (!isGameStateReady()) return;
  if (isGameloopPaused()) return;

  const numTicks = totalTicks * getOption('debugTickMultiplier');

  const timer = new LoggerTimer({
    dumpThreshold: 100,
    isActive: getOption('debugGameloopTimerUpdates'),
  });

  timer.startTimer('gameloop');

  timer.startTimer('gameloop-autotravel');
  autoTravelGameloop();
  timer.stopTimer('gameloop-autotravel');

  timer.startTimer('gameloop-currency');
  currencyGameloop(numTicks);
  timer.stopTimer('gameloop-currency');

  timer.startTimer('gameloop-town');
  townGameloop(numTicks);
  timer.stopTimer('gameloop-town');

  timer.startTimer('gameloop-travel');
  travelGameloop(numTicks);
  timer.stopTimer('gameloop-travel');

  timer.startTimer('gameloop-explore');
  exploreGameloop(numTicks);
  timer.stopTimer('gameloop-explore');

  timer.startTimer('gameloop-festival');
  festivalGameloop(numTicks);
  timer.stopTimer('gameloop-festival');

  timer.startTimer('gameloop-timers');
  gameloopTimers(numTicks);
  timer.stopTimer('gameloop-timers');

  timer.dumpTimers((timers) => debug('Gameloop:Timers', timers));

  updateGamestate((state) => {
    state.actionClock.numTicks += numTicks;
    return state;
  });
}
