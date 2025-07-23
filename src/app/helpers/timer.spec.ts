import {
  addTimerAndAction,
  doTimerActions,
  getRegisterTick,
  getTickActions,
  timerUnclaimVillage,
  totalTicksElapsed,
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

vi.mock('@helpers/world', () => ({
  getWorldNode: vi.fn(),
  unclaimNode: vi.fn(),
}));

import { gamestate, updateGamestate } from '@helpers/state-game';
import { getWorldNode, unclaimNode } from '@helpers/world';

describe('Timer Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('totalTicksElapsed', () => {
    it('should return current number of ticks', () => {
      vi.mocked(gamestate).mockReturnValue({
        actionClock: { numTicks: 42, timers: {} },
      } as ReturnType<typeof gamestate>);

      expect(totalTicksElapsed()).toBe(42);
    });
  });

  describe('getRegisterTick', () => {
    it('should return future tick based on current ticks', () => {
      vi.mocked(gamestate).mockReturnValue({
        actionClock: { numTicks: 100, timers: {} },
      } as ReturnType<typeof gamestate>);

      expect(getRegisterTick(50)).toBe(150);
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

      expect(getTickActions(100)).toEqual([mockTimer]);
    });

    it('should return empty array for non-existent tick', () => {
      vi.mocked(gamestate).mockReturnValue({
        actionClock: { numTicks: 0, timers: {} },
      } as ReturnType<typeof gamestate>);

      expect(getTickActions(100)).toEqual([]);
    });
  });

  describe('addTimerAndAction', () => {
    it('should add timer action to specified future tick', () => {
      const mockTimer: Timer = {
        type: 'UnclaimVillage',
        location: { x: 0, y: 0 },
      };

      vi.mocked(gamestate).mockReturnValue({
        actionClock: { numTicks: 100, timers: {} },
      } as ReturnType<typeof gamestate>);

      addTimerAndAction(mockTimer, 50);

      expect(updateGamestate).toHaveBeenCalled();
    });
  });

  describe('doTimerActions', () => {
    it('should execute all actions and clear timer slot', () => {
      const mockTimer: Timer = {
        type: 'UnclaimVillage',
        location: { x: 0, y: 0 },
      };

      doTimerActions([mockTimer], 100);

      expect(updateGamestate).toHaveBeenCalled();
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

      vi.mocked(getWorldNode).mockReturnValue(mockNode);

      timerUnclaimVillage(mockTimer);

      expect(getWorldNode).toHaveBeenCalledWith(1, 1);
      expect(unclaimNode).toHaveBeenCalledWith(mockNode);
    });

    it('should do nothing if node not found', () => {
      const location: WorldPosition = { x: 1, y: 1 };
      const mockTimer: TimerUnclaimVillage = {
        type: 'UnclaimVillage',
        location,
      };

      vi.mocked(getWorldNode).mockReturnValue(undefined);

      timerUnclaimVillage(mockTimer);

      expect(unclaimNode).not.toHaveBeenCalled();
    });
  });
});
