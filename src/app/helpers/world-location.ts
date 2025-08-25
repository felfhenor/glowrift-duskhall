import { claimMessageLog } from '@helpers/claim-log';
import { combatGenerateForLocation } from '@helpers/combat-create';
import { getEntry } from '@helpers/content';
import { currencyClaimsGain, currencyClaimsLose } from '@helpers/currency';
import { defaultLocation, defaultNodeCountBlock } from '@helpers/defaults';
import { discordUpdateStatus } from '@helpers/discord';
import { droppableGain, droppableMakeReal } from '@helpers/droppable';
import { heroAverageLevel } from '@helpers/hero';
import { itemElementAdd, itemIsEquipment } from '@helpers/item';
import { distanceBetweenNodes } from '@helpers/math';
import { gamestate, updateGamestate } from '@helpers/state-game';
import {
  timerAddUnclaimAction,
  timerGetRegisterTick,
  timerTicksElapsed,
} from '@helpers/timer';
import { globalStatusText } from '@helpers/ui';
import { worldNodeGetAccessId } from '@helpers/world';
import {
  worldNotifyClaim,
  worldNotifyUnclaimed,
} from '@helpers/world-change-notifications';
import { locationUpgradeStatTotal } from '@helpers/world-location-upgrade';
import {
  worldgenDetermineExploreTypeAndSetValues,
  worldgenLootForLocation,
} from '@helpers/worldgen';
import type { EquipmentItemContent } from '@interfaces/content-equipment';
import type { LocationType } from '@interfaces/content-worldconfig';
import type { DroppableEquippable, DropRarity } from '@interfaces/droppable';
import { RARITY_PRIORITY } from '@interfaces/droppable';
import type { WorldPosition } from '@interfaces/world';
import { REVELATION_RADIUS, type WorldLocation } from '@interfaces/world';
import { isNumber, sortBy } from 'es-toolkit/compat';

export function migrateUnclaimMissedNodes(): void {
  locationGetClaimed().forEach((claimed) => {
    if (
      locationIsPermanentlyClaimed(claimed) ||
      claimed.unclaimTime > timerTicksElapsed()
    )
      return;

    locationUnclaim(claimed);
  });
}

export function migratePermanentlyClaimedNodes(): void {
  locationGetClaimed().forEach((claimed) => {
    if (claimed.unclaimTime > 0) return;
    claimed.permanentlyClaimed = true;
  });
}

export function migrateResetClaimedNodeCounts(): void {
  const baseNodeCount = defaultNodeCountBlock();
  locationGetClaimed().forEach((node) => baseNodeCount[node.nodeType!]++);

  updateGamestate((state) => {
    state.world.claimedCounts = baseNodeCount;
    return state;
  });
}

export function locationExploreTimeRequired(location: WorldLocation): number {
  const heroLevel = heroAverageLevel();
  const diff = Math.abs(heroLevel - location.encounterLevel);
  const baseValue = location.encounterLevel * 5;

  if (heroLevel > location.encounterLevel) {
    return Math.max(1, baseValue - diff * 5);
  }

  if (heroLevel < location.encounterLevel) {
    return baseValue + diff * 10;
  }

  return baseValue;
}

export function locationClaimDuration(location: WorldLocation): number {
  const config = gamestate().world.config;
  const maxLevel = config.maxLevel;

  return (
    (maxLevel * 3 - location.encounterLevel) * maxLevel +
    locationUpgradeStatTotal(location, 'boostedTicksPerLevel')
  );
}

export function locationArriveAt(location: WorldLocation): void {
  if (location.currentlyClaimed) return;

  updateGamestate((state) => {
    state.hero.exploreTicks = 0;
    return state;
  });

  if (location.captureType === 'guardians') {
    updateGamestate((state) => {
      state.hero.combat = combatGenerateForLocation(location);
      return state;
    });
  }

  if (location.captureType === 'time') {
    const timeNeeded = locationExploreTimeRequired(location);
    updateGamestate((state) => {
      state.hero.exploreTicks = timeNeeded;
      return state;
    });
  }
}

/**
 * Get the highest rarity of loot items at a location
 * @param location World location with loot IDs
 * @returns Highest rarity found, or null if no loot items
 */
export function locationGetHighestLootRarity(
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

export function locationGet(
  x: number,
  y: number,
  state = gamestate(),
): WorldLocation {
  return state.world.nodes[`${x},${y}`] ?? defaultLocation(x, y);
}

export function locationGetCurrent(
  state = gamestate(),
): WorldLocation | undefined {
  const currentPosition = state.hero.position;
  return locationGet(currentPosition.x, currentPosition.y);
}

export function locationGetAll(): WorldLocation[] {
  return Object.values(gamestate().world.nodes);
}

export function locationGetInOrderOfCloseness(
  node: WorldLocation,
): WorldLocation[] {
  const nodes = locationGetAll();
  return sortBy(nodes, (n) => distanceBetweenNodes(node, n)).filter(
    (n) => n.nodeType && n.id !== node.id,
  );
}

export function locationNodesAround(
  x: number,
  y: number,
  squareRadius: number,
): WorldLocation[] {
  const nodes: WorldLocation[] = [];

  for (let dx = -squareRadius; dx <= squareRadius; dx++) {
    for (let dy = -squareRadius; dy <= squareRadius; dy++) {
      const tx = x + dx;
      const ty = y + dy;
      const node = locationGet(tx, ty);
      if (node?.nodeType) nodes.push(node);
    }
  }

  return nodes;
}

export function locationGetNearbySafeHaven(
  position: WorldPosition,
  requirePermanentlyOwned = false,
): WorldLocation | undefined {
  const nearest = locationGetNearest(position, ['town', 'village']);
  if (!nearest) return undefined;
  if (requirePermanentlyOwned && !locationIsPermanentlyClaimed(nearest))
    return undefined;

  const squareRadius = REVELATION_RADIUS[nearest.nodeType!];
  const allNodesNearby = locationNodesAround(
    position.x,
    position.y,
    squareRadius,
  );
  const amIContained = !!allNodesNearby.find((n) => n.id === nearest.id);

  return amIContained ? nearest : undefined;
}

export function locationIsPermanentlyClaimed(node: WorldLocation): boolean {
  return node.permanentlyClaimed;
}

export function locationGetNearest(
  position: {
    x: number;
    y: number;
  },
  types: LocationType[] = ['town'],
): WorldLocation | undefined {
  const allNodes = locationGetAll();
  const towns = allNodes.filter(
    (node) => types.includes(node.nodeType!) && node.currentlyClaimed,
  );
  if (towns.length === 0) return undefined;

  return sortBy(towns, (town) => distanceBetweenNodes(position, town))[0];
}

export function locationGetClosestUnclaimedClaimableLocation(
  node: WorldLocation,
  nodes = locationGetInOrderOfCloseness(node),
): WorldLocation {
  return nodes.filter((n) => !n.currentlyClaimed)[0];
}

export function locationGetAllMatchingPreferences(
  node: WorldLocation,
  nodes = locationGetInOrderOfCloseness(node),
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
    const highestRarity = locationGetHighestLootRarity(n);
    if (highestRarity && !lootRarityPreferences[highestRarity]) return false;

    return true;
  });

  const sortedNodes = sortBy(viableNodes, [
    (n) => distanceBetweenNodes(node, n),
    (n) => {
      const highestRarity = locationGetHighestLootRarity(n);
      return isNumber(highestRarity) ? RARITY_PRIORITY[highestRarity] : -1;
    },
    (n) => {
      const nodeId = worldNodeGetAccessId(n);
      return tooHardNodes.includes(nodeId) ? 1 : 0;
    },
  ]);

  return sortedNodes;
}

export function locationGetClaimed(): WorldLocation[] {
  return locationGetAll().filter((n) => n.currentlyClaimed);
}

export function locationRewardsGain(node: WorldLocation): void {
  globalStatusText.set(`You have claimed ${node.name}!`);
  claimMessageLog(node, `You have claimed ${node.name}!`);

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

  locationClaim(node);
}

export function locationClaim(node: WorldLocation): void {
  if (node.currentlyClaimed) return;

  currencyClaimsGain(node);

  let unclaimTime = 0;

  const nearbyPermanentNode = locationGetNearbySafeHaven(node, true);
  if (!nearbyPermanentNode) {
    // we can still buff ones even if we don't own the location
    const nearbyTownishNode = locationGetNearbySafeHaven(node, false);
    const claimDuration =
      locationClaimDuration(node) +
      (nearbyTownishNode
        ? locationUpgradeStatTotal(nearbyTownishNode, 'boostedTicksPerLevel')
        : 0);
    unclaimTime = timerGetRegisterTick(claimDuration);
    timerAddUnclaimAction(node, unclaimTime);
  }

  updateGamestate((state) => {
    const updateNodeData = locationGet(node.x, node.y, state);
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
export function locationUnclaim(node: WorldLocation): void {
  currencyClaimsLose(node);

  globalStatusText.set(`${node.name} was lost!`);
  claimMessageLog(node, `${node.name} was lost!`);

  updateGamestate((state) => {
    const updateNodeData = locationGet(node.x, node.y, state);
    if (updateNodeData) {
      updateNodeData.currentlyClaimed = false;

      worldgenDetermineExploreTypeAndSetValues(node);

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

function locationGetClaimedByType(type: LocationType): number {
  return gamestate().world.claimedCounts[type] ?? 0;
}

export function locationHasClaimedCount(
  type: LocationType,
  needed: number,
): boolean {
  return locationGetClaimedByType(type) >= needed;
}

export function locationAreAllClaimed(): boolean {
  const { nodeCounts, claimedCounts } = gamestate().world;

  return Object.keys(nodeCounts).every(
    (type) =>
      claimedCounts[type as LocationType] >= nodeCounts[type as LocationType],
  );
}

export function locationTooHardClear(): void {
  updateGamestate((state) => {
    state.hero.tooHardNodes = [];
    return state;
  });
}

export function locationAddTooHard(nodeId: string): void {
  updateGamestate((state) => {
    if (!state.hero.tooHardNodes.includes(nodeId)) {
      state.hero.tooHardNodes.push(nodeId);
    }
    return state;
  });
}
