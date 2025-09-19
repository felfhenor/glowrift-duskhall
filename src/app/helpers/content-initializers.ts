import {
  defaultAffinities,
  defaultCurrencyBlock,
  defaultStats,
} from '@helpers/defaults';
import type {
  CameoContent,
  CombatantCombatStats,
  ContentType,
  CurrencyBlock,
  CurrencyContent,
  DuskmoteBundleContent,
  DuskmoteBundleId,
  ElementBlock,
  EquipmentElement,
  EquipmentItemContent,
  EquipmentItemId,
  EquipmentSkillContent,
  EquipmentSkillContentTechnique,
  EquipmentSkillId,
  EquipmentSkillTechniqueStatusEffectApplication,
  FestivalContent,
  GuardianContent,
  GuardianId,
  HelpContent,
  IsContentItem,
  JobContent,
  JobId,
  LocationUpgradeContent,
  LocationUpgradeId,
  StatBlock,
  StatusEffectContent,
  StatusEffectId,
  TalentBoost,
  TalentContent,
  TalentId,
  TalentTownStats,
  TalentTreeContent,
  TownUpgradeContent,
  TownUpgradeId,
  TraitEquipmentContent,
  TraitEquipmentId,
  TraitLocationContent,
  TraitLocationId,
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
  townupgrade: ensureTownUpgrade,
  locationupgrade: ensureLocationUpgrade,
  traitequipment: ensureTraitEquipment,
  traitlocation: ensureTraitLocation,
  worldconfig: ensureWorldConfig,
  help: ensureHelp,
  cameo: ensureCameo,
  job: ensureJob,
  duskmotebundle: ensureDuskmoteBundle,
};

function ensureStats(statblock: Partial<StatBlock> = {}): Required<StatBlock> {
  return Object.assign({}, defaultStats(), statblock);
}

function ensureAffinities(
  elementblock: Partial<ElementBlock> = {},
): Required<ElementBlock> {
  return Object.assign({}, defaultAffinities(), elementblock);
}

function ensureCurrencies(
  currencies: Partial<CurrencyBlock> = {},
): Required<CurrencyBlock> {
  return Object.assign({}, defaultCurrencyBlock(), currencies);
}

function ensureEquipmentElement(
  el: Partial<EquipmentElement>,
): Required<EquipmentElement> {
  return {
    element: el.element ?? 'Fire',
    multiplier: el.multiplier ?? 0,
  };
}

function ensureTechnique(
  tech: Partial<EquipmentSkillContentTechnique>,
): Required<EquipmentSkillContentTechnique> {
  return {
    attributes: tech.attributes ?? [],
    elements: tech.elements ?? [],
    targets: tech.targets ?? 1,
    targetType: tech.targetType ?? 'Enemies',
    targetBehaviors: tech.targetBehaviors ?? [{ behavior: 'NotZeroHealth' }],
    statusEffects: (tech.statusEffects ?? []).map(ensureTechniqueStatusEffect),
    combatMessage: tech.combatMessage ?? '',
    damageScaling: ensureStats(tech.damageScaling),
  };
}

function ensureTechniqueStatusEffect(
  tech: Partial<EquipmentSkillTechniqueStatusEffectApplication>,
): Required<EquipmentSkillTechniqueStatusEffectApplication> {
  return {
    chance: tech.chance ?? 0,
    duration: tech.duration ?? 0,
    statusEffectId: tech.statusEffectId ?? ('UNKNOWN' as StatusEffectId),
  };
}

function ensureTalentBoost(boost: Partial<TalentBoost>): Required<TalentBoost> {
  return {
    talentId: boost.talentId ?? ('UNKNOWN' as TalentId),
    value: boost.value ?? 0,
  };
}

function ensureCombatStats(
  combatStats: Partial<CombatantCombatStats> = {},
): Required<CombatantCombatStats> {
  return {
    repeatActionChance: ensureAffinities(combatStats.repeatActionChance),
    skillStrikeAgainChance: ensureAffinities(
      combatStats.skillStrikeAgainChance,
    ),
    skillAdditionalUseChance: ensureAffinities(
      combatStats.skillAdditionalUseChance,
    ),
    skillAdditionalUseCount: ensureAffinities(
      combatStats.skillAdditionalUseCount,
    ),
    redirectionChance: ensureAffinities(combatStats.redirectionChance),
    missChance: ensureAffinities(combatStats.missChance),
    debuffIgnoreChance: ensureAffinities(combatStats.debuffIgnoreChance),
    damageReflectPercent: ensureAffinities(combatStats.damageReflectPercent),
    healingIgnorePercent: ensureAffinities(
      combatStats.healingIgnorePercent ?? {},
    ),
    reviveChance: combatStats.reviveChance ?? 0,
  };
}

export function ensureContent<T extends IsContentItem>(content: T): T {
  return initializers[content.__type](content) satisfies T;
}

function ensureWorldConfig(
  worldConfig: WorldConfigContent,
): Required<WorldConfigContent> {
  return {
    id: worldConfig.id ?? 'UNKNOWN',
    name: worldConfig.name ?? 'UNKNOWN',
    __type: 'worldconfig',
    height: worldConfig.height ?? 50,
    width: worldConfig.width ?? 50,
    maxLevel: worldConfig.maxLevel ?? 25,
    duskmoteMultiplier: worldConfig.duskmoteMultiplier ?? 1,
    nodeCount: {
      castle: worldConfig.nodeCount?.castle ?? { min: 1, max: 10 },
      cave: worldConfig.nodeCount?.cave ?? { min: 1, max: 10 },
      dungeon: worldConfig.nodeCount?.dungeon ?? { min: 1, max: 10 },
      town: worldConfig.nodeCount?.town ?? { min: 1, max: 2 },
      village: worldConfig.nodeCount?.village ?? { min: 1, max: 3 },
    },
  };
}

function ensureCurrency(currency: CurrencyContent): CurrencyContent {
  return {
    __type: 'currency',
    id: currency.id ?? 'UNKNOWN',
    name: currency.name ?? 'UNKNOWN',
    value: currency.value ?? 0,
    element: currency.element,
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

    minLevel: guardian.minLevel ?? 1,

    targettingType: guardian.targettingType ?? 'Random',

    statScaling: ensureStats(guardian.statScaling),
    skillIds: guardian.skillIds ?? [],
    resistance: ensureAffinities(guardian.resistance),
    affinity: ensureAffinities(guardian.affinity),
    talents: (guardian.talents ?? []).map(ensureTalentBoost),

    combatStats: ensureCombatStats(guardian.combatStats),
  };
}

function ensureSkill(
  skill: EquipmentSkillContent,
): Required<EquipmentSkillContent> {
  return {
    id: skill.id ?? ('UNKNOWN' as EquipmentSkillId),
    name: skill.name ?? 'UNKNOWN',
    description: skill.description ?? '',
    __type: skill.__type ?? 'skill',
    disableUpgrades: skill.disableUpgrades ?? false,
    unableToUpgrade: skill.unableToUpgrade ?? [],
    sprite: skill.sprite ?? '0000',
    frames: skill.frames ?? 1,
    rarity: skill.rarity ?? 'Common',
    enchantLevel: skill.enchantLevel ?? 0,
    dropLevel: skill.dropLevel ?? 0,
    preventDrop: skill.preventDrop ?? false,
    preventModification: skill.preventModification ?? false,
    isFavorite: skill.isFavorite ?? false,
    usesPerCombat: skill.usesPerCombat ?? -1,
    numTargets: skill.numTargets ?? 0,
    damageScaling: ensureStats(skill.damageScaling),
    statusEffectChanceBoost: skill.statusEffectChanceBoost ?? {},
    statusEffectDurationBoost: skill.statusEffectDurationBoost ?? {},
    techniques: (skill.techniques ?? []).map(ensureTechnique),
    symmetryCount: skill.symmetryCount ?? 0,
    duskmoteBundleId: skill.duskmoteBundleId ?? ('' as DuskmoteBundleId),
  };
}

function ensureItem(
  item: Partial<EquipmentItemContent>,
): Required<EquipmentItemContent> {
  return {
    id: item.id ?? ('UNKNOWN' as EquipmentItemId),
    name: item.name ?? 'UNKNOWN',
    description: item.description ?? '',
    __type: item.__type ?? 'trinket',
    unableToUpgrade: item.unableToUpgrade ?? [],
    sprite: item.sprite ?? '0000',
    rarity: item.rarity ?? 'Common',
    dropLevel: item.dropLevel ?? 0,
    preventDrop: item.preventDrop ?? false,
    preventModification: item.preventModification ?? false,
    isFavorite: item.isFavorite ?? false,

    enchantLevel: item.enchantLevel ?? 0,
    baseStats: ensureStats(item.baseStats),
    talentBoosts: (item.talentBoosts ?? []).map(ensureTalentBoost),
    elementMultipliers: (item.elementMultipliers ?? []).map(
      ensureEquipmentElement,
    ),
    traitIds: item.traitIds ?? [],
    skillIds: item.skillIds ?? [],
    symmetryCount: item.symmetryCount ?? 0,
    duskmoteBundleId: item.duskmoteBundleId ?? ('' as DuskmoteBundleId),
  };
}

function ensureFestival(festival: FestivalContent): Required<FestivalContent> {
  return {
    ...festival,
  };
}

function ensureTraitLocation(
  trait: TraitLocationContent,
): Required<TraitLocationContent> {
  return {
    __type: 'traitlocation',
    id: trait.id ?? ('UNKNOWN' as TraitLocationId),
    name: trait.name ?? 'UNKNOWN',
    description: trait.description ?? 'UNKNOWN',
    effects: trait.effects ?? {},
    rarity: trait.rarity ?? 'Common',
  };
}

function ensureTalentTownStats(
  townStats: Partial<TalentTownStats>,
): Required<TalentTownStats> {
  return {
    merchantFindItemBonus: townStats.merchantFindItemBonus ?? 0,
    marketTradeBonusPercent: townStats.marketTradeBonusPercent ?? 0,
    breakdownCurrencyBonus: townStats.breakdownCurrencyBonus ?? 0,
    healOverTimeBonus: townStats.healOverTimeBonus ?? 0,
  };
}

function ensureTalent(talent: Partial<TalentContent>): Required<TalentContent> {
  return {
    id: talent.id ?? ('UNKNOWN' as TalentId),
    name: talent.name ?? 'UNKNOWN',
    description: talent.description ?? 'UNKNOWN',
    __type: talent.__type ?? 'trinket',
    sprite: talent.sprite ?? '0000',

    requireTalentId: (talent.requireTalentId ?? '') as TalentId,

    applyToAllSkills: talent.applyToAllSkills ?? false,
    applyToAllStatusEffects: talent.applyToAllStatusEffects ?? false,
    applyToElements: talent.applyToElements ?? [],
    applyToSkillIds: talent.applyToSkillIds ?? [],
    applyToAttributes: talent.applyToAttributes ?? [],
    boostStats: ensureStats(talent.boostStats),

    boostedStatusEffectChance: talent.boostedStatusEffectChance ?? 0,
    boostedStatusEffectDuration: talent.boostedStatusEffectDuration ?? 0,
    applyToStatusEffectIds: talent.applyToStatusEffectIds ?? [],
    boostStatusEffectStats: ensureStats(talent.boostStatusEffectStats),

    additionalTargets: talent.additionalTargets ?? 0,

    chanceToIgnoreConsume: talent.chanceToIgnoreConsume ?? 0,

    applyStatusEffects: (talent.applyStatusEffects ?? []).map(
      ensureTechniqueStatusEffect,
    ),

    combatStats: ensureCombatStats(talent.combatStats),

    addTechniques: (talent.addTechniques ?? []).map(ensureTechnique),

    townStats: ensureTalentTownStats(talent.townStats ?? {}),
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
    effectType: statusEffect.effectType ?? 'Buff',
    elements: statusEffect.elements ?? [],
    __type: statusEffect.__type ?? 'statuseffect',
    trigger: statusEffect.trigger ?? 'TurnEnd',
    onApply: statusEffect.onApply ?? [],
    onTick: statusEffect.onTick ?? [],
    onUnapply: statusEffect.onUnapply ?? [],
    statScaling: ensureStats(statusEffect.statScaling),
    useTargetStats: statusEffect.useTargetStats ?? false,
  };
}

function ensureTraitEquipment(
  traitEquipment: Partial<TraitEquipmentContent>,
): Required<TraitEquipmentContent> {
  return {
    id: traitEquipment.id ?? ('UNKNOWN' as TraitEquipmentId),
    name: traitEquipment.name ?? 'UNKNOWN',
    description: traitEquipment.description ?? 'UNKNOWN',
    __type: 'traitequipment',
    rarity: traitEquipment.rarity ?? 'Common',
    enchantLevel: traitEquipment.enchantLevel ?? 0,
    baseStats: ensureStats(traitEquipment.baseStats),
    elementMultipliers: (traitEquipment.elementMultipliers ?? []).map(
      ensureEquipmentElement,
    ),
    skillIds: traitEquipment.skillIds ?? [],
    traitIds: traitEquipment.traitIds ?? [],
    talentBoosts: (traitEquipment.talentBoosts ?? []).map(ensureTalentBoost),
    symmetryCount: traitEquipment.symmetryCount ?? 0,
  };
}

function ensureTownUpgrade(
  townUpgrade: Partial<TownUpgradeContent>,
): Required<TownUpgradeContent> {
  return {
    id: townUpgrade.id ?? ('UNKNOWN' as TownUpgradeId),
    name: townUpgrade.name ?? 'UNKNOWN',
    description: townUpgrade.description ?? 'UNKNOWN',
    __type: 'townupgrade',
    cost: ensureCurrencies(townUpgrade.cost),
    levelRequirement: townUpgrade.levelRequirement ?? 1,
    appliesToTypes: townUpgrade.appliesToTypes ?? [],
  };
}

function ensureLocationUpgrade(
  locationUpgrade: Partial<LocationUpgradeContent>,
): Required<LocationUpgradeContent> {
  return {
    id: locationUpgrade.id ?? ('UNKNOWN' as LocationUpgradeId),
    name: locationUpgrade.name ?? 'UNKNOWN',
    description: locationUpgrade.description ?? 'UNKNOWN',
    __type: 'locationupgrade',
    requiresTownUpgradeId:
      locationUpgrade.requiresTownUpgradeId ?? ('' as TownUpgradeId),
    pairedLocationUpgradeId:
      locationUpgrade.pairedLocationUpgradeId ?? ('' as LocationUpgradeId),
    requireClaimType: locationUpgrade.requireClaimType ?? '',

    appliesToTypes: locationUpgrade.appliesToTypes ?? [],

    costScalePerTile: locationUpgrade.costScalePerTile ?? 1,
    baseCost: ensureCurrencies(locationUpgrade.baseCost),
    boostedProductionValuePercentPerLevel:
      locationUpgrade.boostedProductionValuePercentPerLevel ?? 0,
    boostedLootLevelPerLevel: locationUpgrade.boostedLootLevelPerLevel ?? 0,
    boostedTicksPerLevel: locationUpgrade.boostedTicksPerLevel ?? 0,
    boostedUnclaimableCount: locationUpgrade.boostedUnclaimableCount ?? 0,
    boostedRebellionPerLevel: locationUpgrade.boostedRebellionPerLevel ?? 0,
    boostedDustProductionPerLevel:
      locationUpgrade.boostedDustProductionPerLevel ?? 0,
  };
}

function ensureJob(job: Partial<JobContent>): Required<JobContent> {
  return {
    id: job.id ?? ('UNKNOWN' as JobId),
    name: job.name ?? 'UNKNOWN',
    description: job.description ?? 'UNKNOWN',
    __type: 'job',
    numSkills: job.numSkills ?? 3,
    defaultSkillIds: job.defaultSkillIds ?? [],
    talentTreeIds: job.talentTreeIds ?? [],

    duskmoteBundleId: job.duskmoteBundleId ?? ('' as DuskmoteBundleId),
  };
}

function ensureHelp(help: Partial<HelpContent>): Required<HelpContent> {
  return {
    id: help.id ?? ('UNKNOWN' as string),
    name: help.name ?? 'UNKNOWN',
    category: help.category ?? 'General',
    description: help.description ?? 'UNKNOWN',
    __type: 'help',
  };
}

function ensureCameo(cameo: Partial<CameoContent>): Required<CameoContent> {
  return {
    id: cameo.id ?? 'UNKNOWN',
    name: cameo.name ?? 'UNKNOWN',
    __type: 'cameo',
    sprite: cameo.sprite ?? '0000',
    contribution: cameo.contribution ?? 'UNKNOWN',
  };
}

function ensureDuskmoteBundle(
  bundle: Partial<DuskmoteBundleContent>,
): Required<DuskmoteBundleContent> {
  return {
    id: bundle.id ?? ('UNKNOWN' as DuskmoteBundleId),
    name: bundle.name ?? 'UNKNOWN',
    description: bundle.description ?? 'UNKNOWN',
    __type: 'duskmotebundle',
    cost: bundle.cost ?? 0,
  };
}
