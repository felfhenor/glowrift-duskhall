import { getEntry } from '@helpers/content';
import { equipmentCreate } from '@helpers/creator-equipment';
import { skillCreate } from '@helpers/creator-skill';
import { itemInventoryAdd } from '@helpers/inventory-equipment';
import { skillInventoryAdd } from '@helpers/inventory-skill';
import type {
  DroppableEquippable,
  DropRarity,
  EquipmentItem,
  EquipmentItemContent,
  EquipmentSkill,
  EquipmentSkillContent,
} from '@interfaces';
import { sortBy } from 'es-toolkit/compat';

export function droppableGetBaseId(item: DroppableEquippable): string {
  return item.id.split('|')[0];
}

export function droppableCleanup(
  droppable: DroppableEquippable,
): DroppableEquippable {
  delete droppable.preventModification;
  delete droppable.preventDrop;
  return droppable;
}

export function droppableMakeReal(
  droppable: DroppableEquippable,
): DroppableEquippable {
  switch (droppable.__type) {
    case 'skill':
      return skillCreate(droppable as EquipmentSkillContent);
    case 'accessory':
    case 'armor':
    case 'trinket':
    case 'weapon':
      return equipmentCreate(droppable as EquipmentItemContent);

    default:
      throw new Error(
        `Could not create a real item with type: ${droppable.__type}`,
      );
  }
}

export function droppableGain(droppable: DroppableEquippable): void {
  if (getEntry<DroppableEquippable>(droppable.id))
    throw new Error(
      'Gaining a droppable that has a real content id instead of a unique one',
    );

  switch (droppable.__type) {
    case 'skill':
      skillInventoryAdd(droppable as EquipmentSkill);
      return;
    case 'accessory':
    case 'armor':
    case 'trinket':
    case 'weapon':
      itemInventoryAdd(droppable as EquipmentItem);
      return;

    default:
      throw new Error(
        `Could not handle adding a real item with type: ${droppable.__type}`,
      );
  }
}

export function droppableSortedRarityList<T extends DroppableEquippable>(
  items: T[],
): T[] {
  return sortBy(items, [
    (i) => -i.dropLevel,
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
  ]);
}
