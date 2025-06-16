import { TownBuilding } from '../interfaces';
import { gamestate } from './state-game';

export function getBuildingLevel(building: TownBuilding): number {
  return gamestate().town.buildingLevels[building] ?? 1;
}
