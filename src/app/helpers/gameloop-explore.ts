import {
  combatDoCombatIteration,
  combatReset,
  currentCombat,
} from '@helpers/combat';
import { combatGenerateForLocation } from '@helpers/combat-create';
import { combatHasGuardiansAlive } from '@helpers/combat-end';
import { exploringUpdateGlobalStatusText } from '@helpers/explore';
import { updateGamestate } from '@helpers/state-game';
import { isTraveling } from '@helpers/travel';
import {
  locationGetCurrent,
  locationRewardsGain,
} from '@helpers/world-location';

export function gameloopExplore(): void {
  if (isTraveling()) return;

  const node = locationGetCurrent();
  if (!node) return;
  if (node.currentlyClaimed) return;

  if (currentCombat()?.locationName !== node.name) {
    combatReset();
  }

  // generate a combat, move to next tick
  if (!currentCombat()) {
    // claim a node if there are no guardians to defend it
    if (node.guardianIds.length === 0) {
      locationRewardsGain(node);
      return;
    }

    exploringUpdateGlobalStatusText(
      `Exploring ${node.name}... engaging in combat.`,
    );
    updateGamestate((state) => {
      state.hero.combat = combatGenerateForLocation(node);
      return state;
    });

    return;
  }

  // if we have guardians alive, we're doing combat
  if (combatHasGuardiansAlive()) {
    exploringUpdateGlobalStatusText(
      `Exploring ${node.name}... fighting ${node.guardianIds.length} guardian(s).`,
    );

    for (let i = 0; i < 1; i++) {
      combatDoCombatIteration();
    }
    return;
  }
}
