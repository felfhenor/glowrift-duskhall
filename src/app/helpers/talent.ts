import { getEntry } from '@helpers/content';
import { getDroppableEquippableBaseId } from '@helpers/droppable';
import type { EquipmentSkill } from '@interfaces/content-skill';
import type { StatusEffectContent } from '@interfaces/content-statuseffect';
import type { TalentContent } from '@interfaces/content-talent';
import type { Hero } from '@interfaces/hero';
import type { GameStat, StatBlock } from '@interfaces/stat';
import { intersection, sum, union, uniq } from 'es-toolkit/compat';

export function allHeroTalents(hero: Hero): TalentContent[] {
  return Object.entries(hero.talents)
    .filter(([, level]) => level > 0)
    .map(([talentId]) => getEntry<TalentContent>(talentId))
    .filter((talent): talent is TalentContent => !!talent);
}

// filtering down to specific applications
export function talentsForSkill(
  talents: TalentContent[],
  skill: EquipmentSkill,
): TalentContent[] {
  const skillContentId = getDroppableEquippableBaseId(skill);
  const skillElements = uniq(skill.techniques.flatMap((t) => t.elements));

  const appliesToAll = talents.filter((t) => t.applyToAllSkills);
  const appliesDirectlyToSkill = talents.filter((t) =>
    t.applyToSkillIds?.includes(skillContentId),
  );
  const appliesBasedOnElement = talents.filter(
    (t) => intersection(t.applyToElements, skillElements).length > 0,
  );

  return union(appliesToAll, appliesDirectlyToSkill, appliesBasedOnElement);
}

export function talentsForStatusEffect(
  talents: TalentContent[],
  skill: EquipmentSkill,
  statusEffect: StatusEffectContent,
): TalentContent[] {
  return talentsForSkill(talents, skill).filter((t) =>
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

export function talentStatBoost(
  talents: TalentContent[],
  skill: EquipmentSkill,
  stat: GameStat,
): number {
  return talentPropDrillTotal(
    talentsForSkill(talents, skill),
    'boostStats',
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
