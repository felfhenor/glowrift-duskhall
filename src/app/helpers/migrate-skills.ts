import { EquipmentSkill } from '@interfaces';
import { getEntry } from '@helpers/content';
import { getDroppableEquippableBaseId } from '@helpers/droppable';
import { allHeroes, updateHeroData } from '@helpers/hero';
import { gamestate, updateGamestate } from '@helpers/state-game';

export function getUpdatedSkill(skill: EquipmentSkill): EquipmentSkill {
  return Object.assign(skill, getEntry(getDroppableEquippableBaseId(skill)), {
    id: skill.id,
  });
}

export function migrateSkills() {
  migrateInventorySkills();
  migrateEquippedSkills();
}

export function migrateInventorySkills() {
  const skills = gamestate().inventory.skills;
  const newSkills = skills.map((s) => getUpdatedSkill(s));

  updateGamestate((state) => {
    state.inventory.skills = newSkills;
    return state;
  });
}

export function migrateEquippedSkills() {
  allHeroes().forEach((hero) => {
    const heroSkills = hero.skills
      .filter(Boolean)
      .map((s) => getUpdatedSkill(s!));
    updateHeroData(hero.id, { skills: heroSkills });
  });
}
