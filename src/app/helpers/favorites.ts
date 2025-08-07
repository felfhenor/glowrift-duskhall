import { notifySuccess } from '@helpers/notify';
import type { EquipmentItem, EquipmentSkill } from '@interfaces';

export function toggleItemFavorite(item: EquipmentItem): void {
  item.isFavorite = !item.isFavorite;
  
  const status = item.isFavorite ? 'favorited' : 'unfavorited';
  notifySuccess(`${item.name} has been ${status}!`);
}

export function toggleSkillFavorite(skill: EquipmentSkill): void {
  skill.isFavorite = !skill.isFavorite;
  
  const status = skill.isFavorite ? 'favorited' : 'unfavorited';
  notifySuccess(`${skill.name} has been ${status}!`);
}