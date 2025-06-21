import { GameCurrency, LocationType, TownBuilding } from '../interfaces';
import { hasCurrency, loseCurrency } from './currency';
import {
  blankCurrencyBlock,
  blankNodeCountBlock,
  gamestate,
  updateGamestate,
} from './state-game';
import { hasClaimedNodeCount } from './world';

export function getBuildingLevel(building: TownBuilding): number {
  return gamestate().town.buildingLevels[building] ?? 1;
}

export function buildingUpgradeCost(building: TownBuilding) {
  const liberationCosts: Record<TownBuilding, Record<LocationType, number>> = {
    Academy: {
      ...blankNodeCountBlock(),
      dungeon: 3,
    },

    Alchemist: {
      ...blankNodeCountBlock(),
      cave: 25,
    },

    Blacksmith: {
      ...blankNodeCountBlock(),
      cave: 25,
    },

    Market: {
      ...blankNodeCountBlock(),
      town: 1,
    },

    Merchant: {
      ...blankNodeCountBlock(),
      village: 3,
    },
  };

  const currencyCosts: Record<TownBuilding, Record<GameCurrency, number>> = {
    Academy: {
      ...blankCurrencyBlock(),
      Mana: 5000,
    },

    Alchemist: {
      ...blankCurrencyBlock(),
      Mana: 1000,
    },

    Blacksmith: {
      ...blankCurrencyBlock(),
      Mana: 1000,
    },

    Market: {
      ...blankCurrencyBlock(),
      Mana: 500,
    },

    Merchant: {
      ...blankCurrencyBlock(),
      Mana: 5000,
    },
  };

  const currentLevel = getBuildingLevel(building);

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

export function buildingMaxLevel(building: TownBuilding) {
  const maxLevels: Record<TownBuilding, number> = {
    Academy: 99,
    Alchemist: 99,
    Blacksmith: 99,
    Market: 99,
    Merchant: 99,
  };

  return maxLevels[building] ?? 1;
}

export function canUpgradeBuildingLevel(building: TownBuilding): boolean {
  const level = getBuildingLevel(building);
  if (level >= buildingMaxLevel(building)) return false;

  const { liberation, currency } = buildingUpgradeCost(building);

  let shouldUpgrade = true;

  Object.keys(liberation).forEach((libType) => {
    const numRequired = liberation[libType as LocationType] ?? 0;
    if (numRequired <= 0) return;

    if (!hasClaimedNodeCount(libType as LocationType, numRequired)) {
      shouldUpgrade = false;
    }
  });

  Object.keys(currency).forEach((currType) => {
    const numRequired = currency[currType as GameCurrency] ?? 0;
    if (numRequired <= 0) return;

    if (!hasCurrency(currType as GameCurrency, numRequired)) {
      shouldUpgrade = false;
    }
  });

  return shouldUpgrade;
}

export function upgradeBuildingLevel(building: TownBuilding): void {
  const { currency } = buildingUpgradeCost(building);
  Object.keys(currency).forEach((curr) => {
    loseCurrency(curr as GameCurrency, currency[curr as GameCurrency] ?? 0);
  });

  updateGamestate((state) => {
    state.town.buildingLevels[building]++;
    return state;
  });
}
