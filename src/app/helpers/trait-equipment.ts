import { getEntriesByType } from '@helpers/content';
import { rngChoiceRarity, rngSucceedsChance } from '@helpers/rng';
import { symmetryLevel } from '@helpers/symmetry';
import type { EquipmentItem } from '@interfaces/content-equipment';
import type { TraitEquipmentContent } from '@interfaces/content-trait-equipment';

export function traitCanAddToEquipment() {
  return rngSucceedsChance(25);
}

export function traitMaxForEquipment(item: EquipmentItem) {
  const level = symmetryLevel(item);
  return 1 + (level >= 3 ? 1 : 0) + (level >= 5 ? 1 : 0);
}

export function traitAddToEquipment(item: EquipmentItem) {
  item.mods ??= {};
  item.mods.traitIds ??= [];

  const allValidTraits = getEntriesByType<TraitEquipmentContent>(
    'traitequipment',
  ).filter((t) => !item.mods?.traitIds?.includes(t.id));
  const chosenTrait = rngChoiceRarity(allValidTraits);
  if (!chosenTrait) return;

  item.mods.traitIds.push(chosenTrait.id);
}
