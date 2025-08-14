import type { CurrencyBlock } from '@interfaces/content-currency';
import type { TownUpgradeId } from '@interfaces/content-townupgrade';
import type { LocationType } from '@interfaces/content-worldconfig';
import type { Branded, IsContentItem } from '@interfaces/identifiable';
import type { HasDescription } from '@interfaces/traits';

export type LocationUpgradeId = Branded<string, 'LocationUpgradeId'>;

export type LocationUpgradeContentNumerics = {
  boostedProductionValuePercentPerLevel: number;
  boostedLootLevelPerLevel: number;
  boostedTicksPerLevel: number;
  boostedUnclaimableCount: number;
};

export type LocationUpgradeContent = IsContentItem &
  HasDescription &
  LocationUpgradeContentNumerics & {
    id: LocationUpgradeId;

    requiresTownUpgradeId: TownUpgradeId;
    appliesToTypes: LocationType[];

    costScalePerTile: number;
    baseCost: CurrencyBlock;
  };
