import { getEntry } from '@helpers/content';
import { defaultCombatStats } from '@helpers/defaults';
import { droppableGetBaseId } from '@helpers/droppable';
import { allHeroes, heroUpdateData } from '@helpers/hero';
import type { CombatantCombatStats } from '@interfaces/combat';
import type {
  EquipmentSkill,
  EquipmentSkillContentTechnique,
  EquipmentSkillTechniqueStatusEffectApplication,
} from '@interfaces/content-skill';
import type { StatusEffectContent } from '@interfaces/content-statuseffect';
import type {
  TalentContent,
  TalentId,
  TalentTownStats,
} from '@interfaces/content-talent';
import type { TalentTreeContent } from '@interfaces/content-talenttree';
import type { ElementBlock } from '@interfaces/element';
import type { Hero } from '@interfaces/hero';
import type { GameStat, StatBlock } from '@interfaces/stat';
import {
  intersection,
  isNumber,
  isObject,
  sum,
  sumBy,
  uniq,
} from 'es-toolkit/compat';

export function talentsForAllHeroes(): TalentContent[] {
  return allHeroes().flatMap((t) => talentsForHero(t));
}

export function talentsForHero(hero: Hero): TalentContent[] {
  return Object.entries(hero.talents)
    .filter(([, level]) => level > 0)
    .map(([talentId]) => getEntry<TalentContent>(talentId))
    .filter((talent): talent is TalentContent => !!talent);
}

export function talentRespec(hero: Hero): void {
  heroUpdateData(hero.id, {
    talents: {},
  });
}

export function talentIdsInTalentTree(
  talentTree: TalentTreeContent,
): TalentId[] {
  return talentTree.talents.flatMap((m) =>
    m.learnableTalents.flatMap((t) => t.talentId),
  );
}

export function talentCombineIntoCombatStats(
  talents: TalentContent[],
): CombatantCombatStats {
  const defaults = defaultCombatStats();

  talents.forEach((tal) => {
    Object.keys(tal.combatStats).forEach((keyRef) => {
      const statKey = keyRef as keyof CombatantCombatStats;
      const val = tal.combatStats[statKey];

      if (isNumber(val)) {
        (defaults[statKey] as number) += val;
      }

      if (isObject(val)) {
        Object.keys(val).forEach((valKeyRef) => {
          const valKey = valKeyRef as keyof ElementBlock;
          (defaults[statKey] as ElementBlock)[valKey] += (val as ElementBlock)[
            valKey
          ];
        });
      }
    });
  });

  return defaults;
}

// filtering down to specific applications
export function talentsForSkill(
  talents: TalentContent[],
  skill: EquipmentSkill,
): TalentContent[] {
  const skillContentId = droppableGetBaseId(skill);
  const skillElements = uniq(skill.techniques.flatMap((t) => t.elements));
  const skillAttributes = uniq(skill.techniques.flatMap((t) => t.attributes));
  const skillStatusEffects = uniq(
    skill.techniques.flatMap((t) =>
      t.statusEffects.flatMap((s) => s.statusEffectId),
    ),
  );

  return talents.filter((t) => {
    if (t.applyToAllSkills) return true;

    if (
      t.applyToSkillIds.length > 0 &&
      !t.applyToSkillIds.includes(skillContentId)
    )
      return false;

    if (
      t.applyToElements.length > 0 &&
      intersection(t.applyToElements, skillElements).length === 0
    )
      return false;

    if (
      t.applyToAttributes.length > 0 &&
      intersection(t.applyToAttributes, skillAttributes).length === 0
    )
      return false;

    if (
      t.applyToStatusEffectIds.length > 0 &&
      intersection(t.applyToStatusEffectIds, skillStatusEffects).length === 0
    )
      return false;

    return true;
  });
}

export function talentsForSkillTechnique(
  talents: TalentContent[],
  skill: EquipmentSkill,
  technique: EquipmentSkillContentTechnique,
): TalentContent[] {
  return talentsForSkill(talents, skill).filter((t) => {
    if (
      t.applyToElements.length > 0 &&
      intersection(t.applyToElements, technique.elements).length === 0
    )
      return false;

    if (
      t.applyToAttributes.length > 0 &&
      intersection(t.applyToAttributes, technique.attributes).length === 0
    )
      return false;

    if (
      t.applyToStatusEffectIds.length > 0 &&
      intersection(
        t.applyToStatusEffectIds,
        technique.statusEffects.map((s) => s.statusEffectId),
      ).length === 0
    )
      return false;

    return true;
  });
}

export function talentsForStatusEffect(
  talents: TalentContent[],
  skill: EquipmentSkill,
  statusEffect: StatusEffectContent,
): TalentContent[] {
  return talentsForSkill(talents, skill).filter(
    (t) =>
      t.applyToAllStatusEffects ||
      t.applyToStatusEffectIds.includes(statusEffect.id),
  );
}

// getting specific data
function talentPropTotal(
  talents: TalentContent[],
  prop: keyof TalentContent,
): number {
  return sum(talents.map((t) => t[prop] ?? 0));
}

function talentPropDrillTotal(
  talents: TalentContent[],
  prop: 'boostStats' | 'boostStatusEffectStats',
  drill: keyof StatBlock,
): number {
  return sum(talents.map((t) => t[prop]?.[drill] ?? 0));
}

export function talentStatusEffectStatBoost(
  talents: TalentContent[],
  skill: EquipmentSkill,
  effect: StatusEffectContent,
  stat: GameStat,
): number {
  return talentPropDrillTotal(
    talentsForStatusEffect(talents, skill, effect),
    'boostStatusEffectStats',
    stat,
  );
}

export function talentStatusEffectChanceBoost(
  talents: TalentContent[],
  skill: EquipmentSkill,
  effect: StatusEffectContent,
): number {
  return talentPropTotal(
    talentsForStatusEffect(talents, skill, effect),
    'boostedStatusEffectChance',
  );
}

export function talentStatusEffectDurationBoost(
  talents: TalentContent[],
  skill: EquipmentSkill,
  effect: StatusEffectContent,
): number {
  return talentPropTotal(
    talentsForStatusEffect(talents, skill, effect),
    'boostedStatusEffectDuration',
  );
}

export function talentTargetCountBoost(
  talents: TalentContent[],
  skill: EquipmentSkill,
): number {
  return talentPropTotal(talentsForSkill(talents, skill), 'additionalTargets');
}

export function talentIgnoreConsumptionChance(
  talents: TalentContent[],
  skill: EquipmentSkill,
): number {
  return talentPropTotal(
    talentsForSkill(talents, skill),
    'chanceToIgnoreConsume',
  );
}

export function talentTechniqueAddedStatusEffects(
  talents: TalentContent[],
  skill: EquipmentSkill,
  technique: EquipmentSkillContentTechnique,
): EquipmentSkillTechniqueStatusEffectApplication[] {
  return talentsForSkillTechnique(talents, skill, technique).flatMap(
    (t) => t.applyStatusEffects,
  );
}

export function talentTechniqueAddedStats(
  talents: TalentContent[],
  skill: EquipmentSkill,
  technique: EquipmentSkillContentTechnique,
  stat: GameStat,
): number {
  return talentPropDrillTotal(
    talentsForSkillTechnique(talents, skill, technique),
    'boostStats',
    stat,
  );
}

export function talentAddedTechniques(
  talents: TalentContent[],
  skill: EquipmentSkill,
): EquipmentSkillContentTechnique[] {
  return talentsForSkill(talents, skill).flatMap((t) => t.addTechniques);
}

function talentTownStatTotal(
  talents: TalentContent[],
  stat: keyof TalentTownStats,
): number {
  return sumBy(talents, (t) => t.townStats[stat] ?? 0);
}

export function talentTownStatTotalForAllHeroes(
  stat: keyof TalentTownStats,
): number {
  return talentTownStatTotal(talentsForAllHeroes(), stat);
}
