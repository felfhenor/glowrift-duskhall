import { getDefaultAffinities, getDefaultStats } from '@helpers/defaults';
import {
  Content,
  ContentType,
  CurrencyContent,
  EquipmentItemContent,
  EquipmentItemId,
  EquipmentSkillContent,
  EquipmentSkillContentTechnique,
  EquipmentSkillId,
  FestivalContent,
  GuardianContent,
  GuardianId,
  TalentContent,
  TalentId,
  TalentTreeContent,
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
  talent: ensureTalent,
  talenttree: ensureTalentTree,
  worldconfig: ensureWorldConfig,
};

export function ensureContent<T extends Content>(content: T): T {
  return initializers[content.__type](content) satisfies T;
}

export function ensureWorldConfig(
  worldConfig: WorldConfigContent,
): Required<WorldConfigContent> {
  return {
    ...worldConfig,
  };
}

export function ensureCurrency(currency: CurrencyContent): CurrencyContent {
  return {
    ...currency,
  };
}

export function ensureGuardian(
  guardian: Partial<GuardianContent>,
): Required<GuardianContent> {
  return {
    id: guardian.id ?? ('UNKNOWN' as GuardianId),
    name: guardian.name ?? 'UNKNOWN',
    __type: guardian.__type ?? 'guardian',
    frames: guardian.frames ?? 1,
    sprite: guardian.sprite ?? '0000',

    statScaling: Object.assign({}, getDefaultStats(), guardian.statScaling),
    skillIds: guardian.skillIds ?? [],
    resistance: Object.assign(
      {},
      getDefaultAffinities(),
      guardian.resistance ?? {},
    ),
    affinity: Object.assign(
      {},
      getDefaultAffinities(),
      guardian.affinity ?? {},
    ),
    talentIds: guardian.talentIds ?? {},
  };
}

export function ensureSkill(
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
          combatMessage: tech.combatMessage ?? 'UNKNOWN',
          damageScaling: Object.assign(
            {},
            getDefaultStats(),
            tech.damageScaling,
          ),
        };

        return techReq;
      },
    ),
  };
}

export function ensureItem(
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

    baseStats: Object.assign({}, getDefaultStats(), item.baseStats ?? {}),
  };
}

export function ensureFestival(
  festival: FestivalContent,
): Required<FestivalContent> {
  return {
    ...festival,
  };
}

export function ensureTalent(
  talent: Partial<TalentContent>,
): Required<TalentContent> {
  return {
    id: talent.id ?? ('UNKNOWN' as TalentId),
    name: talent.name ?? 'UNKNOWN',
    description: talent.description ?? 'UNKNOWN',
    __type: talent.__type ?? 'trinket',
    sprite: talent.sprite ?? '0000',

    requireTalentId: talent.requireTalentId ?? '',

    boostedElements: talent.boostedElements ?? [],
    boostedSkillIds: talent.boostedSkillIds ?? [],
    boostStats: talent.boostStats ?? getDefaultStats(),
  };
}

export function ensureTalentTree(
  tree: TalentTreeContent,
): Required<TalentTreeContent> {
  return {
    ...tree,
  };
}
