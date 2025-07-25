import { getDefaultAffinities, getDefaultStats } from '@helpers/defaults';
import type {
  ContentType,
  CurrencyContent,
  ElementBlock,
  EquipmentElement,
  EquipmentItemContent,
  EquipmentItemId,
  EquipmentSkillContent,
  EquipmentSkillContentTechnique,
  EquipmentSkillId,
  FestivalContent,
  GuardianContent,
  GuardianId,
  IsContentItem,
  StatBlock,
  StatusEffectContent,
  StatusEffectId,
  TalentContent,
  TalentId,
  TalentTreeContent,
  TraitEquipmentContent,
  TraitEquipmentId,
  WorldConfigContent,
} from '@interfaces';

// eat my ass, typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const initializers: Record<ContentType, (entry: any) => any> = {
  accessory: ensureItem,
  armor: ensureItem,
  trinket: ensureItem,
  weapon: ensureItem,
  currency: ensureCurrency,
  festival: ensureFestival,
  guardian: ensureGuardian,
  skill: ensureSkill,
  statuseffect: ensureStatusEffect,
  talent: ensureTalent,
  talenttree: ensureTalentTree,
  traitequipment: ensureTraitEquipment,
  worldconfig: ensureWorldConfig,
};

function ensureStats(statblock: Partial<StatBlock> = {}): Required<StatBlock> {
  return Object.assign({}, getDefaultStats(), statblock);
}

function ensureAffinities(
  elementblock: Partial<ElementBlock> = {},
): Required<ElementBlock> {
  return Object.assign({}, getDefaultAffinities(), elementblock);
}

function ensureEquipmentElement(
  el: Partial<EquipmentElement>,
): Required<EquipmentElement> {
  return {
    element: el.element ?? 'Fire',
    multiplier: el.multiplier ?? 0,
  };
}

export function ensureContent<T extends IsContentItem>(content: T): T {
  return initializers[content.__type](content) satisfies T;
}

function ensureWorldConfig(
  worldConfig: WorldConfigContent,
): Required<WorldConfigContent> {
  return {
    ...worldConfig,
  };
}

function ensureCurrency(currency: CurrencyContent): CurrencyContent {
  return {
    ...currency,
  };
}

function ensureGuardian(
  guardian: Partial<GuardianContent>,
): Required<GuardianContent> {
  return {
    id: guardian.id ?? ('UNKNOWN' as GuardianId),
    name: guardian.name ?? 'UNKNOWN',
    __type: guardian.__type ?? 'guardian',
    frames: guardian.frames ?? 1,
    sprite: guardian.sprite ?? '0000',

    targettingType: guardian.targettingType ?? 'Random',

    statScaling: ensureStats(guardian.statScaling),
    skillIds: guardian.skillIds ?? [],
    resistance: ensureAffinities(guardian.resistance),
    affinity: ensureAffinities(guardian.affinity),
    talentIds: guardian.talentIds ?? {},
  };
}

function ensureSkill(
  skill: EquipmentSkillContent,
): Required<EquipmentSkillContent> {
  return {
    id: skill.id ?? ('UNKNOWN' as EquipmentSkillId),
    name: skill.name ?? 'UNKNOWN',
    __type: skill.__type ?? 'skill',
    sprite: skill.sprite ?? '0000',
    frames: skill.frames ?? 1,
    rarity: skill.rarity ?? 'Common',
    dropLevel: skill.dropLevel ?? 0,
    preventDrop: skill.preventDrop ?? false,
    preventModification: skill.preventModification ?? false,
    usesPerCombat: skill.usesPerCombat ?? -1,
    techniques: (skill.techniques ?? []).map(
      (tech: Partial<EquipmentSkillContentTechnique>) => {
        const techReq: Required<EquipmentSkillContentTechnique> = {
          attributes: tech.attributes ?? [],
          elements: tech.elements ?? [],
          targets: tech.targets ?? 1,
          targetType: tech.targetType ?? 'Enemies',
          targetBehaviors: tech.targetBehaviors ?? [
            { behavior: 'NotZeroHealth' },
          ],
          statusEffects: tech.statusEffects ?? [],
          combatMessage: tech.combatMessage ?? 'UNKNOWN',
          damageScaling: ensureStats(tech.damageScaling),
        };

        return techReq;
      },
    ),
  };
}

function ensureItem(
  item: Partial<EquipmentItemContent>,
): Required<EquipmentItemContent> {
  return {
    id: item.id ?? ('UNKNOWN' as EquipmentItemId),
    name: item.name ?? 'UNKNOWN',
    __type: item.__type ?? 'trinket',
    sprite: item.sprite ?? '0000',
    rarity: item.rarity ?? 'Common',
    dropLevel: item.dropLevel ?? 0,
    preventDrop: item.preventDrop ?? false,
    preventModification: item.preventModification ?? false,

    baseStats: ensureStats(item.baseStats),
    talentBoosts: item.talentBoosts ?? [],
    elementMultipliers: (item.elementMultipliers ?? []).map(
      ensureEquipmentElement,
    ),
    traitIds: item.traitIds ?? [],
    skillIds: item.skillIds ?? [],
  };
}

function ensureFestival(festival: FestivalContent): Required<FestivalContent> {
  return {
    ...festival,
  };
}

function ensureTalent(talent: Partial<TalentContent>): Required<TalentContent> {
  return {
    id: talent.id ?? ('UNKNOWN' as TalentId),
    name: talent.name ?? 'UNKNOWN',
    description: talent.description ?? 'UNKNOWN',
    __type: talent.__type ?? 'trinket',
    sprite: talent.sprite ?? '0000',

    requireTalentId: talent.requireTalentId ?? '',

    boostedElements: talent.boostedElements ?? [],
    boostedSkillIds: talent.boostedSkillIds ?? [],
    boostStats: ensureStats(talent.boostStats),

    boostedStatusEffectChance: talent.boostedStatusEffectChance ?? 0,
    boostedStatusEffectIds: talent.boostedStatusEffectIds ?? [],
    boostStatusEffectStats: ensureStats(talent.boostStatusEffectStats),
  };
}

function ensureTalentTree(
  tree: TalentTreeContent,
): Required<TalentTreeContent> {
  return {
    ...tree,
  };
}

function ensureStatusEffect(
  statusEffect: Partial<StatusEffectContent>,
): Required<StatusEffectContent> {
  return {
    id: statusEffect.id ?? ('UNKNOWN' as StatusEffectId),
    name: statusEffect.name ?? 'UNKNOWN',
    __type: statusEffect.__type ?? 'statuseffect',
    trigger: statusEffect.trigger ?? 'TurnEnd',
    onApply: statusEffect.onApply ?? [],
    onTick: statusEffect.onTick ?? [],
    onUnapply: statusEffect.onUnapply ?? [],
    statScaling: ensureStats(statusEffect.statScaling),
  };
}

function ensureTraitEquipment(
  traitEquipment: Partial<TraitEquipmentContent>,
): Required<TraitEquipmentContent> {
  return {
    id: traitEquipment.id ?? ('UNKNOWN' as TraitEquipmentId),
    name: traitEquipment.name ?? 'UNKNOWN',
    __type: 'traitequipment',
    rarity: traitEquipment.rarity ?? 'Common',
    baseStats: ensureStats(traitEquipment.baseStats),
    elementMultipliers: (traitEquipment.elementMultipliers ?? []).map(
      ensureEquipmentElement,
    ),
    skillIds: traitEquipment.skillIds ?? [],
    traitIds: traitEquipment.traitIds ?? [],
    talentBoosts: traitEquipment.talentBoosts ?? [],
  };
}
