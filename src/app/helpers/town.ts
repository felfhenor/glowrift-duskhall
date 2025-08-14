import {
  currencyHasAmount,
  currencyLose,
  currencyLoseMultiple,
} from '@helpers/currency';
import { defaultCurrencyBlock, defaultNodeCountBlock } from '@helpers/defaults';
import { gamestate, updateGamestate } from '@helpers/state-game';
import { locationHasClaimedCount } from '@helpers/world-location';
import type {
  GameCurrency,
  LocationType,
  TownBuilding,
  TownUpgradeContent,
} from '@interfaces';

export function townBuildingLevel(building: TownBuilding): number {
  return gamestate().town.buildingLevels[building] ?? 1;
}

export function townBuildingUpgradeCost(building: TownBuilding) {
  const liberationCosts: Record<TownBuilding, Record<LocationType, number>> = {
    Academy: {
      ...defaultNodeCountBlock(),
      dungeon: 1,
    },

    Alchemist: {
      ...defaultNodeCountBlock(),
      dungeon: 1,
    },

    Blacksmith: {
      ...defaultNodeCountBlock(),
      cave: 5,
    },

    Market: {
      ...defaultNodeCountBlock(),
      town: 1,
    },

    Merchant: {
      ...defaultNodeCountBlock(),
      village: 1,
    },

    Salvager: {
      ...defaultNodeCountBlock(),
      dungeon: 1,
    },

    'Rally Point': {
      ...defaultNodeCountBlock(),
      cave: 3,
    },
  };

  const currencyCosts: Record<TownBuilding, Record<GameCurrency, number>> = {
    Academy: {
      ...defaultCurrencyBlock(),
      Mana: 2500,
      'Fire Sliver': 100,
      'Water Sliver': 100,
      'Air Sliver': 100,
      'Earth Sliver': 100,
    },

    Alchemist: {
      ...defaultCurrencyBlock(),
      Mana: 1000,
      'Water Shard': 3,
    },

    Blacksmith: {
      ...defaultCurrencyBlock(),
      Mana: 1000,
      'Soul Essence': 50,
    },

    Market: {
      ...defaultCurrencyBlock(),
      Mana: 500,
      'Air Shard': 3,
    },

    Merchant: {
      ...defaultCurrencyBlock(),
      Mana: 5000,
      'Fire Shard': 3,
    },

    Salvager: {
      ...defaultCurrencyBlock(),
      Mana: 1000,
      'Earth Shard': 3,
    },
    'Rally Point': {
      ...defaultCurrencyBlock(),
      Mana: 10000,
      'Fire Sliver': 250,
      'Water Sliver': 250,
      'Air Sliver': 250,
      'Earth Sliver': 250,
      'Soul Essence': 25,
    },
  };

  const currentLevel = townBuildingLevel(building);

  const costs = {
    liberation: liberationCosts[building],
    currency: currencyCosts[building],
  };

  Object.keys(costs.liberation).forEach((libKey) => {
    costs.liberation[libKey as LocationType] *= currentLevel;
  });

  Object.keys(costs.currency).forEach((currKey) => {
    costs.currency[currKey as GameCurrency] *= currentLevel;
  });

  return costs;
}

export function townBuildingMaxLevel(building: TownBuilding) {
  const maxLevels: Record<TownBuilding, number> = {
    Academy: 99,
    Alchemist: 99,
    Blacksmith: 99,
    Market: 99,
    Merchant: 99,
    Salvager: 99,
    'Rally Point': 99,
  };

  return maxLevels[building] ?? 1;
}

export function townCanUpgradeBuildingLevel(building: TownBuilding): boolean {
  const level = townBuildingLevel(building);
  if (level >= townBuildingMaxLevel(building)) return false;

  const { liberation, currency } = townBuildingUpgradeCost(building);

  let shouldUpgrade = true;

  Object.keys(liberation).forEach((libType) => {
    const numRequired = liberation[libType as LocationType] ?? 0;
    if (numRequired <= 0) return;

    if (!locationHasClaimedCount(libType as LocationType, numRequired)) {
      shouldUpgrade = false;
    }
  });

  Object.keys(currency).forEach((currType) => {
    const numRequired = currency[currType as GameCurrency] ?? 0;
    if (numRequired <= 0) return;

    if (!currencyHasAmount(currType as GameCurrency, numRequired)) {
      shouldUpgrade = false;
    }
  });

  return shouldUpgrade;
}

export function townUpgradeBuildingLevel(building: TownBuilding): void {
  const { currency } = townBuildingUpgradeCost(building);
  Object.keys(currency).forEach((curr) => {
    currencyLose(curr as GameCurrency, currency[curr as GameCurrency] ?? 0);
  });

  updateGamestate((state) => {
    state.town.buildingLevels[building]++;
    return state;
  });
}

export function townHasUpgrade(upgrade: TownUpgradeContent): boolean {
  return gamestate().town.townUpgrades[upgrade.id];
}

export function townBuyUpgrade(upgrade: TownUpgradeContent): void {
  currencyLoseMultiple(upgrade.cost);

  updateGamestate((state) => {
    state.town.townUpgrades[upgrade.id] = true;
    return state;
  });
}
