import type { FestivalContent, FestivalId } from '@interfaces/content-festival';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Helper function to create properly typed FestivalId
const createFestivalId = (id: string): FestivalId => id as FestivalId;

// Mock dependencies
vi.mock('@helpers/festival', () => ({
  festivalGetActive: vi.fn(() => []),
}));

// Import functions after mocking
import { festivalGetActive } from '@helpers/festival';
import { festivalExplorationTickMultiplier } from '@helpers/festival-exploration';

describe('Festival Exploration Helper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('festivalExplorationTickMultiplier', () => {
    it('should return 0 when no active festivals', () => {
      vi.mocked(festivalGetActive).mockReturnValue([]);

      const result = festivalExplorationTickMultiplier();

      expect(result).toBe(0);
      expect(festivalGetActive).toHaveBeenCalled();
    });

    it('should return 0 when active festivals have no effects', () => {
      const mockFestival: FestivalContent = {
        id: createFestivalId('festival-1'),
        name: 'No Effects Festival',
        description: 'A festival without effects',
        rarity: 'Common',
        __type: 'festival',
        endDescription: 'Festival ends',
        effectsDescription: 'No effects',
        duration: 1000,
        effects: {},
      };

      vi.mocked(festivalGetActive).mockReturnValue([mockFestival]);

      const result = festivalExplorationTickMultiplier();

      expect(result).toBe(0);
      expect(festivalGetActive).toHaveBeenCalled();
    });

    it('should return 0 when festivals have effects but no exploration effects', () => {
      const mockFestival: FestivalContent = {
        id: createFestivalId('festival-2'),
        name: 'Combat Festival',
        description: 'A festival with combat effects only',
        rarity: 'Uncommon',
        __type: 'festival',
        endDescription: 'Combat ends',
        effectsDescription: 'Combat effects only',
        duration: 2000,
        effects: {
          combat: {
            outgoing: {
              damage: 1.5,
            },
            incoming: {
              damage: 0.8,
            },
          },
          production: {
            Mana: 100,
          },
        },
      };

      vi.mocked(festivalGetActive).mockReturnValue([mockFestival]);

      const result = festivalExplorationTickMultiplier();

      expect(result).toBe(0);
      expect(festivalGetActive).toHaveBeenCalled();
    });

    it('should return 0 when festivals have exploration effects but no ticks', () => {
      const mockFestival: FestivalContent = {
        id: createFestivalId('festival-3'),
        name: 'Empty Exploration Festival',
        description: 'A festival with empty exploration effects',
        rarity: 'Rare',
        __type: 'festival',
        endDescription: 'Empty exploration ends',
        effectsDescription: 'Empty exploration effects',
        duration: 3000,
        effects: {
          exploration: {}, // Empty exploration object
        },
      };

      vi.mocked(festivalGetActive).mockReturnValue([mockFestival]);

      const result = festivalExplorationTickMultiplier();

      expect(result).toBe(0);
      expect(festivalGetActive).toHaveBeenCalled();
    });

    it('should return correct multiplier for single festival with exploration ticks', () => {
      const mockFestival: FestivalContent = {
        id: createFestivalId('festival-4'),
        name: 'Exploration Festival',
        description: 'A festival with exploration effects',
        rarity: 'Mystical',
        __type: 'festival',
        endDescription: 'Exploration ends',
        effectsDescription: 'Exploration effects',
        duration: 4000,
        effects: {
          exploration: {
            ticks: 5,
          },
        },
      };

      vi.mocked(festivalGetActive).mockReturnValue([mockFestival]);

      const result = festivalExplorationTickMultiplier();

      expect(result).toBe(5);
      expect(festivalGetActive).toHaveBeenCalled();
    });

    it('should sum tick multipliers from multiple festivals', () => {
      const mockFestival1: FestivalContent = {
        id: createFestivalId('festival-5'),
        name: 'First Exploration Festival',
        description: 'First exploration festival',
        rarity: 'Legendary',
        __type: 'festival',
        endDescription: 'First exploration ends',
        effectsDescription: 'First exploration effects',
        duration: 5000,
        effects: {
          exploration: {
            ticks: 3,
          },
        },
      };

      const mockFestival2: FestivalContent = {
        id: createFestivalId('festival-6'),
        name: 'Second Exploration Festival',
        description: 'Second exploration festival',
        rarity: 'Unique',
        __type: 'festival',
        endDescription: 'Second exploration ends',
        effectsDescription: 'Second exploration effects',
        duration: 6000,
        effects: {
          exploration: {
            ticks: 7,
          },
        },
      };

      vi.mocked(festivalGetActive).mockReturnValue([
        mockFestival1,
        mockFestival2,
      ]);

      const result = festivalExplorationTickMultiplier();

      expect(result).toBe(10); // 3 + 7
      expect(festivalGetActive).toHaveBeenCalled();
    });

    it('should handle festivals with mixed effects (some with ticks, some without)', () => {
      const festivalWithTicks: FestivalContent = {
        id: createFestivalId('festival-7'),
        name: 'Mixed Festival 1',
        description: 'Festival with exploration ticks',
        rarity: 'Common',
        __type: 'festival',
        endDescription: 'Mixed ends',
        effectsDescription: 'Mixed effects',
        duration: 7000,
        effects: {
          exploration: {
            ticks: 4,
          },
          combat: {
            outgoing: {
              damage: 1.2,
            },
          },
        },
      };

      const festivalWithoutTicks: FestivalContent = {
        id: createFestivalId('festival-8'),
        name: 'Mixed Festival 2',
        description: 'Festival without exploration ticks',
        rarity: 'Uncommon',
        __type: 'festival',
        endDescription: 'No ticks ends',
        effectsDescription: 'No ticks effects',
        duration: 8000,
        effects: {
          combat: {
            incoming: {
              damage: 0.6,
            },
          },
          production: {
            'Soul Essence': 150,
            'Fire Shard': 25,
          },
        },
      };

      vi.mocked(festivalGetActive).mockReturnValue([
        festivalWithTicks,
        festivalWithoutTicks,
      ]);

      const result = festivalExplorationTickMultiplier();

      expect(result).toBe(4); // Only the first festival contributes
      expect(festivalGetActive).toHaveBeenCalled();
    });

    it('should handle festivals with undefined exploration effects gracefully', () => {
      const mockFestival: FestivalContent = {
        id: createFestivalId('festival-9'),
        name: 'Undefined Exploration Festival',
        description: 'Festival with undefined exploration',
        rarity: 'Rare',
        __type: 'festival',
        endDescription: 'Undefined exploration ends',
        effectsDescription: 'Undefined exploration effects',
        duration: 9000,
        effects: {
          exploration: undefined, // This should be handled gracefully
          combat: {
            outgoing: {
              damage: 2.0,
            },
          },
        },
      };

      vi.mocked(festivalGetActive).mockReturnValue([mockFestival]);

      const result = festivalExplorationTickMultiplier();

      expect(result).toBe(0);
      expect(festivalGetActive).toHaveBeenCalled();
    });

    it('should handle zero tick values correctly', () => {
      const mockFestival: FestivalContent = {
        id: createFestivalId('festival-10'),
        name: 'Zero Ticks Festival',
        description: 'Festival with zero exploration ticks',
        rarity: 'Mystical',
        __type: 'festival',
        endDescription: 'Zero ticks ends',
        effectsDescription: 'Zero ticks effects',
        duration: 10000,
        effects: {
          exploration: {
            ticks: 0,
          },
        },
      };

      vi.mocked(festivalGetActive).mockReturnValue([mockFestival]);

      const result = festivalExplorationTickMultiplier();

      expect(result).toBe(0);
      expect(festivalGetActive).toHaveBeenCalled();
    });

    it('should handle negative tick values correctly', () => {
      const mockFestival: FestivalContent = {
        id: createFestivalId('festival-11'),
        name: 'Negative Ticks Festival',
        description: 'Festival with negative exploration ticks',
        rarity: 'Legendary',
        __type: 'festival',
        endDescription: 'Negative ticks ends',
        effectsDescription: 'Negative ticks effects',
        duration: 11000,
        effects: {
          exploration: {
            ticks: -2,
          },
        },
      };

      vi.mocked(festivalGetActive).mockReturnValue([mockFestival]);

      const result = festivalExplorationTickMultiplier();

      expect(result).toBe(-2);
      expect(festivalGetActive).toHaveBeenCalled();
    });

    it('should handle decimal tick values correctly', () => {
      const mockFestival: FestivalContent = {
        id: createFestivalId('festival-12'),
        name: 'Decimal Ticks Festival',
        description: 'Festival with decimal exploration ticks',
        rarity: 'Unique',
        __type: 'festival',
        endDescription: 'Decimal ticks ends',
        effectsDescription: 'Decimal ticks effects',
        duration: 12000,
        effects: {
          exploration: {
            ticks: 2.5,
          },
        },
      };

      vi.mocked(festivalGetActive).mockReturnValue([mockFestival]);

      const result = festivalExplorationTickMultiplier();

      expect(result).toBe(2.5);
      expect(festivalGetActive).toHaveBeenCalled();
    });

    it('should handle large tick values correctly', () => {
      const mockFestival: FestivalContent = {
        id: createFestivalId('festival-13'),
        name: 'Large Ticks Festival',
        description: 'Festival with large exploration ticks',
        rarity: 'Common',
        __type: 'festival',
        endDescription: 'Large ticks ends',
        effectsDescription: 'Large ticks effects',
        duration: 13000,
        effects: {
          exploration: {
            ticks: 1000,
          },
        },
      };

      vi.mocked(festivalGetActive).mockReturnValue([mockFestival]);

      const result = festivalExplorationTickMultiplier();

      expect(result).toBe(1000);
      expect(festivalGetActive).toHaveBeenCalled();
    });

    it('should handle multiple festivals with various tick values', () => {
      const festival1: FestivalContent = {
        id: createFestivalId('festival-14'),
        name: 'Multi Test Festival 1',
        description: 'First festival for multi test',
        rarity: 'Uncommon',
        __type: 'festival',
        endDescription: 'Multi 1 ends',
        effectsDescription: 'Multi 1 effects',
        duration: 14000,
        effects: {
          exploration: {
            ticks: 1.5,
          },
        },
      };

      const festival2: FestivalContent = {
        id: createFestivalId('festival-15'),
        name: 'Multi Test Festival 2',
        description: 'Second festival for multi test',
        rarity: 'Rare',
        __type: 'festival',
        endDescription: 'Multi 2 ends',
        effectsDescription: 'Multi 2 effects',
        duration: 15000,
        effects: {
          exploration: {
            ticks: 3.7,
          },
        },
      };

      const festival3: FestivalContent = {
        id: createFestivalId('festival-16'),
        name: 'Multi Test Festival 3',
        description: 'Third festival for multi test',
        rarity: 'Mystical',
        __type: 'festival',
        endDescription: 'Multi 3 ends',
        effectsDescription: 'Multi 3 effects',
        duration: 16000,
        effects: {
          exploration: {
            ticks: -0.8,
          },
        },
      };

      vi.mocked(festivalGetActive).mockReturnValue([
        festival1,
        festival2,
        festival3,
      ]);

      const result = festivalExplorationTickMultiplier();

      expect(result).toBeCloseTo(4.4); // 1.5 + 3.7 + (-0.8) = 4.4
      expect(festivalGetActive).toHaveBeenCalled();
    });

    it('should handle complex festival combinations with all effect types', () => {
      const complexFestival1: FestivalContent = {
        id: createFestivalId('festival-complex-1'),
        name: 'Complex Festival 1',
        description: 'Festival with all effect types',
        rarity: 'Legendary',
        __type: 'festival',
        endDescription: 'Complex 1 ends',
        effectsDescription: 'Complex 1 effects',
        duration: 25000,
        effects: {
          exploration: {
            ticks: 6,
          },
          combat: {
            outgoing: {
              damage: 1.8,
            },
            incoming: {
              damage: 0.4,
            },
          },
          production: {
            Mana: 300,
            'Earth Crystal': 5,
            'Common Dust': 20,
          },
        },
      };

      const complexFestival2: FestivalContent = {
        id: createFestivalId('festival-complex-2'),
        name: 'Complex Festival 2',
        description: 'Festival with partial effects',
        rarity: 'Unique',
        __type: 'festival',
        endDescription: 'Complex 2 ends',
        effectsDescription: 'Complex 2 effects',
        duration: 30000,
        effects: {
          exploration: {
            ticks: 2,
          },
          production: {
            'Soul Essence': 500,
          },
        },
      };

      vi.mocked(festivalGetActive).mockReturnValue([
        complexFestival1,
        complexFestival2,
      ]);

      const result = festivalExplorationTickMultiplier();

      expect(result).toBe(8); // 6 + 2 = 8
      expect(festivalGetActive).toHaveBeenCalled();
    });

    it('should handle empty festivals array after complex setup', () => {
      // First call with festivals
      const mockFestival: FestivalContent = {
        id: createFestivalId('festival-temp'),
        name: 'Temporary Festival',
        description: 'A temporary festival',
        rarity: 'Common',
        __type: 'festival',
        endDescription: 'Temporary ends',
        effectsDescription: 'Temporary effects',
        duration: 1000,
        effects: {
          exploration: {
            ticks: 10,
          },
        },
      };

      vi.mocked(festivalGetActive).mockReturnValueOnce([mockFestival]);
      let result = festivalExplorationTickMultiplier();
      expect(result).toBe(10);

      // Second call with empty array
      vi.mocked(festivalGetActive).mockReturnValueOnce([]);
      result = festivalExplorationTickMultiplier();
      expect(result).toBe(0);

      expect(festivalGetActive).toHaveBeenCalledTimes(2);
    });

    it('should call festivalGetActive exactly once per invocation', () => {
      const mockFestival: FestivalContent = {
        id: createFestivalId('festival-call-test'),
        name: 'Call Test Festival',
        description: 'Festival for testing function calls',
        rarity: 'Rare',
        __type: 'festival',
        endDescription: 'Call test ends',
        effectsDescription: 'Call test effects',
        duration: 5000,
        effects: {
          exploration: {
            ticks: 3,
          },
        },
      };

      vi.mocked(festivalGetActive).mockReturnValue([mockFestival]);

      festivalExplorationTickMultiplier();

      expect(festivalGetActive).toHaveBeenCalledTimes(1);
      expect(festivalGetActive).toHaveBeenCalledWith();
    });
  });
});
