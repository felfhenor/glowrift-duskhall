import type { EquipmentItem, EquipmentSkill } from '@interfaces';

export function toggleItemFavorite(item: EquipmentItem): void {
  item.isFavorite = !item.isFavorite;
}

export function toggleSkillFavorite(skill: EquipmentSkill): void {
  skill.isFavorite = !skill.isFavorite;
}