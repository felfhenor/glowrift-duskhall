import type { EquipmentSkillId } from '@interfaces/content-skill';
import type { Hero } from '@interfaces/hero';

export function heroEquipmentSkills(hero: Hero): EquipmentSkillId[] {
  return Object.values(hero.equipment ?? {})
    .flatMap((i) => (i ? i.skillIds : []))
    .filter(Boolean);
}
