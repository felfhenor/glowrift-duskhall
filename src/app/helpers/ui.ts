import { computed, signal } from '@angular/core';
import type { WorldLocation } from '@interfaces';

export const windowWidth = signal<number>(-1);
export const windowHeight = signal<number>(-1);

export const windowWidthTiles = computed(() => Math.floor(windowWidth() / 64));
export const windowHeightTiles = computed(() =>
  Math.floor(windowHeight() / 64),
);

export const globalStatusText = signal<string>('');

export const showCurrencyList = signal<boolean>(false);
export const showLocationMenu = signal<WorldLocation | undefined>(undefined);
export const showOptionsMenu = signal<boolean>(false);
export const showInventoryMenu = signal<boolean>(false);
export const showHeroesMenu = signal<boolean>(false);
export const showCombatMenu = signal<boolean>(false);
export const showTownMenu = signal<boolean>(false);

export const isCatchingUp = signal<boolean>(false);

export const contextMenuCoordinates = signal<
  { x: number; y: number } | undefined
>(undefined);

export function isPageVisible(): boolean {
  return !document.hidden;
}

export function closeAllMenus() {
  showCurrencyList.set(false);
  showHeroesMenu.set(false);
  showCombatMenu.set(false);
  showOptionsMenu.set(false);
  showInventoryMenu.set(false);
  showTownMenu.set(false);
  showLocationMenu.set(undefined);
}
