import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock LoggerTimer
const mockStartTimer = vi.fn();
const mockStopTimer = vi.fn();
const mockDumpTimers = vi.fn();

vi.mock('logger-timer', () => ({
  LoggerTimer: vi.fn().mockImplementation(() => ({
    startTimer: mockStartTimer,
    stopTimer: mockStopTimer,
    dumpTimers: mockDumpTimers,
  })),
}));

// Mock all gameloop dependencies
vi.mock('@helpers/gameloop-autotravel', () => ({
  gameloopAutoTravel: vi.fn(),
}));

vi.mock('@helpers/gameloop-currency', () => ({
  gameloopCurrency: vi.fn(),
}));

vi.mock('@helpers/gameloop-explore', () => ({
  gameloopExplore: vi.fn(),
}));

vi.mock('@helpers/gameloop-festival', () => ({
  gameloopFestival: vi.fn(),
}));

vi.mock('@helpers/gameloop-timers', () => ({
  gameloopTimers: vi.fn(),
}));

vi.mock('@helpers/gameloop-town', () => ({
  gameloopTown: vi.fn(),
}));

vi.mock('@helpers/gameloop-travel', () => ({
  gameloopTravel: vi.fn(),
}));

vi.mock('@helpers/logging', () => ({
  debug: vi.fn(),
}));

vi.mock('@helpers/setup', () => ({
  isSetup: vi.fn(),
}));

vi.mock('@helpers/state-game', () => ({
  gamestateTickStart: vi.fn(),
  gamestateTickEnd: vi.fn(),
  isGameStateReady: vi.fn(),
  updateGamestate: vi.fn(),
  saveGameState: vi.fn(),
  gamestate: vi.fn(() => defaultGameState()),
}));

vi.mock('@helpers/state-options', () => ({
  getOption: vi.fn(),
  setOption: vi.fn(),
}));

vi.mock('@helpers/victory', () => ({
  victoryClaim: vi.fn(),
  victoryHasWonForFirstTime: vi.fn(),
}));

vi.mock('@helpers/world-location', () => ({
  locationAreAllClaimed: vi.fn(),
}));

vi.mock('@helpers/interconnectedness', () => ({
  isInterconnectednessReady: vi.fn(() => true),
}));

// Import the mocked functions and the functions under test
import { defaultGameState } from '@helpers/defaults';
import {
  gameloop,
  gameloopShouldRun,
  isGameloopPaused,
} from '@helpers/gameloop';
import { gameloopAutoTravel } from '@helpers/gameloop-autotravel';
import { gameloopCurrency } from '@helpers/gameloop-currency';
import { gameloopExplore } from '@helpers/gameloop-explore';
import { gameloopFestival } from '@helpers/gameloop-festival';
import { gameloopTimers } from '@helpers/gameloop-timers';
import { gameloopTown } from '@helpers/gameloop-town';
import { gameloopTravel } from '@helpers/gameloop-travel';
import { debug } from '@helpers/logging';
import { isSetup } from '@helpers/setup';
import type { gamestate } from '@helpers/state-game';
import {
  gamestateTickStart,
  isGameStateReady,
  updateGamestate,
} from '@helpers/state-game';
import { getOption, setOption } from '@helpers/state-options';
import { victoryClaim, victoryHasWonForFirstTime } from '@helpers/victory';
import { locationAreAllClaimed } from '@helpers/world-location';
import { LoggerTimer } from 'logger-timer';

describe('Gameloop Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset LoggerTimer mocks
    mockStartTimer.mockClear();
    mockStopTimer.mockClear();
    mockDumpTimers.mockClear();
  });

  describe('gameloopShouldRun', () => {
    it('should return true when URL includes /game', () => {
      // Mock window.location.toString()
      Object.defineProperty(window, 'location', {
        value: {
          toString: () => 'https://example.com/game',
        },
        writable: true,
      });

      expect(gameloopShouldRun()).toBe(true);
    });

    it('should return true when URL includes /game with additional paths', () => {
      Object.defineProperty(window, 'location', {
        value: {
          toString: () => 'https://example.com/game/session/123',
        },
        writable: true,
      });

      expect(gameloopShouldRun()).toBe(true);
    });

    it('should return false when URL does not include /game', () => {
      Object.defineProperty(window, 'location', {
        value: {
          toString: () => 'https://example.com/home',
        },
        writable: true,
      });

      expect(gameloopShouldRun()).toBe(false);
    });

    it('should return false for root URL', () => {
      Object.defineProperty(window, 'location', {
        value: {
          toString: () => 'https://example.com/',
        },
        writable: true,
      });

      expect(gameloopShouldRun()).toBe(false);
    });

    it('should return true for URL with game as part of a larger path segment', () => {
      Object.defineProperty(window, 'location', {
        value: {
          toString: () => 'https://example.com/gameplay',
        },
        writable: true,
      });

      expect(gameloopShouldRun()).toBe(true);
    });
  });

  describe('isGameloopPaused', () => {
    it('should return computed value from getOption gameloopPaused', () => {
      vi.mocked(getOption).mockReturnValue(true);

      const result = isGameloopPaused();

      expect(getOption).toHaveBeenCalledWith('gameloopPaused');
      expect(result).toBe(true);
    });

    it('should return false when gameloopPaused option is false', () => {
      vi.mocked(getOption).mockReturnValue(false);

      const result = isGameloopPaused();

      expect(getOption).toHaveBeenCalledWith('gameloopPaused');
      expect(result).toBe(false);
    });
  });

  describe('gameloop', () => {
    beforeEach(() => {
      // Set up default successful conditions
      vi.mocked(isSetup).mockReturnValue(true);
      vi.mocked(isGameStateReady).mockReturnValue(true);
      vi.mocked(getOption).mockImplementation((key) => {
        if (key === 'gameloopPaused') return false;
        if (key === 'debugTickMultiplier') return 1;
        if (key === 'debugGameloopTimerUpdates') return false;
        return false;
      });
      vi.mocked(locationAreAllClaimed).mockReturnValue(false);
      vi.mocked(victoryHasWonForFirstTime).mockReturnValue(false);
      vi.mocked(updateGamestate).mockImplementation((callback) =>
        callback({
          actionClock: { numTicks: 0, timers: {} },
          meta: { lastSaveTick: 0 },
        } as ReturnType<typeof gamestate>),
      );
    });

    describe('early returns', () => {
      it('should return early when not setup', () => {
        vi.mocked(isSetup).mockReturnValue(false);

        gameloop(5);

        expect(isSetup).toHaveBeenCalledTimes(1);
        expect(isGameStateReady).not.toHaveBeenCalled();
        expect(gamestateTickStart).not.toHaveBeenCalled();
        expect(gameloopAutoTravel).not.toHaveBeenCalled();
      });

      it('should return early when game state not ready', () => {
        vi.mocked(isSetup).mockReturnValue(true);
        vi.mocked(isGameStateReady).mockReturnValue(false);

        gameloop(5);

        expect(isSetup).toHaveBeenCalledTimes(1);
        expect(isGameStateReady).toHaveBeenCalledTimes(1);
        expect(gamestateTickStart).not.toHaveBeenCalled();
        expect(gameloopAutoTravel).not.toHaveBeenCalled();
      });

      it('should return early when gameloop is paused', () => {
        vi.mocked(isSetup).mockReturnValue(true);
        vi.mocked(isGameStateReady).mockReturnValue(true);
        vi.mocked(getOption).mockImplementation((key) => {
          if (key === 'gameloopPaused') return true;
          return false;
        });

        gameloop(5);

        expect(isSetup).toHaveBeenCalledTimes(1);
        expect(isGameStateReady).toHaveBeenCalledTimes(1);
        expect(getOption).toHaveBeenCalledWith('gameloopPaused');
        expect(gamestateTickStart).not.toHaveBeenCalled();
        expect(gameloopAutoTravel).not.toHaveBeenCalled();
      });
    });

    describe('victory condition', () => {
      it('should claim victory and pause when all locations claimed and not won before', () => {
        vi.mocked(locationAreAllClaimed).mockReturnValue(true);
        vi.mocked(victoryHasWonForFirstTime).mockReturnValue(false);

        gameloop(5);

        expect(locationAreAllClaimed).toHaveBeenCalledTimes(1);
        expect(victoryHasWonForFirstTime).toHaveBeenCalledTimes(1);
        expect(victoryClaim).toHaveBeenCalledTimes(1);
        expect(setOption).toHaveBeenCalledWith('gameloopPaused', true);
        expect(gamestateTickStart).not.toHaveBeenCalled();
        expect(gameloopAutoTravel).not.toHaveBeenCalled();
      });

      it('should not claim victory when all locations claimed but already won', () => {
        vi.mocked(locationAreAllClaimed).mockReturnValue(true);
        vi.mocked(victoryHasWonForFirstTime).mockReturnValue(true);

        gameloop(5);

        expect(locationAreAllClaimed).toHaveBeenCalledTimes(1);
        expect(victoryHasWonForFirstTime).toHaveBeenCalledTimes(1);
        expect(victoryClaim).not.toHaveBeenCalled();
        expect(setOption).not.toHaveBeenCalledWith('gameloopPaused', true);
        expect(gamestateTickStart).toHaveBeenCalledTimes(1);
      });

      it('should not claim victory when not all locations claimed', () => {
        vi.mocked(locationAreAllClaimed).mockReturnValue(false);
        vi.mocked(victoryHasWonForFirstTime).mockReturnValue(false);

        gameloop(5);

        expect(locationAreAllClaimed).toHaveBeenCalledTimes(1);
        expect(victoryHasWonForFirstTime).not.toHaveBeenCalled();
        expect(victoryClaim).not.toHaveBeenCalled();
        expect(setOption).not.toHaveBeenCalledWith('gameloopPaused', true);
        expect(gamestateTickStart).toHaveBeenCalledTimes(1);
      });
    });

    describe('tick multiplier', () => {
      it('should multiply ticks by debugTickMultiplier', () => {
        vi.mocked(getOption).mockImplementation((key) => {
          if (key === 'gameloopPaused') return false;
          if (key === 'debugTickMultiplier') return 3;
          if (key === 'debugGameloopTimerUpdates') return false;
          return false;
        });

        gameloop(5);

        // Should call each gameloop function with 5 * 3 = 15 ticks
        expect(gameloopCurrency).toHaveBeenCalledWith(15);
        expect(gameloopFestival).toHaveBeenCalledWith(15);
        expect(gameloopTimers).toHaveBeenCalledWith(15);
      });

      it('should handle floating point multiplier', () => {
        vi.mocked(getOption).mockImplementation((key) => {
          if (key === 'gameloopPaused') return false;
          if (key === 'debugTickMultiplier') return 2.5;
          if (key === 'debugGameloopTimerUpdates') return false;
          return false;
        });

        gameloop(4);

        // Should call each gameloop function with 4 * 2.5 = 10 ticks
        expect(gameloopCurrency).toHaveBeenCalledWith(10);
        expect(gameloopFestival).toHaveBeenCalledWith(10);
        expect(gameloopTimers).toHaveBeenCalledWith(10);
      });

      it('should handle zero totalTicks', () => {
        vi.mocked(getOption).mockImplementation((key) => {
          if (key === 'gameloopPaused') return false;
          if (key === 'debugTickMultiplier') return 2;
          if (key === 'debugGameloopTimerUpdates') return false;
          return false;
        });

        gameloop(0);

        // Should call each gameloop function with 0 * 2 = 0 ticks
        expect(gameloopCurrency).toHaveBeenCalledWith(1);
        expect(gameloopFestival).toHaveBeenCalledWith(1);
        expect(gameloopTimers).toHaveBeenCalledWith(1);
      });
    });

    describe('timer configuration', () => {
      it('should create LoggerTimer with correct configuration when debug updates enabled', () => {
        vi.mocked(getOption).mockImplementation((key) => {
          if (key === 'gameloopPaused') return false;
          if (key === 'debugTickMultiplier') return 1;
          if (key === 'debugGameloopTimerUpdates') return true;
          return false;
        });

        gameloop(5);

        expect(getOption).toHaveBeenCalledWith('debugGameloopTimerUpdates');
        // LoggerTimer should be created with isActive: true
        expect(vi.mocked(LoggerTimer)).toHaveBeenCalledWith({
          dumpThreshold: 100,
          isActive: true,
        });
      });

      it('should create LoggerTimer with correct configuration when debug updates disabled', () => {
        vi.mocked(getOption).mockImplementation((key) => {
          if (key === 'gameloopPaused') return false;
          if (key === 'debugTickMultiplier') return 1;
          if (key === 'debugGameloopTimerUpdates') return false;
          return false;
        });

        gameloop(5);

        expect(getOption).toHaveBeenCalledWith('debugGameloopTimerUpdates');
        // LoggerTimer should be created with isActive: false
        expect(vi.mocked(LoggerTimer)).toHaveBeenCalledWith({
          dumpThreshold: 100,
          isActive: false,
        });
      });
    });

    describe('gameloop function calls', () => {
      it('should call all gameloop functions with correct parameters', () => {
        gameloop(10);

        expect(gameloopAutoTravel).toHaveBeenCalledTimes(10);
        expect(gameloopAutoTravel).toHaveBeenCalledWith();
        expect(gameloopCurrency).toHaveBeenCalledWith(10);
        expect(gameloopTown).toHaveBeenCalledWith();
        expect(gameloopTravel).toHaveBeenCalledWith();
        expect(gameloopExplore).toHaveBeenCalledWith();
        expect(gameloopFestival).toHaveBeenCalledWith(10);
        expect(gameloopTimers).toHaveBeenCalledWith(10);
      });
    });

    describe('timer dump functionality', () => {
      it('should dump timers with debug function', () => {
        const mockTimers = { 'test-timer': 123 };
        mockDumpTimers.mockImplementation((callback) => callback(mockTimers));

        gameloop(5);

        expect(mockDumpTimers).toHaveBeenCalledTimes(1);
        expect(mockDumpTimers).toHaveBeenCalledWith(expect.any(Function));
        expect(debug).toHaveBeenCalledWith('Gameloop:Timers', mockTimers);
      });

      it('should handle timer dump callback correctly', () => {
        let capturedCallback:
          | ((timers: Record<string, unknown>) => void)
          | undefined;
        mockDumpTimers.mockImplementation((callback) => {
          capturedCallback = callback;
        });

        gameloop(5);

        expect(capturedCallback).toBeDefined();
        if (capturedCallback) {
          const testTimers = { 'autotravel-timer': 456 };
          capturedCallback(testTimers);
          expect(debug).toHaveBeenCalledWith('Gameloop:Timers', testTimers);
        }
      });
    });

    describe('game state updates', () => {
      it('should update numTicks in game state', () => {
        const mockState = {
          actionClock: { numTicks: 100, timers: {} },
          meta: { lastSaveTick: 0 },
        };

        vi.mocked(updateGamestate).mockImplementation((callback) => {
          return callback(mockState as ReturnType<typeof gamestate>);
        });

        gameloop(5);

        expect(updateGamestate).toHaveBeenCalledTimes(2); // Called for numTicks update and for saving
        expect(updateGamestate).toHaveBeenCalledWith(expect.any(Function));

        // Verify the state was modified correctly
        expect(mockState.actionClock.numTicks).toBe(105); // 100 + 5
      });

      it('should update numTicks with multiplied ticks', () => {
        vi.mocked(getOption).mockImplementation((key) => {
          if (key === 'gameloopPaused') return false;
          if (key === 'debugTickMultiplier') return 3;
          if (key === 'debugGameloopTimerUpdates') return false;
          return false;
        });

        const mockState = {
          actionClock: { numTicks: 50, timers: {} },
          meta: { lastSaveTick: 0 },
        };

        vi.mocked(updateGamestate).mockImplementation((callback) => {
          return callback(mockState as ReturnType<typeof gamestate>);
        });

        gameloop(4);

        // Should add 4 * 3 = 12 ticks
        expect(mockState.actionClock.numTicks).toBe(62); // 50 + 12
      });
    });

    describe('edge cases', () => {
      it('should handle very large totalTicks', () => {
        vi.mocked(getOption).mockImplementation((key) => {
          if (key === 'gameloopPaused') return false;
          if (key === 'debugTickMultiplier') return 1;
          if (key === 'debugGameloopTimerUpdates') return false;
          return false;
        });

        const largeTicks = 1000000;
        gameloop(largeTicks);

        expect(gameloopCurrency).toHaveBeenCalledWith(3600);
        expect(gameloopTown).toHaveBeenCalledWith();
        expect(gameloopTravel).toHaveBeenCalledWith();
        expect(gameloopExplore).toHaveBeenCalledWith();
        expect(gameloopFestival).toHaveBeenCalledWith(3600);
        expect(gameloopTimers).toHaveBeenCalledWith(3600);
      });
    });
  });
});
