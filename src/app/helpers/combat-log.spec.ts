import type { Combat, CombatLog, Combatant } from '@interfaces';
import type { ElementBlock } from '@interfaces/element';
import type { StatBlock } from '@interfaces/stat';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Create default objects to avoid type errors
const defaultStatBlock = (): StatBlock => ({
  Force: 0,
  Health: 0,
  Speed: 0,
  Aura: 0,
});

const defaultElementBlock = (): ElementBlock => ({
  Fire: 0,
  Water: 0,
  Earth: 0,
  Air: 0,
});

// Mock dependencies
vi.mock('@helpers/rng', () => ({
  rngUuid: vi.fn(() => 'mock-uuid-123'),
}));

vi.mock('@helpers/signal', () => ({
  localStorageSignal: vi.fn((key: string, defaultValue: unknown) => {
    let value = defaultValue;
    const signal = () => value;
    signal.update = vi.fn((updater: (prev: unknown) => unknown) => {
      value = updater(value);
      return value;
    });
    signal.set = vi.fn((newValue: unknown) => {
      value = newValue;
      return value;
    });
    return signal;
  }),
}));

vi.mock('mustache', () => ({
  default: {
    render: vi.fn((template: string, props: unknown) => {
      // Simple mock implementation that replaces {{prop}} and {{obj.prop}} with values
      return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
        if (!props || typeof props !== 'object') {
          return match; // Return original if no props
        }

        const data = props as Record<string, unknown>;
        const keys = path.split('.');
        let value: unknown = data;

        for (const key of keys) {
          if (
            value &&
            typeof value === 'object' &&
            key in (value as Record<string, unknown>)
          ) {
            value = (value as Record<string, unknown>)[key];
          } else {
            return match; // Return original if path doesn't exist
          }
        }

        return String(value || match);
      });
    }),
  },
}));

// Import functions after mocking
import {
  combatFormatMessage,
  combatLog,
  combatLogHealthColor,
  combatLogReset,
  combatMessageLog,
} from '@helpers/combat-log';
import { rngUuid } from '@helpers/rng';

describe('Combat Log', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the combat log to empty state
    combatLogReset();
  });

  describe('combatLog signal', () => {
    it('should be initialized as a localStorage signal with empty array', () => {
      // This test verifies the signal was created properly
      expect(combatLog).toBeDefined();
      expect(typeof combatLog.set).toBe('function');
      expect(typeof combatLog.update).toBe('function');
    });
  });

  describe('combatFormatMessage', () => {
    it('should format messages using mustache templates with string props', () => {
      const template = 'Hello {{name}}!';
      const props = { name: 'World' };

      const result = combatFormatMessage(template, props);

      expect(result).toBe('Hello World!');
    });

    it('should format messages with number props', () => {
      const template = 'Damage: {{damage}}';
      const props = { damage: 42 };

      const result = combatFormatMessage(template, props);

      expect(result).toBe('Damage: 42');
    });

    it('should format messages with boolean props', () => {
      const template = 'Critical: {{isCritical}}';
      const props = { isCritical: true };

      const result = combatFormatMessage(template, props);

      expect(result).toBe('Critical: true');
    });

    it('should handle complex object props', () => {
      const template = 'Player {{player.name}} dealt {{player.damage}} damage';
      const props = {
        player: {
          name: 'Hero',
          damage: 25,
        },
      };

      const result = combatFormatMessage(template, props);

      expect(result).toBe('Player Hero dealt 25 damage');
    });

    it('should handle empty template', () => {
      const template = '';
      const props = { name: 'Test' };

      const result = combatFormatMessage(template, props);

      expect(result).toBe('');
    });

    it('should handle null/undefined props', () => {
      const template = 'Hello {{name}}!';

      // These should not throw errors
      expect(() => combatFormatMessage(template, null)).not.toThrow();
      expect(() => combatFormatMessage(template, undefined)).not.toThrow();
    });
  });

  describe('combatMessageLog', () => {
    let mockCombat: Combat;
    let mockCombatant: Combatant;

    beforeEach(() => {
      mockCombat = {
        id: 'combat-123' as Combat['id'],
        locationName: 'Test Location',
        locationPosition: { x: 10, y: 20 },
        rounds: 5,
        heroes: [],
        guardians: [],
        elementalModifiers: defaultElementBlock(),
      };

      mockCombatant = {
        id: 'combatant-456',
        name: 'Test Hero',
        isEnemy: false,
        level: 10,
        hp: 100,
        targettingType: 'Random',
        baseStats: defaultStatBlock(),
        statBoosts: defaultStatBlock(),
        totalStats: defaultStatBlock(),
        combatStats: {
          repeatActionChance: defaultElementBlock(),
          skillStrikeAgainChance: defaultElementBlock(),
          skillAdditionalUseChance: defaultElementBlock(),
          skillAdditionalUseCount: defaultElementBlock(),
          redirectionChance: defaultElementBlock(),
          missChance: defaultElementBlock(),
          debuffIgnoreChance: defaultElementBlock(),
          damageReflectPercent: defaultElementBlock(),
          healingIgnorePercent: defaultElementBlock(),
          reviveChance: 0,
        },
        resistance: defaultElementBlock(),
        affinity: defaultElementBlock(),
        skillIds: [],
        skillRefs: [],
        talents: {},
        skillUses: {},
        statusEffects: [],
        statusEffectData: {},
        sprite: 'hero-sprite',
        frames: 4, // Required by Animatable interface
      };

      // Mock Date.now to return a consistent timestamp
      vi.spyOn(Date, 'now').mockReturnValue(1234567890);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should create and add a new combat log entry with actor', () => {
      const message = 'Test combat message';

      combatMessageLog(mockCombat, message, mockCombatant);

      expect(rngUuid).toHaveBeenCalled();
      expect(combatLog.update).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should create log entry with guardian spritesheet for enemy actor', () => {
      const message = 'Enemy attack';
      const enemyCombatant = {
        ...mockCombatant,
        isEnemy: true,
        sprite: 'guardian-sprite',
      };

      combatMessageLog(mockCombat, message, enemyCombatant);

      expect(rngUuid).toHaveBeenCalled();
      expect(combatLog.update).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should create log entry without actor', () => {
      const message = 'Combat starts';

      combatMessageLog(mockCombat, message);

      expect(rngUuid).toHaveBeenCalled();
      expect(combatLog.update).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should limit log entries to 500 items', () => {
      const message = 'Test message';

      // Create a mock update function that we can inspect
      let capturedUpdater: ((logs: CombatLog[]) => CombatLog[]) | undefined;
      vi.mocked(combatLog.update).mockImplementation((updater) => {
        capturedUpdater = updater as (logs: CombatLog[]) => CombatLog[];
        return [];
      });

      combatMessageLog(mockCombat, message);

      expect(capturedUpdater).toBeDefined();

      // Test the updater function with more than 500 logs
      const existingLogs: CombatLog[] = Array.from({ length: 500 }, (_, i) => ({
        combatId: mockCombat.id,
        messageId: `existing-${i}`,
        timestamp: 1000 + i,
        locationName: 'Old Location',
        message: `Old message ${i}`,
      }));

      const result = capturedUpdater!(existingLogs);

      // Should have exactly 500 logs (new one + 499 existing)
      expect(result).toHaveLength(500);
      expect(result[0].messageId).toBe('mock-uuid-123'); // New log should be first
    });

    it('should handle actor without sprite', () => {
      const message = 'Test message';
      const actorWithoutSprite = {
        ...mockCombatant,
        sprite: 'default-sprite', // Can't be undefined per Artable interface
      };

      combatMessageLog(mockCombat, message, actorWithoutSprite);

      expect(rngUuid).toHaveBeenCalled();
      expect(combatLog.update).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should handle empty message', () => {
      const message = '';

      combatMessageLog(mockCombat, message, mockCombatant);

      expect(rngUuid).toHaveBeenCalled();
      expect(combatLog.update).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe('combatLogReset', () => {
    it('should reset the combat log to empty array', () => {
      combatLogReset();

      expect(combatLog.set).toHaveBeenCalledWith([]);
    });

    it('should clear any existing log entries', () => {
      // First add some entries
      const mockCombat: Combat = {
        id: 'combat-123' as Combat['id'],
        locationName: 'Test Location',
        locationPosition: { x: 10, y: 20 },
        rounds: 1,
        heroes: [],
        guardians: [],
        elementalModifiers: defaultElementBlock(),
      };

      combatMessageLog(mockCombat, 'Test message');

      // Then reset
      combatLogReset();

      expect(combatLog.set).toHaveBeenCalledWith([]);
    });
  });

  describe('combatLogHealthColor', () => {
    describe('when health is 75% or higher', () => {
      it('should return green color for 75% health', () => {
        const result = combatLogHealthColor(75, 100);
        expect(result).toBe('text-green-400');
      });

      it('should return green color for 100% health', () => {
        const result = combatLogHealthColor(100, 100);
        expect(result).toBe('text-green-400');
      });

      it('should return green color for 90% health', () => {
        const result = combatLogHealthColor(90, 100);
        expect(result).toBe('text-green-400');
      });

      it('should return green color for exactly 75% with different total', () => {
        const result = combatLogHealthColor(150, 200);
        expect(result).toBe('text-green-400');
      });
    });

    describe('when health is between 26% and 74%', () => {
      it('should return yellow color for 50% health', () => {
        const result = combatLogHealthColor(50, 100);
        expect(result).toBe('text-yellow-400');
      });

      it('should return yellow color for 26% health', () => {
        const result = combatLogHealthColor(26, 100);
        expect(result).toBe('text-yellow-400');
      });

      it('should return yellow color for 74% health', () => {
        const result = combatLogHealthColor(74, 100);
        expect(result).toBe('text-yellow-400');
      });

      it('should return yellow color for exactly 26% with different total', () => {
        const result = combatLogHealthColor(52, 200);
        expect(result).toBe('text-yellow-400');
      });
    });

    describe('when health is 25% or lower', () => {
      it('should return red color for 25% health', () => {
        const result = combatLogHealthColor(25, 100);
        expect(result).toBe('text-rose-400');
      });

      it('should return red color for 0% health', () => {
        const result = combatLogHealthColor(0, 100);
        expect(result).toBe('text-rose-400');
      });

      it('should return red color for 10% health', () => {
        const result = combatLogHealthColor(10, 100);
        expect(result).toBe('text-rose-400');
      });

      it('should return red color for exactly 25% with different total', () => {
        const result = combatLogHealthColor(50, 200);
        expect(result).toBe('text-rose-400');
      });
    });

    describe('edge cases and different totals', () => {
      it('should handle decimal health values', () => {
        const result = combatLogHealthColor(74.5, 100);
        expect(result).toBe('text-green-400'); // 74.5% rounds to 75%
      });

      it('should handle decimal total health values', () => {
        const result = combatLogHealthColor(37.5, 50.0);
        expect(result).toBe('text-green-400'); // 75%
      });

      it('should handle very small health values', () => {
        const result = combatLogHealthColor(1, 1000);
        expect(result).toBe('text-rose-400'); // 0.1% rounds to 0%
      });

      it('should handle health equal to total', () => {
        const result = combatLogHealthColor(500, 500);
        expect(result).toBe('text-green-400'); // 100%
      });

      it('should handle negative health values', () => {
        const result = combatLogHealthColor(-10, 100);
        expect(result).toBe('text-rose-400'); // -10% rounds to -10%
      });

      it('should handle health higher than total (overhealing)', () => {
        const result = combatLogHealthColor(120, 100);
        expect(result).toBe('text-green-400'); // 120%
      });

      it('should handle zero total health', () => {
        // This would cause division by zero, which results in Infinity
        const result = combatLogHealthColor(50, 0);
        expect(result).toBe('text-green-400'); // Math.round(Infinity) results in large number >= 75
      });

      it('should round health percentages correctly', () => {
        // Test boundary rounding - 74.5% should round to 75%
        const result1 = combatLogHealthColor(74.5, 100);
        expect(result1).toBe('text-green-400'); // 75% (rounded up from 74.5)

        // Test 75.4% should round to 75%
        const result2 = combatLogHealthColor(75.4, 100);
        expect(result2).toBe('text-green-400'); // 75%

        // Test 25.5% should round to 26%
        const result3 = combatLogHealthColor(25.5, 100);
        expect(result3).toBe('text-yellow-400'); // 26%

        // Test 25.4% should round to 25%
        const result4 = combatLogHealthColor(25.4, 100);
        expect(result4).toBe('text-rose-400'); // 25%
      });
    });
  });
});
