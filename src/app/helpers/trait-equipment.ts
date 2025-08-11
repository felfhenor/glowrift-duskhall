import { getEntriesByType } from '@helpers/content';
import { rngChoiceRarity, rngSucceedsChance } from '@helpers/rng';
import type { EquipmentItem } from '@interfaces/content-equipment';
import type { TraitEquipmentContent } from '@interfaces/content-trait-equipment';

export function traitCanAddToEquipment() {
  return rngSucceedsChance(25);
}

export function traitAddToEquipment(item: EquipmentItem) {
  item.mods ??= {};
  item.mods.traitIds ??= [];

  const allValidTraits =
    getEntriesByType<TraitEquipmentContent>('traitequipment');
  const chosenTrait = rngChoiceRarity(allValidTraits);
  if (!chosenTrait) return;

  item.mods.traitIds.push(chosenTrait.id);
}
