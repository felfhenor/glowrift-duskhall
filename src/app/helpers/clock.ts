import { gamestate } from '@helpers/state-game';

export function clockGetTickTimer(expiresInTicks: number): number {
  return gamestate().actionClock.numTicks + expiresInTicks;
}

export function clockIsTimerExpired(timer: number): boolean {
  return gamestate().actionClock.numTicks >= timer;
}
