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

    followHeroesOnMap: true,
    switchToBiggestTreeOnHeroChange: true,
    glanceResourceView: 'left',

    uiTheme: 'dark',

    sfxPlay: true,
    sfxVolume: 0.3,

    bgmPlay: true,
    bgmVolume: 0.1,

    gameloopPaused: false,
    canSendNotifications: true,
    enabledNotificationCategories: ['Festival'],
    combatTab: 'Preferences',
    optionsTab: 'UI',
    townTab: 'Market',
    worldTab: 'ResourceGeneration',
    inventoryFilter: 'accessory',
    selectedHeroIndex: 0,
    selectedTalentTreeElement: 'Fire',
    empireSelectedLocationTypes: [
      'castle',
      'cave',
      'dungeon',
      'town',
      'village',
    ],
    empireSelectedOwnershipTypes: ['Permanent', 'Temporary'],
  };
}

const _options = localStorageSignal<GameOptions>('options', defaultOptions());
export const options: Signal<GameOptions> = _options.asReadonly();

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
