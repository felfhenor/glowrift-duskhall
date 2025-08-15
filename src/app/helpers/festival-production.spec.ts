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
import { festivalProductionMultiplier } from '@helpers/festival-production';

describe('Festival Production Helper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('festivalProductionMultiplier', () => {
    describe('with no active festivals', () => {
      it('should return 0 for Mana when no active festivals', () => {
        vi.mocked(festivalGetActive).mockReturnValue([]);

        const result = festivalProductionMultiplier('Mana');

        expect(result).toBe(0);
        expect(festivalGetActive).toHaveBeenCalled();
      });

      it('should return 0 for Soul Essence when no active festivals', () => {
        vi.mocked(festivalGetActive).mockReturnValue([]);

        const result = festivalProductionMultiplier('Soul Essence');

        expect(result).toBe(0);
        expect(festivalGetActive).toHaveBeenCalled();
      });

      it('should return 0 for elemental currencies when no active festivals', () => {
        vi.mocked(festivalGetActive).mockReturnValue([]);

        expect(festivalProductionMultiplier('Fire Sliver')).toBe(0);
        expect(festivalProductionMultiplier('Water Shard')).toBe(0);
        expect(festivalProductionMultiplier('Earth Crystal')).toBe(0);
        expect(festivalProductionMultiplier('Air Core')).toBe(0);
        expect(festivalGetActive).toHaveBeenCalledTimes(4);
      });

      it('should return 0 for rarity dust currencies when no active festivals', () => {
        vi.mocked(festivalGetActive).mockReturnValue([]);

        expect(festivalProductionMultiplier('Common Dust')).toBe(0);
        expect(festivalProductionMultiplier('Rare Dust')).toBe(0);
        expect(festivalProductionMultiplier('Legendary Dust')).toBe(0);
        expect(festivalGetActive).toHaveBeenCalledTimes(3);
      });
    });

    describe('with festivals that have no effects', () => {
      it('should return 0 when festivals have no effects object', () => {
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

        const result = festivalProductionMultiplier('Mana');

        expect(result).toBe(0);
        expect(festivalGetActive).toHaveBeenCalled();
      });

      it('should return 0 when festivals have effects but no production effects', () => {
        const mockFestival: FestivalContent = {
          id: createFestivalId('festival-2'),
          name: 'Combat Only Festival',
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
            exploration: {
              ticks: 3,
            },
          },
        };

        vi.mocked(festivalGetActive).mockReturnValue([mockFestival]);

        const result = festivalProductionMultiplier('Soul Essence');

        expect(result).toBe(0);
        expect(festivalGetActive).toHaveBeenCalled();
      });

      it('should return 0 when festivals have production effects but not for requested currency', () => {
        const mockFestival: FestivalContent = {
          id: createFestivalId('festival-3'),
          name: 'Partial Production Festival',
          description: 'A festival with some production effects',
          rarity: 'Rare',
          __type: 'festival',
          endDescription: 'Partial production ends',
          effectsDescription: 'Partial production effects',
          duration: 3000,
          effects: {
            production: {
              Mana: 100,
              'Fire Shard': 10,
            },
          },
        };

        vi.mocked(festivalGetActive).mockReturnValue([mockFestival]);

        const result = festivalProductionMultiplier('Soul Essence'); // Not in the festival

        expect(result).toBe(0);
        expect(festivalGetActive).toHaveBeenCalled();
      });
    });

    describe('with single festival having production effects', () => {
      it('should return correct multiplier for Mana', () => {
        const mockFestival: FestivalContent = {
          id: createFestivalId('festival-4'),
          name: 'Mana Festival',
          description: 'A festival that produces Mana',
          rarity: 'Mystical',
          __type: 'festival',
          endDescription: 'Mana production ends',
          effectsDescription: 'Mana production effects',
          duration: 4000,
          effects: {
            production: {
              Mana: 150,
            },
          },
        };

        vi.mocked(festivalGetActive).mockReturnValue([mockFestival]);

        const result = festivalProductionMultiplier('Mana');

        expect(result).toBe(150);
        expect(festivalGetActive).toHaveBeenCalled();
      });

      it('should return correct multiplier for Soul Essence', () => {
        const mockFestival: FestivalContent = {
          id: createFestivalId('festival-5'),
          name: 'Soul Festival',
          description: 'A festival that produces Soul Essence',
          rarity: 'Legendary',
          __type: 'festival',
          endDescription: 'Soul production ends',
          effectsDescription: 'Soul production effects',
          duration: 5000,
          effects: {
            production: {
              'Soul Essence': 75,
            },
          },
        };

        vi.mocked(festivalGetActive).mockReturnValue([mockFestival]);

        const result = festivalProductionMultiplier('Soul Essence');

        expect(result).toBe(75);
        expect(festivalGetActive).toHaveBeenCalled();
      });

      it('should return correct multiplier for elemental slivers', () => {
        const mockFestival: FestivalContent = {
          id: createFestivalId('festival-6'),
          name: 'Fire Sliver Festival',
          description: 'A festival that produces Fire Slivers',
          rarity: 'Unique',
          __type: 'festival',
          endDescription: 'Fire sliver production ends',
          effectsDescription: 'Fire sliver production effects',
          duration: 6000,
          effects: {
            production: {
              'Fire Sliver': 25,
            },
          },
        };

        vi.mocked(festivalGetActive).mockReturnValue([mockFestival]);

        const result = festivalProductionMultiplier('Fire Sliver');

        expect(result).toBe(25);
        expect(festivalGetActive).toHaveBeenCalled();
      });

      it('should return correct multiplier for elemental shards', () => {
        const mockFestival: FestivalContent = {
          id: createFestivalId('festival-7'),
          name: 'Water Shard Festival',
          description: 'A festival that produces Water Shards',
          rarity: 'Common',
          __type: 'festival',
          endDescription: 'Water shard production ends',
          effectsDescription: 'Water shard production effects',
          duration: 7000,
          effects: {
            production: {
              'Water Shard': 12,
            },
          },
        };

        vi.mocked(festivalGetActive).mockReturnValue([mockFestival]);

        const result = festivalProductionMultiplier('Water Shard');

        expect(result).toBe(12);
        expect(festivalGetActive).toHaveBeenCalled();
      });

      it('should return correct multiplier for elemental crystals', () => {
        const mockFestival: FestivalContent = {
          id: createFestivalId('festival-8'),
          name: 'Earth Crystal Festival',
          description: 'A festival that produces Earth Crystals',
          rarity: 'Uncommon',
          __type: 'festival',
          endDescription: 'Earth crystal production ends',
          effectsDescription: 'Earth crystal production effects',
          duration: 8000,
          effects: {
            production: {
              'Earth Crystal': 5,
            },
          },
        };

        vi.mocked(festivalGetActive).mockReturnValue([mockFestival]);

        const result = festivalProductionMultiplier('Earth Crystal');

        expect(result).toBe(5);
        expect(festivalGetActive).toHaveBeenCalled();
      });

      it('should return correct multiplier for elemental cores', () => {
        const mockFestival: FestivalContent = {
          id: createFestivalId('festival-9'),
          name: 'Air Core Festival',
          description: 'A festival that produces Air Cores',
          rarity: 'Rare',
          __type: 'festival',
          endDescription: 'Air core production ends',
          effectsDescription: 'Air core production effects',
          duration: 9000,
          effects: {
            production: {
              'Air Core': 2,
            },
          },
        };

        vi.mocked(festivalGetActive).mockReturnValue([mockFestival]);

        const result = festivalProductionMultiplier('Air Core');

        expect(result).toBe(2);
        expect(festivalGetActive).toHaveBeenCalled();
      });

      it('should return correct multiplier for rarity dust', () => {
        const mockFestival: FestivalContent = {
          id: createFestivalId('festival-10'),
          name: 'Rare Dust Festival',
          description: 'A festival that produces Rare Dust',
          rarity: 'Mystical',
          __type: 'festival',
          endDescription: 'Rare dust production ends',
          effectsDescription: 'Rare dust production effects',
          duration: 10000,
          effects: {
            production: {
              'Rare Dust': 8,
            },
          },
        };

        vi.mocked(festivalGetActive).mockReturnValue([mockFestival]);

        const result = festivalProductionMultiplier('Rare Dust');

        expect(result).toBe(8);
        expect(festivalGetActive).toHaveBeenCalled();
      });
    });

    describe('with multiple festivals', () => {
      it('should sum production multipliers from multiple festivals for same currency', () => {
        const festival1: FestivalContent = {
          id: createFestivalId('festival-11'),
          name: 'First Mana Festival',
          description: 'First festival producing Mana',
          rarity: 'Legendary',
          __type: 'festival',
          endDescription: 'First Mana ends',
          effectsDescription: 'First Mana effects',
          duration: 11000,
          effects: {
            production: {
              Mana: 80,
            },
          },
        };

        const festival2: FestivalContent = {
          id: createFestivalId('festival-12'),
          name: 'Second Mana Festival',
          description: 'Second festival producing Mana',
          rarity: 'Unique',
          __type: 'festival',
          endDescription: 'Second Mana ends',
          effectsDescription: 'Second Mana effects',
          duration: 12000,
          effects: {
            production: {
              Mana: 120,
            },
          },
        };

        vi.mocked(festivalGetActive).mockReturnValue([festival1, festival2]);

        const result = festivalProductionMultiplier('Mana');

        expect(result).toBe(200); // 80 + 120
        expect(festivalGetActive).toHaveBeenCalled();
      });

      it('should only include relevant festivals for specific currency', () => {
        const manaFestival: FestivalContent = {
          id: createFestivalId('festival-13'),
          name: 'Mana Festival',
          description: 'Festival producing Mana',
          rarity: 'Common',
          __type: 'festival',
          endDescription: 'Mana ends',
          effectsDescription: 'Mana effects',
          duration: 13000,
          effects: {
            production: {
              Mana: 60,
            },
          },
        };

        const soulFestival: FestivalContent = {
          id: createFestivalId('festival-14'),
          name: 'Soul Festival',
          description: 'Festival producing Soul Essence',
          rarity: 'Uncommon',
          __type: 'festival',
          endDescription: 'Soul ends',
          effectsDescription: 'Soul effects',
          duration: 14000,
          effects: {
            production: {
              'Soul Essence': 40,
            },
          },
        };

        const mixedFestival: FestivalContent = {
          id: createFestivalId('festival-15'),
          name: 'Mixed Festival',
          description: 'Festival producing multiple currencies',
          rarity: 'Rare',
          __type: 'festival',
          endDescription: 'Mixed ends',
          effectsDescription: 'Mixed effects',
          duration: 15000,
          effects: {
            production: {
              Mana: 30,
              'Fire Shard': 15,
            },
          },
        };

        vi.mocked(festivalGetActive).mockReturnValue([
          manaFestival,
          soulFestival,
          mixedFestival,
        ]);

        const manaResult = festivalProductionMultiplier('Mana');
        expect(manaResult).toBe(90); // 60 + 0 + 30

        const soulResult = festivalProductionMultiplier('Soul Essence');
        expect(soulResult).toBe(40); // 0 + 40 + 0

        const fireResult = festivalProductionMultiplier('Fire Shard');
        expect(fireResult).toBe(15); // 0 + 0 + 15

        expect(festivalGetActive).toHaveBeenCalledTimes(3);
      });
    });

    describe('edge cases and error handling', () => {
      it('should handle festivals with undefined production effects gracefully', () => {
        const mockFestival: FestivalContent = {
          id: createFestivalId('festival-16'),
          name: 'Undefined Production Festival',
          description: 'Festival with undefined production',
          rarity: 'Mystical',
          __type: 'festival',
          endDescription: 'Undefined production ends',
          effectsDescription: 'Undefined production effects',
          duration: 16000,
          effects: {
            production: undefined, // This should be handled gracefully
            combat: {
              outgoing: {
                damage: 2.0,
              },
            },
          },
        };

        vi.mocked(festivalGetActive).mockReturnValue([mockFestival]);

        const result = festivalProductionMultiplier('Mana');

        expect(result).toBe(0);
        expect(festivalGetActive).toHaveBeenCalled();
      });

      it('should handle zero production values correctly', () => {
        const mockFestival: FestivalContent = {
          id: createFestivalId('festival-17'),
          name: 'Zero Production Festival',
          description: 'Festival with zero production',
          rarity: 'Legendary',
          __type: 'festival',
          endDescription: 'Zero production ends',
          effectsDescription: 'Zero production effects',
          duration: 17000,
          effects: {
            production: {
              Mana: 0,
            },
          },
        };

        vi.mocked(festivalGetActive).mockReturnValue([mockFestival]);

        const result = festivalProductionMultiplier('Mana');

        expect(result).toBe(0);
        expect(festivalGetActive).toHaveBeenCalled();
      });

      it('should handle negative production values correctly', () => {
        const mockFestival: FestivalContent = {
          id: createFestivalId('festival-18'),
          name: 'Negative Production Festival',
          description: 'Festival with negative production',
          rarity: 'Unique',
          __type: 'festival',
          endDescription: 'Negative production ends',
          effectsDescription: 'Negative production effects',
          duration: 18000,
          effects: {
            production: {
              'Soul Essence': -25,
            },
          },
        };

        vi.mocked(festivalGetActive).mockReturnValue([mockFestival]);

        const result = festivalProductionMultiplier('Soul Essence');

        expect(result).toBe(-25);
        expect(festivalGetActive).toHaveBeenCalled();
      });

      it('should handle decimal production values correctly', () => {
        const mockFestival: FestivalContent = {
          id: createFestivalId('festival-19'),
          name: 'Decimal Production Festival',
          description: 'Festival with decimal production',
          rarity: 'Common',
          __type: 'festival',
          endDescription: 'Decimal production ends',
          effectsDescription: 'Decimal production effects',
          duration: 19000,
          effects: {
            production: {
              'Fire Crystal': 2.5,
            },
          },
        };

        vi.mocked(festivalGetActive).mockReturnValue([mockFestival]);

        const result = festivalProductionMultiplier('Fire Crystal');

        expect(result).toBe(2.5);
        expect(festivalGetActive).toHaveBeenCalled();
      });

      it('should handle large production values correctly', () => {
        const mockFestival: FestivalContent = {
          id: createFestivalId('festival-20'),
          name: 'Large Production Festival',
          description: 'Festival with large production',
          rarity: 'Uncommon',
          __type: 'festival',
          endDescription: 'Large production ends',
          effectsDescription: 'Large production effects',
          duration: 20000,
          effects: {
            production: {
              'Common Dust': 10000,
            },
          },
        };

        vi.mocked(festivalGetActive).mockReturnValue([mockFestival]);

        const result = festivalProductionMultiplier('Common Dust');

        expect(result).toBe(10000);
        expect(festivalGetActive).toHaveBeenCalled();
      });
    });

    describe('complex scenarios', () => {
      it('should handle mixed positive and negative values from multiple festivals', () => {
        const positiveFestival: FestivalContent = {
          id: createFestivalId('festival-21'),
          name: 'Positive Festival',
          description: 'Festival with positive production',
          rarity: 'Rare',
          __type: 'festival',
          endDescription: 'Positive ends',
          effectsDescription: 'Positive effects',
          duration: 21000,
          effects: {
            production: {
              Mana: 100,
            },
          },
        };

        const negativeFestival: FestivalContent = {
          id: createFestivalId('festival-22'),
          name: 'Negative Festival',
          description: 'Festival with negative production',
          rarity: 'Mystical',
          __type: 'festival',
          endDescription: 'Negative ends',
          effectsDescription: 'Negative effects',
          duration: 22000,
          effects: {
            production: {
              Mana: -30,
            },
          },
        };

        vi.mocked(festivalGetActive).mockReturnValue([
          positiveFestival,
          negativeFestival,
        ]);

        const result = festivalProductionMultiplier('Mana');

        expect(result).toBe(70); // 100 + (-30) = 70
        expect(festivalGetActive).toHaveBeenCalled();
      });

      it('should handle complex festival with all production currencies', () => {
        const complexFestival: FestivalContent = {
          id: createFestivalId('festival-complex'),
          name: 'Complex Production Festival',
          description: 'Festival with all production types',
          rarity: 'Legendary',
          __type: 'festival',
          endDescription: 'Complex production ends',
          effectsDescription: 'Complex production effects',
          duration: 25000,
          effects: {
            production: {
              Mana: 200,
              'Soul Essence': 150,
              'Fire Sliver': 50,
              'Water Shard': 25,
              'Earth Crystal': 10,
              'Air Core': 5,
              'Common Dust': 100,
              'Rare Dust': 20,
              'Legendary Dust': 3,
            },
            combat: {
              outgoing: {
                damage: 1.5,
              },
            },
            exploration: {
              ticks: 8,
            },
          },
        };

        vi.mocked(festivalGetActive).mockReturnValue([complexFestival]);

        expect(festivalProductionMultiplier('Mana')).toBe(200);
        expect(festivalProductionMultiplier('Soul Essence')).toBe(150);
        expect(festivalProductionMultiplier('Fire Sliver')).toBe(50);
        expect(festivalProductionMultiplier('Water Shard')).toBe(25);
        expect(festivalProductionMultiplier('Earth Crystal')).toBe(10);
        expect(festivalProductionMultiplier('Air Core')).toBe(5);
        expect(festivalProductionMultiplier('Common Dust')).toBe(100);
        expect(festivalProductionMultiplier('Rare Dust')).toBe(20);
        expect(festivalProductionMultiplier('Legendary Dust')).toBe(3);

        expect(festivalGetActive).toHaveBeenCalledTimes(9);
      });

      it('should handle decimal precision correctly in summation', () => {
        const festival1: FestivalContent = {
          id: createFestivalId('festival-decimal-1'),
          name: 'Decimal Festival 1',
          description: 'First decimal festival',
          rarity: 'Unique',
          __type: 'festival',
          endDescription: 'Decimal 1 ends',
          effectsDescription: 'Decimal 1 effects',
          duration: 26000,
          effects: {
            production: {
              'Water Crystal': 1.23,
            },
          },
        };

        const festival2: FestivalContent = {
          id: createFestivalId('festival-decimal-2'),
          name: 'Decimal Festival 2',
          description: 'Second decimal festival',
          rarity: 'Common',
          __type: 'festival',
          endDescription: 'Decimal 2 ends',
          effectsDescription: 'Decimal 2 effects',
          duration: 27000,
          effects: {
            production: {
              'Water Crystal': 2.456,
            },
          },
        };

        vi.mocked(festivalGetActive).mockReturnValue([festival1, festival2]);

        const result = festivalProductionMultiplier('Water Crystal');

        expect(result).toBeCloseTo(3.686); // 1.23 + 2.456 = 3.686
        expect(festivalGetActive).toHaveBeenCalled();
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
            production: {
              Mana: 100,
            },
          },
        };

        vi.mocked(festivalGetActive).mockReturnValue([mockFestival]);

        festivalProductionMultiplier('Mana');

        expect(festivalGetActive).toHaveBeenCalledTimes(1);
        expect(festivalGetActive).toHaveBeenCalledWith();
      });
    });
  });
});
