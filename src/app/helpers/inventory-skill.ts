import { updateHeroData } from '@helpers/hero';
import { recalculateStats } from '@helpers/hero-stats';
import { sortedRarityList } from '@helpers/item';
import { updateGamestate } from '@helpers/state-game';
import type { EquipmentSkill, Hero } from '@interfaces';

export function maxSkillInventorySize(): number {
  return 100;
}

export function addSkillToInventory(item: EquipmentSkill): void {
  updateGamestate((state) => {
    const items = sortedRarityList([...state.inventory.skills, item]);
    while (items.length > maxSkillInventorySize()) {
      items.pop();
    }

    state.inventory.skills = items;

    return state;
  });
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
