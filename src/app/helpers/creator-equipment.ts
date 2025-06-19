import { cloneDeep } from 'lodash';
import {
  EquipmentItem,
  EquipmentItemDefinition,
  EquipmentItemId,
} from '../interfaces';
import { getEntriesByType, getEntry } from './content';
import { cleanupDroppableDefinition } from './droppable';
import { randomIdentifiableChoice, seededrng, uuid } from './rng';

export function allItemDefinitions(): EquipmentItemDefinition[] {
  return [
    ...getEntriesByType<EquipmentItemDefinition>('accessory'),
    ...getEntriesByType<EquipmentItemDefinition>('armor'),
    ...getEntriesByType<EquipmentItemDefinition>('trinket'),
    ...getEntriesByType<EquipmentItemDefinition>('weapon'),
  ].filter((i) => !i.preventDrop);
}

export function pickRandomItemDefinition(
  definitions = allItemDefinitions(),
  rng = seededrng(uuid()),
): EquipmentItemDefinition {
  const allItems = definitions;

  const chosenItem = randomIdentifiableChoice<EquipmentItemDefinition>(
    allItems,
    rng,
  );
  if (!chosenItem) throw new Error('Could not generate an item.');

  const chosenItemDefinition = getEntry<EquipmentItemDefinition>(chosenItem);
  if (!chosenItemDefinition) throw new Error('Could not generate an item.');

  return cloneDeep(chosenItemDefinition);
}

export function createItem(def: EquipmentItemDefinition): EquipmentItem {
  const defClone = cloneDeep(def);
  cleanupDroppableDefinition(defClone);

  return {
    ...defClone,
    id: `${defClone.id}|${uuid()}` as EquipmentItemId,
    mods: {},
  };
}
