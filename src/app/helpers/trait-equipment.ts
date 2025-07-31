import { getEntriesByType } from '@helpers/content';
import { randomChoiceByRarity, succeedsChance } from '@helpers/rng';
import type { EquipmentItem } from '@interfaces/content-equipment';
import type { TraitEquipmentContent } from '@interfaces/content-trait-equipment';

export function canAddTraitToEquipment() {
  return succeedsChance(25);
}

export function addTraitToEquipment(item: EquipmentItem) {
  item.mods.traitIds ??= [];

  const allValidTraits =
    getEntriesByType<TraitEquipmentContent>('traitequipment');
  const chosenTrait = randomChoiceByRarity(allValidTraits);
  if (!chosenTrait) return;

  item.mods.traitIds.push(chosenTrait.id);
}
