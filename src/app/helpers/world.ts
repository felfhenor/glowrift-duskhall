import {
  getCurrencyClaimsForNode,
  mergeCurrencyClaims,
} from '@helpers/currency';
import { defaultWorldNode } from '@helpers/defaults';
import { notify } from '@helpers/notify';
import { gamestate, updateGamestate } from '@helpers/state-game';
import { addTimerAndAction, getRegisterTick } from '@helpers/timer';
import { distanceBetweenNodes } from '@helpers/travel';
import { getGuardiansForLocation, getLootForLocation } from '@helpers/worldgen';
import {
  GameCurrency,
  GameStateWorld,
  LocationType,
  WorldLocation,
} from '@interfaces';
import { sortBy } from 'lodash';

export function setWorld(world: GameStateWorld): void {
  updateGamestate((state) => {
    state.world = world;
    return state;
  });
}

export function getWorldNode(
  x: number,
  y: number,
  state = gamestate(),
): WorldLocation {
  return state.world.nodes[`${x},${y}`] ?? defaultWorldNode(x, y);
}

export function getCurrentWorldNode(
  state = gamestate(),
): WorldLocation | undefined {
  const currentPosition = state.hero.position;
  return getWorldNode(currentPosition.x, currentPosition.y);
}

export function getAllNodes(): WorldLocation[] {
  return Object.values(gamestate().world.nodes);
}

export function getAllNodesInOrderOfCloseness(
  node: WorldLocation,
): WorldLocation[] {
  const nodes = getAllNodes();
  return sortBy(nodes, (n) => distanceBetweenNodes(node, n)).filter(
    (n) => n.nodeType && n.id !== node.id,
  );
}

export function getClosestUnclaimedClaimableNode(
  node: WorldLocation,
  nodes = getAllNodesInOrderOfCloseness(node),
): WorldLocation {
  return nodes.filter((n) => !n.currentlyClaimed)[0];
}

export function getNodesWithinRiskTolerance(
  node: WorldLocation,
  nodes = getAllNodesInOrderOfCloseness(node),
): WorldLocation[] {
  const riskTolerance = gamestate().hero.riskTolerance;
  const heroLevel = gamestate().hero.heroes[0].level;

  let levelThreshold = 3;
  if (riskTolerance === 'medium') levelThreshold = 7;
  else if (riskTolerance === 'high') levelThreshold = 100;
  return nodes.filter((n) => n.encounterLevel <= heroLevel + levelThreshold);
}

export function getClaimedNodes(): WorldLocation[] {
  return getAllNodes().filter((n) => n.currentlyClaimed);
}

export function claimNode(node: WorldLocation): void {
  const claims = getCurrencyClaimsForNode(node);
  mergeCurrencyClaims(claims);

  const claimDuration = (100 - node.encounterLevel) * 25;
  addTimerAndAction(
    {
      location: {
        x: node.x,
        y: node.y,
      },
      type: 'UnclaimVillage',
    },
    claimDuration,
  );

  updateGamestate((state) => {
    const updateNodeData = getWorldNode(node.x, node.y, state);
    if (updateNodeData) {
      updateNodeData.claimCount++;
      updateNodeData.currentlyClaimed = true;
      updateNodeData.guardianIds = [];
      updateNodeData.claimLootIds = [];
      updateNodeData.unclaimTime = getRegisterTick(claimDuration);

      if (updateNodeData.nodeType) {
        state.world.claimedCounts[updateNodeData.nodeType]++;
      }
    }

    return state;
  });
}

export function unclaimNode(node: WorldLocation): void {
  const claims = getCurrencyClaimsForNode(node);
  Object.keys(claims).forEach(
    (currencyKey) =>
      (claims[currencyKey as GameCurrency] =
        -claims[currencyKey as GameCurrency]),
  );

  notify(`${node.name} was lost!`, 'LocationClaim');

  mergeCurrencyClaims(claims);

  updateGamestate((state) => {
    const updateNodeData = getWorldNode(node.x, node.y, state);
    if (updateNodeData) {
      updateNodeData.currentlyClaimed = false;
      updateNodeData.guardianIds = getGuardiansForLocation(updateNodeData).map(
        (i) => i.id,
      );
      updateNodeData.claimLootIds = getLootForLocation(updateNodeData).map(
        (i) => i.id,
      );
      updateNodeData.unclaimTime = 0;

      if (updateNodeData.nodeType) {
        state.world.claimedCounts[updateNodeData.nodeType]--;
      }
    }

    return state;
  });
}

export function getClaimedNodeTypeCount(type: LocationType): number {
  return gamestate().world.claimedCounts[type] ?? 0;
}

export function hasClaimedNodeCount(
  type: LocationType,
  needed: number,
): boolean {
  return getClaimedNodeTypeCount(type) >= needed;
}
