import { signal } from '@angular/core';
import { combatHasGuardiansAlive } from '@helpers/combat-end';
import { globalStatusText } from '@helpers/ui';
import { worldNodeGetCurrent } from '@helpers/world';

export const exploreProgressText = signal<string>('');
export const exploreProgressPercent = signal<number>(0);

export function isExploring() {
  const currentPosition = worldNodeGetCurrent();
  if (!currentPosition) return false;
  return combatHasGuardiansAlive();
}

export function exploringUpdateGlobalStatusText(status: string): void {
  exploreProgressText.set(status);
  globalStatusText.set(status);
}
