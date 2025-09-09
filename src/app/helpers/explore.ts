import { signal } from '@angular/core';
import { combatHasGuardiansAlive } from '@helpers/combat-end';
import { gamestate, updateGamestate } from '@helpers/state-game';
import { setOption } from '@helpers/state-options';
import { globalStatusText } from '@helpers/ui';
import { locationGetCurrent } from '@helpers/world-location';

export const exploreProgressText = signal<string>('');
export const exploreProgressPercent = signal<number>(0);

export function isExploring() {
  const currentPosition = locationGetCurrent();
  if (!currentPosition) return false;

  return combatHasGuardiansAlive() || gamestate().hero.exploreTicks > 0;
}

export function exploringUpdateGlobalStatusText(status: string): void {
  exploreProgressText.set(status);
  globalStatusText.set(status);
}

export function exploreAddFailureToCapture() {
  const nextFailure = gamestate().hero.failuresSinceLastSuccess + 1;

  updateGamestate((state) => {
    state.hero.failuresSinceLastSuccess = nextFailure;
    return state;
  });

  if ([1, 5, 10, 25, 50, 100].includes(nextFailure)) {
    setOption('showHeroFailureIndicator', true);
  }
}

export function exploreClearFailures() {
  updateGamestate((state) => {
    state.hero.failuresSinceLastSuccess = 0;
    return state;
  });
}
