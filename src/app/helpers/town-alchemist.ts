import { currencyGainMultiple } from '@helpers/currency';
import { skillInventoryRemove } from '@helpers/inventory-skill';
import { talentTownStatTotalForAllHeroes } from '@helpers/talent';
import { townBuildingLevel } from '@helpers/town';
import type { EquipmentSkill, GameCurrency } from '@interfaces';

export function alchemistSkillsMax() {
  return Math.floor(Math.min(15, 3 + townBuildingLevel('Alchemist') / 3));
}

export function alchemistCurrencyMultiplier(): number {
  return (
    townBuildingLevel('Alchemist') +
    talentTownStatTotalForAllHeroes('breakdownCurrencyBonus')
  );
}

export function alchemistSalvageSkills(items: EquipmentSkill[]): void {
  items.forEach((item) => {
    alchemistSalvageSkill(item);
  });
}

export function alchemistSalvageSkill(skill: EquipmentSkill): void {
  skillInventoryRemove(skill);

  const currenciesGain = alchemistSkillSalvageCurrencyGain(skill);
  currencyGainMultiple(currenciesGain);
}

export function alchemistMultiSkillSalvageCurrencyGain(
  skills: EquipmentSkill[],
): Partial<Record<GameCurrency, number>> {
  const result: Partial<Record<GameCurrency, number>> = {};

  skills.forEach((skill) => {
    const currencies = alchemistSkillSalvageCurrencyGain(skill);
    Object.entries(currencies).forEach(([curr, amount]) => {
      const currency = curr as GameCurrency;
      const addedAmount = alchemistCurrencyMultiplier() * amount;

      if (result[currency]) {
        result[currency] += addedAmount;
      } else {
        result[currency] = addedAmount;
      }
    });
  });

  return result;
}

export function alchemistSkillSalvageCurrencyGain(
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
