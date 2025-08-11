import { townBuildingLevel } from '@helpers/town';

export function marketCurrencyBonus(): number {
  return townBuildingLevel('Market') * 0.01;
}
