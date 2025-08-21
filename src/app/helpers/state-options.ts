import type { Signal } from '@angular/core';
import { environment } from '@environments/environment.development';
import { localStorageSignal } from '@helpers/signal';
import type { GameOptions } from '@interfaces';

export function defaultOptions(): GameOptions {
  return {
    showDebug: !environment.production,
    debugConsoleLogStateUpdates: false,
    debugGameloopTimerUpdates: false,
    debugMapNodePositions: false,
    debugAllowBackgroundOperations: false,
    debugDisableFogOfWar: false,
    debugTickMultiplier: 1,
    debugSaveInterval: 15,

    audioPlay: true,
    followHeroesOnMap: true,

    uiTheme: 'dark',

    volume: 0.5,
    gameloopPaused: false,
    canSendNotifications: true,
    enabledNotificationCategories: ['Travel', 'LocationClaim'],
    combatTab: 'Preferences',
    optionsTab: 'UI',
    townTab: 'Market',
    worldTab: 'ResourceGeneration',
    inventoryFilter: 'accessory',
    selectedHeroIndex: 0,
    selectedTalentTreeElement: 'Fire',
  };
}

const _options = localStorageSignal<GameOptions>('options', defaultOptions());
export const options: Signal<GameOptions> = _options.asReadonly();

export function toggleDebugOn() {
  setOption('showDebug', true);
}

export function setOptions(options: GameOptions) {
  _options.set(options);
}

export function setOption<T extends keyof GameOptions>(
  option: T,
  value: GameOptions[T],
): void {
  _options.update((state) => ({
    ...state,
    [option]: value,
  }));
}

export function getOption<T extends keyof GameOptions>(
  option: T,
): GameOptions[T] {
  return options()[option];
}
