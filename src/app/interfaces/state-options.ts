import type { Signal } from '@angular/core';
import type { InventorySlotType } from '@interfaces/content-equipment';
import type { EquipmentSkillAttribute } from '@interfaces/content-skill';
import type { TalentTreeId } from '@interfaces/content-talenttree';
import type { LocationType } from '@interfaces/content-worldconfig';
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
  | 'switchToBiggestTreeOnHeroChange'
  | 'showHeroFailureIndicator';

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
export type GlanceClaimView = 'left' | 'right' | 'hidden';
export type GlanceHeroView = 'left' | 'right' | 'middle' | 'hidden';
export type ItemOrganizeSetting =
  | 'default'
  | 'stat-health'
  | 'stat-force'
  | 'stat-aura'
  | 'stat-speed'
  | 'element-earth'
  | 'element-fire'
  | 'element-water'
  | 'element-air';
export type SkillOrganizeSetting =
  | 'default'
  | 'element-earth'
  | 'element-fire'
  | 'element-water'
  | 'element-air'
  | `tech-${EquipmentSkillAttribute}`;

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
  selectedTalentTreeId: TalentTreeId;
  glanceResourceView: GlanceResourceView;
  glanceHeroView: GlanceHeroView;
  glanceClaimView: GlanceClaimView;
  empireSelectedLocationTypes: LocationType[];
  empireSelectedOwnershipTypes: OwnershipType[];
  organizeItems: ItemOrganizeSetting;
  organizeSkills: SkillOrganizeSetting;
};
