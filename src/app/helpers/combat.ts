import { applySkillToTarget } from '@helpers/combat-damage';
import { checkCombatOver, isCombatOver, isDead } from '@helpers/combat-end';
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
import { Combat, Combatant, EquipmentSkill, TalentContent } from '@interfaces';
import { sample, sortBy } from 'lodash';

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
    logCombatMessage(combat, `**${combatant.name}** is dead, skipping turn.`);
    return;
  }

  handleCombatantStatusEffects(combat, combatant, 'TurnStart');

  if (isDead(combatant)) {
    logCombatMessage(combat, `**${combatant.name}** has died!`);
    return;
  }

  if (!canTakeTurn(combatant)) {
    logCombatMessage(combat, `**${combatant.name}** lost their turn!`);
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
    logCombatMessage(combat, `**${combatant.name}** has died!`);
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

export function resetCombat(): void {
  updateGamestate((state) => {
    state.hero.combat = undefined;
    return state;
  });
}
