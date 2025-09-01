import {
  currencyClaimsGain,
  currencyClaimsGetCurrent,
  currencyClaimsGetForNode,
  currencyClaimsGetUpdated,
  currencyClaimsLose,
  currencyClaimsMerge,
  currencyClaimsUpdate,
  currencyGain,
  currencyGainMultiple,
  currencyGet,
  currencyHasAmount,
  currencyHasMultipleAmounts,
  currencyLose,
  currencyLoseMultiple,
  currencySortByOrder,
} from '@helpers/currency';
import type { CurrencyBlock, GameCurrency, WorldLocation } from '@interfaces';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@helpers/defaults', () => ({
  defaultLocation: () => ({
    id: 'test-location',
    x: 0,
    y: 0,
    nodeType: 'dungeon',
    encounterLevel: 1,
    claimed: true,
    unclaimTime: 0,
    visible: true,
    traits: [],
    locationUpgrades: {},
    traitIds: [],
    elements: [],
  }),
  defaultCurrencyBlock: () => ({
    'Fire Sliver': 0,
    'Fire Shard': 0,
    'Fire Crystal': 0,
    'Fire Core': 0,
    'Water Sliver': 0,
    'Water Shard': 0,
    'Water Crystal': 0,
    'Water Core': 0,
    'Air Sliver': 0,
    'Air Shard': 0,
    'Air Crystal': 0,
    'Air Core': 0,
    'Earth Sliver': 0,
    'Earth Shard': 0,
    'Earth Crystal': 0,
    'Earth Core': 0,
    'Soul Essence': 0,
    'Common Dust': 0,
    'Uncommon Dust': 0,
    'Rare Dust': 0,
    'Legendary Dust': 0,
    'Mystical Dust': 0,
    'Unique Dust': 0,
    Mana: 0,
  }),
}));

// Mock state with factory functions
vi.mock('@helpers/state-game', () => {
  const defaultCurrencies: CurrencyBlock = {
    Mana: 100,
    'Soul Essence': 50,
    'Fire Sliver': 25,
    'Water Sliver': 30,
    'Air Sliver': 20,
    'Earth Sliver': 15,
    'Common Dust': 10,
    'Fire Shard': 5,
    'Water Shard': 3,
    'Air Shard': 2,
    'Earth Shard': 1,
    'Fire Crystal': 0,
    'Water Crystal': 0,
    'Air Crystal': 0,
    'Earth Crystal': 0,
    'Fire Core': 0,
    'Water Core': 0,
    'Air Core': 0,
    'Earth Core': 0,
    'Uncommon Dust': 0,
    'Rare Dust': 0,
    'Mystical Dust': 0,
    'Legendary Dust': 0,
    'Unique Dust': 0,
  };

  return {
    gamestate: vi.fn(() => ({
      currency: {
        currencies: { ...defaultCurrencies },
        currencyPerTickEarnings: {} as Record<GameCurrency, number>,
      },
    })),
    updateGamestate: vi.fn(),
  };
});

vi.mock('@helpers/world-location', () => ({
  locationGetClaimed: vi.fn(() => []),
  locationGetNearbySafeHaven: vi.fn(() => null),
}));

vi.mock('@helpers/signal', () => ({
  localStorageSignal: vi.fn(),
}));

vi.mock('@helpers/state-options', () => ({
  options: vi.fn(),
}));

vi.mock('@helpers/trait-location-currency', () => ({
  locationTraitCurrencyAllGenerateModifiers: vi.fn(() => []),
}));

vi.mock('@helpers/world-location-upgrade', () => ({
  locationUpgradeStatTotal: vi.fn(() => 0),
}));

vi.mock('@helpers/festival-production', () => ({
  festivalProductionMultiplier: vi.fn(() => 0),
}));

vi.mock('@helpers/content', () => ({
  getEntry: vi.fn(),
}));

import { defaultLocation } from '@helpers/defaults';
import { gamestate, updateGamestate } from '@helpers/state-game';

describe('Currency Helper Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock to return default currencies for each test
    vi.mocked(gamestate).mockReturnValue({
      currency: {
        currencies: {
          Mana: 100,
          'Soul Essence': 50,
          'Fire Sliver': 25,
          'Water Sliver': 30,
          'Air Sliver': 20,
          'Earth Sliver': 15,
          'Common Dust': 10,
          'Fire Shard': 5,
          'Water Shard': 3,
          'Air Shard': 2,
          'Earth Shard': 1,
          'Fire Crystal': 0,
          'Water Crystal': 0,
          'Air Crystal': 0,
          'Earth Crystal': 0,
          'Fire Core': 0,
          'Water Core': 0,
          'Air Core': 0,
          'Earth Core': 0,
          'Uncommon Dust': 0,
          'Rare Dust': 0,
          'Mystical Dust': 0,
          'Legendary Dust': 0,
          'Unique Dust': 0,
        } as CurrencyBlock,
        currencyPerTickEarnings: {} as Record<GameCurrency, number>,
      },
    } as ReturnType<typeof gamestate>);
  });

  describe('currencyGet', () => {
    it('should return currency amount from gamestate', () => {
      expect(currencyGet('Mana')).toBe(100);
    });

    it('should return 0 for undefined currency', () => {
      vi.mocked(gamestate).mockReturnValue({
        currency: {
          currencies: {} as CurrencyBlock,
          currencyPerTickEarnings: {} as Record<GameCurrency, number>,
        },
      } as ReturnType<typeof gamestate>);
      expect(currencyGet('Fire Sliver')).toBe(0);
    });

    it('should return Soul Essence amount', () => {
      expect(currencyGet('Soul Essence')).toBe(50);
    });

    it('should return elemental sliver amounts', () => {
      expect(currencyGet('Fire Sliver')).toBe(25);
      expect(currencyGet('Water Sliver')).toBe(30);
      expect(currencyGet('Air Sliver')).toBe(20);
      expect(currencyGet('Earth Sliver')).toBe(15);
    });
  });

  describe('currencyHasAmount', () => {
    it('should return true if currency amount is sufficient', () => {
      expect(currencyHasAmount('Mana', 50)).toBe(true);
    });

    it('should return false if currency amount is insufficient', () => {
      expect(currencyHasAmount('Mana', 150)).toBe(false);
    });

    it('should return true for exact amount', () => {
      expect(currencyHasAmount('Soul Essence', 50)).toBe(true);
    });

    it('should return false for zero currency when requesting positive amount', () => {
      expect(currencyHasAmount('Fire Core', 1)).toBe(false);
    });
  });

  describe('currencyHasMultipleAmounts', () => {
    it('should return true when player has all required currencies in full block', () => {
      const costs: CurrencyBlock = {
        Mana: 50,
        'Soul Essence': 25,
        'Fire Sliver': 10,
        'Water Sliver': 15,
        'Air Sliver': 5,
        'Earth Sliver': 3,
        'Fire Shard': 2,
        'Water Shard': 1,
        'Air Shard': 1,
        'Earth Shard': 0,
        'Fire Crystal': 0,
        'Water Crystal': 0,
        'Air Crystal': 0,
        'Earth Crystal': 0,
        'Fire Core': 0,
        'Water Core': 0,
        'Air Core': 0,
        'Earth Core': 0,
        'Common Dust': 5,
        'Uncommon Dust': 0,
        'Rare Dust': 0,
        'Mystical Dust': 0,
        'Legendary Dust': 0,
        'Unique Dust': 0,
      };
      expect(currencyHasMultipleAmounts(costs)).toBe(true);
    });

    it('should return false when player lacks one currency in full block', () => {
      const costs: CurrencyBlock = {
        Mana: 150,
        'Soul Essence': 25,
        'Fire Sliver': 10,
        'Water Sliver': 15,
        'Air Sliver': 5,
        'Earth Sliver': 3,
        'Fire Shard': 2,
        'Water Shard': 1,
        'Air Shard': 1,
        'Earth Shard': 0,
        'Fire Crystal': 0,
        'Water Crystal': 0,
        'Air Crystal': 0,
        'Earth Crystal': 0,
        'Fire Core': 0,
        'Water Core': 0,
        'Air Core': 0,
        'Earth Core': 0,
        'Common Dust': 5,
        'Uncommon Dust': 0,
        'Rare Dust': 0,
        'Mystical Dust': 0,
        'Legendary Dust': 0,
        'Unique Dust': 0,
      };
      expect(currencyHasMultipleAmounts(costs)).toBe(false);
    });
  });

  describe('currencyGain', () => {
    it('should call updateGamestate when gaining currency', () => {
      currencyGain('Mana', 50);
      expect(updateGamestate).toHaveBeenCalled();
    });

    it('should handle zero gain amounts', () => {
      currencyGain('Mana', 0);
      expect(updateGamestate).toHaveBeenCalled();
    });

    it('should handle default amount of 1', () => {
      currencyGain('Mana');
      expect(updateGamestate).toHaveBeenCalled();
    });
  });

  describe('currencyGainMultiple', () => {
    it('should call updateGamestate when gaining multiple currencies', () => {
      const gains: Partial<CurrencyBlock> = {
        Mana: 50,
        'Soul Essence': 25,
      };
      currencyGainMultiple(gains);
      expect(updateGamestate).toHaveBeenCalled();
    });

    it('should handle empty gains object', () => {
      currencyGainMultiple({});
      expect(updateGamestate).toHaveBeenCalled();
    });

    it('should handle gains with zero values', () => {
      const gains: Partial<CurrencyBlock> = {
        Mana: 0,
        'Soul Essence': 25,
      };
      currencyGainMultiple(gains);
      expect(updateGamestate).toHaveBeenCalled();
    });
  });

  describe('currencyLose', () => {
    it('should call updateGamestate when losing currency', () => {
      currencyLose('Mana', 25);
      expect(updateGamestate).toHaveBeenCalled();
    });

    it('should handle attempting to lose more than available', () => {
      currencyLose('Mana', 150);
      expect(updateGamestate).toHaveBeenCalled();
    });

    it('should handle zero loss amounts', () => {
      currencyLose('Mana', 0);
      expect(updateGamestate).toHaveBeenCalled();
    });

    it('should handle default amount of 1', () => {
      currencyLose('Mana');
      expect(updateGamestate).toHaveBeenCalled();
    });
  });

  describe('currencyLoseMultiple', () => {
    it('should call updateGamestate when losing multiple currencies', () => {
      const costs: Partial<CurrencyBlock> = {
        Mana: 25,
        'Soul Essence': 10,
      };
      currencyLoseMultiple(costs);
      expect(updateGamestate).toHaveBeenCalled();
    });

    it('should handle empty costs object', () => {
      currencyLoseMultiple({});
      expect(updateGamestate).toHaveBeenCalled();
    });

    it('should handle costs with zero values', () => {
      const costs: Partial<CurrencyBlock> = {
        Mana: 0,
        'Soul Essence': 10,
      };
      currencyLoseMultiple(costs);
      expect(updateGamestate).toHaveBeenCalled();
    });
  });

  describe('currencyClaimsGetCurrent', () => {
    it('should execute without errors', () => {
      expect(() => currencyClaimsGetCurrent()).not.toThrow();
    });
  });

  describe('currencyClaimsGetUpdated', () => {
    it('should return currency block', () => {
      const result = currencyClaimsGetUpdated();
      expect(typeof result).toBe('object');
      expect(result).toBeDefined();
    });
  });

  describe('currencyClaimsGain', () => {
    it('should handle gaining claims for a location', () => {
      const mockLocation: WorldLocation = {
        ...defaultLocation(),
        nodeType: 'dungeon',
        traitIds: [],
        claimed: true,
      } as WorldLocation;

      expect(() => currencyClaimsGain(mockLocation)).not.toThrow();
    });
  });

  describe('currencyClaimsLose', () => {
    it('should handle losing claims for a location', () => {
      const mockLocation: WorldLocation = {
        ...defaultLocation(),
        nodeType: 'dungeon',
        traitIds: [],
        claimed: true,
      } as WorldLocation;

      expect(() => currencyClaimsLose(mockLocation)).not.toThrow();
    });
  });

  describe('currencyClaimsMerge', () => {
    it('should merge currency deltas', () => {
      const delta: CurrencyBlock = {
        Mana: 10,
        'Soul Essence': 5,
        'Fire Sliver': 0,
        'Water Sliver': 0,
        'Air Sliver': 0,
        'Earth Sliver': 0,
        'Fire Shard': 0,
        'Water Shard': 0,
        'Air Shard': 0,
        'Earth Shard': 0,
        'Fire Crystal': 0,
        'Water Crystal': 0,
        'Air Crystal': 0,
        'Earth Crystal': 0,
        'Fire Core': 0,
        'Water Core': 0,
        'Air Core': 0,
        'Earth Core': 0,
        'Common Dust': 0,
        'Uncommon Dust': 0,
        'Rare Dust': 0,
        'Mystical Dust': 0,
        'Legendary Dust': 0,
        'Unique Dust': 0,
      };

      currencyClaimsMerge(delta);
      expect(updateGamestate).toHaveBeenCalled();
    });
  });

  describe('currencyClaimsGetForNode', () => {
    it('should calculate currency claims for cave nodes', () => {
      const node: WorldLocation = {
        ...defaultLocation(),
        nodeType: 'cave',
        traitIds: [],
        elements: [{ element: 'Fire', intensity: 100 }],
        claimed: true,
      } as WorldLocation;

      const claims = currencyClaimsGetForNode(node);
      expect(claims['Fire Sliver']).toBe(1);
    });

    it('should calculate currency claims for village nodes', () => {
      const node: WorldLocation = {
        ...defaultLocation(),
        nodeType: 'village',
        traitIds: [],
        claimed: true,
      } as WorldLocation;

      const claims = currencyClaimsGetForNode(node);
      expect(claims.Mana).toBe(1);
    });

    it('should calculate currency claims for town nodes', () => {
      const node: WorldLocation = {
        ...defaultLocation(),
        nodeType: 'town',
        traitIds: [],
        claimed: true,
      } as WorldLocation;

      const claims = currencyClaimsGetForNode(node);
      expect(claims.Mana).toBe(5);
    });

    it('should calculate currency claims for dungeon nodes', () => {
      const node: WorldLocation = {
        ...defaultLocation(),
        nodeType: 'dungeon',
        traitIds: [],
        elements: [{ element: 'Fire', intensity: 100 }],
        claimed: true,
      } as WorldLocation;

      const claims = currencyClaimsGetForNode(node);
      expect(claims['Fire Shard']).toBe(1); // 100/100 = 1
    });

    it('should return zero claims for unclaimed nodes', () => {
      const node: WorldLocation = {
        ...defaultLocation(),
        nodeType: 'dungeon',
        traitIds: [],
        claimed: false,
      } as WorldLocation;

      const claims = currencyClaimsGetForNode(node);
      expect(Object.values(claims).every((val) => val === 0)).toBe(true);
    });

    it('should handle nodes without nodeType', () => {
      const node: WorldLocation = {
        ...defaultLocation(),
        nodeType: undefined,
        traitIds: [],
        claimed: true,
      } as WorldLocation;

      const claims = currencyClaimsGetForNode(node);
      expect(Object.values(claims).every((val) => val === 0)).toBe(true);
    });

    it('should handle unclaimed nodes', () => {
      const node: WorldLocation = {
        ...defaultLocation(),
        nodeType: 'cave',
        traitIds: [],
        claimed: false,
      } as WorldLocation;

      const claims = currencyClaimsGetForNode(node);
      expect(Object.values(claims).every((val) => val === 0)).toBe(true);
    });
  });

  describe('currencyClaimsUpdate', () => {
    it('should call updateGamestate', () => {
      currencyClaimsUpdate();
      expect(updateGamestate).toHaveBeenCalled();
    });

    it('should call updateGamestate with provided claims', () => {
      const claims: CurrencyBlock = {
        Mana: 10,
        'Soul Essence': 5,
        'Fire Sliver': 0,
        'Water Sliver': 0,
        'Air Sliver': 0,
        'Earth Sliver': 0,
        'Fire Shard': 0,
        'Water Shard': 0,
        'Air Shard': 0,
        'Earth Shard': 0,
        'Fire Crystal': 0,
        'Water Crystal': 0,
        'Air Crystal': 0,
        'Earth Crystal': 0,
        'Fire Core': 0,
        'Water Core': 0,
        'Air Core': 0,
        'Earth Core': 0,
        'Common Dust': 0,
        'Uncommon Dust': 0,
        'Rare Dust': 0,
        'Mystical Dust': 0,
        'Legendary Dust': 0,
        'Unique Dust': 0,
      };

      currencyClaimsUpdate(claims);
      expect(updateGamestate).toHaveBeenCalled();
    });
  });

  describe('currencySortByOrder', () => {
    it('should sort currencies in the correct order', () => {
      const unsortedCurrencies = [
        'Soul Essence',
        'Fire Sliver',
        'Air Crystal',
        'Mana',
        'Common Dust',
        'Earth Shard',
        'Water Core',
      ] as GameCurrency[];

      const sorted = currencySortByOrder(unsortedCurrencies);

      expect(sorted).toEqual([
        'Mana',
        'Earth Shard',
        'Fire Sliver',
        'Water Core',
        'Air Crystal',
        'Common Dust',
        'Soul Essence',
      ]);
    });

    it('should handle empty array', () => {
      const result = currencySortByOrder([]);
      expect(result).toEqual([]);
    });

    it('should handle single currency', () => {
      const result = currencySortByOrder(['Mana']);
      expect(result).toEqual(['Mana']);
    });

    it('should put unknown currencies at the end', () => {
      const currencies = [
        'Unknown Currency',
        'Mana',
        'Fire Sliver',
      ] as GameCurrency[];

      const sorted = currencySortByOrder(currencies);

      expect(sorted).toEqual(['Mana', 'Fire Sliver', 'Unknown Currency']);
    });

    it('should maintain order of elements correctly', () => {
      const allElementalCurrencies = [
        'Air Core',
        'Earth Sliver',
        'Fire Crystal',
        'Water Shard',
        'Air Sliver',
        'Earth Core',
        'Fire Shard',
        'Water Crystal',
      ] as GameCurrency[];

      const sorted = currencySortByOrder(allElementalCurrencies);

      expect(sorted).toEqual([
        'Earth Sliver',
        'Earth Core',
        'Fire Shard',
        'Fire Crystal',
        'Water Shard',
        'Water Crystal',
        'Air Sliver',
        'Air Core',
      ]);
    });

    it('should maintain order of dusts correctly', () => {
      const dustCurrencies = [
        'Legendary Dust',
        'Common Dust',
        'Mystical Dust',
        'Rare Dust',
        'Unique Dust',
        'Uncommon Dust',
      ] as GameCurrency[];

      const sorted = currencySortByOrder(dustCurrencies);

      expect(sorted).toEqual([
        'Common Dust',
        'Uncommon Dust',
        'Rare Dust',
        'Mystical Dust',
        'Legendary Dust',
        'Unique Dust',
      ]);
    });
  });
});
