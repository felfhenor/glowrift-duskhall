import { Signal } from "@angular/core";
import { InventorySlotType } from "./equipment";
import { TownBuilding } from "./town";

export type GameOption =
  | 'showDebug'
  | 'debugConsoleLogStateUpdates'
  | 'debugMapNodePositions'
  | 'debugGameloopTimerUpdates'
  | 'audioPlay';

export type NotificationCategory = 'Error' | 'Success' | 'Travel' | 'LocationClaim';
  
export type ToggleableCategory = Exclude<NotificationCategory, 'Error' | 'Success'>;

export type CombatTab = 'preferences' | 'combatlog' | 'claims';
export type OptionsTab = 'ui' | 'savefile' | 'debug';

export interface CombatTabLink {
  name: 'Preferences' | 'Combat Log' | 'Claims';
  link: CombatTab
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
  townTab: TownBuilding;
  inventoryFilter: InventorySlotType;
};
