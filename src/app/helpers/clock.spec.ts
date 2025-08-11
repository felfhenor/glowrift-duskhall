import { clockGetTickTimer, clockIsTimerExpired } from '@helpers/clock';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the gamestate dependency
vi.mock('@helpers/state-game', () => ({
  gamestate: vi.fn(),
}));

import { gamestate } from '@helpers/state-game';

describe('Clock Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTickTimer', () => {
    it('should add expiresInTicks to current numTicks', () => {
      const mockNumTicks = 100;
      vi.mocked(gamestate).mockReturnValue({
        actionClock: { numTicks: mockNumTicks, timers: {} },
      } as ReturnType<typeof gamestate>);

      expect(clockGetTickTimer(5)).toBe(105);
      expect(clockGetTickTimer(0)).toBe(100);
      expect(clockGetTickTimer(-5)).toBe(95);
    });
  });

  describe('isExpired', () => {
    it('should return true when current numTicks is greater than timer', () => {
      vi.mocked(gamestate).mockReturnValue({
        actionClock: { numTicks: 50, timers: {} },
      } as ReturnType<typeof gamestate>);

      expect(clockIsTimerExpired(49)).toBe(true);
    });

    it('should return true when current numTicks equals timer', () => {
      vi.mocked(gamestate).mockReturnValue({
        actionClock: { numTicks: 50, timers: {} },
      } as ReturnType<typeof gamestate>);

      expect(clockIsTimerExpired(50)).toBe(true);
    });

    it('should return false when current numTicks is less than timer', () => {
      vi.mocked(gamestate).mockReturnValue({
        actionClock: { numTicks: 50, timers: {} },
      } as ReturnType<typeof gamestate>);

      expect(clockIsTimerExpired(51)).toBe(false);
    });
  });
});
