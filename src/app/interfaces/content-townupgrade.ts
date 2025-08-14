import type { CurrencyBlock } from '@interfaces/content-currency';
import type { Branded, IsContentItem } from '@interfaces/identifiable';
import type { HasDescription } from '@interfaces/traits';

export type TownUpgradeId = Branded<string, 'TownUpgradeId'>;

export type TownUpgradeContent = IsContentItem &
  HasDescription & {
    id: TownUpgradeId;

    description: string;
    cost: CurrencyBlock;
    levelRequirement: number;
  };
