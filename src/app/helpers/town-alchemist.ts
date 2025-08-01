import type { EquipmentSkill, GameCurrency } from '@interfaces';
import { gainCurrency } from '@helpers/currency';
import { removeSkillFromInventory } from '@helpers/inventory-skill';
import { getBuildingLevel } from '@helpers/town';

export function maxAlchemistSkills() {
  return Math.floor(Math.min(15, 3 + getBuildingLevel('Alchemist') / 3));
}

export function salvageSkills(items: EquipmentSkill[]): void {
  items.forEach((item) => {
    salvageSkill(item);
  });
}

export function salvageSkill(skill: EquipmentSkill): void {
  removeSkillFromInventory(skill);

  const currencyGain = skillSalvageCurrencyGain(skill);
  Object.entries(currencyGain).forEach(([curr, amount]) => {
    const currency = curr as GameCurrency;
    gainCurrency(currency, amount);
  });
}

export function multiSkillSalvageCurrencyGain(
  skills: EquipmentSkill[],
): Partial<Record<GameCurrency, number>> {
  const result: Partial<Record<GameCurrency, number>> = {};

  skills.forEach((skill) => {
    const currencies = skillSalvageCurrencyGain(skill);
    Object.entries(currencies).forEach(([curr, amount]) => {
      const currency = curr as GameCurrency;

      if (result[currency]) {
        result[currency] += amount;
      } else {
        result[currency] = amount;
      }
    });
  });

  return result;
}

export function skillSalvageCurrencyGain(
  skill: EquipmentSkill,
): Partial<Record<GameCurrency, number>> {
  const currencies: Partial<Record<GameCurrency, number>> = {};

  let sliverMultiplier = 0;
  let shardMultiplier = 0;
  let crystalMultiplier = 0;

  switch (skill.rarity) {
    case 'Common':
      sliverMultiplier = 0.05;
      break;
    case 'Uncommon':
      sliverMultiplier = 0.1;
      break;
    case 'Rare':
      sliverMultiplier = 0.15;
      shardMultiplier = 0.05;
      break;
    case 'Mystical':
      sliverMultiplier = 0.2;
      shardMultiplier = 0.1;
      break;
    case 'Legendary':
      sliverMultiplier = 0.25;
      shardMultiplier = 0.2;
      crystalMultiplier = 0.05;
      break;
    case 'Unique':
      sliverMultiplier = 0.5;
      shardMultiplier = 0.35;
      crystalMultiplier = 0.1;
      break;
  }

  const allElements = skill.techniques.flatMap((t) => t.elements);
  allElements.forEach((element) => {
    if (sliverMultiplier > 0) {
      const sliverKey = `${element} Sliver` as GameCurrency;
      currencies[sliverKey] =
        (currencies[sliverKey] || 0) +
        Math.max(1, Math.floor(skill.dropLevel * sliverMultiplier));
    }

    if (shardMultiplier > 0) {
      const shardKey = `${element} Shard` as GameCurrency;
      currencies[shardKey] =
        (currencies[shardKey] || 0) +
        Math.max(1, Math.floor(skill.dropLevel * shardMultiplier));
    }

    if (crystalMultiplier > 0) {
      const crystalKey = `${element} Crystal` as GameCurrency;
      currencies[crystalKey] =
        (currencies[crystalKey] || 0) +
        Math.max(1, Math.floor(skill.dropLevel * crystalMultiplier));
    }
  });

  return currencies;
}
