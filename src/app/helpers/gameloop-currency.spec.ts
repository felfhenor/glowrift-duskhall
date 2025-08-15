import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the currency helper functions
vi.mock('@helpers/currency', () => ({
  currencyClaimsGetCurrent: vi.fn(),
}));

// Import the mocked function and the function under test
import { currencyClaimsGetCurrent } from '@helpers/currency';
import { gameloopCurrency } from '@helpers/gameloop-currency';

describe('gameloopCurrency', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock to default implementation
    vi.mocked(currencyClaimsGetCurrent).mockImplementation(() => {});
  });

  describe('basic functionality', () => {
    it('should call currencyClaimsGetCurrent once when numTicks is 1', () => {
      const numTicks = 1;

      gameloopCurrency(numTicks);

      expect(currencyClaimsGetCurrent).toHaveBeenCalledTimes(1);
      expect(currencyClaimsGetCurrent).toHaveBeenCalledWith();
    });

    it('should call currencyClaimsGetCurrent multiple times for multiple ticks', () => {
      const numTicks = 5;

      gameloopCurrency(numTicks);

      expect(currencyClaimsGetCurrent).toHaveBeenCalledTimes(5);
      // Verify each call was made with no arguments
      for (let i = 0; i < numTicks; i++) {
        expect(currencyClaimsGetCurrent).toHaveBeenNthCalledWith(i + 1);
      }
    });

    it('should not call currencyClaimsGetCurrent when numTicks is 0', () => {
      const numTicks = 0;

      gameloopCurrency(numTicks);

      expect(currencyClaimsGetCurrent).not.toHaveBeenCalled();
    });

    it('should not call currencyClaimsGetCurrent when numTicks is negative', () => {
      const numTicks = -5;

      gameloopCurrency(numTicks);

      expect(currencyClaimsGetCurrent).not.toHaveBeenCalled();
    });
  });

  describe('function call verification', () => {
    it('should call currencyClaimsGetCurrent with no arguments each time', () => {
      const numTicks = 3;

      gameloopCurrency(numTicks);

      expect(currencyClaimsGetCurrent).toHaveBeenCalledTimes(3);
      expect(currencyClaimsGetCurrent).toHaveBeenNthCalledWith(1);
      expect(currencyClaimsGetCurrent).toHaveBeenNthCalledWith(2);
      expect(currencyClaimsGetCurrent).toHaveBeenNthCalledWith(3);
    });

    it('should maintain call order for sequential calls', () => {
      const numTicks = 4;

      gameloopCurrency(numTicks);

      const callOrders = vi.mocked(currencyClaimsGetCurrent).mock
        .invocationCallOrder;
      expect(callOrders).toHaveLength(4);

      // Verify calls were made in sequence
      for (let i = 1; i < callOrders.length; i++) {
        expect(callOrders[i]).toBeGreaterThan(callOrders[i - 1]);
      }
    });
  });

  describe('return value', () => {
    it('should return void (undefined)', () => {
      const numTicks = 1;

      const result = gameloopCurrency(numTicks);

      expect(result).toBeUndefined();
    });

    it('should return void for zero ticks', () => {
      const numTicks = 0;

      const result = gameloopCurrency(numTicks);

      expect(result).toBeUndefined();
    });

    it('should return void for negative ticks', () => {
      const numTicks = -1;

      const result = gameloopCurrency(numTicks);

      expect(result).toBeUndefined();
    });
  });

  describe('loop behavior verification', () => {
    it('should execute loop from 0 to numTicks-1', () => {
      const numTicks = 3;
      let callCount = 0;

      vi.mocked(currencyClaimsGetCurrent).mockImplementation(() => {
        callCount++;
      });

      gameloopCurrency(numTicks);

      expect(callCount).toBe(3);
      expect(currencyClaimsGetCurrent).toHaveBeenCalledTimes(3);
    });

    it('should not execute loop body when condition is false from start', () => {
      const numTicks = 0;
      let callCount = 0;

      vi.mocked(currencyClaimsGetCurrent).mockImplementation(() => {
        callCount++;
      });

      gameloopCurrency(numTicks);

      expect(callCount).toBe(0);
      expect(currencyClaimsGetCurrent).not.toHaveBeenCalled();
    });

    it('should handle loop with mock that throws error', () => {
      const numTicks = 1;
      const error = new Error('Mock error');

      vi.mocked(currencyClaimsGetCurrent).mockImplementation(() => {
        throw error;
      });

      try {
        gameloopCurrency(numTicks);
      } catch (e) {
        expect(e).toBe(error);
      }

      expect(currencyClaimsGetCurrent).toHaveBeenCalledTimes(1);
    });
  });

  describe('performance and stress testing', () => {
    it('should handle reasonable performance requirements for typical game ticks', () => {
      const numTicks = 10; // Typical for a few seconds of game time

      gameloopCurrency(numTicks);

      expect(currencyClaimsGetCurrent).toHaveBeenCalledTimes(10);
      // Just verify the function completed without timing constraints
    });

    it('should maintain consistent behavior across multiple calls', () => {
      const numTicks = 5;
      const iterations = 3;

      for (let i = 0; i < iterations; i++) {
        vi.clearAllMocks();
        // Reset the mock to default behavior
        vi.mocked(currencyClaimsGetCurrent).mockImplementation(() => {});

        gameloopCurrency(numTicks);

        expect(currencyClaimsGetCurrent).toHaveBeenCalledTimes(numTicks);
      }
    });
  });

  describe('integration scenarios', () => {
    beforeEach(() => {
      // Ensure clean state for integration tests
      vi.clearAllMocks();
      vi.mocked(currencyClaimsGetCurrent).mockImplementation(() => {});
    });

    it('should work correctly when called multiple times in sequence', () => {
      gameloopCurrency(2);
      gameloopCurrency(3);
      gameloopCurrency(1);

      expect(currencyClaimsGetCurrent).toHaveBeenCalledTimes(6); // 2 + 3 + 1
    });

    it('should work with mixed positive and zero/negative calls', () => {
      gameloopCurrency(2); // 2 calls
      gameloopCurrency(0); // 0 calls
      gameloopCurrency(-1); // 0 calls
      gameloopCurrency(3); // 3 calls

      expect(currencyClaimsGetCurrent).toHaveBeenCalledTimes(5); // 2 + 0 + 0 + 3
    });

    it('should maintain isolation between test runs', () => {
      // First run
      gameloopCurrency(2);
      expect(currencyClaimsGetCurrent).toHaveBeenCalledTimes(2);

      // Clear and second run
      vi.clearAllMocks();
      gameloopCurrency(3);
      expect(currencyClaimsGetCurrent).toHaveBeenCalledTimes(3);
    });
  });
});
