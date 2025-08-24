import type { FestivalId } from '@interfaces/content-festival';
import type { Timer, TimerId } from '@interfaces/timer';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the timer helper functions
vi.mock('@helpers/timer', () => ({
  timerTicksElapsed: vi.fn(),
  timerGetTickActions: vi.fn(),
  timerActionDo: vi.fn(),
  timerGetTickActionsBeforeAndIncluding: vi.fn(),
}));

// Import the mocked functions and the function under test
import { gameloopTimers } from '@helpers/gameloop-timers';
import {
  timerActionDo,
  timerGetTickActions,
  timerGetTickActionsBeforeAndIncluding,
  timerTicksElapsed,
} from '@helpers/timer';

// Helper function to create properly typed TimerId
const createTimerId = (id: string): TimerId => id as TimerId;

// Helper function to create properly typed FestivalId
const createFestivalId = (id: string): FestivalId => id as FestivalId;

// Mock timer data
const mockTimer: Timer = {
  type: 'EndFestival',
  id: createTimerId('test-timer-1'),
  tick: 100,
  festivalId: createFestivalId('test-festival'),
};

const mockTimer2: Timer = {
  type: 'UnclaimVillage',
  id: createTimerId('test-timer-2'),
  tick: 101,
  location: { x: 5, y: 10 },
};

describe('gameloopTimers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('basic functionality', () => {
    it('should process single tick when numTicks is 1', () => {
      const baseTicks = 100;
      const numTicks = 1;
      const mockActions = [mockTimer];

      vi.mocked(timerTicksElapsed).mockReturnValue(baseTicks);
      vi.mocked(timerGetTickActionsBeforeAndIncluding).mockReturnValue(
        mockActions,
      );

      gameloopTimers(numTicks);

      expect(timerTicksElapsed).toHaveBeenCalledTimes(1);
      expect(timerGetTickActionsBeforeAndIncluding).toHaveBeenCalledTimes(1);
      expect(timerGetTickActionsBeforeAndIncluding).toHaveBeenCalledWith(100);
      expect(timerActionDo).toHaveBeenCalledTimes(1);
      expect(timerActionDo).toHaveBeenCalledWith(mockActions);
    });

    it('should process multiple ticks sequentially', () => {
      const baseTicks = 50;
      const numTicks = 3;
      const mockActions1 = [mockTimer];
      const mockActions2: Timer[] = [];
      const mockActions3 = [mockTimer2];

      vi.mocked(timerTicksElapsed).mockReturnValue(baseTicks);
      vi.mocked(timerGetTickActionsBeforeAndIncluding)
        .mockReturnValueOnce(mockActions1)
        .mockReturnValueOnce(mockActions2)
        .mockReturnValueOnce(mockActions3);

      gameloopTimers(numTicks);

      expect(timerTicksElapsed).toHaveBeenCalledTimes(1);
      expect(timerGetTickActionsBeforeAndIncluding).toHaveBeenCalledTimes(3);
      expect(timerGetTickActionsBeforeAndIncluding).toHaveBeenNthCalledWith(
        1,
        50,
      );
      expect(timerGetTickActionsBeforeAndIncluding).toHaveBeenNthCalledWith(
        2,
        51,
      );
      expect(timerGetTickActionsBeforeAndIncluding).toHaveBeenNthCalledWith(
        3,
        52,
      );
      expect(timerActionDo).toHaveBeenCalledTimes(3);
      expect(timerActionDo).toHaveBeenNthCalledWith(1, mockActions1);
      expect(timerActionDo).toHaveBeenNthCalledWith(2, mockActions2);
      expect(timerActionDo).toHaveBeenNthCalledWith(3, mockActions3);
    });

    it('should handle zero numTicks without processing any ticks', () => {
      const baseTicks = 200;
      const numTicks = 0;

      vi.mocked(timerTicksElapsed).mockReturnValue(baseTicks);

      gameloopTimers(numTicks);

      expect(timerTicksElapsed).toHaveBeenCalledTimes(1);
      expect(timerGetTickActions).not.toHaveBeenCalled();
      expect(timerActionDo).not.toHaveBeenCalled();
    });

    it('should handle negative numTicks without processing any ticks', () => {
      const baseTicks = 150;
      const numTicks = -5;

      vi.mocked(timerTicksElapsed).mockReturnValue(baseTicks);

      gameloopTimers(numTicks);

      expect(timerTicksElapsed).toHaveBeenCalledTimes(1);
      expect(timerGetTickActions).not.toHaveBeenCalled();
      expect(timerActionDo).not.toHaveBeenCalled();
    });
  });

  describe('timer actions processing', () => {
    it('should process empty timer actions arrays', () => {
      const baseTicks = 75;
      const numTicks = 2;
      const emptyActions: Timer[] = [];

      vi.mocked(timerTicksElapsed).mockReturnValue(baseTicks);
      vi.mocked(timerGetTickActionsBeforeAndIncluding).mockReturnValue(
        emptyActions,
      );

      gameloopTimers(numTicks);

      expect(timerActionDo).toHaveBeenCalledTimes(2);
      expect(timerActionDo).toHaveBeenNthCalledWith(1, emptyActions);
      expect(timerActionDo).toHaveBeenNthCalledWith(2, emptyActions);
    });

    it('should process single timer action per tick', () => {
      const baseTicks = 300;
      const numTicks = 2;
      const actions1 = [mockTimer];
      const actions2 = [mockTimer2];

      vi.mocked(timerTicksElapsed).mockReturnValue(baseTicks);
      vi.mocked(timerGetTickActionsBeforeAndIncluding)
        .mockReturnValueOnce(actions1)
        .mockReturnValueOnce(actions2);

      gameloopTimers(numTicks);

      expect(timerActionDo).toHaveBeenCalledTimes(2);
      expect(timerActionDo).toHaveBeenNthCalledWith(1, actions1);
      expect(timerActionDo).toHaveBeenNthCalledWith(2, actions2);
    });

    it('should process multiple timer actions per tick', () => {
      const baseTicks = 400;
      const numTicks = 1;
      const multipleActions = [mockTimer, mockTimer2];

      vi.mocked(timerTicksElapsed).mockReturnValue(baseTicks);
      vi.mocked(timerGetTickActionsBeforeAndIncluding).mockReturnValue(
        multipleActions,
      );

      gameloopTimers(numTicks);

      expect(timerActionDo).toHaveBeenCalledTimes(1);
      expect(timerActionDo).toHaveBeenCalledWith(multipleActions);
    });

    it('should handle mix of empty and populated action arrays', () => {
      const baseTicks = 500;
      const numTicks = 4;
      const actions1: Timer[] = [];
      const actions2 = [mockTimer];
      const actions3: Timer[] = [];
      const actions4 = [mockTimer, mockTimer2];

      vi.mocked(timerTicksElapsed).mockReturnValue(baseTicks);
      vi.mocked(timerGetTickActionsBeforeAndIncluding)
        .mockReturnValueOnce(actions1)
        .mockReturnValueOnce(actions2)
        .mockReturnValueOnce(actions3)
        .mockReturnValueOnce(actions4);

      gameloopTimers(numTicks);

      expect(timerActionDo).toHaveBeenCalledTimes(4);
      expect(timerActionDo).toHaveBeenNthCalledWith(1, actions1);
      expect(timerActionDo).toHaveBeenNthCalledWith(2, actions2);
      expect(timerActionDo).toHaveBeenNthCalledWith(3, actions3);
      expect(timerActionDo).toHaveBeenNthCalledWith(4, actions4);
    });
  });

  describe('timer action types', () => {
    it('should process EndFestival timer actions', () => {
      const baseTicks = 600;
      const numTicks = 1;
      const endFestivalTimer: Timer = {
        type: 'EndFestival',
        id: createTimerId('end-festival-timer'),
        tick: 600,
        festivalId: createFestivalId('autumn-festival'),
      };

      vi.mocked(timerTicksElapsed).mockReturnValue(baseTicks);
      vi.mocked(timerGetTickActionsBeforeAndIncluding).mockReturnValue([
        endFestivalTimer,
      ]);

      gameloopTimers(numTicks);

      expect(timerActionDo).toHaveBeenCalledWith([endFestivalTimer]);
    });

    it('should process UnclaimVillage timer actions', () => {
      const baseTicks = 700;
      const numTicks = 1;
      const unclaimTimer: Timer = {
        type: 'UnclaimVillage',
        id: createTimerId('unclaim-timer'),
        tick: 700,
        location: { x: 15, y: 25 },
      };

      vi.mocked(timerTicksElapsed).mockReturnValue(baseTicks);
      vi.mocked(timerGetTickActionsBeforeAndIncluding).mockReturnValue([
        unclaimTimer,
      ]);

      gameloopTimers(numTicks);

      expect(timerActionDo).toHaveBeenCalledWith([unclaimTimer]);
    });

    it('should process mixed timer action types in same tick', () => {
      const baseTicks = 800;
      const numTicks = 1;
      const endFestivalTimer: Timer = {
        type: 'EndFestival',
        id: createTimerId('end-timer'),
        tick: 800,
        festivalId: createFestivalId('spring-festival'),
      };
      const unclaimTimer: Timer = {
        type: 'UnclaimVillage',
        id: createTimerId('unclaim-timer'),
        tick: 800,
        location: { x: 30, y: 40 },
      };
      const mixedActions = [endFestivalTimer, unclaimTimer];

      vi.mocked(timerTicksElapsed).mockReturnValue(baseTicks);
      vi.mocked(timerGetTickActionsBeforeAndIncluding).mockReturnValue(
        mixedActions,
      );

      gameloopTimers(numTicks);

      expect(timerActionDo).toHaveBeenCalledWith(mixedActions);
    });
  });

  describe('function call sequence verification', () => {
    it('should call functions in correct order for single tick', () => {
      const baseTicks = 900;
      const numTicks = 1;

      vi.mocked(timerTicksElapsed).mockReturnValue(baseTicks);
      vi.mocked(timerGetTickActionsBeforeAndIncluding).mockReturnValue([]);

      gameloopTimers(numTicks);

      const callOrder =
        vi.mocked(timerTicksElapsed).mock.invocationCallOrder[0];
      const getActionsCallOrder = vi.mocked(
        timerGetTickActionsBeforeAndIncluding,
      ).mock.invocationCallOrder[0];
      const actionDoCallOrder =
        vi.mocked(timerActionDo).mock.invocationCallOrder[0];

      expect(callOrder).toBeLessThan(getActionsCallOrder);
      expect(getActionsCallOrder).toBeLessThan(actionDoCallOrder);
    });

    it('should maintain correct call sequence for multiple ticks', () => {
      const baseTicks = 1000;
      const numTicks = 3;

      vi.mocked(timerTicksElapsed).mockReturnValue(baseTicks);
      vi.mocked(timerGetTickActions).mockReturnValue([]);

      gameloopTimers(numTicks);

      // Verify timerTicksElapsed is called once at the beginning
      expect(timerTicksElapsed).toHaveBeenCalledTimes(1);

      // Verify timerGetTickActions and timerActionDo are called in pairs for each tick
      const getActionsCallOrders = vi.mocked(
        timerGetTickActionsBeforeAndIncluding,
      ).mock.invocationCallOrder;
      const actionDoCallOrders =
        vi.mocked(timerActionDo).mock.invocationCallOrder;

      expect(getActionsCallOrders).toHaveLength(3);
      expect(actionDoCallOrders).toHaveLength(3);

      // Each getActions call should come before its corresponding actionDo call
      for (let i = 0; i < 3; i++) {
        expect(getActionsCallOrders[i]).toBeLessThan(actionDoCallOrders[i]);
      }
    });
  });

  describe('parameter validation', () => {
    it('should handle floating point numTicks by treating as integer', () => {
      const baseTicks = 1100;
      const numTicks = 2.7; // JavaScript for loop will process this as 2.7 > 2, so 3 iterations

      vi.mocked(timerTicksElapsed).mockReturnValue(baseTicks);
      vi.mocked(timerGetTickActionsBeforeAndIncluding).mockReturnValue([]);

      gameloopTimers(numTicks);

      expect(timerGetTickActionsBeforeAndIncluding).toHaveBeenCalledTimes(3); // 1100, 1101, 1102
      expect(timerGetTickActionsBeforeAndIncluding).toHaveBeenNthCalledWith(
        1,
        1100,
      );
      expect(timerGetTickActionsBeforeAndIncluding).toHaveBeenNthCalledWith(
        2,
        1101,
      );
      expect(timerGetTickActionsBeforeAndIncluding).toHaveBeenNthCalledWith(
        3,
        1102,
      );
    });

    it('should handle very small positive numTicks', () => {
      const baseTicks = 1200;
      const numTicks = 0.9; // JavaScript for loop will process this as 0.9 > 0, so 1 iteration

      vi.mocked(timerTicksElapsed).mockReturnValue(baseTicks);
      vi.mocked(timerGetTickActions).mockReturnValue([]);

      gameloopTimers(numTicks);

      expect(timerGetTickActionsBeforeAndIncluding).toHaveBeenCalledTimes(1);
      expect(timerGetTickActionsBeforeAndIncluding).toHaveBeenNthCalledWith(
        1,
        1200,
      );
    });

    it('should handle negative baseTicks correctly', () => {
      const baseTicks = -5;
      const numTicks = 3;

      vi.mocked(timerTicksElapsed).mockReturnValue(baseTicks);
      vi.mocked(timerGetTickActionsBeforeAndIncluding).mockReturnValue([]);

      gameloopTimers(numTicks);

      expect(timerGetTickActionsBeforeAndIncluding).toHaveBeenCalledTimes(3);
      expect(timerGetTickActionsBeforeAndIncluding).toHaveBeenNthCalledWith(
        1,
        -5,
      );
      expect(timerGetTickActionsBeforeAndIncluding).toHaveBeenNthCalledWith(
        2,
        -4,
      );
      expect(timerGetTickActionsBeforeAndIncluding).toHaveBeenNthCalledWith(
        3,
        -3,
      );
    });
  });

  describe('return value', () => {
    it('should return void (undefined)', () => {
      const baseTicks = 1300;
      const numTicks = 1;

      vi.mocked(timerTicksElapsed).mockReturnValue(baseTicks);
      vi.mocked(timerGetTickActions).mockReturnValue([]);

      const result = gameloopTimers(numTicks);

      expect(result).toBeUndefined();
    });
  });

  describe('integration scenarios', () => {
    it('should handle realistic game scenario with mixed timer types across multiple ticks', () => {
      const baseTicks = 1400;
      const numTicks = 5;

      const tick1Actions: Timer[] = [];
      const tick2Actions = [
        {
          type: 'EndFestival' as const,
          id: createTimerId('festival-end-1'),
          tick: 1401,
          festivalId: createFestivalId('harvest-festival'),
        },
      ];
      const tick3Actions = [
        {
          type: 'UnclaimVillage' as const,
          id: createTimerId('unclaim-1'),
          tick: 1402,
          location: { x: 10, y: 20 },
        },
        {
          type: 'UnclaimVillage' as const,
          id: createTimerId('unclaim-2'),
          tick: 1402,
          location: { x: 30, y: 40 },
        },
      ];
      const tick4Actions: Timer[] = [];
      const tick5Actions = [
        {
          type: 'EndFestival' as const,
          id: createTimerId('festival-end-2'),
          tick: 1404,
          festivalId: createFestivalId('winter-festival'),
        },
        {
          type: 'UnclaimVillage' as const,
          id: createTimerId('unclaim-3'),
          tick: 1404,
          location: { x: 50, y: 60 },
        },
      ];

      vi.mocked(timerTicksElapsed).mockReturnValue(baseTicks);
      vi.mocked(timerGetTickActionsBeforeAndIncluding)
        .mockReturnValueOnce(tick1Actions)
        .mockReturnValueOnce(tick2Actions)
        .mockReturnValueOnce(tick3Actions)
        .mockReturnValueOnce(tick4Actions)
        .mockReturnValueOnce(tick5Actions);

      gameloopTimers(numTicks);

      expect(timerTicksElapsed).toHaveBeenCalledTimes(1);
      expect(timerGetTickActionsBeforeAndIncluding).toHaveBeenCalledTimes(5);
      expect(timerActionDo).toHaveBeenCalledTimes(5);

      // Verify each tick was processed correctly
      expect(timerGetTickActionsBeforeAndIncluding).toHaveBeenNthCalledWith(
        1,
        1400,
      );
      expect(timerGetTickActionsBeforeAndIncluding).toHaveBeenNthCalledWith(
        2,
        1401,
      );
      expect(timerGetTickActionsBeforeAndIncluding).toHaveBeenNthCalledWith(
        3,
        1402,
      );
      expect(timerGetTickActionsBeforeAndIncluding).toHaveBeenNthCalledWith(
        4,
        1403,
      );
      expect(timerGetTickActionsBeforeAndIncluding).toHaveBeenNthCalledWith(
        5,
        1404,
      );

      expect(timerActionDo).toHaveBeenNthCalledWith(1, tick1Actions);
      expect(timerActionDo).toHaveBeenNthCalledWith(2, tick2Actions);
      expect(timerActionDo).toHaveBeenNthCalledWith(3, tick3Actions);
      expect(timerActionDo).toHaveBeenNthCalledWith(4, tick4Actions);
      expect(timerActionDo).toHaveBeenNthCalledWith(5, tick5Actions);
    });
  });
});
