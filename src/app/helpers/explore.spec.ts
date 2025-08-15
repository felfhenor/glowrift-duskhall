import type { WorldLocation } from '@interfaces/world';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('@helpers/combat-end', () => ({
  combatHasGuardiansAlive: vi.fn(() => false),
}));

vi.mock('@helpers/ui', () => ({
  globalStatusText: {
    set: vi.fn(),
  },
}));

vi.mock('@helpers/world-location', () => ({
  locationGetCurrent: vi.fn(() => undefined),
}));

// Import functions after mocking
import { combatHasGuardiansAlive } from '@helpers/combat-end';
import {
  exploreProgressPercent,
  exploreProgressText,
  exploringUpdateGlobalStatusText,
  isExploring,
} from '@helpers/explore';
import { globalStatusText } from '@helpers/ui';
import { locationGetCurrent } from '@helpers/world-location';

describe('Explore Helper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset signals to default state
    exploreProgressText.set('');
    exploreProgressPercent.set(0);
  });

  describe('exploreProgressText signal', () => {
    it('should be initialized with empty string', () => {
      expect(exploreProgressText()).toBe('');
    });

    it('should update when set is called', () => {
      const testText = 'Exploring dungeon...';
      exploreProgressText.set(testText);
      expect(exploreProgressText()).toBe(testText);
    });

    it('should handle empty string updates', () => {
      exploreProgressText.set('Some text');
      exploreProgressText.set('');
      expect(exploreProgressText()).toBe('');
    });

    it('should handle long text strings', () => {
      const longText =
        'This is a very long exploration status text that contains many characters and describes the current exploration state in great detail.';
      exploreProgressText.set(longText);
      expect(exploreProgressText()).toBe(longText);
    });

    it('should handle special characters', () => {
      const specialText = 'Exploring 🗡️ dungeon with 💰 treasure!';
      exploreProgressText.set(specialText);
      expect(exploreProgressText()).toBe(specialText);
    });
  });

  describe('exploreProgressPercent signal', () => {
    it('should be initialized with 0', () => {
      expect(exploreProgressPercent()).toBe(0);
    });

    it('should update when set is called', () => {
      const testPercent = 50;
      exploreProgressPercent.set(testPercent);
      expect(exploreProgressPercent()).toBe(testPercent);
    });

    it('should handle 0 percent', () => {
      exploreProgressPercent.set(25);
      exploreProgressPercent.set(0);
      expect(exploreProgressPercent()).toBe(0);
    });

    it('should handle 100 percent', () => {
      exploreProgressPercent.set(100);
      expect(exploreProgressPercent()).toBe(100);
    });

    it('should handle decimal values', () => {
      exploreProgressPercent.set(33.5);
      expect(exploreProgressPercent()).toBe(33.5);
    });

    it('should handle negative values', () => {
      exploreProgressPercent.set(-10);
      expect(exploreProgressPercent()).toBe(-10);
    });

    it('should handle values over 100', () => {
      exploreProgressPercent.set(150);
      expect(exploreProgressPercent()).toBe(150);
    });
  });

  describe('isExploring', () => {
    it('should return false when no current location', () => {
      vi.mocked(locationGetCurrent).mockReturnValue(undefined);
      vi.mocked(combatHasGuardiansAlive).mockReturnValue(true);

      const result = isExploring();

      expect(result).toBe(false);
      expect(locationGetCurrent).toHaveBeenCalled();
    });

    it('should return false when current location exists but no guardians alive', () => {
      const mockLocation: WorldLocation = {
        id: 'location-1',
        name: 'Test Dungeon',
        x: 10,
        y: 20,
        nodeType: 'dungeon',
        elements: [],
        currentlyClaimed: false,
        claimCount: 0,
        encounterLevel: 5,
        unclaimTime: 0,
        guardianIds: ['guardian-1'],
        claimLootIds: [],
        traitIds: [],
        locationUpgrades: {},
      };

      vi.mocked(locationGetCurrent).mockReturnValue(mockLocation);
      vi.mocked(combatHasGuardiansAlive).mockReturnValue(false);

      const result = isExploring();

      expect(result).toBe(false);
      expect(locationGetCurrent).toHaveBeenCalled();
      expect(combatHasGuardiansAlive).toHaveBeenCalled();
    });

    it('should return true when current location exists and guardians are alive', () => {
      const mockLocation: WorldLocation = {
        id: 'location-2',
        name: 'Active Dungeon',
        x: 15,
        y: 25,
        nodeType: 'dungeon',
        elements: [
          {
            element: 'Fire',
            intensity: 3,
          },
        ],
        currentlyClaimed: true,
        claimCount: 2,
        encounterLevel: 8,
        unclaimTime: 1000,
        guardianIds: ['guardian-1', 'guardian-2'],
        claimLootIds: [],
        traitIds: [],
        locationUpgrades: {},
      };

      vi.mocked(locationGetCurrent).mockReturnValue(mockLocation);
      vi.mocked(combatHasGuardiansAlive).mockReturnValue(true);

      const result = isExploring();

      expect(result).toBe(true);
      expect(locationGetCurrent).toHaveBeenCalled();
      expect(combatHasGuardiansAlive).toHaveBeenCalled();
    });

    it('should call locationGetCurrent without parameters', () => {
      vi.mocked(locationGetCurrent).mockReturnValue(undefined);

      isExploring();

      expect(locationGetCurrent).toHaveBeenCalledWith();
    });

    it('should handle location with empty guardian array', () => {
      const mockLocation: WorldLocation = {
        id: 'location-3',
        name: 'Peaceful Town',
        x: 0,
        y: 0,
        nodeType: 'town',
        elements: [],
        currentlyClaimed: false,
        claimCount: 0,
        encounterLevel: 1,
        unclaimTime: 0,
        guardianIds: [],
        claimLootIds: [],
        traitIds: [],
        locationUpgrades: {},
      };

      vi.mocked(locationGetCurrent).mockReturnValue(mockLocation);
      vi.mocked(combatHasGuardiansAlive).mockReturnValue(false);

      const result = isExploring();

      expect(result).toBe(false);
      expect(locationGetCurrent).toHaveBeenCalled();
      expect(combatHasGuardiansAlive).toHaveBeenCalled();
    });

    it('should handle location with multiple elements', () => {
      const mockLocation: WorldLocation = {
        id: 'location-4',
        name: 'Elemental Dungeon',
        x: 100,
        y: 200,
        nodeType: 'dungeon',
        elements: [
          { element: 'Fire', intensity: 5 },
          { element: 'Water', intensity: 3 },
          { element: 'Earth', intensity: 2 },
          { element: 'Air', intensity: 4 },
        ],
        currentlyClaimed: true,
        claimCount: 10,
        encounterLevel: 15,
        unclaimTime: 5000,
        guardianIds: ['guardian-1', 'guardian-2', 'guardian-3'],
        claimLootIds: [],
        traitIds: [],
        locationUpgrades: {},
      };

      vi.mocked(locationGetCurrent).mockReturnValue(mockLocation);
      vi.mocked(combatHasGuardiansAlive).mockReturnValue(true);

      const result = isExploring();

      expect(result).toBe(true);
    });
  });

  describe('exploringUpdateGlobalStatusText', () => {
    it('should update both exploreProgressText and globalStatusText with same value', () => {
      const status = 'Exploring the ancient dungeon...';

      exploringUpdateGlobalStatusText(status);

      expect(exploreProgressText()).toBe(status);
      expect(globalStatusText.set).toHaveBeenCalledWith(status);
    });

    it('should handle empty string status', () => {
      const status = '';

      exploringUpdateGlobalStatusText(status);

      expect(exploreProgressText()).toBe(status);
      expect(globalStatusText.set).toHaveBeenCalledWith(status);
    });

    it('should handle long status text', () => {
      const status =
        'The hero ventures deep into the mystical caverns, encountering strange creatures and ancient magic that tests their resolve and determination in this perilous quest for treasure and glory.';

      exploringUpdateGlobalStatusText(status);

      expect(exploreProgressText()).toBe(status);
      expect(globalStatusText.set).toHaveBeenCalledWith(status);
    });

    it('should handle status with special characters', () => {
      const status = 'Fighting 🐉 dragon with ⚔️ sword!';

      exploringUpdateGlobalStatusText(status);

      expect(exploreProgressText()).toBe(status);
      expect(globalStatusText.set).toHaveBeenCalledWith(status);
    });

    it('should handle status with newlines and whitespace', () => {
      const status = '  Status with\nnewlines\tand tabs  ';

      exploringUpdateGlobalStatusText(status);

      expect(exploreProgressText()).toBe(status);
      expect(globalStatusText.set).toHaveBeenCalledWith(status);
    });

    it('should handle numeric strings', () => {
      const status = '42% complete';

      exploringUpdateGlobalStatusText(status);

      expect(exploreProgressText()).toBe(status);
      expect(globalStatusText.set).toHaveBeenCalledWith(status);
    });

    it('should update signals independently', () => {
      // Set initial different values
      exploreProgressText.set('Initial text');
      const initialGlobalCallCount = vi.mocked(globalStatusText.set).mock.calls
        .length;

      const status = 'New status';
      exploringUpdateGlobalStatusText(status);

      expect(exploreProgressText()).toBe(status);
      expect(globalStatusText.set).toHaveBeenCalledTimes(
        initialGlobalCallCount + 1,
      );
      expect(globalStatusText.set).toHaveBeenLastCalledWith(status);
    });

    it('should handle consecutive calls with different values', () => {
      const status1 = 'First status';
      const status2 = 'Second status';

      exploringUpdateGlobalStatusText(status1);
      expect(exploreProgressText()).toBe(status1);
      expect(globalStatusText.set).toHaveBeenCalledWith(status1);

      exploringUpdateGlobalStatusText(status2);
      expect(exploreProgressText()).toBe(status2);
      expect(globalStatusText.set).toHaveBeenCalledWith(status2);

      expect(globalStatusText.set).toHaveBeenCalledTimes(2);
    });

    it('should handle same status called multiple times', () => {
      const status = 'Repeated status';

      exploringUpdateGlobalStatusText(status);
      exploringUpdateGlobalStatusText(status);
      exploringUpdateGlobalStatusText(status);

      expect(exploreProgressText()).toBe(status);
      expect(globalStatusText.set).toHaveBeenCalledTimes(3);
      expect(globalStatusText.set).toHaveBeenCalledWith(status);
    });
  });
});
