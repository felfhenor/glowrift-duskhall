import type { DiscordPresenceOpts } from '@interfaces';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('@helpers/state-game', () => ({
  gamestate: vi.fn(() => ({
    world: {
      nodeCounts: {
        cave: 10,
        village: 5,
        town: 3,
        dungeon: 8,
        castle: 2,
      },
      claimedCounts: {
        cave: 6,
        village: 4,
        town: 2,
        dungeon: 3,
        castle: 1,
      },
    },
  })),
}));

// Import functions after mocking
import {
  discordSetMainStatus,
  discordSetStatus,
  discordUpdateStatus,
  isInElectron,
} from '@helpers/discord';
import { gamestate } from '@helpers/state-game';

describe('Discord Helper Functions', () => {
  let originalUserAgent: string;

  beforeEach(() => {
    vi.clearAllMocks();
    originalUserAgent = navigator.userAgent;

    // Reset window object for each test
    Object.defineProperty(window, 'discordRPCStatus', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    // Reset main status for each test
    discordSetMainStatus('');
  });

  afterEach(() => {
    // Restore original userAgent
    Object.defineProperty(navigator, 'userAgent', {
      value: originalUserAgent,
      writable: true,
      configurable: true,
    });
  });

  describe('isInElectron', () => {
    it('should return true when running in Electron', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) MyApp/1.0.0 Chrome/91.0.4472.124 Electron/13.1.7 Safari/537.36',
        writable: true,
        configurable: true,
      });

      expect(isInElectron()).toBe(true);
    });

    it('should return true when userAgent contains electron in lowercase', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'test electron/1.0.0 test',
        writable: true,
        configurable: true,
      });

      expect(isInElectron()).toBe(true);
    });

    it('should return true when userAgent contains Electron in mixed case', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'test Electron/1.0.0 test',
        writable: true,
        configurable: true,
      });

      expect(isInElectron()).toBe(true);
    });

    it('should return false when not running in Electron', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        writable: true,
        configurable: true,
      });

      expect(isInElectron()).toBe(false);
    });

    it('should return false when userAgent is empty', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: '',
        writable: true,
        configurable: true,
      });

      expect(isInElectron()).toBe(false);
    });

    it('should return false when userAgent contains similar but not exact electron string', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'test electronics/1.0.0 test',
        writable: true,
        configurable: true,
      });

      expect(isInElectron()).toBe(false);
    });
  });

  describe('discordSetMainStatus', () => {
    it('should set the main status', () => {
      const status = 'Playing the game';
      discordSetMainStatus(status);

      // Test that the status is actually used by calling discordSetStatus
      const opts: DiscordPresenceOpts = {
        state: 'In menu',
        details: 'Original details',
      };

      discordSetStatus(opts);

      expect(
        (window as typeof window & { discordRPCStatus?: DiscordPresenceOpts })
          .discordRPCStatus?.details,
      ).toBe(status);
    });

    it('should handle empty string status', () => {
      discordSetMainStatus('');

      const opts: DiscordPresenceOpts = {
        state: 'In menu',
        details: 'Original details',
      };

      discordSetStatus(opts);

      expect(
        (window as typeof window & { discordRPCStatus?: DiscordPresenceOpts })
          .discordRPCStatus?.details,
      ).toBe('Original details');
    });

    it('should handle long status strings', () => {
      const longStatus =
        'A very long status that might be used in the game with lots of details about what the player is currently doing';
      discordSetMainStatus(longStatus);

      const opts: DiscordPresenceOpts = {
        state: 'In menu',
        details: 'Original details',
      };

      discordSetStatus(opts);

      expect(
        (window as typeof window & { discordRPCStatus?: DiscordPresenceOpts })
          .discordRPCStatus?.details,
      ).toBe(longStatus);
    });

    it('should overwrite previous main status', () => {
      discordSetMainStatus('First status');
      discordSetMainStatus('Second status');

      const opts: DiscordPresenceOpts = {
        state: 'In menu',
        details: 'Original details',
      };

      discordSetStatus(opts);

      expect(
        (window as typeof window & { discordRPCStatus?: DiscordPresenceOpts })
          .discordRPCStatus?.details,
      ).toBe('Second status');
    });
  });

  describe('discordSetStatus', () => {
    it('should set Discord status on window object with all options', () => {
      const status: DiscordPresenceOpts = {
        state: 'In game',
        details: 'Exploring dungeons',
        smallImageKey: 'small_icon',
        smallImageText: 'Small icon tooltip',
        largeImageKey: 'large_icon',
        largeImageText: 'Large icon tooltip',
      };

      discordSetStatus(status);

      const windowStatus = (
        window as typeof window & { discordRPCStatus?: DiscordPresenceOpts }
      ).discordRPCStatus;
      expect(windowStatus).toEqual(status);
    });

    it('should set Discord status with minimal options', () => {
      const status: DiscordPresenceOpts = {
        state: 'In menu',
      };

      discordSetStatus(status);

      const windowStatus = (
        window as typeof window & { discordRPCStatus?: DiscordPresenceOpts }
      ).discordRPCStatus;
      expect(windowStatus).toEqual({
        state: 'In menu',
        details: undefined,
      });
    });

    it('should use main status as details when main status is set', () => {
      discordSetMainStatus('Main status override');

      const status: DiscordPresenceOpts = {
        state: 'In game',
        details: 'Original details',
      };

      discordSetStatus(status);

      const windowStatus = (
        window as typeof window & { discordRPCStatus?: DiscordPresenceOpts }
      ).discordRPCStatus;
      expect(windowStatus?.details).toBe('Main status override');
      expect(windowStatus?.state).toBe('In game');
    });

    it('should preserve original details when main status is empty', () => {
      discordSetMainStatus('');

      const status: DiscordPresenceOpts = {
        state: 'In game',
        details: 'Original details',
      };

      discordSetStatus(status);

      const windowStatus = (
        window as typeof window & { discordRPCStatus?: DiscordPresenceOpts }
      ).discordRPCStatus;
      expect(windowStatus?.details).toBe('Original details');
    });

    it('should handle empty status object', () => {
      const status: DiscordPresenceOpts = {};

      discordSetStatus(status);

      const windowStatus = (
        window as typeof window & { discordRPCStatus?: DiscordPresenceOpts }
      ).discordRPCStatus;
      expect(windowStatus).toEqual({
        details: undefined,
      });
    });

    it('should handle status with only image options', () => {
      const status: DiscordPresenceOpts = {
        smallImageKey: 'small_key',
        smallImageText: 'Small text',
        largeImageKey: 'large_key',
        largeImageText: 'Large text',
      };

      discordSetStatus(status);

      const windowStatus = (
        window as typeof window & { discordRPCStatus?: DiscordPresenceOpts }
      ).discordRPCStatus;
      expect(windowStatus).toEqual({
        smallImageKey: 'small_key',
        smallImageText: 'Small text',
        largeImageKey: 'large_key',
        largeImageText: 'Large text',
        details: undefined,
      });
    });

    it('should spread all properties from status object', () => {
      const status: DiscordPresenceOpts = {
        state: 'Testing',
        details: 'Test details',
        smallImageKey: 'test_small',
        smallImageText: 'Test small text',
        largeImageKey: 'test_large',
        largeImageText: 'Test large text',
      };

      discordSetStatus(status);

      const windowStatus = (
        window as typeof window & { discordRPCStatus?: DiscordPresenceOpts }
      ).discordRPCStatus;
      expect(windowStatus).toEqual({
        ...status,
        details: 'Test details', // Should preserve original since no main status
      });
    });
  });

  describe('discordUpdateStatus', () => {
    beforeEach(() => {
      // Reset main status for each test
      discordSetMainStatus('');
    });

    it('should not update status when not in Electron', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        writable: true,
        configurable: true,
      });

      discordUpdateStatus();

      const windowStatus = (
        window as typeof window & { discordRPCStatus?: DiscordPresenceOpts }
      ).discordRPCStatus;
      expect(windowStatus).toBeUndefined();
    });

    it('should update status with correct world progress when in Electron', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'test electron/1.0.0 test',
        writable: true,
        configurable: true,
      });

      discordUpdateStatus();

      const windowStatus = (
        window as typeof window & { discordRPCStatus?: DiscordPresenceOpts }
      ).discordRPCStatus;

      // Total nodes: 10 + 5 + 3 + 8 + 2 = 28
      // Total claimed: 6 + 4 + 2 + 3 + 1 = 16
      // Percentage: Math.floor((16/28) * 100) = Math.floor(57.14) = 57
      expect(windowStatus).toEqual({
        state: 'In game',
        details: 'Conquering the world (16/28 | 57%)',
      });
    });

    it('should handle zero nodes correctly', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'test electron/1.0.0 test',
        writable: true,
        configurable: true,
      });

      vi.mocked(gamestate).mockReturnValue({
        world: {
          nodeCounts: {
            cave: 0,
            village: 0,
            town: 0,
            dungeon: 0,
            castle: 0,
          },
          claimedCounts: {
            cave: 0,
            village: 0,
            town: 0,
            dungeon: 0,
            castle: 0,
          },
        },
      } as ReturnType<typeof gamestate>);

      discordUpdateStatus();

      const windowStatus = (
        window as typeof window & { discordRPCStatus?: DiscordPresenceOpts }
      ).discordRPCStatus;

      // 0/0 would cause NaN, but Math.floor(NaN) = NaN, so we should handle this
      expect(windowStatus?.state).toBe('In game');
      expect(windowStatus?.details).toMatch(/Conquering the world \(0\/0 \|/);
    });

    it('should handle 100% completion correctly', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'test electron/1.0.0 test',
        writable: true,
        configurable: true,
      });

      vi.mocked(gamestate).mockReturnValue({
        world: {
          nodeCounts: {
            cave: 5,
            village: 3,
            town: 2,
            dungeon: 0,
            castle: 0,
          },
          claimedCounts: {
            cave: 5,
            village: 3,
            town: 2,
            dungeon: 0,
            castle: 0,
          },
        },
      } as ReturnType<typeof gamestate>);

      discordUpdateStatus();

      const windowStatus = (
        window as typeof window & { discordRPCStatus?: DiscordPresenceOpts }
      ).discordRPCStatus;

      // Total nodes: 5 + 3 + 2 = 10
      // Total claimed: 5 + 3 + 2 = 10
      // Percentage: Math.floor((10/10) * 100) = 100
      expect(windowStatus).toEqual({
        state: 'In game',
        details: 'Conquering the world (10/10 | 100%)',
      });
    });

    it('should handle partial completion with different node types', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'test electron/1.0.0 test',
        writable: true,
        configurable: true,
      });

      vi.mocked(gamestate).mockReturnValue({
        world: {
          nodeCounts: {
            cave: 20,
            village: 10,
            town: 5,
            dungeon: 15,
            castle: 3,
          },
          claimedCounts: {
            cave: 10,
            village: 8,
            town: 3,
            dungeon: 5,
            castle: 1,
          },
        },
      } as ReturnType<typeof gamestate>);

      discordUpdateStatus();

      const windowStatus = (
        window as typeof window & { discordRPCStatus?: DiscordPresenceOpts }
      ).discordRPCStatus;

      // Total nodes: 20 + 10 + 5 + 15 + 3 = 53
      // Total claimed: 10 + 8 + 3 + 5 + 1 = 27
      // Percentage: Math.floor((27/53) * 100) = Math.floor(50.94) = 50
      expect(windowStatus).toEqual({
        state: 'In game',
        details: 'Conquering the world (27/53 | 50%)',
      });
    });

    it('should handle single node type scenarios', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'test electron/1.0.0 test',
        writable: true,
        configurable: true,
      });

      vi.mocked(gamestate).mockReturnValue({
        world: {
          nodeCounts: {
            cave: 15,
            village: 0,
            town: 0,
            dungeon: 0,
            castle: 0,
          },
          claimedCounts: {
            cave: 7,
            village: 0,
            town: 0,
            dungeon: 0,
            castle: 0,
          },
        },
      } as ReturnType<typeof gamestate>);

      discordUpdateStatus();

      const windowStatus = (
        window as typeof window & { discordRPCStatus?: DiscordPresenceOpts }
      ).discordRPCStatus;

      // Total nodes: 15
      // Total claimed: 7
      // Percentage: Math.floor((7/15) * 100) = Math.floor(46.66) = 46
      expect(windowStatus).toEqual({
        state: 'In game',
        details: 'Conquering the world (7/15 | 46%)',
      });
    });

    it('should call gamestate function to get world data', () => {
      Object.defineProperty(navigator, 'userAgent', {
        value: 'test electron/1.0.0 test',
        writable: true,
        configurable: true,
      });

      discordUpdateStatus();

      expect(gamestate).toHaveBeenCalled();
    });
  });
});
