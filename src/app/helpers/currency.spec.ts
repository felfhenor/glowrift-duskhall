import {
  getCurrency,
  getCurrencyClaimsForNode,
  hasCurrency,
} from '@helpers/currency';
import type { CurrencyBlock, GameCurrency, WorldLocation } from '@interfaces';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('@helpers/state-game', () => ({
  gamestate: vi.fn(),
  updateGamestate: vi.fn((callback) =>
    callback({
      currency: {
        currencies: {} as Record<GameCurrency, number>,
        currencyPerTickEarnings: {} as Record<GameCurrency, number>,
      },
    }),
  ),
  blankCurrencyBlock: () => ({
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

vi.mock('@helpers/world', () => ({
  getClaimedNodes: vi.fn(),
}));

vi.mock('@helpers/signal', () => ({
  localStorageSignal: vi.fn(),
}));

vi.mock('@helpers/state-options', () => ({
  options: vi.fn(),
}));

import { gamestate } from '@helpers/state-game';

describe('Currency Helper Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCurrency', () => {
    it('should return currency amount from gamestate', () => {
      vi.mocked(gamestate).mockReturnValue({
        currency: {
          currencies: { Mana: 100 } as CurrencyBlock,
        },
      } as ReturnType<typeof gamestate>);

      expect(getCurrency('Mana')).toBe(100);
    });

    it('should return 0 for undefined currency', () => {
      vi.mocked(gamestate).mockReturnValue({
        currency: {
          currencies: {} as CurrencyBlock,
        },
      } as ReturnType<typeof gamestate>);

      expect(getCurrency('Fire Sliver')).toBe(0);
    });
  });

  describe('hasCurrency', () => {
    it('should return true if currency amount is sufficient', () => {
      vi.mocked(gamestate).mockReturnValue({
        currency: { currencies: { Mana: 100 } as CurrencyBlock },
      } as ReturnType<typeof gamestate>);

      expect(hasCurrency('Mana', 50)).toBe(true);
    });

    it('should return false if currency amount is insufficient', () => {
      vi.mocked(gamestate).mockReturnValue({
        currency: { currencies: { Mana: 30 } as CurrencyBlock },
      } as ReturnType<typeof gamestate>);

      expect(hasCurrency('Mana', 50)).toBe(false);
    });
  });

  describe('getCurrencyClaimsForNode', () => {
    it('should calculate currency claims for cave nodes', () => {
      const node: WorldLocation = {
        nodeType: 'cave',
        traitIds: [],
        elements: [{ element: 'Fire', intensity: 100 }],
      } as WorldLocation;

      const claims = getCurrencyClaimsForNode(node);
      expect(claims['Fire Sliver']).toBe(1);
    });

    it('should calculate currency claims for village nodes', () => {
      const node: WorldLocation = {
        nodeType: 'village',
        traitIds: [],
      } as WorldLocation;

      const claims = getCurrencyClaimsForNode(node);
      expect(claims.Mana).toBe(2);
    });

    it('should calculate currency claims for town nodes', () => {
      const node: WorldLocation = {
        nodeType: 'town',
        traitIds: [],
      } as WorldLocation;

      const claims = getCurrencyClaimsForNode(node);
      expect(claims.Mana).toBe(1);
    });
  });
});
