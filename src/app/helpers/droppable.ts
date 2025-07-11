import {
  DroppableEquippable,
  EquipmentItem,
  EquipmentItemContent,
  EquipmentSkill,
  EquipmentSkillContent,
} from '../interfaces';
import { getEntry } from './content';
import { createItem } from './creator-equipment';
import { createSkill } from './creator-skill';
import { addItemToInventory } from './inventory-equipment';
import { addSkillToInventory } from './inventory-skill';

export function getDroppableEquippableBaseId(
  item: DroppableEquippable,
): string {
  return item.id.split('|')[0];
}

export function cleanupDroppableDefinition(
  droppable: DroppableEquippable,
): DroppableEquippable {
  delete droppable.preventModification;
  delete droppable.preventDrop;
  return droppable;
}

export function makeDroppableIntoRealItem(
  droppable: DroppableEquippable,
): DroppableEquippable {
  switch (droppable.__type) {
    case 'skill':
      return createSkill(droppable as EquipmentSkillContent);
    case 'accessory':
    case 'armor':
    case 'trinket':
    case 'weapon':
      return createItem(droppable as EquipmentItemContent);

    default:
      throw new Error(
        `Could not create a real item with type: ${droppable.__type}`,
      );
  }
}

export function gainDroppableItem(droppable: DroppableEquippable): void {
  if (getEntry<DroppableEquippable>(droppable.id))
    throw new Error(
      'Gaining a droppable that has a real content id instead of a unique one',
    );

  switch (droppable.__type) {
    case 'skill':
      addSkillToInventory(droppable as EquipmentSkill);
      return;
    case 'accessory':
    case 'armor':
    case 'trinket':
    case 'weapon':
      addItemToInventory(droppable as EquipmentItem);
      return;

    default:
      throw new Error(
        `Could not handle adding a real item with type: ${droppable.__type}`,
      );
  }
}
