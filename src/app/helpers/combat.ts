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

import { sample, sortBy } from 'es-toolkit/compat';

import type {
  Combat,
  Combatant,
  EquipmentSkill,
  TalentContent,
} from '@interfaces';

export function currentCombat(): Combat | undefined {
  return gamestate().hero.combat;
}

export function orderCombatantsBySpeed(combat: Combat): Combatant[] {
  return sortBy(
    [...combat.guardians, ...combat.heroes],
    (c) => -c.totalStats.Speed,
  );
}

export function allCombatantTalents(combatant: Combatant): TalentContent[] {
  return Object.entries(combatant.talents)
    .filter(([, level]) => level > 0)
    .map(([talentId]) => getEntry<TalentContent>(talentId))
    .filter((talent): talent is TalentContent => !!talent);
}

export function combatantMarkSkillUse(
  combatant: Combatant,
  skill: EquipmentSkill,
): void {
  combatant.skillUses[skill.id] ??= 0;
  combatant.skillUses[skill.id]++;
}

export function combatantTakeTurn(combat: Combat, combatant: Combatant): void {
  if (isDead(combatant)) {
    logCombatMessage(
      combat,
      `**${combatant.name}** is dead, skipping turn.`,
      combatant,
    );
    return;
  }

  handleCombatantStatusEffects(combat, combatant, 'TurnStart');

  if (isDead(combatant)) {
    logCombatMessage(combat, `**${combatant.name}** has died!`, combatant);
    return;
  }

  if (!canTakeTurn(combatant)) {
    logCombatMessage(
      combat,
      `**${combatant.name}** lost their turn!`,
      combatant,
    );
    return;
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
    return;
  }

  combatantMarkSkillUse(combatant, chosenSkill);

  chosenSkill.techniques.forEach((tech) => {
    const baseTargetList = getPossibleCombatantTargetsForSkillTechnique(
      combat,
      combatant,
      chosenSkill,
      tech,
    );

    const targets = getTargetsFromListBasedOnType(
      baseTargetList,
      combatant.targettingType,
      tech.targets,
    );

    targets.forEach((target) => {
      // check for early termination of combat
      if (isCombatOver(combat)) return;

      applySkillToTarget(combat, combatant, target, chosenSkill, tech);
    });
  });

  handleCombatantStatusEffects(combat, combatant, 'TurnEnd');

  if (isDead(combatant)) {
    logCombatMessage(combat, `**${combatant.name}** has died!`, combatant);
    return;
  }
}

export function doCombatIteration(): void {
  const combat = currentCombat();
  if (!combat) return;

  if (checkCombatOver(combat)) return;

  logCombatMessage(combat, `_Combat round ${combat.rounds + 1}._`);

  const turnOrder = orderCombatantsBySpeed(combat);
  turnOrder.forEach((char) => {
    combatantTakeTurn(combat, char);
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
