import { skillSalvageValue } from '@helpers/action-skill';
import { sendDesignEvent } from '@helpers/analytics';
import { gainCurrency } from '@helpers/currency';
import { updateHeroData } from '@helpers/hero';
import { recalculateStats } from '@helpers/hero-stats';
import { sortedRarityList } from '@helpers/item';
import { updateGamestate } from '@helpers/state-game';
import type { EquipmentSkill, Hero } from '@interfaces';
import { sumBy } from 'es-toolkit/compat';

export function maxSkillInventorySize(): number {
  return 100;
}

export function addSkillToInventory(item: EquipmentSkill): void {
  const lostSkills: EquipmentSkill[] = [];

  updateGamestate((state) => {
    const currentSkills = [...state.inventory.skills];

    // If we're at capacity, remove the worst existing skill first
    if (currentSkills.length >= maxSkillInventorySize()) {
      const sortedSkills = sortedRarityList(currentSkills);
      const worstSkill = sortedSkills.pop();
      if (worstSkill) {
        lostSkills.push(worstSkill);
      }
      state.inventory.skills = sortedSkills;
    }

    // Now add the new skill and sort
    state.inventory.skills.push(item);
    state.inventory.skills = sortedRarityList(state.inventory.skills);

    return state;
  });

  const value = sumBy(lostSkills, (s) => skillSalvageValue(s));
  gainCurrency('Mana', value);
}

export function removeSkillFromInventory(item: EquipmentSkill): void {
  updateGamestate((state) => {
    state.inventory.skills = state.inventory.skills.filter(
      (i) => i.id !== item.id,
    );
    return state;
  });
}

export function maxSkillsForHero(): number {
  return 3;
}

export function equipSkill(
  hero: Hero,
  item: EquipmentSkill,
  slot: number,
): void {
  const heroSkills = hero.skills;
  const existingItem = heroSkills[slot];
  if (existingItem) {
    unequipSkill(hero, existingItem, slot);
  }

  hero.skills[slot] = item;

  updateHeroData(hero.id, {
    skills: heroSkills,
  });

  removeSkillFromInventory(item);
  recalculateStats(hero.id);

  sendDesignEvent(`Game:Hero:EquipSkill:${item.name}`);
}

export function unequipSkill(
  hero: Hero,
  item: EquipmentSkill,
  slot: number,
): void {
  const heroSkills = hero.skills;
  heroSkills[slot] = undefined;

  updateHeroData(hero.id, {
    skills: heroSkills,
  });

  addSkillToInventory(item);
  recalculateStats(hero.id);
}
