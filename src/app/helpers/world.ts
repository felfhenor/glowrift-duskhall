import { getEntry } from '@helpers/content';
import {
  getCurrencyClaimsForNode,
  mergeCurrencyClaims,
} from '@helpers/currency';
import { getDefaultWorldNode } from '@helpers/defaults';
import {
  gainDroppableItem,
  makeDroppableIntoRealItem,
} from '@helpers/droppable';
import { addItemElement, isEquipment } from '@helpers/item';
import { notify } from '@helpers/notify';
import { gamestate, updateGamestate } from '@helpers/state-game';
import { addTimerAndAction, getRegisterTick } from '@helpers/timer';
import { distanceBetweenNodes } from '@helpers/travel';
import { getGuardiansForLocation, getLootForLocation } from '@helpers/worldgen';
import type {
  DropRarity,
  DroppableEquippable,
  EquipmentItemContent,
  GameCurrency,
  GameId,
  GameStateWorld,
  LocationType,
  WorldConfigContent,
  WorldLocation,
} from '@interfaces';
import { isNumber, sortBy } from 'es-toolkit/compat';

/**
 * Maps rarity levels to their priority for determining highest rarity
 */
const RARITY_PRIORITY: Record<DropRarity, number> = {
  Common: 1,
  Uncommon: 2,
  Rare: 3,
  Mystical: 4,
  Legendary: 5,
  Unique: 6,
};

/**
 * Get the highest rarity of loot items at a location
 * @param location World location with loot IDs
 * @returns Highest rarity found, or null if no loot items
 */
export function getHighestLootRarity(
  location: WorldLocation,
): DropRarity | null {
  if (!location.claimLootIds.length) return null;

  let highestPriority = 0;
  let highestRarity: DropRarity | null = null;

  for (const lootId of location.claimLootIds) {
    // Extract the base item ID (before the |uuid part if it exists)
    const baseId = lootId.split('|')[0];
    const itemData = getEntry<EquipmentItemContent>(baseId);

    if (itemData?.rarity) {
      const priority = RARITY_PRIORITY[itemData.rarity];
      if (priority > highestPriority) {
        highestPriority = priority;
        highestRarity = itemData.rarity;
      }
    }
  }

  return highestRarity;
}

export function setWorldSeed(seed: string | null): void {
  if (!seed) return;

  updateGamestate((state) => {
    state.gameId = seed as GameId;
    return state;
  });
}

export function setWorldConfig(config: WorldConfigContent): void {
  updateGamestate((state) => {
    state.world.config = config;
    return state;
  });
}

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
  return state.world.nodes[`${x},${y}`] ?? getDefaultWorldNode(x, y);
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

export function getNearestTown(position: {
  x: number;
  y: number;
}): WorldLocation | undefined {
  const allNodes = getAllNodes();
  const towns = allNodes.filter(
    (node) => node.nodeType === 'town' && node.currentlyClaimed,
  );
  if (towns.length === 0) return undefined;

  return sortBy(towns, (town) => distanceBetweenNodes(position, town))[0];
}

export function getClosestUnclaimedClaimableNode(
  node: WorldLocation,
  nodes = getAllNodesInOrderOfCloseness(node),
): WorldLocation {
  return nodes.filter((n) => !n.currentlyClaimed)[0];
}

export function getNodesMatchingHeroPreferences(
  node: WorldLocation,
  nodes = getAllNodesInOrderOfCloseness(node),
): WorldLocation[] {
  const riskTolerance = gamestate().hero.riskTolerance;
  const heroLevel = gamestate().hero.heroes[0].level;
  const tooHardNodes = gamestate().hero.tooHardNodes;
  const locationTypePreferences = gamestate().hero.nodeTypePreferences;
  const lootRarityPreferences = gamestate().hero.lootRarityPreferences;

  let levelThreshold = 3;
  if (riskTolerance === 'medium') levelThreshold = 7;
  else if (riskTolerance === 'high') levelThreshold = 100;

  // First filter out nodes that are too high level based on encounter level
  const viableNodes = nodes.filter((n) => {
    if (n.encounterLevel > heroLevel + levelThreshold) return false;
    if (!locationTypePreferences[n.nodeType!]) return false;

    // Check if the node has loot that matches our rarity preferences
    const highestRarity = getHighestLootRarity(n);
    if (highestRarity && !lootRarityPreferences[highestRarity]) return false;

    return true;
  });

  const sortedByRarity = sortBy(viableNodes, (n) => {
    const highestRarity = getHighestLootRarity(n);
    return isNumber(highestRarity) ? RARITY_PRIORITY[highestRarity] : -1;
  });

  // Then sort them so that "too hard" nodes come last (de-prioritized)
  return sortBy(sortedByRarity, (node) => {
    const nodeId = `${node.x},${node.y}`;
    return tooHardNodes.includes(nodeId) ? 1 : 0;
  });
}

export function getClaimedNodes(): WorldLocation[] {
  return getAllNodes().filter((n) => n.currentlyClaimed);
}

export function gainNodeRewards(node: WorldLocation): void {
  notify(`You have claimed ${node.name}!`, 'LocationClaim');

  node.claimLootIds.forEach((lootDefId) => {
    const lootDef = getEntry<DroppableEquippable>(lootDefId);
    if (!lootDef) return;

    const created = makeDroppableIntoRealItem(lootDef);

    if (isEquipment(created)) {
      node.elements.forEach((el) => {
        addItemElement(created, el);
      });
    }

    gainDroppableItem(created);
  });

  claimNode(node);
}

export function claimNode(node: WorldLocation): void {
  const claims = getCurrencyClaimsForNode(node);
  mergeCurrencyClaims(claims);

  const claimDuration = (100 - node.encounterLevel) * 25;
  if (node.nodeType !== 'town') {
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
  }

  updateGamestate((state) => {
    const updateNodeData = getWorldNode(node.x, node.y, state);
    if (updateNodeData) {
      updateNodeData.claimCount++;
      updateNodeData.currentlyClaimed = true;
      updateNodeData.guardianIds = [];
      updateNodeData.claimLootIds = [];

      if (updateNodeData.nodeType !== 'town') {
        updateNodeData.unclaimTime = getRegisterTick(claimDuration);
      }

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

export function hasWonForFirstTime(): boolean {
  const { hasDismissedWinNotification, hasWon } = gamestate().meta;
  return hasWon && hasDismissedWinNotification;
}

export function areAllNodesClaimed(): boolean {
  const { nodeCounts, claimedCounts } = gamestate().world;

  return Object.keys(nodeCounts).every(
    (type) =>
      claimedCounts[type as LocationType] >= nodeCounts[type as LocationType],
  );
}

export function dismissWinGameDialog(): void {
  updateGamestate((state) => {
    state.meta.hasDismissedWinNotification = true;
    return state;
  });
}

export function winGame(): void {
  updateGamestate((state) => {
    state.meta.hasWon = true;
    state.meta.wonAtTick = state.actionClock.numTicks;
    return state;
  });
}

export function clearNodesTooHardForHeroes(): void {
  updateGamestate((state) => {
    state.hero.tooHardNodes = [];
    return state;
  });
}

export function addTooHardNode(nodeId: string): void {
  updateGamestate((state) => {
    if (!state.hero.tooHardNodes.includes(nodeId)) {
      state.hero.tooHardNodes.push(nodeId);
    }
    return state;
  });
}
