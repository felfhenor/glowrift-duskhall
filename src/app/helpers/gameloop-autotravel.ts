import { isExploring } from '@helpers/explore';
import {
  heroAreAllDead,
  heroRecoveringInTown,
  heroRecoveryPercent,
} from '@helpers/hero';
import { isTraveling, travelHome, travelToNode } from '@helpers/travel';
import { globalStatusText } from '@helpers/ui';
import {
  locationGetAllMatchingPreferences,
  locationGetClosestUnclaimedClaimableLocation,
  locationGetCurrent,
  locationGetInOrderOfCloseness,
} from '@helpers/world-location';

export function gameloopAutoTravel(): void {
  if (isExploring()) return;
  if (isTraveling()) return;
  if (heroAreAllDead()) {
    travelHome();
    return;
  }

  if (heroRecoveringInTown()) {
    globalStatusText.set(
      `Heroes are recovering in town; cannot travel (${heroRecoveryPercent()}% recovered).`,
    );
    return;
  }

  const currentNode = locationGetCurrent();
  if (currentNode) {
    const anyUnclaimedNode = locationGetClosestUnclaimedClaimableLocation(
      currentNode,
      locationGetInOrderOfCloseness(currentNode),
    );
    if (!anyUnclaimedNode) {
      globalStatusText.set('No unclaimed nodes available; idle.');
      return;
    }

    const nodesWithinRiskTolerance =
      locationGetAllMatchingPreferences(currentNode);
    const nextNode = locationGetClosestUnclaimedClaimableLocation(
      currentNode,
      nodesWithinRiskTolerance,
    );
    if (!nextNode) {
      globalStatusText.set('Hero party idle; adjust risk tolerance.');
      return;
    }

    globalStatusText.set('');
    travelToNode(nextNode);
  }
}
