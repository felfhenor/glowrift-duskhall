import { currentCombat, doCombatIteration, resetCombat } from '@helpers/combat';
import { generateCombatForLocation } from '@helpers/combat-create';
import { currentCombatHasGuardiansAlive } from '@helpers/combat-end';
import { updateExploringAndGlobalStatusText } from '@helpers/explore';
import { updateGamestate } from '@helpers/state-game';
import { isTraveling } from '@helpers/travel';
import { getCurrentWorldNode } from '@helpers/world';

export function exploreGameloop(numTicks: number): void {
  if (isTraveling()) return;

  const node = getCurrentWorldNode();
  if (!node) return;
  if (node.currentlyClaimed) return;

  if (currentCombat()?.locationName !== node.name) {
    resetCombat();
  }

  // generate a combat, move to next tick
  if (!currentCombat()) {
    updateExploringAndGlobalStatusText(
      `Exploring ${node.name}... engaging in combat.`,
    );
    updateGamestate((state) => {
      state.hero.combat = generateCombatForLocation(node);
      return state;
    });

    return;
  }

  // if we have guardians alive, we're doing combat
  if (currentCombatHasGuardiansAlive()) {
    updateExploringAndGlobalStatusText(
      `Exploring ${node.name}... fighting ${node.guardianIds.length} guardian(s).`,
    );

    for (let i = 0; i < numTicks; i++) {
      doCombatIteration();
    }
    return;
  }
}
