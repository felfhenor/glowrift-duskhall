import { getEntry } from '@helpers/content';
import { currencyClaimsGain, currencyClaimsLose } from '@helpers/currency';
import { defaultWorldNode } from '@helpers/defaults';
import { discordUpdateStatus } from '@helpers/discord';
import { droppableGain, droppableMakeReal } from '@helpers/droppable';
import { itemElementAdd, itemIsEquipment } from '@helpers/item';
import { distanceBetweenNodes } from '@helpers/math';
import { notify } from '@helpers/notify';
import { gamestate, updateGamestate } from '@helpers/state-game';
import { timerAddUnclaimAction, timerGetRegisterTick } from '@helpers/timer';
import {
  worldNotifyClaim,
  worldNotifyUnclaimed,
} from '@helpers/world-change-notifications';
import { locationClaimDuration } from '@helpers/world-location';
import {
  worldgenGuardiansForLocation,
  worldgenLootForLocation,
} from '@helpers/worldgen';
import type {
  DropRarity,
  DroppableEquippable,
  EquipmentItemContent,
  GameId,
  GameStateWorld,
  LocationType,
  WorldConfigContent,
  WorldLocation,
  WorldPosition,
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

export function worldNodeGetAccessId(node: WorldPosition): string {
  return `${node.x},${node.y}`;
}

export function worldMaxDistance(): number {
  const state = gamestate();

  return distanceBetweenNodes(
    { x: Math.floor(state.world.config.width / 2), y: 0 },
    state.world.homeBase,
  );
}

/**
 * Get the highest rarity of loot items at a location
 * @param location World location with loot IDs
 * @returns Highest rarity found, or null if no loot items
 */
export function worldNodeGetHighestLootRarity(
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

export function worldNodeGet(
  x: number,
  y: number,
  state = gamestate(),
): WorldLocation {
  return state.world.nodes[`${x},${y}`] ?? defaultWorldNode(x, y);
}

export function worldNodeGetCurrent(
  state = gamestate(),
): WorldLocation | undefined {
  const currentPosition = state.hero.position;
  return worldNodeGet(currentPosition.x, currentPosition.y);
}

export function worldNodeGetAll(): WorldLocation[] {
  return Object.values(gamestate().world.nodes);
}

export function worldNodeGetInOrderOfCloseness(
  node: WorldLocation,
): WorldLocation[] {
  const nodes = worldNodeGetAll();
  return sortBy(nodes, (n) => distanceBetweenNodes(node, n)).filter(
    (n) => n.nodeType && n.id !== node.id,
  );
}

export function worldGetNearestTown(position: {
  x: number;
  y: number;
}): WorldLocation | undefined {
  const allNodes = worldNodeGetAll();
  const towns = allNodes.filter(
    (node) => node.nodeType === 'town' && node.currentlyClaimed,
  );
  if (towns.length === 0) return undefined;

  return sortBy(towns, (town) => distanceBetweenNodes(position, town))[0];
}

export function worldGetClosestUnclaimedClaimableNode(
  node: WorldLocation,
  nodes = worldNodeGetInOrderOfCloseness(node),
): WorldLocation {
  return nodes.filter((n) => !n.currentlyClaimed)[0];
}

export function worldGetNodesMatchingPreferences(
  node: WorldLocation,
  nodes = worldNodeGetInOrderOfCloseness(node),
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
    const highestRarity = worldNodeGetHighestLootRarity(n);
    if (highestRarity && !lootRarityPreferences[highestRarity]) return false;

    return true;
  });

  const sortedByRarity = sortBy(viableNodes, (n) => {
    const highestRarity = worldNodeGetHighestLootRarity(n);
    return isNumber(highestRarity) ? RARITY_PRIORITY[highestRarity] : -1;
  });

  // Then sort them so that "too hard" nodes come last (de-prioritized)
  return sortBy(sortedByRarity, (node) => {
    const nodeId = worldNodeGetAccessId(node);
    return tooHardNodes.includes(nodeId) ? 1 : 0;
  });
}

export function worldGetClaimedNodes(): WorldLocation[] {
  return worldNodeGetAll().filter((n) => n.currentlyClaimed);
}

export function worldNodeRewardsGain(node: WorldLocation): void {
  notify(`You have claimed ${node.name}!`, 'LocationClaim');

  node.claimLootIds.forEach((lootDefId) => {
    const lootDef = getEntry<DroppableEquippable>(lootDefId);
    if (!lootDef) return;

    const created = droppableMakeReal(lootDef);

    if (itemIsEquipment(created)) {
      node.elements.forEach((el) => {
        itemElementAdd(created, el);
      });
    }

    droppableGain(created);
  });

  worldNodeClaim(node);
}

export function worldNodeClaim(node: WorldLocation): void {
  if (node.currentlyClaimed) return;

  currencyClaimsGain(node);

  const claimDuration = locationClaimDuration(node);
  const unclaimTime = timerGetRegisterTick(claimDuration);
  timerAddUnclaimAction(node, unclaimTime);

  updateGamestate((state) => {
    const updateNodeData = worldNodeGet(node.x, node.y, state);
    if (updateNodeData) {
      updateNodeData.claimCount++;
      updateNodeData.currentlyClaimed = true;
      updateNodeData.guardianIds = [];
      updateNodeData.claimLootIds = [];

      updateNodeData.unclaimTime = unclaimTime;

      if (updateNodeData.nodeType) {
        state.world.claimedCounts[updateNodeData.nodeType]++;
      }

      // Notify about the node change for surgical map updates
      worldNotifyClaim(updateNodeData);
    }

    return state;
  });

  discordUpdateStatus();
}

export function worldNodeUnclaim(node: WorldLocation): void {
  currencyClaimsLose(node);

  notify(`${node.name} was lost!`, 'LocationClaim');

  updateGamestate((state) => {
    const updateNodeData = worldNodeGet(node.x, node.y, state);
    if (updateNodeData) {
      updateNodeData.currentlyClaimed = false;
      updateNodeData.guardianIds = worldgenGuardiansForLocation(
        updateNodeData,
        gamestate().world.homeBase,
        worldMaxDistance(),
      ).map((i) => i.id);
      updateNodeData.claimLootIds = worldgenLootForLocation(updateNodeData).map(
        (i) => i.id,
      );
      updateNodeData.unclaimTime = 0;

      if (updateNodeData.nodeType) {
        state.world.claimedCounts[updateNodeData.nodeType]--;
      }

      // Notify about the node change for surgical map updates
      worldNotifyUnclaimed(updateNodeData);
    }

    return state;
  });

  discordUpdateStatus();
}

export function worldNodeGetClaimedByType(type: LocationType): number {
  return gamestate().world.claimedCounts[type] ?? 0;
}

export function worldNodeHasClaimedCount(
  type: LocationType,
  needed: number,
): boolean {
  return worldNodeGetClaimedByType(type) >= needed;
}

export function worldNodeAreAllClaimed(): boolean {
  const { nodeCounts, claimedCounts } = gamestate().world;

  return Object.keys(nodeCounts).every(
    (type) =>
      claimedCounts[type as LocationType] >= nodeCounts[type as LocationType],
  );
}

export function worldNodeTooHardClear(): void {
  updateGamestate((state) => {
    state.hero.tooHardNodes = [];
    return state;
  });
}

export function worldNodeAddTooHard(nodeId: string): void {
  updateGamestate((state) => {
    if (!state.hero.tooHardNodes.includes(nodeId)) {
      state.hero.tooHardNodes.push(nodeId);
    }
    return state;
  });
}
