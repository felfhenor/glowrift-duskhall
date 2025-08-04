import { getEntry } from '@helpers/content';
import { getDefaultCombatStats } from '@helpers/defaults';
import { getDroppableEquippableBaseId } from '@helpers/droppable';
import type { CombatantCombatStats } from '@interfaces/combat';
import type {
  EquipmentSkill,
  EquipmentSkillTechniqueStatusEffectApplication,
} from '@interfaces/content-skill';
import type { StatusEffectContent } from '@interfaces/content-statuseffect';
import type { TalentContent, TalentId } from '@interfaces/content-talent';
import type { TalentTreeContent } from '@interfaces/content-talenttree';
import type { ElementBlock } from '@interfaces/element';
import type { Hero } from '@interfaces/hero';
import type { GameStat, StatBlock } from '@interfaces/stat';
import {
  intersection,
  isNumber,
  isObject,
  sum,
  union,
  uniq,
} from 'es-toolkit/compat';

export function allHeroTalents(hero: Hero): TalentContent[] {
  return Object.entries(hero.talents)
    .filter(([, level]) => level > 0)
    .map(([talentId]) => getEntry<TalentContent>(talentId))
    .filter((talent): talent is TalentContent => !!talent);
}

export function allTalentIdsInTalentTree(
  talentTree: TalentTreeContent,
): TalentId[] {
  return talentTree.talents.flatMap((m) =>
    m.learnableTalents.flatMap((t) => t.talentId),
  );
}

export function combineTalentsIntoCombatStats(
  talents: TalentContent[],
): CombatantCombatStats {
  const defaults = getDefaultCombatStats();

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
  const skillContentId = getDroppableEquippableBaseId(skill);
  const skillElements = uniq(skill.techniques.flatMap((t) => t.elements));
  const skillAttributes = uniq(skill.techniques.flatMap((t) => t.attributes));

  const appliesToAll = talents.filter((t) => t.applyToAllSkills);
  const appliesDirectlyToSkill = talents.filter((t) =>
    t.applyToSkillIds?.includes(skillContentId),
  );
  const appliesBasedOnElement = talents.filter(
    (t) => intersection(t.applyToElements, skillElements).length > 0,
  );
  const appliesBasedOnAttribute = talents.filter(
    (t) => intersection(t.applyToAttributes, skillAttributes).length > 0,
  );

  return union(
    appliesToAll,
    appliesDirectlyToSkill,
    appliesBasedOnElement,
    appliesBasedOnAttribute,
  );
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

export function talentAddedStatusEffects(
  talents: TalentContent[],
  skill: EquipmentSkill,
): EquipmentSkillTechniqueStatusEffectApplication[] {
  return talentsForSkill(talents, skill).flatMap((t) => t.applyStatusEffects);
}
