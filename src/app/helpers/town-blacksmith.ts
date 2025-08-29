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
import type { GameCurrency } from '@interfaces/content-currency';
import type { EquipmentItem } from '@interfaces/content-equipment';
import type { TalentContent } from '@interfaces/content-talent';
import type { TraitEquipmentContent } from '@interfaces/content-trait-equipment';
import { RARITY_PRIORITY, type DropRarity } from '@interfaces/droppable';
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
      description: `+10 Health`,
      rarity: 'Common',
      cost: {
        ...defaultCurrencyBlock(),
        Mana: adjustByLevel(300),
        'Earth Sliver': adjustByLevel(300),
      },
      statBoosts: {
        ...defaultStats(),
        Health: 10,
      },
    },
    {
      description: `+25 Health`,
      rarity: 'Rare',
      cost: {
        ...defaultCurrencyBlock(),
        Mana: adjustByLevel(1000),
        'Earth Sliver': adjustByLevel(500),
        'Earth Shard': adjustByLevel(100),
      },
      statBoosts: {
        ...defaultStats(),
        Health: 25,
      },
    },
    {
      description: `+50 Health`,
      rarity: 'Mystical',
      cost: {
        ...defaultCurrencyBlock(),
        Mana: adjustByLevel(2500),
        'Earth Sliver': adjustByLevel(500),
        'Earth Shard': adjustByLevel(100),
        'Earth Crystal': adjustByLevel(25),
      },
      statBoosts: {
        ...defaultStats(),
        Health: 50,
      },
    },
    {
      description: `+0.5 Force`,
      rarity: 'Common',
      cost: {
        ...defaultCurrencyBlock(),
        Mana: adjustByLevel(500),
        'Fire Sliver': adjustByLevel(300),
      },
      statBoosts: {
        ...defaultStats(),
        Force: 0.5,
      },
    },
    {
      description: `+0.5 Aura`,
      rarity: 'Common',
      cost: {
        ...defaultCurrencyBlock(),
        Mana: adjustByLevel(500),
        'Water Sliver': adjustByLevel(300),
      },
      statBoosts: {
        ...defaultStats(),
        Aura: 0.5,
      },
    },
    {
      description: `+0.5 Speed`,
      rarity: 'Uncommon',
      cost: {
        ...defaultCurrencyBlock(),
        Mana: adjustByLevel(1000),
        'Air Sliver': adjustByLevel(300),
      },
      statBoosts: {
        ...defaultStats(),
        Speed: 0.5,
      },
    },
    {
      description: `+0.4 Force/Aura`,
      rarity: 'Uncommon',
      cost: {
        ...defaultCurrencyBlock(),
        Mana: adjustByLevel(500),
        'Fire Sliver': adjustByLevel(500),
        'Water Sliver': adjustByLevel(500),
      },
      statBoosts: {
        ...defaultStats(),
        Force: 0.4,
        Aura: 0.4,
      },
    },
    {
      description: `+0.4 Force/Speed`,
      rarity: 'Uncommon',
      cost: {
        ...defaultCurrencyBlock(),
        Mana: adjustByLevel(500),
        'Fire Sliver': adjustByLevel(500),
        'Air Sliver': adjustByLevel(500),
      },
      statBoosts: {
        ...defaultStats(),
        Force: 0.4,
        Speed: 0.4,
      },
    },
    {
      description: `+0.4 Aura/Speed`,
      rarity: 'Uncommon',
      cost: {
        ...defaultCurrencyBlock(),
        Mana: adjustByLevel(500),
        'Water Sliver': adjustByLevel(500),
        'Air Sliver': adjustByLevel(500),
      },
      statBoosts: {
        ...defaultStats(),
        Speed: 0.4,
        Aura: 0.4,
      },
    },
    {
      description: `+0.3 Speed/Force/Aura`,
      rarity: 'Rare',
      cost: {
        ...defaultCurrencyBlock(),
        Mana: adjustByLevel(1500),
        'Air Sliver': adjustByLevel(500),
        'Fire Sliver': adjustByLevel(500),
        'Water Sliver': adjustByLevel(500),
      },
      statBoosts: {
        ...defaultStats(),
        Force: 0.3,
        Aura: 0.3,
        Speed: 0.3,
      },
    },
    {
      description: `+3% Fire`,
      rarity: 'Uncommon',
      cost: {
        ...defaultCurrencyBlock(),
        Mana: adjustByLevel(250),
        'Fire Shard': adjustByLevel(100),
      },
      elementBoosts: {
        ...defaultAffinities(),
        Fire: 0.03,
      },
    },
    {
      description: `+3% Water`,
      rarity: 'Uncommon',
      cost: {
        ...defaultCurrencyBlock(),
        Mana: adjustByLevel(250),
        'Water Shard': adjustByLevel(100),
      },
      elementBoosts: {
        ...defaultAffinities(),
        Water: 0.03,
      },
    },
    {
      description: `+3% Air`,
      rarity: 'Uncommon',
      cost: {
        ...defaultCurrencyBlock(),
        Mana: adjustByLevel(250),
        'Air Shard': adjustByLevel(100),
      },
      elementBoosts: {
        ...defaultAffinities(),
        Air: 0.03,
      },
    },
    {
      description: `+3% Earth`,
      rarity: 'Uncommon',
      cost: {
        ...defaultCurrencyBlock(),
        Mana: adjustByLevel(250),
        'Earth Shard': adjustByLevel(100),
      },
      elementBoosts: {
        ...defaultAffinities(),
        Earth: 0.03,
      },
    },
    {
      description: `+2% Fire/Water`,
      rarity: 'Rare',
      cost: {
        ...defaultCurrencyBlock(),
        Mana: adjustByLevel(250),
        'Fire Shard': adjustByLevel(100),
        'Fire Crystal': adjustByLevel(3),
        'Water Shard': adjustByLevel(100),
        'Water Crystal': adjustByLevel(3),
      },
      elementBoosts: {
        ...defaultAffinities(),
        Fire: 0.02,
        Water: 0.02,
      },
    },
    {
      description: `+2% Fire/Air`,
      rarity: 'Rare',
      cost: {
        ...defaultCurrencyBlock(),
        Mana: adjustByLevel(250),
        'Fire Shard': adjustByLevel(100),
        'Fire Crystal': adjustByLevel(3),
        'Air Shard': adjustByLevel(100),
        'Air Crystal': adjustByLevel(3),
      },
      elementBoosts: {
        ...defaultAffinities(),
        Fire: 0.02,
        Air: 0.02,
      },
    },
    {
      description: `+2% Fire/Earth`,
      rarity: 'Rare',
      cost: {
        ...defaultCurrencyBlock(),
        Mana: adjustByLevel(250),
        'Fire Shard': adjustByLevel(100),
        'Fire Crystal': adjustByLevel(3),
        'Earth Shard': adjustByLevel(100),
        'Earth Crystal': adjustByLevel(3),
      },
      elementBoosts: {
        ...defaultAffinities(),
        Fire: 0.02,
        Earth: 0.02,
      },
    },
    {
      description: `+2% Air/Earth`,
      rarity: 'Rare',
      cost: {
        ...defaultCurrencyBlock(),
        Mana: adjustByLevel(250),
        'Air Shard': adjustByLevel(100),
        'Air Crystal': adjustByLevel(3),
        'Earth Shard': adjustByLevel(100),
        'Earth Crystal': adjustByLevel(3),
      },
      elementBoosts: {
        ...defaultAffinities(),
        Air: 0.02,
        Earth: 0.02,
      },
    },
    {
      description: `+2% Air/Water`,
      rarity: 'Rare',
      cost: {
        ...defaultCurrencyBlock(),
        Mana: adjustByLevel(250),
        'Air Shard': adjustByLevel(100),
        'Air Crystal': adjustByLevel(3),
        'Water Shard': adjustByLevel(100),
        'Water Crystal': adjustByLevel(3),
      },
      elementBoosts: {
        ...defaultAffinities(),
        Air: 0.02,
        Water: 0.02,
      },
    },
    {
      description: `+2% Earth/Water`,
      rarity: 'Rare',
      cost: {
        ...defaultCurrencyBlock(),
        Mana: adjustByLevel(250),
        'Earth Shard': adjustByLevel(100),
        'Earth Crystal': adjustByLevel(3),
        'Water Shard': adjustByLevel(100),
        'Water Crystal': adjustByLevel(3),
      },
      elementBoosts: {
        ...defaultAffinities(),
        Earth: 0.02,
        Water: 0.02,
      },
    },
    {
      description: `+1% Earth/Fire/Water/Air`,
      rarity: 'Mystical',
      cost: {
        ...defaultCurrencyBlock(),
        Mana: adjustByLevel(1500),
        'Air Crystal': adjustByLevel(5),
        'Fire Crystal': adjustByLevel(5),
        'Water Crystal': adjustByLevel(5),
        'Earth Crystal': adjustByLevel(5),
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
        rarity: 'Mystical',
        cost: {
          ...defaultCurrencyBlock(),
          'Soul Essence': adjustByLevel(500),
        },
        talentBoosts: [talentData.id],
      });
    });
  }

  validPaths.forEach((path) => {
    Object.keys(path.cost).forEach((currency) => {
      path.cost[currency as GameCurrency] *= RARITY_PRIORITY[item.rarity];
    });
  });

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
