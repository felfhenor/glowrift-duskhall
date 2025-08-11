import { currencyGain } from '@helpers/currency';
import { skillInventoryRemove } from '@helpers/inventory-skill';
import { notifySuccess } from '@helpers/notify';
import type { EquipmentSkill } from '@interfaces';

export function actionSkillSalvageValue(item: EquipmentSkill): number {
  return item.dropLevel * 100;
}

export function actionSkillSalvage(item: EquipmentSkill): void {
  const manaGained = actionSkillSalvageValue(item);

  skillInventoryRemove(item);
  currencyGain('Mana', manaGained);

  notifySuccess(`Salvaged ${item.name} for ${manaGained} mana!`);
}
