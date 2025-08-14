import { currencyHasMultipleAmounts } from '@helpers/currency';
import { townBuildingLevel, townHasUpgrade } from '@helpers/town';
import type { TownUpgradeContent } from '@interfaces/content-townupgrade';

export function canBuyRallyPointUpgrade(upgrade: TownUpgradeContent): boolean {
  return (
    !townHasUpgrade(upgrade) &&
    currencyHasMultipleAmounts(upgrade.cost) &&
    townBuildingLevel('Rally Point') >= upgrade.levelRequirement
  );
}
