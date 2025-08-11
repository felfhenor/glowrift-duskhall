import { isExploring } from '@helpers/explore';
import {
  heroAreAllDead,
  heroRecoveringInTown,
  heroRecoveryPercent,
} from '@helpers/hero';
import { isTraveling, travelToNode } from '@helpers/travel';
import { globalStatusText } from '@helpers/ui';
import {
  worldGetClosestUnclaimedClaimableNode,
  worldGetNodesMatchingPreferences,
  worldNodeGetCurrent,
  worldNodeGetInOrderOfCloseness,
} from '@helpers/world';

export function gameloopAutoTravel(): void {
  if (isExploring()) return;
  if (isTraveling()) return;
  if (heroAreAllDead()) {
    globalStatusText.set('All heroes are defeated; cannot travel.');
    return;
  }

  if (heroRecoveringInTown()) {
    globalStatusText.set(
      `Heroes are recovering in town; cannot travel (${heroRecoveryPercent()}% recovered).`,
    );
    return;
  }

  const currentNode = worldNodeGetCurrent();
  if (currentNode) {
    const anyUnclaimedNode = worldGetClosestUnclaimedClaimableNode(
      currentNode,
      worldNodeGetInOrderOfCloseness(currentNode),
    );
    if (!anyUnclaimedNode) {
      globalStatusText.set('No unclaimed nodes available; idle.');
      return;
    }

    const nodesWithinRiskTolerance =
      worldGetNodesMatchingPreferences(currentNode);
    const nextNode = worldGetClosestUnclaimedClaimableNode(
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
