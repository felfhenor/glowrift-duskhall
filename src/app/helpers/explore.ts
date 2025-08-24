import { signal } from '@angular/core';
import { combatHasGuardiansAlive } from '@helpers/combat-end';
import { gamestate } from '@helpers/state-game';
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
