import {
  timerGetMerchantRefreshTicksRemaining,
  timerGetRegisterTick,
  timerGetTickActions,
  timerTicksElapsed,
  timerUnclaimVillage,
} from '@helpers/timer';
import type {
  Timer,
  TimerId,
  TimerUnclaimVillage,
  WorldLocation,
  WorldPosition,
} from '@interfaces';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('@helpers/state-game', () => ({
  gamestate: vi.fn(),
  updateGamestate: vi.fn((callback) =>
    callback({
      actionClock: {
        numTicks: 0,
        timers: {},
      },
    }),
  ),
}));

vi.mock('@helpers/world-location', () => ({
  locationGet: vi.fn(),
  locationUnclaim: vi.fn(),
}));

import { gamestate } from '@helpers/state-game';
import { locationGet, locationUnclaim } from '@helpers/world-location';

describe('Timer Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('totalTicksElapsed', () => {
    it('should return current number of ticks', () => {
      vi.mocked(gamestate).mockReturnValue({
        actionClock: { numTicks: 42, timers: {} },
      } as ReturnType<typeof gamestate>);

      expect(timerTicksElapsed()).toBe(42);
    });
  });

  describe('getRegisterTick', () => {
    it('should return future tick based on current ticks', () => {
      vi.mocked(gamestate).mockReturnValue({
        actionClock: { numTicks: 100, timers: {} },
      } as ReturnType<typeof gamestate>);

      expect(timerGetRegisterTick(50)).toBe(150);
    });
  });

  describe('getTickActions', () => {
    it('should return actions for specified tick', () => {
      const mockTimer: Timer = {
        type: 'UnclaimVillage',
        id: 'test-timer-1' as TimerId,
        tick: 100,
        location: { x: 0, y: 0 },
      };

      vi.mocked(gamestate).mockReturnValue({
        actionClock: {
          numTicks: 0,
          timers: { 100: [mockTimer] },
        },
      } as unknown as ReturnType<typeof gamestate>);

      expect(timerGetTickActions(100)).toEqual([mockTimer]);
    });

    it('should return empty array for non-existent tick', () => {
      vi.mocked(gamestate).mockReturnValue({
        actionClock: { numTicks: 0, timers: {} },
      } as ReturnType<typeof gamestate>);

      expect(timerGetTickActions(100)).toEqual([]);
    });
  });

  describe('timerUnclaimVillage', () => {
    it('should unclaim node at specified location', () => {
      const location: WorldPosition = { x: 1, y: 1 };
      const mockTimer: TimerUnclaimVillage = {
        type: 'UnclaimVillage',
        id: 'test-timer-2' as TimerId,
        tick: 200,
        location,
      };

      const mockNode = {
        x: 1,
        y: 1,
      } as WorldLocation;

      vi.mocked(locationGet).mockReturnValue(mockNode);

      timerUnclaimVillage(mockTimer);

      expect(locationGet).toHaveBeenCalledWith(1, 1);
      expect(locationUnclaim).toHaveBeenCalledWith(mockNode);
    });

    it('should do nothing if node not found', () => {
      const location: WorldPosition = { x: 1, y: 1 };
      const mockTimer: TimerUnclaimVillage = {
        type: 'UnclaimVillage',
        id: 'test-timer-3' as TimerId,
        tick: 300,
        location,
      };

      vi.mocked(locationGet).mockReturnValue(
        undefined as unknown as WorldLocation,
      );

      timerUnclaimVillage(mockTimer);

      expect(locationUnclaim).not.toHaveBeenCalled();
    });
  });

  describe('timerGetMerchantRefreshTicksRemaining', () => {
    it('should return ticks remaining until next merchant refresh', () => {
      const merchantRefreshTimer = {
        type: 'MerchantRefresh' as const,
        id: 'merchant-timer' as TimerId,
        tick: 1000,
      };

      vi.mocked(gamestate).mockReturnValue({
        actionClock: {
          numTicks: 500,
          timers: { 1000: [merchantRefreshTimer] },
        },
      } as unknown as ReturnType<typeof gamestate>);

      expect(timerGetMerchantRefreshTicksRemaining()).toBe(500);
    });

    it('should return 0 when no merchant refresh timer exists', () => {
      vi.mocked(gamestate).mockReturnValue({
        actionClock: {
          numTicks: 500,
          timers: {},
        },
      } as unknown as ReturnType<typeof gamestate>);

      expect(timerGetMerchantRefreshTicksRemaining()).toBe(0);
    });

    it('should return 0 when merchant refresh timer is in the past', () => {
      const merchantRefreshTimer = {
        type: 'MerchantRefresh' as const,
        id: 'merchant-timer' as TimerId,
        tick: 100,
      };

      vi.mocked(gamestate).mockReturnValue({
        actionClock: {
          numTicks: 500,
          timers: { 100: [merchantRefreshTimer] },
        },
      } as unknown as ReturnType<typeof gamestate>);

      expect(timerGetMerchantRefreshTicksRemaining()).toBe(0);
    });

    it('should return ticks for the next merchant refresh when multiple exist', () => {
      const merchantRefreshTimer1 = {
        type: 'MerchantRefresh' as const,
        id: 'merchant-timer-1' as TimerId,
        tick: 1000,
      };
      const merchantRefreshTimer2 = {
        type: 'MerchantRefresh' as const,
        id: 'merchant-timer-2' as TimerId,
        tick: 800,
      };

      vi.mocked(gamestate).mockReturnValue({
        actionClock: {
          numTicks: 500,
          timers: { 
            1000: [merchantRefreshTimer1],
            800: [merchantRefreshTimer2]
          },
        },
      } as unknown as ReturnType<typeof gamestate>);

      expect(timerGetMerchantRefreshTicksRemaining()).toBe(300); // 800 - 500
    });
  });
});
