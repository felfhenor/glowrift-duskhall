import { getEntry } from '@helpers/content';
import { defaultStats } from '@helpers/defaults';
import { gamestate } from '@helpers/state-game';
import type {
  EquipmentItemId,
  EquipmentSkillContent,
  TalentBoost,
  TalentId,
  TraitEquipmentContent,
} from '@interfaces';
import {
  type DroppableEquippable,
  type EquipmentItem,
  type EquipmentItemContent,
  type GameElement,
  type GameStat,
  type WorldLocationElement,
} from '@interfaces';
import { groupBy, sum, sumBy } from 'es-toolkit/compat';

export function itemIsEquipment(
  item: DroppableEquippable,
): item is EquipmentItem {
  return (
    item.__type === 'weapon' ||
    item.__type === 'armor' ||
    item.__type === 'accessory' ||
    item.__type === 'trinket'
  );
}

export function itemGetById(
  itemId: EquipmentItemId,
): EquipmentItem | undefined {
  return gamestate().inventory.items.find((i) => i.id === itemId);
}

export function itemStat(item: EquipmentItemContent, stat: GameStat): number {
  return (
    (item.baseStats[stat] ?? 0) +
    ((item as EquipmentItem)?.mods?.baseStats?.[stat] ?? 0) +
    sum(itemTraits(item as EquipmentItem).map((t) => t?.baseStats?.[stat] ?? 0))
  );
}

export function itemElementMultiplier(
  item: EquipmentItemContent,
  element: GameElement,
): number {
  const itemMultipliers = (item.elementMultipliers ?? [])
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

  const itemModTraitMultipliers = (
    (item as EquipmentItem)?.mods?.traitIds ?? []
  )
    ?.flatMap(
      (t) => getEntry<TraitEquipmentContent>(t)?.elementMultipliers ?? [],
    )
    .filter((e) => e.element === element)
    .map((i) => i.multiplier ?? 0);

  return sum([
    ...itemMultipliers,
    ...itemModMultipliers,
    ...itemTraitMultipliers,
    ...itemModTraitMultipliers,
  ]);
}

export function itemElementAdd(
  item: EquipmentItem,
  locElement: WorldLocationElement,
): void {
  item.mods ??= {};
  item.mods.elementMultipliers ??= [];
  item.mods.elementMultipliers.push({
    element: locElement.element,
    multiplier: locElement.intensity / 100,
  });
}

export function itemStatAdd(
  item: EquipmentItem,
  stat: GameStat,
  value: number,
): void {
  item.mods ??= {};
  item.mods.baseStats ??= defaultStats();
  item.mods.baseStats[stat] += value;
}

export function itemEnchantLevel(item: EquipmentItem): number {
  return item.enchantLevel + (item.mods?.enchantLevel ?? 0);
}

export function itemTraits(item: EquipmentItem): TraitEquipmentContent[] {
  return [...item.traitIds, ...(item.mods?.traitIds ?? [])].map(
    (t) => getEntry<TraitEquipmentContent>(t)!,
  );
}

export function itemTalents(item: EquipmentItem): TalentBoost[] {
  // Get talents from item and mods
  const itemTalents = [
    ...item.talentBoosts,
    ...(item.mods?.talentBoosts ?? []),
  ];

  // Get talents from traits
  const traitTalents = itemTraits(item).flatMap(
    (trait) => trait.talentBoosts ?? [],
  );

  // Combine all talent sources
  const allTalents = [...itemTalents, ...traitTalents];

  const talentLevels = groupBy(allTalents, (t) => t.talentId);

  return Object.keys(talentLevels).map((tId) => ({
    talentId: tId as TalentId,
    value: sumBy(talentLevels[tId], (t) => t.value),
  }));
}

export function itemSkills(item: EquipmentItem): EquipmentSkillContent[] {
  return [...item.skillIds, ...(item.mods?.skillIds ?? [])].map(
    (t) => getEntry<EquipmentSkillContent>(t)!,
  );
}
