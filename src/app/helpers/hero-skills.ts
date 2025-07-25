import type { Hero } from '@interfaces/hero';
import type { EquipmentSkillId } from '@interfaces/skill';

export function heroEquipmentSkills(hero: Hero): EquipmentSkillId[] {
  return Object.values(hero.equipment ?? {})
    .flatMap((i) => (i ? i.skillIds : []))
    .filter(Boolean);
}
