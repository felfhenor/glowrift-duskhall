import { getEntry } from '@helpers/content';
import type { TraitEquipmentContent } from '@interfaces';
import {
  type DroppableEquippable,
  type DropRarity,
  type EquipmentItem,
  type EquipmentItemContent,
  type GameElement,
  type GameStat,
  type WorldLocationElement,
} from '@interfaces';
import { sortBy, sum } from 'es-toolkit/compat';

export function sortedRarityList<T extends DroppableEquippable>(
  items: T[],
): T[] {
  return sortBy(items, [
    (i) => {
      const rarityOrder: Record<DropRarity, number> = {
        Common: 0,
        Uncommon: -1,
        Rare: -2,
        Mystical: -3,
        Legendary: -4,
        Unique: -5,
      };
      return rarityOrder[i.rarity] ?? 0;
    },
    (i) => -i.dropLevel,
  ]);
}

export function isEquipment(item: DroppableEquippable): item is EquipmentItem {
  return (
    item.__type === 'weapon' ||
    item.__type === 'armor' ||
    item.__type === 'accessory' ||
    item.__type === 'trinket'
  );
}

export function getItemStat(
  item: EquipmentItemContent,
  stat: GameStat,
): number {
  return (
    (item.baseStats[stat] ?? 0) +
    ((item as EquipmentItem)?.mods?.baseStats?.[stat] ?? 0) +
    sum(
      item.traitIds.map(
        (t) => getEntry<TraitEquipmentContent>(t)?.baseStats?.[stat] ?? 0,
      ),
    )
  );
}

export function getItemElementMultiplier(
  item: EquipmentItemContent,
  element: GameElement,
): number {
  const itemMultipliers = item.elementMultipliers
    .filter((e) => e.element === element)
    .map((i) => i.multiplier ?? 0);

  const itemModMultipliers = (
    (item as EquipmentItem)?.mods?.elementMultipliers ?? []
  )
    .filter((e) => e.element === element)
    .map((i) => i.multiplier ?? 0);

  const itemTraitMultipliers = (item as EquipmentItem)?.traitIds
    ?.flatMap(
      (t) => getEntry<TraitEquipmentContent>(t)?.elementMultipliers ?? [],
    )
    .filter((e) => e.element === element)
    .map((i) => i.multiplier ?? 0);

  return sum([
    ...itemMultipliers,
    ...itemModMultipliers,
    ...itemTraitMultipliers,
  ]);
}

export function addItemElement(
  item: EquipmentItem,
  locElement: WorldLocationElement,
): void {
  item.mods.elementMultipliers ??= [];
  item.mods.elementMultipliers.push({
    element: locElement.element,
    multiplier: locElement.intensity / 100,
  });
}

export function rarityItemTextColor(rarity: DropRarity): string {
  const rarityColorRecord: Record<DropRarity, string> = {
    Common: 'text-white-400',
    Uncommon: 'text-green-400',
    Rare: 'text-blue-400',
    Mystical: 'text-purple-400',
    Legendary: 'text-yellow-400',
    Unique: 'text-rose-400',
  };

  return rarityColorRecord[rarity];
}

export function rarityItemOutlineColor(rarity: DropRarity): string {
  const rarityColorRecord: Record<DropRarity, string> = {
    Common: 'outline-white-400',
    Uncommon: 'outline-green-400',
    Rare: 'outline-blue-400',
    Mystical: 'outline-purple-400',
    Legendary: 'outline-yellow-400',
    Unique: 'outline-rose-400',
  };

  return rarityColorRecord[rarity];
}
