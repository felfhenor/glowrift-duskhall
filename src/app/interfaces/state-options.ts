import type { Signal } from '@angular/core';
import type { InventorySlotType } from '@interfaces/content-equipment';
import type { GameElement } from '@interfaces/element';
import type { TownBuilding } from '@interfaces/town';

export type GameOption =
  | 'showDebug'
  | 'debugConsoleLogStateUpdates'
  | 'debugMapNodePositions'
  | 'debugGameloopTimerUpdates'
  | 'debugAllowBackgroundOperations'
  | 'debugDisableFogOfWar'
  | 'audioPlay'
  | 'gameloopPaused'
  | 'canSendNotifications'
  | 'followHeroesOnMap';

export type NotificationCategory = 'Error' | 'Success' | 'Festival';

export type ToggleableCategory = Exclude<
  NotificationCategory,
  'Error' | 'Success'
>;

export type WorldTab =
  | 'Festivals'
  | 'Claims'
  | 'ClaimsLog'
  | 'ResourceGeneration';
export type TownTab = TownBuilding;
export type CombatTab = 'Preferences' | 'CombatLog';
export type OptionsTab = 'UI' | 'Savefile' | 'Debug';

export interface CombatTabLink {
  name: 'Exploration Preferences' | 'Combat Log' | 'Claims';
  link: CombatTab;
}

export interface OptionsTabLink {
  name: 'UI' | 'Savefile' | 'Debug';
  link: OptionsTab;
  showIf: Signal<boolean>;
}

export type GameOptions = Record<GameOption, boolean> & {
  uiTheme: string;
  volume: number;
  debugTickMultiplier: number;
  debugSaveInterval: number;
  enabledNotificationCategories: ToggleableCategory[];
  combatTab: CombatTab;
  optionsTab: OptionsTab;
  townTab: TownTab;
  worldTab: WorldTab;
  inventoryFilter: InventorySlotType;
  selectedHeroIndex: number;
  selectedTalentTreeElement: GameElement;
};
