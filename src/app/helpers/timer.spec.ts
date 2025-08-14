import {
  timerGetRegisterTick,
  timerGetTickActions,
  timerTicksElapsed,
  timerUnclaimVillage,
} from '@helpers/timer';
import type {
  Timer,
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
        location: { x: 0, y: 0 },
      };

      vi.mocked(gamestate).mockReturnValue({
        actionClock: {
          numTicks: 0,
          timers: { 100: [mockTimer] },
        },
      } as ReturnType<typeof gamestate>);

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
        location,
      };

      vi.mocked(locationGet).mockReturnValue(undefined);

      timerUnclaimVillage(mockTimer);

      expect(locationUnclaim).not.toHaveBeenCalled();
    });
  });
});
