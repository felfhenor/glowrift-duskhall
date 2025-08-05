import { applySkillToTarget } from '@helpers/combat-damage';
import {
  checkCombatOver,
  handleCombatDefeat,
  isCombatOver,
  isDead,
} from '@helpers/combat-end';
import { logCombatMessage } from '@helpers/combat-log';
import {
  canTakeTurn,
  handleCombatantStatusEffects,
} from '@helpers/combat-statuseffects';
import {
  availableSkillsForCombatant,
  getPossibleCombatantTargetsForSkill,
  getPossibleCombatantTargetsForSkillTechnique,
  getTargetsFromListBasedOnType,
} from '@helpers/combat-targetting';
import { getEntry } from '@helpers/content';
import { gamestate, updateGamestate } from '@helpers/state-game';

import { notify } from '@helpers/notify';

import { sample, sortBy, sumBy } from 'es-toolkit/compat';

import { skillSucceedsElementCombatStatChance } from '@helpers/combat-stats';
import { succeedsChance } from '@helpers/rng';
import { getSkillTechniqueNumTargets, skillElements } from '@helpers/skill';
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

export function allCombatantTalents(combatant: Combatant): TalentContent[] {
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
    allCombatantTalents(combatant),
    skill,
  );
  if (succeedsChance(shouldIgnoreUseChance)) return;

  const shouldApplyExtraUses = skillSucceedsElementCombatStatChance(
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
  if (isDead(combatant)) {
    logCombatMessage(
      combat,
      `**${combatant.name}** is dead, skipping turn.`,
      combatant,
    );
    return {};
  }

  handleCombatantStatusEffects(combat, combatant, 'TurnStart');

  if (isDead(combatant)) {
    logCombatMessage(combat, `**${combatant.name}** has died!`, combatant);
    return {};
  }

  if (!canTakeTurn(combatant)) {
    logCombatMessage(
      combat,
      `**${combatant.name}** lost their turn!`,
      combatant,
    );
    return {};
  }

  const skills = availableSkillsForCombatant(combatant).filter(
    (s) => getPossibleCombatantTargetsForSkill(combat, combatant, s).length > 0,
  );

  const chosenSkill = sample(skills);
  if (!chosenSkill) {
    logCombatMessage(
      combat,
      `**${combatant.name}** has no skills available, skipping turn.`,
      combatant,
    );
    return {};
  }

  combatantMarkSkillUse(combatant, chosenSkill);

  chosenSkill.techniques.forEach((tech) => {
    const baseTargetList = getPossibleCombatantTargetsForSkillTechnique(
      combat,
      combatant,
      chosenSkill,
      tech,
    );

    const numTargets = getSkillTechniqueNumTargets(chosenSkill, tech);

    const targets = getTargetsFromListBasedOnType(
      baseTargetList,
      combatant.targettingType,
      numTargets,
    );

    targets.forEach((target) => {
      // check for early termination of combat
      if (isCombatOver(combat)) return;

      applySkillToTarget(combat, combatant, target, chosenSkill, tech);

      const shouldApplyAgain = skillSucceedsElementCombatStatChance(
        chosenSkill,
        combatant,
        'skillStrikeAgainChance',
      );

      if (shouldApplyAgain && !isDead(target)) {
        logCombatMessage(
          combat,
          `**${chosenSkill.name}** strikes again!`,
          combatant,
        );

        applySkillToTarget(combat, combatant, target, chosenSkill, tech);
      }
    });
  });

  handleCombatantStatusEffects(combat, combatant, 'TurnEnd');

  if (isDead(combatant)) {
    logCombatMessage(combat, `**${combatant.name}** has died!`, combatant);
    return {};
  }

  const shouldGoAgain = skillSucceedsElementCombatStatChance(
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

export function doCombatIteration(): void {
  const combat = currentCombat();
  if (!combat) return;

  if (checkCombatOver(combat)) return;

  logCombatMessage(combat, `_Combat round ${combat.rounds + 1}._`);

  const turnOrder = orderCombatantsBySpeed(combat);
  turnOrder.forEach((char) => {
    const res = combatantTakeTurn(combat, char);

    if (res?.takeAnotherTurn) {
      logCombatMessage(
        combat,
        `**${char.name}** was blessed by the elements, and gets to go again!`,
        char,
      );
      combatantTakeTurn(combat, char);
    }
  });

  updateGamestate((state) => {
    combat.rounds++;
    state.hero.combat = combat;
    return state;
  });

  checkCombatOver(combat);
}

export function handleCombatFlee(): void {
  const combat = currentCombat();
  if (!combat) {
    notify('You are not in combat!', 'Travel');
    return;
  }

  logCombatMessage(combat, 'The heroes have fled!');
  handleCombatDefeat(combat);
  resetCombat();
}

export function resetCombat(): void {
  updateGamestate((state) => {
    state.hero.combat = undefined;
    return state;
  });
}
