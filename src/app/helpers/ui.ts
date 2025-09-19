import { computed, signal } from '@angular/core';
import type { WorldPosition } from '@interfaces';

export const windowWidth = signal<number>(-1);
export const windowHeight = signal<number>(-1);

export const windowWidthTiles = computed(() => Math.floor(windowWidth() / 64));
export const windowHeightTiles = computed(() =>
  Math.floor(windowHeight() / 64),
);

export const globalStatusText = signal<string>('');

export const showLocationMenu = signal<WorldPosition | undefined>(undefined);
export const showHelpMenu = signal<boolean>(false);
export const showOptionsMenu = signal<boolean>(false);
export const showInventoryMenu = signal<boolean>(false);
export const showHeroesMenu = signal<boolean>(false);
export const showCombatMenu = signal<boolean>(false);
export const showTownMenu = signal<boolean>(false);
export const showWorldMenu = signal<boolean>(false);
export const showAnySubmenu = signal<boolean>(false);

export const showDuskmoteShop = signal<boolean>(false);

export const isShowingAnyMenu = computed(
  () =>
    showDuskmoteShop() ||
    showHelpMenu() ||
    showLocationMenu() ||
    showOptionsMenu() ||
    showInventoryMenu() ||
    showHeroesMenu() ||
    showCombatMenu() ||
    showTownMenu() ||
    showWorldMenu(),
);

export const isLoadingGamePage = signal<boolean>(true);

export const isCatchingUp = signal<boolean>(false);

export function isPageVisible(): boolean {
  return !document.hidden;
}

export function closeAllMenus(smart = false) {
  if (smart && showAnySubmenu()) {
    showAnySubmenu.set(false);
    return;
  }

  showHelpMenu.set(false);
  showHeroesMenu.set(false);
  showCombatMenu.set(false);
  showInventoryMenu.set(false);
  showTownMenu.set(false);
  showWorldMenu.set(false);
  showLocationMenu.set(undefined);
  showAnySubmenu.set(false);
  showOptionsMenu.set(false);
}
