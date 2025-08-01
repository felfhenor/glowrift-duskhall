import { getEntriesByType, getEntry } from '@helpers/content';
import {
  hasCurrencies,
  hasCurrency,
  loseCurrencies,
  loseCurrency,
} from '@helpers/currency';
import {
  getDefaultAffinities,
  getDefaultCurrencyBlock,
  getDefaultStats,
} from '@helpers/defaults';
import { getDroppableEquippableBaseId } from '@helpers/droppable';
import { getItemEnchantLevel, getItemTalents } from '@helpers/item';
import { randomChoiceByRarity, seededrng } from '@helpers/rng';
import { updateGamestate } from '@helpers/state-game';
import { getBuildingLevel } from '@helpers/town';
import type { EquipmentItem } from '@interfaces/content-equipment';
import type { TalentContent } from '@interfaces/content-talent';
import type { TraitEquipmentContent } from '@interfaces/content-trait-equipment';
import type { DropRarity } from '@interfaces/droppable';
import type { GameElement } from '@interfaces/element';
import type { GameStat } from '@interfaces/stat';
import type { BlacksmithEnchant } from '@interfaces/town';
import { cloneDeep, sumBy } from 'es-toolkit/compat';

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
  if (!hasCurrency('Mana', cost)) return;

  loseCurrency('Mana', cost);

  const allTraits = getEntriesByType<TraitEquipmentContent>('traitequipment');

  updateGamestate((state) => {
    const updateItem = state.inventory.items.find((i) => i.id === item.id);
    if (!updateItem) return state;

    updateItem.mods ??= {};
    updateItem.mods.traitIds = [randomChoiceByRarity(allTraits)!.id];

    return state;
  });
}

export function blacksmithCanEnchantItem(item: EquipmentItem): boolean {
  return getItemEnchantLevel(item) < getBuildingLevel('Blacksmith');
}

export function blacksmithNextItemEnchants(
  item: EquipmentItem,
): BlacksmithEnchant[] {
  const level = getItemEnchantLevel(item);

  const adjustByLevel = (num: number) => (level + 1) * num;

  const validPaths: BlacksmithEnchant[] = [
    {
      description: `+5 Health`,
      rarity: 'Common',
      cost: {
        ...getDefaultCurrencyBlock(),
        Mana: adjustByLevel(300),
        'Earth Sliver': adjustByLevel(100),
      },
      statBoosts: {
        ...getDefaultStats(),
        Health: 5,
      },
    },
    {
      description: `+0.1 Force`,
      rarity: 'Common',
      cost: {
        ...getDefaultCurrencyBlock(),
        Mana: adjustByLevel(500),
        'Fire Sliver': adjustByLevel(100),
      },
      statBoosts: {
        ...getDefaultStats(),
        Force: 0.1,
      },
    },
    {
      description: `+0.1 Aura`,
      rarity: 'Common',
      cost: {
        ...getDefaultCurrencyBlock(),
        Mana: adjustByLevel(500),
        'Water Sliver': adjustByLevel(100),
      },
      statBoosts: {
        ...getDefaultStats(),
        Aura: 0.1,
      },
    },
    {
      description: `+0.1 Speed`,
      rarity: 'Uncommon',
      cost: {
        ...getDefaultCurrencyBlock(),
        Mana: adjustByLevel(1000),
        'Air Sliver': adjustByLevel(100),
      },
      statBoosts: {
        ...getDefaultStats(),
        Speed: 0.1,
      },
    },
    {
      description: `+0.1 Speed/Force/Aura`,
      rarity: 'Rare',
      cost: {
        ...getDefaultCurrencyBlock(),
        Mana: adjustByLevel(1500),
        'Air Sliver': adjustByLevel(200),
        'Fire Sliver': adjustByLevel(200),
        'Water Sliver': adjustByLevel(200),
      },
      statBoosts: {
        ...getDefaultStats(),
        Force: 0.1,
        Aura: 0.1,
        Speed: 0.1,
      },
    },
    {
      description: `+1% Fire`,
      rarity: 'Uncommon',
      cost: {
        ...getDefaultCurrencyBlock(),
        Mana: adjustByLevel(100),
        'Fire Shard': adjustByLevel(50),
      },
      elementBoosts: {
        ...getDefaultAffinities(),
        Fire: 0.01,
      },
    },
    {
      description: `+1% Water`,
      rarity: 'Uncommon',
      cost: {
        ...getDefaultCurrencyBlock(),
        Mana: adjustByLevel(100),
        'Water Shard': adjustByLevel(50),
      },
      elementBoosts: {
        ...getDefaultAffinities(),
        Water: 0.01,
      },
    },
    {
      description: `+1% Air`,
      rarity: 'Uncommon',
      cost: {
        ...getDefaultCurrencyBlock(),
        Mana: adjustByLevel(100),
        'Air Shard': adjustByLevel(50),
      },
      elementBoosts: {
        ...getDefaultAffinities(),
        Air: 0.01,
      },
    },
    {
      description: `+1% Earth`,
      rarity: 'Uncommon',
      cost: {
        ...getDefaultCurrencyBlock(),
        Mana: adjustByLevel(100),
        'Earth Shard': adjustByLevel(50),
      },
      elementBoosts: {
        ...getDefaultAffinities(),
        Earth: 0.01,
      },
    },
    {
      description: `+1% All Elements`,
      rarity: 'Rare',
      cost: {
        ...getDefaultCurrencyBlock(),
        Mana: adjustByLevel(1500),
        'Air Crystal': adjustByLevel(1),
        'Fire Crystal': adjustByLevel(1),
        'Water Crystal': adjustByLevel(1),
        'Earth Crystal': adjustByLevel(1),
      },
      elementBoosts: {
        ...getDefaultAffinities(),
        Earth: 0.01,
        Fire: 0.01,
        Water: 0.01,
        Air: 0.01,
      },
    },
  ];

  const itemTalents = getItemTalents(item);
  if (itemTalents.length > 0) {
    itemTalents.forEach((talent) => {
      const talentData = getEntry<TalentContent>(talent.talentId);
      if (!talentData) return;

      validPaths.push({
        description: `+1 ${talentData.name}`,
        rarity: 'Rare',
        cost: {
          ...getDefaultCurrencyBlock(),
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

  const seed = `${getDroppableEquippableBaseId(item)}-${level}`;
  const rng = seededrng(seed);

  return [
    randomChoiceByRarity(filteredPaths, rng)!,
    randomChoiceByRarity(filteredPaths, rng)!,
    randomChoiceByRarity(filteredPaths, rng)!,
  ];
}

export function blacksmithEnchantItem(
  item: EquipmentItem,
  enchant: BlacksmithEnchant,
): void {
  if (!hasCurrencies(enchant.cost)) return;

  loseCurrencies(enchant.cost);

  item.mods ??= {};
  item.mods.enchantLevel ??= 0;
  item.mods.baseStats ??= getDefaultStats();
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
  updateGamestate((state) => {
    const updateItem = state.inventory.items.find((i) => i.id === item.id);
    if (!updateItem) return state;

    updateItem.mods = cloneDeep(item.mods);

    return state;
  });
}
