import { actionSkillSalvageValue } from '@helpers/action-skill';
import { analyticsSendDesignEvent } from '@helpers/analytics';
import { currencyGain } from '@helpers/currency';
import { droppableSortedRarityList } from '@helpers/droppable';
import { heroUpdateData } from '@helpers/hero';
import { heroRecalculateStats } from '@helpers/hero-stats';
import { updateGamestate } from '@helpers/state-game';
import type { EquipmentSkill, Hero } from '@interfaces';
import { sumBy } from 'es-toolkit/compat';

export function skillInventoryMaxSize(): number {
  return 100;
}

export function skillHeroMax(): number {
  return 3;
}

export function skillInventoryAdd(item: EquipmentSkill): void {
  const lostSkills: EquipmentSkill[] = [];

  updateGamestate((state) => {
    const currentSkills = [...state.inventory.skills];

    // If we're at capacity, remove the worst existing skill first
    if (currentSkills.length >= skillInventoryMaxSize()) {
      const sortedSkills = droppableSortedRarityList(currentSkills);
      const worstSkill = sortedSkills.pop();
      if (worstSkill) {
        lostSkills.push(worstSkill);
      }
      state.inventory.skills = sortedSkills;
    }

    // Now add the new skill and sort
    state.inventory.skills.push(item);
    state.inventory.skills = droppableSortedRarityList(state.inventory.skills);

    return state;
  });

  const value = sumBy(lostSkills, (s) => actionSkillSalvageValue(s));
  currencyGain('Mana', value);
}

export function skillInventoryRemove(item: EquipmentSkill): void {
  updateGamestate((state) => {
    state.inventory.skills = state.inventory.skills.filter(
      (i) => i.id !== item.id,
    );
    return state;
  });
}

export function skillEquip(
  hero: Hero,
  item: EquipmentSkill,
  slot: number,
): void {
  const heroSkills = hero.skills;
  const existingItem = heroSkills[slot];
  if (existingItem) {
    skillUnequip(hero, existingItem, slot);
  }

  hero.skills[slot] = item;

  heroUpdateData(hero.id, {
    skills: heroSkills,
  });

  skillInventoryRemove(item);
  heroRecalculateStats(hero.id);

  analyticsSendDesignEvent(`Game:Hero:EquipSkill:${item.name}`);
}

export function skillUnequip(
  hero: Hero,
  item: EquipmentSkill,
  slot: number,
): void {
  const heroSkills = hero.skills;
  heroSkills[slot] = undefined;

  heroUpdateData(hero.id, {
    skills: heroSkills,
  });

  skillInventoryAdd(item);
  heroRecalculateStats(hero.id);
}
