import { getEntriesByType, getEntry } from '@helpers/content';
import {
  currencyClaimsForNodeWithoutUpgrades,
  currencyClaimsUpdate,
  currencyHasMultipleAmounts,
  currencyLoseMultiple,
} from '@helpers/currency';
import { distanceBetweenNodes } from '@helpers/math';
import { riftglowUpgradeGetValue } from '@helpers/riftglow';
import { updateGamestate } from '@helpers/state-game';
import {
  timerAddUnclaimAction,
  timerGetUnclaimActionForLocation,
  timerRemoveActionById,
} from '@helpers/timer';
import { townBuildingLevel, townHasUpgrade } from '@helpers/town';
import { locationTraitEncounterLevelModifier } from '@helpers/trait-location-worldgen';
import { worldNodeGetAccessId } from '@helpers/world';
import { worldNotifyUpdated } from '@helpers/world-change-notifications';
import {
  locationGetClaimed,
  locationIsPermanentlyClaimed,
  locationNodesAround,
} from '@helpers/world-location';
import type { CurrencyBlock, GameCurrency } from '@interfaces/content-currency';
import type {
  LocationUpgradeContent,
  LocationUpgradeContentNumerics,
  LocationUpgradeId,
} from '@interfaces/content-locationupgrade';
import type { TownUpgradeContent } from '@interfaces/content-townupgrade';
import { REVELATION_RADIUS, type WorldLocation } from '@interfaces/world';
import { sortBy, sum, sumBy, uniq } from 'es-toolkit/compat';

export function locationEncounterLevel(location: WorldLocation): number {
  return (
    location.encounterLevel + locationTraitEncounterLevelModifier(location)
  );
}

export function locationLootLevel(location: WorldLocation): number {
  return (
    location.encounterLevel +
    locationUpgradeStatTotal(location, 'boostedLootLevelPerLevel') +
    riftglowUpgradeGetValue('BonusLootLevel')
  );
}

export function locationMaxLevel(): number {
  return townBuildingLevel('Rally Point');
}

export function locationLevel(location: WorldLocation): number {
  return sum(Object.values(location.locationUpgrades ?? {}));
}

export function locationUpgradeLevel(
  location: WorldLocation,
  upgrade: LocationUpgradeContent,
): number {
  return (
    (location.locationUpgrades?.[upgrade.id] ?? 0) +
    (location.locationUpgrades?.[upgrade.pairedLocationUpgradeId] ?? 0)
  );
}

export function locationCanUpgrade(
  location: WorldLocation,
  upgrade: LocationUpgradeContent,
): boolean {
  const townUpgrade = getEntry<TownUpgradeContent>(
    upgrade.requiresTownUpgradeId,
  );
  if (!townUpgrade) return false;

  return (
    townHasUpgrade(townUpgrade) &&
    locationLevel(location) < townBuildingLevel('Rally Point') &&
    currencyHasMultipleAmounts(locationUpgradeCosts(location, upgrade))
  );
}

export function locationAvailableUpgrades(
  location: WorldLocation,
): LocationUpgradeContent[] {
  const nodeType = location.nodeType;
  if (!nodeType) return [];

  return getEntriesByType<LocationUpgradeContent>('locationupgrade').filter(
    (upgrade) => {
      const permanentClaimed = locationIsPermanentlyClaimed(location);
      if (permanentClaimed && upgrade.boostedUnclaimableCount) return false;

      if (permanentClaimed && upgrade.requireClaimType === 'temporary')
        return false;
      if (!permanentClaimed && upgrade.requireClaimType === 'permanent')
        return false;

      return (
        upgrade.appliesToTypes.includes(nodeType) &&
        townHasUpgrade(
          getEntry<TownUpgradeContent>(upgrade.requiresTownUpgradeId)!,
        )
      );
    },
  );
}

export function locationUpgradeCostScalar(
  location: WorldLocation,
  upgrade: LocationUpgradeContent,
): number {
  return (
    upgrade.costScalePerTile *
    (1 +
      sortBy(
        locationGetClaimed()
          .filter((n) => n.nodeType === 'town')
          .map((node) => distanceBetweenNodes(node, location)),
      )[0])
  );
}

export function locationUpgradeCosts(
  location: WorldLocation,
  upgrade: LocationUpgradeContent,
): CurrencyBlock {
  const baseScalar = locationUpgradeCostScalar(location, upgrade);
  const generatedResources = currencyClaimsForNodeWithoutUpgrades(location);

  const usedCurrencies: GameCurrency[] = uniq([
    'Mana',
    'Soul Essence',
    'Common Dust',
    'Uncommon Dust',
    'Rare Dust',
    'Mystical Dust',
    'Legendary Dust',
    ...(Object.keys(generatedResources).filter(
      (k) => generatedResources[k as GameCurrency] > 0,
    ) as GameCurrency[]),
  ]);

  return usedCurrencies.reduce((acc, currency) => {
    const value = upgrade.baseCost[currency]
      ? (generatedResources[currency] ?? 0) + upgrade.baseCost[currency]
      : 0;

    if (value === 0) return acc;

    acc[currency] = baseScalar * value;
    return acc;
  }, {} as CurrencyBlock);
}

function upgradePermanentlyClaimNearbyClaimedNodes(
  location: WorldLocation,
): void {
  const type = location.nodeType;
  if (!type || !['town'].includes(type)) return;

  const radius = REVELATION_RADIUS[type];

  updateGamestate((state) => {
    locationNodesAround(location.x, location.y, radius).forEach((node) => {
      state.world.nodes[worldNodeGetAccessId(node)].unclaimTime = -1;
      state.world.nodes[worldNodeGetAccessId(node)].permanentlyClaimed = true;
    });

    return state;
  });
}

export function locationUpgrade(
  location: WorldLocation,
  upgrade: LocationUpgradeContent,
): void {
  if (locationLevel(location) >= locationMaxLevel()) return;

  const costs = locationUpgradeCosts(location, upgrade);
  if (!currencyHasMultipleAmounts(costs)) return;

  currencyLoseMultiple(costs);

  location.locationUpgrades ??= {};
  location.locationUpgrades[upgrade.id] =
    (location.locationUpgrades[upgrade.id] ?? 0) + 1;

  if (upgrade.boostedUnclaimableCount) {
    location.unclaimTime = -1;
    location.permanentlyClaimed = true;
    upgradePermanentlyClaimNearbyClaimedNodes(location);
  }

  if (
    upgrade.boostedProductionValuePercentPerLevel ||
    upgrade.boostedDustProductionPerLevel
  ) {
    currencyClaimsUpdate();
  }

  if (upgrade.boostedTicksPerLevel) {
    const oldTimer = timerGetUnclaimActionForLocation(location);
    if (oldTimer) {
      timerRemoveActionById(oldTimer.id, oldTimer.tick);
    }

    location.unclaimTime += upgrade.boostedTicksPerLevel;

    timerAddUnclaimAction(location, location.unclaimTime);
  }

  worldNotifyUpdated(location);

  updateGamestate((state) => {
    state.world.nodes[worldNodeGetAccessId(location)] = location;
    return state;
  });
}

export function locationUpgradeStatTotal(
  location: WorldLocation,
  key: keyof LocationUpgradeContentNumerics,
): number {
  return sumBy(Object.keys(location.locationUpgrades ?? {}), (upgKey) => {
    const upgradeData = getEntry<LocationUpgradeContent>(upgKey)!;
    const permanentlyClaimed = locationIsPermanentlyClaimed(location);

    if (permanentlyClaimed && upgradeData.requireClaimType === 'temporary')
      return 0;
    if (!permanentlyClaimed && upgradeData.requireClaimType === 'permanent')
      return 0;

    return (
      (location.locationUpgrades[upgKey as LocationUpgradeId] ?? 0) *
      (upgradeData?.[key] ?? 0)
    );
  });
}
