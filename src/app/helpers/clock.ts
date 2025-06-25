import { gamestate } from './state-game';

export function getTickTimer(expiresInTicks: number): number {
  return gamestate().actionClock.numTicks + expiresInTicks;
}

export function isExpired(timer: number): boolean {
  return gamestate().actionClock.numTicks >= timer;
}
