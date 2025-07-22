import { getEntriesByType, getEntry } from '@helpers/content';
import { cleanupDroppableDefinition } from '@helpers/droppable';
import { randomChoiceByRarity, seededrng, uuid } from '@helpers/rng';
import type {
  EquipmentItem,
  EquipmentItemContent,
  EquipmentItemId,
} from '@interfaces';
import { cloneDeep } from 'lodash';

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

  return cloneDeep(chosenItemDefinition);
}

export function createItem(def: EquipmentItemContent): EquipmentItem {
  const defClone = cloneDeep(def);
  cleanupDroppableDefinition(defClone);

  return {
    ...defClone,
    id: `${defClone.id}|${uuid()}` as EquipmentItemId,
    mods: {},
  };
}
