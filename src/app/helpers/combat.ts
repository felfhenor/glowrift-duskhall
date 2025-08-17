import {
  combatApplySkillToTarget,
  combatCombatantTakeDamage,
} from '@helpers/combat-damage';
import {
  combatantIsDead,
  combatCheckIfOver,
  combatHandleDefeat,
  isCombatOver,
} from '@helpers/combat-end';
import {
  beginCombatLogCommits,
  combatMessageLog,
  endCombatLogCommits,
} from '@helpers/combat-log';
import {
  combatCanTakeTurn,
  combatHandleCombatantStatusEffects,
  combatUnapplyAllStatusEffects,
} from '@helpers/combat-statuseffects';
import {
  combatAvailableSkillsForCombatant,
  combatGetPossibleCombatantTargetsForSkill,
  combatGetPossibleCombatantTargetsForSkillTechnique,
  combatGetTargetsFromListBasedOnType,
} from '@helpers/combat-targetting';
import { getEntry } from '@helpers/content';
import { gamestate, updateGamestate } from '@helpers/state-game';

import { sample, sortBy, sumBy } from 'es-toolkit/compat';

import { combatSkillSucceedsElementCombatStatChance } from '@helpers/combat-stats';
import { rngSucceedsChance } from '@helpers/rng';
import { skillElements, skillTechniqueNumTargets } from '@helpers/skill';
import { talentIgnoreConsumptionChance } from '@helpers/talent';
import type {
  Combat,
  Combatant,
  EquipmentSkill,
  TalentContent,
} from '@interfaces';

type CombatTurnResult = {
  takeAnotherTurn?: boolean;
};

export function currentCombat(): Combat | undefined {
  return gamestate().hero.combat;
}

function orderCombatantsBySpeed(combat: Combat): Combatant[] {
  return sortBy(
    [...combat.guardians, ...combat.heroes],
    (c) => -c.totalStats.Speed,
  );
}

export function combatAllCombatantTalents(
  combatant: Combatant,
): TalentContent[] {
  return Object.entries(combatant.talents)
    .filter(([, level]) => level > 0)
    .flatMap(([talentId, level]) =>
      Array(level).fill(getEntry<TalentContent>(talentId)),
    )
    .filter((talent): talent is TalentContent => !!talent);
}

function combatantMarkSkillUse(
  combatant: Combatant,
  skill: EquipmentSkill,
): void {
  const shouldIgnoreUseChance = talentIgnoreConsumptionChance(
    combatAllCombatantTalents(combatant),
    skill,
  );
  if (rngSucceedsChance(shouldIgnoreUseChance)) return;

  const shouldApplyExtraUses = combatSkillSucceedsElementCombatStatChance(
    skill,
    combatant,
    'skillAdditionalUseChance',
  );

  const extraUses = shouldApplyExtraUses
    ? sumBy(
        skillElements(skill),
        (el) => combatant.combatStats.skillAdditionalUseCount[el],
      )
    : 0;

  combatant.skillUses[skill.id] ??= 0;
  combatant.skillUses[skill.id] += 1 + extraUses;
}

function combatantTakeTurn(
  combat: Combat,
  combatant: Combatant,
): CombatTurnResult {
  if (combatantIsDead(combatant)) {
    if (rngSucceedsChance(combatant.combatStats.reviveChance)) {
      combatMessageLog(
        combat,
        `**${combatant.name}** has sprung to life!`,
        combatant,
      );

      combatCombatantTakeDamage(combatant, -combatant.totalStats.Health);

      combatUnapplyAllStatusEffects(combat, combatant);
    } else {
      combatMessageLog(
        combat,
        `**${combatant.name}** is dead, skipping turn.`,
        combatant,
      );
      return {};
    }
  }

  combatHandleCombatantStatusEffects(combat, combatant, 'TurnStart');

  if (combatantIsDead(combatant)) {
    combatMessageLog(combat, `**${combatant.name}** has died!`, combatant);
    return {};
  }

  if (!combatCanTakeTurn(combatant)) {
    combatMessageLog(
      combat,
      `**${combatant.name}** lost their turn!`,
      combatant,
    );
    return {};
  }

  const skills = combatAvailableSkillsForCombatant(combatant).filter(
    (s) =>
      combatGetPossibleCombatantTargetsForSkill(combat, combatant, s).length >
      0,
  );

  const chosenSkill = sample(skills);
  if (!chosenSkill) {
    combatMessageLog(
      combat,
      `**${combatant.name}** has no skills available, skipping turn.`,
      combatant,
    );
    return {};
  }

  combatantMarkSkillUse(combatant, chosenSkill);

  // Capture the creator's stats before any modifications from this skill
  const capturedCreatorStats = { ...combatant.totalStats };

  chosenSkill.techniques.forEach((tech) => {
    const baseTargetList = combatGetPossibleCombatantTargetsForSkillTechnique(
      combat,
      combatant,
      chosenSkill,
      tech,
    );

    const numTargets = skillTechniqueNumTargets(chosenSkill, tech);

    const targets = combatGetTargetsFromListBasedOnType(
      baseTargetList,
      combatant.targettingType,
      numTargets,
    );

    targets.forEach((target) => {
      // check for early termination of combat
      if (isCombatOver(combat)) return;

      const shouldMiss = combatSkillSucceedsElementCombatStatChance(
        chosenSkill,
        combatant,
        'missChance',
      );

      if (shouldMiss) {
        combatMessageLog(
          combat,
          `**${chosenSkill.name}** misses **${target.name}**!`,
          combatant,
        );
        return;
      }

      combatApplySkillToTarget(
        combat,
        combatant,
        target,
        chosenSkill,
        tech,
        capturedCreatorStats,
      );

      const shouldApplyAgain = combatSkillSucceedsElementCombatStatChance(
        chosenSkill,
        combatant,
        'skillStrikeAgainChance',
      );

      if (shouldApplyAgain && !combatantIsDead(target)) {
        combatMessageLog(
          combat,
          `**${chosenSkill.name}** strikes again!`,
          combatant,
        );

        combatApplySkillToTarget(
          combat,
          combatant,
          target,
          chosenSkill,
          tech,
          capturedCreatorStats,
        );
      }
    });
  });

  combatHandleCombatantStatusEffects(combat, combatant, 'TurnEnd');

  if (combatantIsDead(combatant)) {
    combatMessageLog(combat, `**${combatant.name}** has died!`, combatant);
    return {};
  }

  const shouldGoAgain = combatSkillSucceedsElementCombatStatChance(
    chosenSkill,
    combatant,
    'repeatActionChance',
  );

  if (shouldGoAgain) {
    return {
      takeAnotherTurn: true,
    };
  }

  return {};
}

export function combatDoCombatIteration(): void {
  const combat = currentCombat();
  if (!combat) return;

  if (combatCheckIfOver(combat)) return;

  beginCombatLogCommits();

  combatMessageLog(combat, `_Combat round ${combat.rounds + 1}._`);

  const turnOrder = orderCombatantsBySpeed(combat);
  turnOrder.forEach((char) => {
    const res = combatantTakeTurn(combat, char);

    if (res?.takeAnotherTurn) {
      combatMessageLog(
        combat,
        `**${char.name}** was blessed by the elements, and gets to go again!`,
        char,
      );
      combatantTakeTurn(combat, char);
    }
  });

  updateGamestate((state) => {
    const previousRounds = combat.rounds;
    combat.rounds++;

    // Check if we've crossed into a new deadlock prevention tier
    const previousMultiplierTier = Math.floor(previousRounds / 25);
    const currentMultiplierTier = Math.floor(combat.rounds / 25);

    if (
      currentMultiplierTier > previousMultiplierTier &&
      currentMultiplierTier > 0
    ) {
      const damageIncreasePercent = currentMultiplierTier * 25;
      combatMessageLog(
        combat,
        `Due to exhaustion, damage received is increased by ${damageIncreasePercent}% for all combatants.`,
      );
    }

    state.hero.combat = combat;
    return state;
  });

  combatCheckIfOver(combat);

  endCombatLogCommits();
}

export function combatHandleFlee(): void {
  const combat = currentCombat();
  if (!combat) return;

  combatMessageLog(combat, 'The heroes have fled!');
  combatHandleDefeat(combat);
  combatReset();
}

export function combatReset(): void {
  updateGamestate((state) => {
    state.hero.combat = undefined;
    return state;
  });
}
