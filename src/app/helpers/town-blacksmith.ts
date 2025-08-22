import { getEntry } from '@helpers/content';
import {
  currencyHasAmount,
  currencyHasMultipleAmounts,
  currencyLose,
  currencyLoseMultiple,
} from '@helpers/currency';
import {
  defaultAffinities,
  defaultCurrencyBlock,
  defaultStats,
} from '@helpers/defaults';
import { droppableGetBaseId } from '@helpers/droppable';
import { itemInventoryRemove } from '@helpers/inventory-equipment';
import {
  itemEnchantLevel,
  itemTalents,
  itemUpdateInState,
} from '@helpers/item';
import { rngChoiceRarity, rngSeeded } from '@helpers/rng';
import {
  symmetryCanIncreaseCount,
  symmetryIncreaseCount,
  symmetryItemsMatchingItem,
  symmetryLevel,
} from '@helpers/symmetry';
import { townBuildingLevel } from '@helpers/town';
import {
  traitAddToEquipment,
  traitMaxForEquipment,
} from '@helpers/trait-equipment';
import type { EquipmentItem } from '@interfaces/content-equipment';
import type { TalentContent } from '@interfaces/content-talent';
import type { TraitEquipmentContent } from '@interfaces/content-trait-equipment';
import type { DropRarity } from '@interfaces/droppable';
import type { GameElement } from '@interfaces/element';
import type { GameStat } from '@interfaces/stat';
import type { BlacksmithEnchant } from '@interfaces/town';
import { sumBy } from 'es-toolkit/compat';

export function blacksmithMaxEnchantLevel(): number {
  return townBuildingLevel('Blacksmith');
}

export function blacksmithRerollItemTraitCost(item: EquipmentItem): number {
  if (item.traitIds.length === 0) return 1000;

  const costs: Record<DropRarity, number> = {
    Common: 500,
    Uncommon: 1500,
    Rare: 3500,
    Mystical: 7500,
    Legendary: 10000,
    Unique: 250000,
  };

  return sumBy(
    item.traitIds,
    (t) => costs[getEntry<TraitEquipmentContent>(t)!.rarity] ?? 500,
  );
}

export function blacksmithRerollItemTrait(item: EquipmentItem): void {
  const cost = blacksmithRerollItemTraitCost(item);
  if (!currencyHasAmount('Mana', cost)) return;

  currencyLose('Mana', cost);

  item.mods ??= {};
  item.mods.traitIds = [];
  const traitsToAdd = traitMaxForEquipment(item);
  for (let i = 0; i < traitsToAdd; i++) {
    traitAddToEquipment(item);
  }

  itemUpdateInState(item);
}

export function blacksmithCanEnchantItem(item: EquipmentItem): boolean {
  return itemEnchantLevel(item) < blacksmithMaxEnchantLevel();
}

export function blacksmithNextItemEnchants(
  item: EquipmentItem,
): BlacksmithEnchant[] {
  const level = itemEnchantLevel(item);

  const adjustByLevel = (num: number) => (level + 1) * num;

  const validPaths: BlacksmithEnchant[] = [
    {
      description: `+5 Health`,
      rarity: 'Common',
      cost: {
        ...defaultCurrencyBlock(),
        Mana: adjustByLevel(300),
        'Earth Sliver': adjustByLevel(100),
      },
      statBoosts: {
        ...defaultStats(),
        Health: 5,
      },
    },
    {
      description: `+0.1 Force`,
      rarity: 'Common',
      cost: {
        ...defaultCurrencyBlock(),
        Mana: adjustByLevel(500),
        'Fire Sliver': adjustByLevel(100),
      },
      statBoosts: {
        ...defaultStats(),
        Force: 0.1,
      },
    },
    {
      description: `+0.1 Aura`,
      rarity: 'Common',
      cost: {
        ...defaultCurrencyBlock(),
        Mana: adjustByLevel(500),
        'Water Sliver': adjustByLevel(100),
      },
      statBoosts: {
        ...defaultStats(),
        Aura: 0.1,
      },
    },
    {
      description: `+0.1 Speed`,
      rarity: 'Uncommon',
      cost: {
        ...defaultCurrencyBlock(),
        Mana: adjustByLevel(1000),
        'Air Sliver': adjustByLevel(100),
      },
      statBoosts: {
        ...defaultStats(),
        Speed: 0.1,
      },
    },
    {
      description: `+0.1 Speed/Force/Aura`,
      rarity: 'Rare',
      cost: {
        ...defaultCurrencyBlock(),
        Mana: adjustByLevel(1500),
        'Air Sliver': adjustByLevel(200),
        'Fire Sliver': adjustByLevel(200),
        'Water Sliver': adjustByLevel(200),
      },
      statBoosts: {
        ...defaultStats(),
        Force: 0.1,
        Aura: 0.1,
        Speed: 0.1,
      },
    },
    {
      description: `+1% Fire`,
      rarity: 'Uncommon',
      cost: {
        ...defaultCurrencyBlock(),
        Mana: adjustByLevel(100),
        'Fire Shard': adjustByLevel(50),
      },
      elementBoosts: {
        ...defaultAffinities(),
        Fire: 0.01,
      },
    },
    {
      description: `+1% Water`,
      rarity: 'Uncommon',
      cost: {
        ...defaultCurrencyBlock(),
        Mana: adjustByLevel(100),
        'Water Shard': adjustByLevel(50),
      },
      elementBoosts: {
        ...defaultAffinities(),
        Water: 0.01,
      },
    },
    {
      description: `+1% Air`,
      rarity: 'Uncommon',
      cost: {
        ...defaultCurrencyBlock(),
        Mana: adjustByLevel(100),
        'Air Shard': adjustByLevel(50),
      },
      elementBoosts: {
        ...defaultAffinities(),
        Air: 0.01,
      },
    },
    {
      description: `+1% Earth`,
      rarity: 'Uncommon',
      cost: {
        ...defaultCurrencyBlock(),
        Mana: adjustByLevel(100),
        'Earth Shard': adjustByLevel(50),
      },
      elementBoosts: {
        ...defaultAffinities(),
        Earth: 0.01,
      },
    },
    {
      description: `+1% All Elements`,
      rarity: 'Rare',
      cost: {
        ...defaultCurrencyBlock(),
        Mana: adjustByLevel(1500),
        'Air Crystal': adjustByLevel(1),
        'Fire Crystal': adjustByLevel(1),
        'Water Crystal': adjustByLevel(1),
        'Earth Crystal': adjustByLevel(1),
      },
      elementBoosts: {
        ...defaultAffinities(),
        Earth: 0.01,
        Fire: 0.01,
        Water: 0.01,
        Air: 0.01,
      },
    },
  ];

  const itemTalentlist = itemTalents(item);
  if (itemTalentlist.length > 0) {
    itemTalentlist.forEach((talent) => {
      const talentData = getEntry<TalentContent>(talent.talentId);
      if (!talentData) return;

      validPaths.push({
        description: `+1 ${talentData.name}`,
        rarity: 'Rare',
        cost: {
          ...defaultCurrencyBlock(),
          'Soul Essence': adjustByLevel(300),
        },
        talentBoosts: [talentData.id],
      });
    });
  }

  validPaths.forEach((path) => {
    path.cost[`${item.rarity} Dust`] += 1;
  });

  const filteredPaths = validPaths.filter((path) =>
    item.unableToUpgrade.every((k) => !path[k]),
  );

  const seed = `${droppableGetBaseId(item)}-${level}`;
  const rng = rngSeeded(seed);

  return [
    rngChoiceRarity(filteredPaths, rng)!,
    rngChoiceRarity(filteredPaths, rng)!,
    rngChoiceRarity(filteredPaths, rng)!,
  ];
}

export function blacksmithEnchantItem(
  item: EquipmentItem,
  enchant: BlacksmithEnchant,
): void {
  if (!currencyHasMultipleAmounts(enchant.cost)) return;

  currencyLoseMultiple(enchant.cost);

  item.mods ??= {};
  item.mods.enchantLevel ??= 0;
  item.mods.baseStats ??= defaultStats();
  item.mods.elementMultipliers ??= [];
  item.mods.talentBoosts ??= [];

  item.mods.enchantLevel += 1;

  const elementBoosts = enchant.elementBoosts;
  if (elementBoosts) {
    Object.keys(elementBoosts).forEach((el) => {
      const multBoost = elementBoosts[el as GameElement] ?? 0;

      const elMod = item.mods!.elementMultipliers!.find(
        (eqEl) => eqEl.element === el,
      );
      if (elMod) {
        elMod.multiplier += multBoost;
        return;
      }

      item.mods!.elementMultipliers!.push({
        element: el as GameElement,
        multiplier: multBoost,
      });
    });
  }

  const statBoosts = enchant.statBoosts;
  if (statBoosts) {
    Object.keys(statBoosts).forEach((stat) => {
      const statBoost = statBoosts[stat as GameStat];
      item.mods!.baseStats![stat as GameStat] += statBoost;
    });
  }

  const talentBoosts = enchant.talentBoosts;
  if (talentBoosts) {
    talentBoosts.forEach((tal) => {
      const talMod = item.mods!.talentBoosts!.find(
        (eqEl) => eqEl.talentId === tal,
      );
      if (talMod) {
        talMod.value += 1;
        return;
      }

      item.mods!.talentBoosts!.push({ talentId: tal, value: 1 });
    });
  }

  itemUpdateInState(item);
}

export function blacksmithIncreaseSymmetry(item: EquipmentItem): void {
  if (!symmetryCanIncreaseCount(item)) return;

  const matching = symmetryItemsMatchingItem(item);
  if (matching.length === 0) return;

  itemInventoryRemove([matching[0]]);

  const oldSymmetryLevel = symmetryLevel(item);
  symmetryIncreaseCount(item, 1 + (matching[0].mods?.symmetryCount ?? 0));
  const newSymmetryLevel = symmetryLevel(item);

  if (oldSymmetryLevel < 3 && newSymmetryLevel >= 3) {
    traitAddToEquipment(item);
  }

  if (oldSymmetryLevel < 5 && newSymmetryLevel >= 5) {
    traitAddToEquipment(item);
  }

  itemUpdateInState(item);
}
