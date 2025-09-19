import { ascendUpdateHighestCompletionPercentage } from '@helpers/ascension';
import { claimMessageLog } from '@helpers/claim-log';
import { combatGenerateForLocation } from '@helpers/combat-create';
import { getEntry } from '@helpers/content';
import { currencyClaimsGain, currencyClaimsLose } from '@helpers/currency';
import { defaultLocation } from '@helpers/defaults';
import { discordUpdateStatus } from '@helpers/discord';
import { droppableGain, droppableMakeReal } from '@helpers/droppable';
import {
  guardianCreateForLocation,
  guardianMaxDamage,
} from '@helpers/guardian';
import { allHeroes, heroAverageLevel } from '@helpers/hero';
import { interconnectednessState } from '@helpers/interconnectedness';
import { itemElementAdd, itemIsEquipment } from '@helpers/item';
import { distanceBetweenNodes } from '@helpers/math';
import { riftglowUpgradeGetValue } from '@helpers/riftglow';
import { gamestate, updateGamestate } from '@helpers/state-game';
import { timerAddUnclaimAction, timerGetRegisterTick } from '@helpers/timer';
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
import type { GuardianContent } from '@interfaces/content-guardian';
import type { LocationType } from '@interfaces/content-worldconfig';
import type { DroppableEquippable, DropRarity } from '@interfaces/droppable';
import { RARITY_PRIORITY } from '@interfaces/droppable';
import type {
  WorldLocationTerrorLevel,
  WorldPosition,
} from '@interfaces/world';
import { type WorldLocation } from '@interfaces/world';
import { isNumber, mean, sortBy, sumBy } from 'es-toolkit/compat';

export function locationExploreTimeRequired(location: WorldLocation): number {
  const heroLevel = heroAverageLevel();
  const diff = Math.abs(heroLevel - location.encounterLevel);
  const baseValue = location.encounterLevel * 5;

  const reduction = riftglowUpgradeGetValue('BonusExploreSpeed');
  let exploreTime = baseValue;

  if (heroLevel > location.encounterLevel) {
    exploreTime = Math.max(1, baseValue - diff * 5);
  }

  if (heroLevel < location.encounterLevel) {
    exploreTime = baseValue + diff * 10;
  }

  return Math.max(1, exploreTime - reduction);
}

export function locationClaimDuration(location: WorldLocation): number {
  const config = gamestate().world.config;
  const maxLevel = config.maxLevel;
  const claimCount = location.claimCount + 1;

  return (
    (maxLevel * 3 - location.encounterLevel) * claimCount ** 2.1 +
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

export function locationZoneOwner(
  position: WorldPosition,
): WorldLocation | undefined {
  const pos =
    interconnectednessState()[worldNodeGetAccessId(position)]?.zocOwnerPosition;
  if (!pos) return undefined;

  const node = locationGet(pos.x, pos.y);
  return node.currentlyClaimed ? node : undefined;
}

export function locationIsPermanentlyClaimed(node: WorldLocation): boolean {
  return !!node.permanentlyClaimed;
}

export function locationGetNearestOwnedTown(
  position: WorldPosition,
): WorldLocation {
  const nearestTowns =
    interconnectednessState()[worldNodeGetAccessId(position)]
      .nearbyTownOrderPositions;

  return nearestTowns
    .map((n) => locationGet(n.x, n.y))
    .filter((t) => t.currentlyClaimed)[0]!;
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
  else if (riskTolerance === 'none') levelThreshold = -100;

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
    (n) => {
      const nodeId = worldNodeGetAccessId(n);
      return tooHardNodes.includes(nodeId) ? 1 : 0;
    },
    (n) => distanceBetweenNodes(node, n),
    (n) => {
      const highestRarity = locationGetHighestLootRarity(n);
      return isNumber(highestRarity) ? RARITY_PRIORITY[highestRarity] : -1;
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

  let claimDuration = 0;
  let unclaimTime = 0;

  const zocOwner = locationZoneOwner(node);
  if (!zocOwner) {
    claimDuration += locationClaimDuration(node);
  }

  if (zocOwner && !zocOwner.permanentlyClaimed) {
    claimDuration += locationClaimDuration(node);
    claimDuration += locationUpgradeStatTotal(zocOwner, 'boostedTicksPerLevel');
  }

  if (claimDuration > 0) {
    unclaimTime = timerGetRegisterTick(claimDuration);
    timerAddUnclaimAction(node, unclaimTime);
  }

  updateGamestate((state) => {
    const updateNodeData = locationGet(node.x, node.y, state);
    if (updateNodeData) {
      updateNodeData.claimCount++;
      updateNodeData.currentlyClaimed = true;
      if (zocOwner?.permanentlyClaimed) {
        updateNodeData.permanentlyClaimed = true;
      }

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

  ascendUpdateHighestCompletionPercentage();
  discordUpdateStatus();
}

export function locationUnclaim(node: WorldLocation): void {
  if (!node.currentlyClaimed) return;

  currencyClaimsLose(node);

  globalStatusText.set(`${node.name} was lost!`);
  claimMessageLog(node, `${node.name} was lost!`);

  updateGamestate((state) => {
    const updateNodeData = locationGet(node.x, node.y, state);
    if (updateNodeData) {
      updateNodeData.currentlyClaimed = false;

      worldgenDetermineExploreTypeAndSetValues(node, state.world.homeBase);

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

export function locationTerrorLevel(
  location: WorldLocation,
): WorldLocationTerrorLevel {
  const totalHeroHealth = sumBy(allHeroes(), (h) => h.totalStats.Health);
  const averageMaxDamage = mean(
    location.guardianIds
      .map((g) => getEntry<GuardianContent>(g))
      .filter(Boolean)
      .map((g) => guardianCreateForLocation(location, g!))
      .map((g) => guardianMaxDamage(g)),
  );
  const worstDamagePerRound = averageMaxDamage * location.guardianIds.length;
  const worstPotentialPercent = (worstDamagePerRound / totalHeroHealth) * 100;

  if (worstPotentialPercent <= 10) return 'Safe';
  if (worstPotentialPercent <= 25) return 'Uncomfortable';
  if (worstPotentialPercent <= 50) return 'Scary';
  if (worstPotentialPercent <= 75) return 'Terrifying';
  return 'Fatal';
}
