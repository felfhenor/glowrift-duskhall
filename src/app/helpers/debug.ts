import { getEntriesByType, getEntry } from '@helpers/content';
import { droppableGain, droppableMakeReal } from '@helpers/droppable';
import { locationClaim, locationGetAll } from '@helpers/world-location';
import type { EquipmentItem } from '@interfaces/content-equipment';
import type { EquipmentSkillContent } from '@interfaces/content-skill';
import type { DroppableEquippable } from '@interfaces/droppable';

export function debugCreateDroppable(id: string): DroppableEquippable {
  return droppableMakeReal(getEntry<DroppableEquippable>(id)!);
}

export function debugGainDroppableById(id: string): void {
  droppableGain(debugCreateDroppable(id)!);
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

export function debugClaimAllNodes(): void {
  locationGetAll().forEach(locationClaim);
}
