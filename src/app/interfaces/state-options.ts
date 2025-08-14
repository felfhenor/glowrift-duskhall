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
  | 'canSendNotifications';

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

export type WorldTab = 'Festivals' | 'Claims' | 'ResourceGeneration';
export type TownTab = TownBuilding;
export type CombatTab = 'Preferences' | 'CombatLog';
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
  debugTickMultiplier: number;
  enabledNotificationCategories: ToggleableCategory[];
  combatTab: CombatTab;
  optionsTab: OptionsTab;
  townTab: TownTab;
  worldTab: WorldTab;
  inventoryFilter: InventorySlotType;
  selectedHeroIndex: number;
  selectedTalentTreeElement: GameElement;
};
