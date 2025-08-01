import { getEntry } from '@helpers/content';
import { hasCurrencies, loseCurrencies } from '@helpers/currency';
import { getDefaultCurrencyBlock, getDefaultStats } from '@helpers/defaults';
import { getDroppableEquippableBaseId } from '@helpers/droppable';
import { randomChoiceByRarity, seededrng } from '@helpers/rng';
import { getSkillEnchantLevel } from '@helpers/skill';
import { updateGamestate } from '@helpers/state-game';
import { getBuildingLevel } from '@helpers/town';
import type { EquipmentSkill } from '@interfaces/content-skill';
import type {
  StatusEffectContent,
  StatusEffectId,
} from '@interfaces/content-statuseffect';
import type { GameStat } from '@interfaces/stat';
import type { AcademyEnchant } from '@interfaces/town';
import { cloneDeep, uniq } from 'es-toolkit/compat';

export function academyCanEnchantSkill(item: EquipmentSkill): boolean {
  return getSkillEnchantLevel(item) < getBuildingLevel('Academy');
}
export function academyNextSkillEnchants(
  skill: EquipmentSkill,
): AcademyEnchant[] {
  const level = getSkillEnchantLevel(skill);

  const usableElements = uniq(skill.techniques.flatMap((t) => t.elements));
  const usableStats = uniq(
    skill.techniques.flatMap((t) =>
      Object.keys(t.damageScaling).filter(
        (s) => t.damageScaling[s as GameStat] > 0,
      ),
    ),
  );
  const usableStatusEffects = uniq(
    skill.techniques.flatMap((t) =>
      t.statusEffects.map((s) => s.statusEffectId),
    ),
  );

  const adjustByLevel = (num: number, delta = 0) => (level + 1 + delta) * num;

  const validPaths: AcademyEnchant[] = [
    {
      description: '+1 Combat Uses',
      rarity: 'Rare',
      cost: {
        ...getDefaultCurrencyBlock(),
        'Soul Essence': adjustByLevel(100),
      },
      damageScaling: getDefaultStats(),
      usesPerCombat: 1,
    },
    {
      description: '+2 Combat Uses',
      rarity: 'Mystical',
      cost: {
        ...getDefaultCurrencyBlock(),
        'Soul Essence': adjustByLevel(300),
      },
      usesPerCombat: 2,
    },
    {
      description: '+3 Combat Uses',
      rarity: 'Legendary',
      cost: {
        ...getDefaultCurrencyBlock(),
        'Soul Essence': adjustByLevel(500),
      },
      usesPerCombat: 3,
    },
    {
      description: '+1 Target',
      rarity: 'Uncommon',
      cost: {
        ...getDefaultCurrencyBlock(),
        'Soul Essence': adjustByLevel(500),
      },
      numTargets: 1,
    },
    {
      description: '+2 Targets',
      rarity: 'Mystical',
      cost: {
        ...getDefaultCurrencyBlock(),
        'Soul Essence': adjustByLevel(1500),
      },
      numTargets: 2,
    },
  ];

  usableStats.forEach((stat) => {
    validPaths.push({
      description: `+0.05 ${stat}`,
      rarity: 'Common',
      cost: {
        ...getDefaultCurrencyBlock(),
        'Soul Essence': adjustByLevel(100),
      },
      damageScaling: {
        ...getDefaultStats(),
        [stat]: 0.05,
      },
    });

    validPaths.push({
      description: `+0.10 ${stat}`,
      rarity: 'Rare',
      cost: {
        ...getDefaultCurrencyBlock(),
        'Soul Essence': adjustByLevel(100),
      },
      damageScaling: {
        ...getDefaultStats(),
        [stat]: 0.1,
      },
    });
  });

  usableStatusEffects.forEach((statusEffectId) => {
    const statusEffect = getEntry<StatusEffectContent>(statusEffectId);
    if (!statusEffect) return;

    validPaths.push({
      description: `+1% ${statusEffect.name}`,
      rarity: 'Common',
      cost: {
        ...getDefaultCurrencyBlock(),
        'Soul Essence': adjustByLevel(300),
      },
      statusEffectChanceBoost: {
        [statusEffectId]: 1,
      },
    });

    validPaths.push({
      description: `+2% ${statusEffect.name}`,
      rarity: 'Rare',
      cost: {
        ...getDefaultCurrencyBlock(),
        'Soul Essence': adjustByLevel(500),
      },
      statusEffectChanceBoost: {
        [statusEffectId]: 2,
      },
    });

    validPaths.push({
      description: `+1 ${statusEffect.name} Turn`,
      rarity: 'Uncommon',
      cost: {
        ...getDefaultCurrencyBlock(),
        'Soul Essence': adjustByLevel(500),
      },
      statusEffectDurationBoost: {
        [statusEffectId]: 1,
      },
    });

    validPaths.push({
      description: `+1%/Turn ${statusEffect.name}`,
      rarity: 'Rare',
      cost: {
        ...getDefaultCurrencyBlock(),
        'Soul Essence': adjustByLevel(1500),
      },
      statusEffectChanceBoost: {
        [statusEffectId]: 1,
      },
      statusEffectDurationBoost: {
        [statusEffectId]: 1,
      },
    });
  });

  validPaths.forEach((path) => {
    usableElements.forEach((el) => {
      path.cost[`${el} Sliver`] = adjustByLevel(100);

      if (level >= 20) {
        path.cost[`${el} Shard`] = adjustByLevel(50, -20);
      }

      if (level >= 50) {
        path.cost[`${el} Crystal`] = adjustByLevel(10, -50);
      }
    });
  });

  const filteredPaths = validPaths.filter((path) =>
    skill.unableToUpgrade.every((k) => !path[k]),
  );

  const seed = `${getDroppableEquippableBaseId(skill)}-${level}`;
  const rng = seededrng(seed);

  return [
    randomChoiceByRarity(filteredPaths, rng)!,
    randomChoiceByRarity(filteredPaths, rng)!,
    randomChoiceByRarity(filteredPaths, rng)!,
  ];
}

export function academyEnchantSkill(
  skill: EquipmentSkill,
  enchant: AcademyEnchant,
): void {
  if (!hasCurrencies(enchant.cost)) return;

  loseCurrencies(enchant.cost);

  skill.mods ??= {};
  skill.mods.enchantLevel ??= 0;
  skill.mods.numTargets ??= 0;
  skill.mods.usesPerCombat ??= 0;
  skill.mods.damageScaling ??= getDefaultStats();
  skill.mods.statusEffectChanceBoost ??= {};
  skill.mods.statusEffectDurationBoost ??= {};

  skill.mods.enchantLevel += 1;

  if (enchant.numTargets) {
    skill.mods.numTargets += enchant.numTargets;
  }

  if (enchant.usesPerCombat) {
    skill.mods.usesPerCombat += enchant.usesPerCombat;
  }

  const damageScaling = enchant.damageScaling;
  if (damageScaling) {
    Object.keys(damageScaling).forEach((scaleStat) => {
      skill.mods!.damageScaling![scaleStat as GameStat] ??= 0;
      skill.mods!.damageScaling![scaleStat as GameStat] +=
        damageScaling[scaleStat as GameStat];
    });
  }

  const statusEffectChanceBoost = enchant.statusEffectChanceBoost;
  if (statusEffectChanceBoost) {
    Object.keys(statusEffectChanceBoost).forEach((statusEffectId) => {
      skill.mods!.statusEffectChanceBoost![statusEffectId as StatusEffectId] ??=
        0;
      skill.mods!.statusEffectChanceBoost![statusEffectId as StatusEffectId] +=
        statusEffectChanceBoost[statusEffectId as StatusEffectId];
    });
  }

  const statusEffectDurationBoost = enchant.statusEffectDurationBoost;
  if (statusEffectDurationBoost) {
    Object.keys(statusEffectDurationBoost).forEach((statusEffectId) => {
      skill.mods!.statusEffectDurationBoost![
        statusEffectId as StatusEffectId
      ] ??= 0;
      skill.mods!.statusEffectDurationBoost![
        statusEffectId as StatusEffectId
      ] += statusEffectDurationBoost[statusEffectId as StatusEffectId];
    });
  }

  updateGamestate((state) => {
    const updateSkill = state.inventory.skills.find((i) => i.id === skill.id);
    if (!updateSkill) return state;

    updateSkill.mods = cloneDeep(skill.mods);

    return state;
  });
}
