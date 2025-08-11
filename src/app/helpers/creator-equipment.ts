import { getEntriesByType, getEntry } from '@helpers/content';
import { droppableCleanup } from '@helpers/droppable';
import { rngChoiceRarity, rngSeeded, rngUuid } from '@helpers/rng';
import {
  traitAddToEquipment,
  traitCanAddToEquipment,
} from '@helpers/trait-equipment';
import type {
  EquipmentItem,
  EquipmentItemContent,
  EquipmentItemId,
} from '@interfaces';

export function equipmentAllDefinitions(): EquipmentItemContent[] {
  return [
    ...getEntriesByType<EquipmentItemContent>('accessory'),
    ...getEntriesByType<EquipmentItemContent>('armor'),
    ...getEntriesByType<EquipmentItemContent>('trinket'),
    ...getEntriesByType<EquipmentItemContent>('weapon'),
  ].filter((i) => !i.preventDrop);
}

export function equipmentPickRandomDefinitionByRarity(
  definitions = equipmentAllDefinitions(),
  rng = rngSeeded(rngUuid()),
): EquipmentItemContent {
  const allItems = definitions;

  const chosenItem = rngChoiceRarity(allItems, rng);
  if (!chosenItem) throw new Error('Could not generate an item.');

  const chosenItemDefinition = getEntry<EquipmentItemContent>(chosenItem.id);
  if (!chosenItemDefinition) throw new Error('Could not generate an item.');

  return structuredClone(chosenItemDefinition);
}

export function equipmentCreate(def: EquipmentItemContent): EquipmentItem {
  const defClone = structuredClone(def);
  droppableCleanup(defClone);

  const item: EquipmentItem = {
    ...defClone,
    id: `${defClone.id}|${rngUuid()}` as EquipmentItemId,
    mods: {},
    traitIds: defClone.traitIds ?? [],
  };

  if (traitCanAddToEquipment()) {
    traitAddToEquipment(item);
  }

  return item;
}
