import type { Signal } from '@angular/core';
import type { InventorySlotType } from '@interfaces/equipment';
import type { TownBuilding } from '@interfaces/town';

export type GameOption =
  | 'showDebug'
  | 'debugConsoleLogStateUpdates'
  | 'debugMapNodePositions'
  | 'debugGameloopTimerUpdates'
  | 'debugAllowBackgroundOperations'
  | 'audioPlay';

export type NotificationCategory =
  | 'Error'
  | 'Success'
  | 'Travel'
  | 'LocationClaim'
  | 'Festival';

export type ToggleableCategory = Exclude<
  NotificationCategory,
  'Error' | 'Success'
>;

export type TownTab = TownBuilding | 'Festivals';
export type CombatTab = 'Preferences' | 'CombatLog' | 'Claims';
export type OptionsTab = 'UI' | 'Savefile' | 'Debug';

export interface CombatTabLink {
  name: 'Preferences' | 'Combat Log' | 'Claims';
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
  gameloopPaused: boolean;
  canSendNotifications: boolean;
  enabledNotificationCategories: ToggleableCategory[];
  combatTab: CombatTab;
  optionsTab: OptionsTab;
  townTab: TownTab;
  inventoryFilter: InventorySlotType;
};
