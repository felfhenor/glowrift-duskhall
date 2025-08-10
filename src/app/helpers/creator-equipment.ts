import { getEntriesByType, getEntry } from '@helpers/content';
import { cleanupDroppableDefinition } from '@helpers/droppable';
import { randomChoiceByRarity, seededrng, uuid } from '@helpers/rng';
import {
  addTraitToEquipment,
  canAddTraitToEquipment,
} from '@helpers/trait-equipment';
import type {
  EquipmentItem,
  EquipmentItemContent,
  EquipmentItemId,
} from '@interfaces';

export function allItemDefinitions(): EquipmentItemContent[] {
  return [
    ...getEntriesByType<EquipmentItemContent>('accessory'),
    ...getEntriesByType<EquipmentItemContent>('armor'),
    ...getEntriesByType<EquipmentItemContent>('trinket'),
    ...getEntriesByType<EquipmentItemContent>('weapon'),
  ].filter((i) => !i.preventDrop);
}

export function pickRandomItemDefinitionBasedOnRarity(
  definitions = allItemDefinitions(),
  rng = seededrng(uuid()),
): EquipmentItemContent {
  const allItems = definitions;

  const chosenItem = randomChoiceByRarity(allItems, rng);
  if (!chosenItem) throw new Error('Could not generate an item.');

  const chosenItemDefinition = getEntry<EquipmentItemContent>(chosenItem.id);
  if (!chosenItemDefinition) throw new Error('Could not generate an item.');

  return structuredClone(chosenItemDefinition);
}

export function createItem(def: EquipmentItemContent): EquipmentItem {
  const defClone = structuredClone(def);
  cleanupDroppableDefinition(defClone);

  const item: EquipmentItem = {
    ...defClone,
    id: `${defClone.id}|${uuid()}` as EquipmentItemId,
    mods: {},
    traitIds: defClone.traitIds ?? [],
  };

  if (canAddTraitToEquipment()) {
    addTraitToEquipment(item);
  }

  return item;
}
