import { getEntry } from '@helpers/content';
import { droppableGetBaseId } from '@helpers/droppable';
import { allHeroes, heroUpdateData } from '@helpers/hero';
import { gamestate, updateGamestate } from '@helpers/state-game';
import type { EquipmentSkill } from '@interfaces';

function getUpdatedSkill(skill: EquipmentSkill): EquipmentSkill {
  return Object.assign(skill, getEntry(droppableGetBaseId(skill)), {
    id: skill.id,
    isFavorite: skill.isFavorite,
  });
}

export function migrateSkills() {
  migrateInventorySkills();
  migrateEquippedSkills();
}

function migrateInventorySkills() {
  const skills = gamestate().inventory.skills;
  const newSkills = skills.map((s) => getUpdatedSkill(s));

  updateGamestate((state) => {
    state.inventory.skills = newSkills;
    return state;
  });
}

function migrateEquippedSkills() {
  allHeroes().forEach((hero) => {
    const heroSkills = hero.skills
      .filter(Boolean)
      .map((s) => getUpdatedSkill(s!));

    hero.skills = heroSkills;
    heroUpdateData(hero);
  });
}
