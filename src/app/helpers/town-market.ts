import { getBuildingLevel } from './town';

export function townMarketBonus(): number {
  return getBuildingLevel('Market') * 0.05;
}
