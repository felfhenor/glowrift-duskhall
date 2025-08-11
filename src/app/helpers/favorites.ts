import type { EquipmentItem, EquipmentSkill } from '@interfaces';

export function favoriteToggleItem(item: EquipmentItem): void {
  item.isFavorite = !item.isFavorite;
}

export function favoriteToggleSkill(skill: EquipmentSkill): void {
  skill.isFavorite = !skill.isFavorite;
}
