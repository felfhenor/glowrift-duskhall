import {
  timerActionAdd,
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

vi.mock('@helpers/world', () => ({
  worldNodeGet: vi.fn(),
  worldNodeUnclaim: vi.fn(),
}));

import { gamestate, updateGamestate } from '@helpers/state-game';
import { worldNodeGet, worldNodeUnclaim } from '@helpers/world';

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

  describe('addTimerAndAction', () => {
    it('should add timer action to specified future tick', () => {
      const mockTimer: Timer = {
        type: 'UnclaimVillage',
        location: { x: 0, y: 0 },
      };

      vi.mocked(gamestate).mockReturnValue({
        actionClock: { numTicks: 100, timers: {} },
      } as ReturnType<typeof gamestate>);

      timerActionAdd(mockTimer, 50);

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

      vi.mocked(worldNodeGet).mockReturnValue(mockNode);

      timerUnclaimVillage(mockTimer);

      expect(worldNodeGet).toHaveBeenCalledWith(1, 1);
      expect(worldNodeUnclaim).toHaveBeenCalledWith(mockNode);
    });

    it('should do nothing if node not found', () => {
      const location: WorldPosition = { x: 1, y: 1 };
      const mockTimer: TimerUnclaimVillage = {
        type: 'UnclaimVillage',
        location,
      };

      vi.mocked(worldNodeGet).mockReturnValue(undefined);

      timerUnclaimVillage(mockTimer);

      expect(worldNodeUnclaim).not.toHaveBeenCalled();
    });
  });
});
