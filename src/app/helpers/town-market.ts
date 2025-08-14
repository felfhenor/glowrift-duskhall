import { talentTownStatTotalForAllHeroes } from '@helpers/talent';
import { townBuildingLevel } from '@helpers/town';

export function marketCurrencyBonus(): number {
  return Math.min(
    0.5,
    townBuildingLevel('Market') * 0.03 +
      talentTownStatTotalForAllHeroes('marketTradeBonusPercent'),
  );
}
