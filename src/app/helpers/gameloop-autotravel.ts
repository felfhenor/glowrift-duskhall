import { isExploring } from '@helpers/explore';
import { areAllHeroesDead } from '@helpers/hero';
import { isTraveling, travelToNode } from '@helpers/travel';
import { globalStatusText } from '@helpers/ui';
import {
  getAllNodesInOrderOfCloseness,
  getClosestUnclaimedClaimableNode,
  getCurrentWorldNode,
  getNodesWithinRiskTolerance,
} from '@helpers/world';

export function autoTravelGameloop(): void {
  if (isExploring()) return;
  if (isTraveling()) return;
  if (areAllHeroesDead()) {
    globalStatusText.set('All heroes are defeated; cannot travel.');
    return;
  }

  const currentNode = getCurrentWorldNode();
  if (currentNode) {
    const anyUnclaimedNode = getClosestUnclaimedClaimableNode(
      currentNode,
      getAllNodesInOrderOfCloseness(currentNode),
    );
    if (!anyUnclaimedNode) {
      globalStatusText.set('No unclaimed nodes available; idle.');
      return;
    }

    const nodesWithinRiskTolerance = getNodesWithinRiskTolerance(currentNode);
    const nextNode = getClosestUnclaimedClaimableNode(
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
