import { EquipmentSkill } from '@interfaces';
import { gainCurrency } from '@helpers/currency';
import { removeSkillFromInventory } from '@helpers/inventory-skill';
import { notifySuccess } from '@helpers/notify';

export function skillSalvageValue(item: EquipmentSkill): number {
  return item.dropLevel * 100;
}

export function skillSalvage(item: EquipmentSkill): void {
  const manaGained = skillSalvageValue(item);

  removeSkillFromInventory(item);
  gainCurrency('Mana', manaGained);

  notifySuccess(`Salvaged ${item.name} for ${manaGained} mana!`);
}
