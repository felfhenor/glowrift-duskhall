import type { AscensionCopyData } from '@interfaces/ascension';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the dependencies
vi.mock('@helpers/currency', () => ({
  currencyGain: vi.fn(),
}));

vi.mock('@helpers/state-game', () => ({
  gamestate: vi.fn(),
  updateGamestate: vi.fn(),
}));

vi.mock('@helpers/ui', () => ({
  globalStatusText: {
    set: vi.fn(),
  },
}));

vi.mock('es-toolkit/compat', () => ({
  meanBy: vi.fn(),
}));

// Import the mocked functions and the functions under test
import { currencyGain } from '@helpers/currency';
import {
  ascendCanDo,
  ascendCopyData,
  ascendCurrencyObtained,
  ascendCurrentPercentage,
  ascendCurrentlyRerollingWorld,
  ascendDo,
  ascendSetCopiedData,
  ascendUpdateHighestCompletionPercentage,
} from '@helpers/ascension';
import { gamestate, updateGamestate } from '@helpers/state-game';
import { globalStatusText } from '@helpers/ui';
import { meanBy } from 'es-toolkit/compat';

const mockGamestate = vi.mocked(gamestate);
const mockUpdateGamestate = vi.mocked(updateGamestate);
const mockCurrencyGain = vi.mocked(currencyGain);
const mockGlobalStatusTextSet = vi.mocked(globalStatusText.set);
const mockMeanBy = vi.mocked(meanBy);

describe('ascension', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ascendCurrentlyRerollingWorld', () => {
    it('should return true when currently ascending', () => {
      mockGamestate.mockReturnValue({
        meta: { isCurrentlyAscending: true },
      } as never);

      const result = ascendCurrentlyRerollingWorld();

      expect(result).toBe(true);
    });

    it('should return false when not currently ascending', () => {
      mockGamestate.mockReturnValue({
        meta: { isCurrentlyAscending: false },
      } as never);

      const result = ascendCurrentlyRerollingWorld();

      expect(result).toBe(false);
    });
  });

  describe('ascendCurrentPercentage', () => {
    it('should return the current world capture percentage', () => {
      const mockPercentage = 75.5;
      mockGamestate.mockReturnValue({
        duskmote: { currentWorldCapturePercentage: mockPercentage },
      } as never);

      const result = ascendCurrentPercentage();

      expect(result).toBe(mockPercentage);
    });

    it('should handle zero percentage', () => {
      mockGamestate.mockReturnValue({
        duskmote: { currentWorldCapturePercentage: 0 },
      } as never);

      const result = ascendCurrentPercentage();

      expect(result).toBe(0);
    });

    it('should handle 100% completion', () => {
      mockGamestate.mockReturnValue({
        duskmote: { currentWorldCapturePercentage: 100 },
      } as never);

      const result = ascendCurrentPercentage();

      expect(result).toBe(100);
    });
  });

  describe('ascendUpdateHighestCompletionPercentage', () => {
    it('should call updateGamestate', () => {
      // Mock gamestate for ascendCalculateCurrentPercentage
      mockGamestate.mockReturnValue({
        world: {
          nodeCounts: { town: 10, village: 5, cave: 8, dungeon: 2, castle: 1 },
          claimedCounts: { town: 8, village: 3, cave: 6, dungeon: 1, castle: 0 },
        },
      } as never);

      // Mock meanBy to return a specific percentage
      mockMeanBy.mockReturnValue(70);

      ascendUpdateHighestCompletionPercentage();
      expect(mockUpdateGamestate).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('ascendCurrencyObtained', () => {
    it('should return 0 when percentage is below 25', () => {
      mockGamestate.mockReturnValue({
        duskmote: { currentWorldCapturePercentage: 24 },
        world: { config: { duskmoteMultiplier: 1 } },
      } as never);

      const result = ascendCurrencyObtained();

      expect(result).toBe(0);
    });

    it('should calculate basic tokens for 25-49% completion', () => {
      mockGamestate.mockReturnValue({
        duskmote: { currentWorldCapturePercentage: 35 },
        world: { config: { duskmoteMultiplier: 1 } },
      } as never);

      const result = ascendCurrencyObtained();

      expect(result).toBe(35);
    });

    it('should add bonus for 50-74% completion', () => {
      mockGamestate.mockReturnValue({
        duskmote: { currentWorldCapturePercentage: 60 },
        world: { config: { duskmoteMultiplier: 1 } },
      } as never);

      const result = ascendCurrencyObtained();

      expect(result).toBe(110);
    });

    it('should add bonus for 75-89% completion', () => {
      mockGamestate.mockReturnValue({
        duskmote: { currentWorldCapturePercentage: 80 },
        world: { config: { duskmoteMultiplier: 1 } },
      } as never);

      const result = ascendCurrencyObtained();

      expect(result).toBe(205);
    });

    it('should add bonus for 90-99% completion', () => {
      mockGamestate.mockReturnValue({
        duskmote: { currentWorldCapturePercentage: 95 },
        world: { config: { duskmoteMultiplier: 1 } },
      } as never);

      const result = ascendCurrencyObtained();

      expect(result).toBe(370);
    });

    it('should add bonus for 100% completion', () => {
      mockGamestate.mockReturnValue({
        duskmote: { currentWorldCapturePercentage: 100 },
        world: { config: { duskmoteMultiplier: 1 } },
      } as never);

      const result = ascendCurrencyObtained();

      expect(result).toBe(675);
    });

    it('should apply world size multiplier', () => {
      mockGamestate.mockReturnValue({
        duskmote: { currentWorldCapturePercentage: 50 },
        world: { config: { duskmoteMultiplier: 2.5 } },
      } as never);

      const result = ascendCurrencyObtained();

      expect(result).toBe(250);
    });

    it('should handle missing duskmoteMultiplier', () => {
      mockGamestate.mockReturnValue({
        duskmote: { currentWorldCapturePercentage: 50 },
        world: { config: {} },
      } as never);

      const result = ascendCurrencyObtained();

      expect(result).toBe(100);
    });
  });

  describe('ascendCanDo', () => {
    it('should return true when percentage is 25 or higher', () => {
      mockGamestate.mockReturnValue({
        duskmote: { currentWorldCapturePercentage: 25 },
      } as never);

      const result = ascendCanDo();

      expect(result).toBe(true);
    });

    it('should return false when percentage is below 25', () => {
      mockGamestate.mockReturnValue({
        duskmote: { currentWorldCapturePercentage: 24.9 },
      } as never);

      const result = ascendCanDo();

      expect(result).toBe(false);
    });
  });

  describe('ascendDo', () => {
    it('should perform ascension correctly', () => {
      mockGamestate.mockReturnValue({
        duskmote: { currentWorldCapturePercentage: 60 },
        world: { config: { duskmoteMultiplier: 1 } },
      } as never);

      ascendDo();

      expect(mockGlobalStatusTextSet).toHaveBeenCalledWith('');
      expect(mockCurrencyGain).toHaveBeenCalledWith('Duskmote', 110);
      expect(mockUpdateGamestate).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('ascendCopyData', () => {
    it('should copy ascension data correctly', () => {
      const mockGamestate = {
        duskmote: {
          numAscends: 15,
          unlockedBundles: {
            bundle1: true,
            bundle2: false,
          },
        },
        currency: {
          currencies: {
            Duskmote: 2500,
          },
        },
      };

      vi.mocked(gamestate).mockReturnValue(mockGamestate as never);

      const result = ascendCopyData();

      expect(result).toEqual({
        numAscends: 15,
        totalDuskmotes: 2500,
        bundles: {
          bundle1: true,
          bundle2: false,
        },
      });
    });
  });

  describe('ascendSetCopiedData', () => {
    it('should call updateGamestate with copied data', () => {
      const mockData: AscensionCopyData = {
        numAscends: 10,
        totalDuskmotes: 1500,
        bundles: {},
      };

      ascendSetCopiedData(mockData);

      expect(mockUpdateGamestate).toHaveBeenCalledWith(expect.any(Function));
    });
  });
});
