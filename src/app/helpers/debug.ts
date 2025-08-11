import { getEntriesByType, getEntry } from '@helpers/content';
import { droppableGain, droppableMakeReal } from '@helpers/droppable';
import type { EquipmentItem } from '@interfaces/content-equipment';
import type { EquipmentSkillContent } from '@interfaces/content-skill';
import type { DroppableEquippable } from '@interfaces/droppable';

/**
 * Used entirely for debugging to add items to the inventory quickly.
 *
 * @param id the item id/name to add
 */
export function debugGainDroppableById(id: string): void {
  const item = droppableMakeReal(getEntry<DroppableEquippable>(id)!);
  droppableGain(item);
}

export function debugSkillGainEvery(): void {
  getEntriesByType<EquipmentSkillContent>('skill').forEach((skill) =>
    debugGainDroppableById(skill.id),
  );
}

export function debugItemGainEvery(): void {
  getEntriesByType<EquipmentItem>('accessory').forEach((skill) =>
    debugGainDroppableById(skill.id),
  );
  getEntriesByType<EquipmentItem>('armor').forEach((skill) =>
    debugGainDroppableById(skill.id),
  );
  getEntriesByType<EquipmentItem>('trinket').forEach((skill) =>
    debugGainDroppableById(skill.id),
  );
  getEntriesByType<EquipmentItem>('weapon').forEach((skill) =>
    debugGainDroppableById(skill.id),
  );
}
