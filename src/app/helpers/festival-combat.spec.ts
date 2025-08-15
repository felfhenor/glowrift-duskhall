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
import {
  festivalGetCombatIncomingAttributeMultiplier,
  festivalGetCombatOutgoingAttributeMultiplier,
} from '@helpers/festival-combat';

describe('Festival Combat Helper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('festivalGetCombatOutgoingAttributeMultiplier', () => {
    it('should return 0 when no active festivals', () => {
      vi.mocked(festivalGetActive).mockReturnValue([]);

      const result = festivalGetCombatOutgoingAttributeMultiplier('damage');

      expect(result).toBe(0);
      expect(festivalGetActive).toHaveBeenCalled();
    });

    it('should return 0 when active festivals have no combat effects', () => {
      const mockFestival: FestivalContent = {
        id: createFestivalId('festival-1'),
        name: 'Test Festival',
        description: 'A test festival',
        rarity: 'Common',
        __type: 'festival',
        endDescription: 'Festival ends',
        effectsDescription: 'No effects',
        duration: 1000,
        effects: {},
      };

      vi.mocked(festivalGetActive).mockReturnValue([mockFestival]);

      const result = festivalGetCombatOutgoingAttributeMultiplier('damage');

      expect(result).toBe(0);
      expect(festivalGetActive).toHaveBeenCalled();
    });

    it('should return 0 when festivals have combat effects but no outgoing effects', () => {
      const mockFestival: FestivalContent = {
        id: createFestivalId('festival-2'),
        name: 'Defensive Festival',
        description: 'A defensive festival',
        rarity: 'Uncommon',
        __type: 'festival',
        endDescription: 'Defense ends',
        effectsDescription: 'Defensive effects',
        duration: 2000,
        effects: {
          combat: {
            incoming: {
              damage: 0.5,
            },
          },
        },
      };

      vi.mocked(festivalGetActive).mockReturnValue([mockFestival]);

      const result = festivalGetCombatOutgoingAttributeMultiplier('damage');

      expect(result).toBe(0);
      expect(festivalGetActive).toHaveBeenCalled();
    });

    it('should return correct multiplier for single festival with outgoing damage', () => {
      const mockFestival: FestivalContent = {
        id: createFestivalId('festival-3'),
        name: 'Offensive Festival',
        description: 'An offensive festival',
        rarity: 'Rare',
        __type: 'festival',
        endDescription: 'Offense ends',
        effectsDescription: 'Offensive effects',
        duration: 3000,
        effects: {
          combat: {
            outgoing: {
              damage: 1.5,
            },
          },
        },
      };

      vi.mocked(festivalGetActive).mockReturnValue([mockFestival]);

      const result = festivalGetCombatOutgoingAttributeMultiplier('damage');

      expect(result).toBe(1.5);
      expect(festivalGetActive).toHaveBeenCalled();
    });

    it('should sum multipliers from multiple festivals', () => {
      const mockFestival1: FestivalContent = {
        id: createFestivalId('festival-4'),
        name: 'First Festival',
        description: 'First festival',
        rarity: 'Mystical',
        __type: 'festival',
        endDescription: 'First ends',
        effectsDescription: 'First effects',
        duration: 4000,
        effects: {
          combat: {
            outgoing: {
              damage: 0.8,
            },
          },
        },
      };

      const mockFestival2: FestivalContent = {
        id: createFestivalId('festival-5'),
        name: 'Second Festival',
        description: 'Second festival',
        rarity: 'Legendary',
        __type: 'festival',
        endDescription: 'Second ends',
        effectsDescription: 'Second effects',
        duration: 5000,
        effects: {
          combat: {
            outgoing: {
              damage: 1.2,
            },
          },
        },
      };

      vi.mocked(festivalGetActive).mockReturnValue([
        mockFestival1,
        mockFestival2,
      ]);

      const result = festivalGetCombatOutgoingAttributeMultiplier('damage');

      expect(result).toBe(2.0); // 0.8 + 1.2
      expect(festivalGetActive).toHaveBeenCalled();
    });

    it('should handle festivals with mixed effects (some with outgoing, some without)', () => {
      const festivalWithOutgoing: FestivalContent = {
        id: createFestivalId('festival-6'),
        name: 'Mixed Festival 1',
        description: 'Festival with outgoing',
        rarity: 'Unique',
        __type: 'festival',
        endDescription: 'Mixed ends',
        effectsDescription: 'Mixed effects',
        duration: 6000,
        effects: {
          combat: {
            outgoing: {
              damage: 2.5,
            },
            incoming: {
              damage: 0.3,
            },
          },
        },
      };

      const festivalWithoutOutgoing: FestivalContent = {
        id: createFestivalId('festival-7'),
        name: 'Mixed Festival 2',
        description: 'Festival without outgoing',
        rarity: 'Common',
        __type: 'festival',
        endDescription: 'No outgoing ends',
        effectsDescription: 'No outgoing effects',
        duration: 7000,
        effects: {
          combat: {
            incoming: {
              damage: 0.7,
            },
          },
          production: {
            Mana: 100,
          },
        },
      };

      vi.mocked(festivalGetActive).mockReturnValue([
        festivalWithOutgoing,
        festivalWithoutOutgoing,
      ]);

      const result = festivalGetCombatOutgoingAttributeMultiplier('damage');

      expect(result).toBe(2.5); // Only the first festival contributes
      expect(festivalGetActive).toHaveBeenCalled();
    });

    it('should handle festivals with undefined/null values gracefully', () => {
      const mockFestival: FestivalContent = {
        id: createFestivalId('festival-8'),
        name: 'Partial Festival',
        description: 'Festival with undefined values',
        rarity: 'Uncommon',
        __type: 'festival',
        endDescription: 'Partial ends',
        effectsDescription: 'Partial effects',
        duration: 8000,
        effects: {
          combat: {
            outgoing: undefined, // This should be handled gracefully
          },
        },
      };

      vi.mocked(festivalGetActive).mockReturnValue([mockFestival]);

      const result = festivalGetCombatOutgoingAttributeMultiplier('damage');

      expect(result).toBe(0);
      expect(festivalGetActive).toHaveBeenCalled();
    });

    it('should handle zero values correctly', () => {
      const mockFestival: FestivalContent = {
        id: createFestivalId('festival-9'),
        name: 'Zero Festival',
        description: 'Festival with zero damage',
        rarity: 'Rare',
        __type: 'festival',
        endDescription: 'Zero ends',
        effectsDescription: 'Zero effects',
        duration: 9000,
        effects: {
          combat: {
            outgoing: {
              damage: 0,
            },
          },
        },
      };

      vi.mocked(festivalGetActive).mockReturnValue([mockFestival]);

      const result = festivalGetCombatOutgoingAttributeMultiplier('damage');

      expect(result).toBe(0);
      expect(festivalGetActive).toHaveBeenCalled();
    });

    it('should handle negative values correctly', () => {
      const mockFestival: FestivalContent = {
        id: createFestivalId('festival-10'),
        name: 'Negative Festival',
        description: 'Festival with negative damage',
        rarity: 'Mystical',
        __type: 'festival',
        endDescription: 'Negative ends',
        effectsDescription: 'Negative effects',
        duration: 10000,
        effects: {
          combat: {
            outgoing: {
              damage: -0.5,
            },
          },
        },
      };

      vi.mocked(festivalGetActive).mockReturnValue([mockFestival]);

      const result = festivalGetCombatOutgoingAttributeMultiplier('damage');

      expect(result).toBe(-0.5);
      expect(festivalGetActive).toHaveBeenCalled();
    });

    it('should handle decimal values correctly', () => {
      const mockFestival: FestivalContent = {
        id: createFestivalId('festival-11'),
        name: 'Decimal Festival',
        description: 'Festival with decimal damage',
        rarity: 'Legendary',
        __type: 'festival',
        endDescription: 'Decimal ends',
        effectsDescription: 'Decimal effects',
        duration: 11000,
        effects: {
          combat: {
            outgoing: {
              damage: 0.123456,
            },
          },
        },
      };

      vi.mocked(festivalGetActive).mockReturnValue([mockFestival]);

      const result = festivalGetCombatOutgoingAttributeMultiplier('damage');

      expect(result).toBeCloseTo(0.123456);
      expect(festivalGetActive).toHaveBeenCalled();
    });
  });

  describe('festivalGetCombatIncomingAttributeMultiplier', () => {
    it('should return 0 when no active festivals', () => {
      vi.mocked(festivalGetActive).mockReturnValue([]);

      const result = festivalGetCombatIncomingAttributeMultiplier('damage');

      expect(result).toBe(0);
      expect(festivalGetActive).toHaveBeenCalled();
    });

    it('should return 0 when active festivals have no combat effects', () => {
      const mockFestival: FestivalContent = {
        id: createFestivalId('festival-12'),
        name: 'No Combat Festival',
        description: 'Festival without combat effects',
        rarity: 'Common',
        __type: 'festival',
        endDescription: 'No combat ends',
        effectsDescription: 'No combat effects',
        duration: 12000,
        effects: {
          production: {
            'Soul Essence': 50,
          },
        },
      };

      vi.mocked(festivalGetActive).mockReturnValue([mockFestival]);

      const result = festivalGetCombatIncomingAttributeMultiplier('damage');

      expect(result).toBe(0);
      expect(festivalGetActive).toHaveBeenCalled();
    });

    it('should return 0 when festivals have combat effects but no incoming effects', () => {
      const mockFestival: FestivalContent = {
        id: createFestivalId('festival-13'),
        name: 'Outgoing Only Festival',
        description: 'Festival with only outgoing effects',
        rarity: 'Uncommon',
        __type: 'festival',
        endDescription: 'Outgoing only ends',
        effectsDescription: 'Outgoing only effects',
        duration: 13000,
        effects: {
          combat: {
            outgoing: {
              damage: 1.8,
            },
          },
        },
      };

      vi.mocked(festivalGetActive).mockReturnValue([mockFestival]);

      const result = festivalGetCombatIncomingAttributeMultiplier('damage');

      expect(result).toBe(0);
      expect(festivalGetActive).toHaveBeenCalled();
    });

    it('should return correct multiplier for single festival with incoming damage', () => {
      const mockFestival: FestivalContent = {
        id: createFestivalId('festival-14'),
        name: 'Defensive Festival',
        description: 'Festival with defensive effects',
        rarity: 'Rare',
        __type: 'festival',
        endDescription: 'Defense ends',
        effectsDescription: 'Defensive effects',
        duration: 14000,
        effects: {
          combat: {
            incoming: {
              damage: 0.6,
            },
          },
        },
      };

      vi.mocked(festivalGetActive).mockReturnValue([mockFestival]);

      const result = festivalGetCombatIncomingAttributeMultiplier('damage');

      expect(result).toBe(0.6);
      expect(festivalGetActive).toHaveBeenCalled();
    });

    it('should sum multipliers from multiple festivals', () => {
      const mockFestival1: FestivalContent = {
        id: createFestivalId('festival-15'),
        name: 'First Defensive Festival',
        description: 'First defensive festival',
        rarity: 'Mystical',
        __type: 'festival',
        endDescription: 'First defense ends',
        effectsDescription: 'First defensive effects',
        duration: 15000,
        effects: {
          combat: {
            incoming: {
              damage: 0.4,
            },
          },
        },
      };

      const mockFestival2: FestivalContent = {
        id: createFestivalId('festival-16'),
        name: 'Second Defensive Festival',
        description: 'Second defensive festival',
        rarity: 'Legendary',
        __type: 'festival',
        endDescription: 'Second defense ends',
        effectsDescription: 'Second defensive effects',
        duration: 16000,
        effects: {
          combat: {
            incoming: {
              damage: 0.3,
            },
          },
        },
      };

      vi.mocked(festivalGetActive).mockReturnValue([
        mockFestival1,
        mockFestival2,
      ]);

      const result = festivalGetCombatIncomingAttributeMultiplier('damage');

      expect(result).toBe(0.7); // 0.4 + 0.3
      expect(festivalGetActive).toHaveBeenCalled();
    });

    it('should handle festivals with mixed effects (some with incoming, some without)', () => {
      const festivalWithIncoming: FestivalContent = {
        id: createFestivalId('festival-17'),
        name: 'Mixed Defensive Festival',
        description: 'Festival with incoming effects',
        rarity: 'Unique',
        __type: 'festival',
        endDescription: 'Mixed defense ends',
        effectsDescription: 'Mixed defensive effects',
        duration: 17000,
        effects: {
          combat: {
            incoming: {
              damage: 0.2,
            },
            outgoing: {
              damage: 1.5,
            },
          },
        },
      };

      const festivalWithoutIncoming: FestivalContent = {
        id: createFestivalId('festival-18'),
        name: 'No Incoming Festival',
        description: 'Festival without incoming effects',
        rarity: 'Common',
        __type: 'festival',
        endDescription: 'No incoming ends',
        effectsDescription: 'No incoming effects',
        duration: 18000,
        effects: {
          combat: {
            outgoing: {
              damage: 2.0,
            },
          },
          exploration: {
            ticks: 5,
          },
        },
      };

      vi.mocked(festivalGetActive).mockReturnValue([
        festivalWithIncoming,
        festivalWithoutIncoming,
      ]);

      const result = festivalGetCombatIncomingAttributeMultiplier('damage');

      expect(result).toBe(0.2); // Only the first festival contributes
      expect(festivalGetActive).toHaveBeenCalled();
    });

    it('should handle festivals with undefined/null values gracefully', () => {
      const mockFestival: FestivalContent = {
        id: createFestivalId('festival-19'),
        name: 'Undefined Incoming Festival',
        description: 'Festival with undefined incoming',
        rarity: 'Uncommon',
        __type: 'festival',
        endDescription: 'Undefined incoming ends',
        effectsDescription: 'Undefined incoming effects',
        duration: 19000,
        effects: {
          combat: {
            incoming: undefined, // This should be handled gracefully
          },
        },
      };

      vi.mocked(festivalGetActive).mockReturnValue([mockFestival]);

      const result = festivalGetCombatIncomingAttributeMultiplier('damage');

      expect(result).toBe(0);
      expect(festivalGetActive).toHaveBeenCalled();
    });

    it('should handle zero values correctly', () => {
      const mockFestival: FestivalContent = {
        id: createFestivalId('festival-20'),
        name: 'Zero Incoming Festival',
        description: 'Festival with zero incoming damage',
        rarity: 'Rare',
        __type: 'festival',
        endDescription: 'Zero incoming ends',
        effectsDescription: 'Zero incoming effects',
        duration: 20000,
        effects: {
          combat: {
            incoming: {
              damage: 0,
            },
          },
        },
      };

      vi.mocked(festivalGetActive).mockReturnValue([mockFestival]);

      const result = festivalGetCombatIncomingAttributeMultiplier('damage');

      expect(result).toBe(0);
      expect(festivalGetActive).toHaveBeenCalled();
    });

    it('should handle negative values correctly', () => {
      const mockFestival: FestivalContent = {
        id: createFestivalId('festival-21'),
        name: 'Negative Incoming Festival',
        description: 'Festival with negative incoming damage',
        rarity: 'Mystical',
        __type: 'festival',
        endDescription: 'Negative incoming ends',
        effectsDescription: 'Negative incoming effects',
        duration: 21000,
        effects: {
          combat: {
            incoming: {
              damage: -0.8,
            },
          },
        },
      };

      vi.mocked(festivalGetActive).mockReturnValue([mockFestival]);

      const result = festivalGetCombatIncomingAttributeMultiplier('damage');

      expect(result).toBe(-0.8);
      expect(festivalGetActive).toHaveBeenCalled();
    });

    it('should handle decimal values correctly', () => {
      const mockFestival: FestivalContent = {
        id: createFestivalId('festival-22'),
        name: 'Decimal Incoming Festival',
        description: 'Festival with decimal incoming damage',
        rarity: 'Legendary',
        __type: 'festival',
        endDescription: 'Decimal incoming ends',
        effectsDescription: 'Decimal incoming effects',
        duration: 22000,
        effects: {
          combat: {
            incoming: {
              damage: 0.789123,
            },
          },
        },
      };

      vi.mocked(festivalGetActive).mockReturnValue([mockFestival]);

      const result = festivalGetCombatIncomingAttributeMultiplier('damage');

      expect(result).toBeCloseTo(0.789123);
      expect(festivalGetActive).toHaveBeenCalled();
    });
  });

  describe('integration tests', () => {
    it('should handle complex festival combinations correctly', () => {
      const complexFestival1: FestivalContent = {
        id: 'festival-complex-1' as FestivalId,
        name: 'Complex Festival 1',
        description: 'Festival with both incoming and outgoing effects',
        rarity: 'Unique',
        __type: 'festival',
        endDescription: 'Complex 1 ends',
        effectsDescription: 'Complex 1 effects',
        duration: 25000,
        effects: {
          combat: {
            outgoing: {
              damage: 1.5,
            },
            incoming: {
              damage: 0.5,
            },
          },
          production: {
            Mana: 200,
            'Fire Shard': 10,
          },
          exploration: {
            ticks: 3,
          },
        },
      };

      const complexFestival2: FestivalContent = {
        id: 'festival-complex-2' as FestivalId,
        name: 'Complex Festival 2',
        description: 'Festival with only outgoing effects',
        rarity: 'Legendary',
        __type: 'festival',
        endDescription: 'Complex 2 ends',
        effectsDescription: 'Complex 2 effects',
        duration: 30000,
        effects: {
          combat: {
            outgoing: {
              damage: 0.8,
            },
          },
        },
      };

      const complexFestival3: FestivalContent = {
        id: 'festival-complex-3' as FestivalId,
        name: 'Complex Festival 3',
        description: 'Festival with only incoming effects',
        rarity: 'Mystical',
        __type: 'festival',
        endDescription: 'Complex 3 ends',
        effectsDescription: 'Complex 3 effects',
        duration: 35000,
        effects: {
          combat: {
            incoming: {
              damage: 0.2,
            },
          },
          production: {
            'Water Sliver': 50,
          },
        },
      };

      vi.mocked(festivalGetActive).mockReturnValue([
        complexFestival1,
        complexFestival2,
        complexFestival3,
      ]);

      const outgoingResult =
        festivalGetCombatOutgoingAttributeMultiplier('damage');
      const incomingResult =
        festivalGetCombatIncomingAttributeMultiplier('damage');

      expect(outgoingResult).toBe(2.3); // 1.5 + 0.8 + 0 = 2.3
      expect(incomingResult).toBe(0.7); // 0.5 + 0 + 0.2 = 0.7
      expect(festivalGetActive).toHaveBeenCalledTimes(2);
    });

    it('should handle empty effects objects gracefully', () => {
      const emptyEffectsFestival: FestivalContent = {
        id: 'festival-empty' as FestivalId,
        name: 'Empty Effects Festival',
        description: 'Festival with empty effects',
        rarity: 'Common',
        __type: 'festival',
        endDescription: 'Empty effects end',
        effectsDescription: 'No effects',
        duration: 1000,
        effects: {}, // Empty effects object
      };

      vi.mocked(festivalGetActive).mockReturnValue([emptyEffectsFestival]);

      const outgoingResult =
        festivalGetCombatOutgoingAttributeMultiplier('damage');
      const incomingResult =
        festivalGetCombatIncomingAttributeMultiplier('damage');

      expect(outgoingResult).toBe(0);
      expect(incomingResult).toBe(0);
      expect(festivalGetActive).toHaveBeenCalledTimes(2);
    });
  });
});
