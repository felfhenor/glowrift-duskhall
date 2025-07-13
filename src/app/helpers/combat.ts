import { sample, sampleSize, sortBy } from 'lodash';
import { Combat, Combatant } from '@interfaces';
import { applySkillToTarget } from '@helpers/combat-damage';
import {
  checkCombatOver,
  isCombatOver,
  isDead,
  handleCombatDefeat,
} from '@helpers/combat-end';
import { logCombatMessage } from '@helpers/combat-log';
import {
  availableSkillsForCombatant,
  getPossibleCombatantTargetsForSkill,
  getPossibleCombatantTargetsForSkillTechnique,
} from '@helpers/combat-targetting';
import { gamestate, updateGamestate } from '@helpers/state-game';
import { notify } from '@helpers/notify';
import { travelHome } from '@helpers/explore';

export function currentCombat(): Combat | undefined {
  return gamestate().hero.combat;
}

export function orderCombatantsBySpeed(combat: Combat): Combatant[] {
  return sortBy(
    [...combat.guardians, ...combat.heroes],
    (c) => -c.totalStats.Speed,
  );
}

export function combatantTakeTurn(combat: Combat, combatant: Combatant): void {
  if (isDead(combatant)) {
    logCombatMessage(combat, `**${combatant.name}** is dead, skipping turn.`);
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

  chosenSkill.techniques.forEach((tech) => {
    const targets = sampleSize(
      getPossibleCombatantTargetsForSkillTechnique(
        combat,
        combatant,
        chosenSkill,
        tech,
      ),
      tech.targets,
    );

    targets.forEach((target) => {
      // check for early termination of combat
      if (isCombatOver(combat)) return;

      applySkillToTarget(combat, combatant, target, chosenSkill, tech);
    });
  });
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
  logCombatMessage(combat, 'You begin to make the journey home in defeat!');
  logCombatMessage(
    combat,
    'The heroes have forfeited the battle and began to flee!',
  );
  // handleCombatDefeat(combat);

  resetCombat();
  travelHome();
}

export function resetCombat(): void {
  updateGamestate((state) => {
    state.hero.combat = undefined;
    return state;
  });
}
