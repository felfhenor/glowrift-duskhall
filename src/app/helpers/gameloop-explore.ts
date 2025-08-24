import {
  combatDoCombatIteration,
  combatReset,
  currentCombat,
} from '@helpers/combat';
import { combatHasGuardiansAlive } from '@helpers/combat-end';
import { exploringUpdateGlobalStatusText } from '@helpers/explore';
import { heroAllGainXp } from '@helpers/hero-xp';
import { gamestate, updateGamestate } from '@helpers/state-game';
import { isTraveling } from '@helpers/travel';
import {
  locationGetCurrent,
  locationRewardsGain,
} from '@helpers/world-location';

export function gameloopExplore(): void {
  if (isTraveling()) return;

  const node = locationGetCurrent();
  if (!node || node.currentlyClaimed) return;

  if (!node.captureType || node.captureType === 'guardians') {
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

  if (node.captureType === 'time') {
    const timeLeft = gamestate().hero.exploreTicks;
    const newTicks = Math.max(0, timeLeft - 1);
    heroAllGainXp(1);

    exploringUpdateGlobalStatusText(
      `Exploring ${node.name}... ${timeLeft} tick(s) remaining.`,
    );

    updateGamestate((state) => {
      state.hero.exploreTicks = newTicks;
      return state;
    });

    if (newTicks <= 0) {
      locationRewardsGain(node);
      return;
    }
  }
}
