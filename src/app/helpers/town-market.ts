import { getBuildingLevel } from '@helpers/town';

export function townMarketBonus(): number {
  return getBuildingLevel('Market') * 0.05;
}
