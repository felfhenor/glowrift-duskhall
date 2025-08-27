import type { Signal } from '@angular/core';
import type { InventorySlotType } from '@interfaces/content-equipment';
import type { LocationType } from '@interfaces/content-worldconfig';
import type { GameElement } from '@interfaces/element';
import type { TownBuilding } from '@interfaces/town';

export type GameOption =
  | 'showDebug'
  | 'debugConsoleLogStateUpdates'
  | 'debugMapNodePositions'
  | 'debugGameloopTimerUpdates'
  | 'debugAllowBackgroundOperations'
  | 'debugDisableFogOfWar'
  | 'sfxPlay'
  | 'bgmPlay'
  | 'gameloopPaused'
  | 'canSendNotifications'
  | 'followHeroesOnMap'
  | 'switchToBiggestTreeOnHeroChange';

export type NotificationCategory = 'Error' | 'Success' | 'Festival';

export type ToggleableCategory = Exclude<
  NotificationCategory,
  'Error' | 'Success'
>;

export type WorldTab =
  | 'Festivals'
  | 'Claims'
  | 'ClaimsLog'
  | 'ResourceGeneration'
  | 'EmpireManagement';
export type TownTab = TownBuilding;
export type CombatTab = 'Preferences' | 'CombatLog';
export type OptionsTab = 'UI' | 'Savefile' | 'Debug';
export type OwnershipType = 'Permanent' | 'Temporary';
export type GlanceResourceView = 'left' | 'right' | 'hidden';

export interface OptionsTabLink {
  name: 'UI' | 'Savefile' | 'Debug';
  link: OptionsTab;
  showIf: Signal<boolean>;
}

export type GameOptions = Record<GameOption, boolean> & {
  uiTheme: string;
  sfxVolume: number;
  bgmVolume: number;
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
  glanceResourceView: GlanceResourceView;
  empireSelectedLocationTypes: LocationType[];
  empireSelectedOwnershipTypes: OwnershipType[];
};
