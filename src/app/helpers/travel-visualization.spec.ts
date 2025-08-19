import { travelVisualizationProgress } from '@helpers/travel-visualization';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GameState } from '@interfaces/state-game';

// Mock the dependencies
vi.mock('@helpers/state-game', () => ({
  gamestate: vi.fn(),
}));

vi.mock('@helpers/travel', () => ({
  isTraveling: vi.fn(),
}));

// Import the mocked functions
import { gamestate } from '@helpers/state-game';
import { isTraveling } from '@helpers/travel';

describe('Travel Visualization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('travelVisualizationProgress', () => {
    it('should return inactive state when not traveling', () => {
      const mockState = {
        hero: {
          position: { x: 0, y: 0, nodeId: 'start' },
        },
      } as GameState;

      vi.mocked(isTraveling).mockReturnValue(false);
      vi.mocked(gamestate).mockReturnValue(mockState);

      const result = travelVisualizationProgress();

      expect(result.isActive).toBe(false);
      expect(result.progress).toBe(0);
      expect(result.interpolatedPosition).toEqual(mockState.hero.position);
    });

    it('should start at source position when travel just begins', () => {
      const mockState = {
        hero: {
          position: { x: 0, y: 0, nodeId: 'start' },
          travel: {
            x: 10,
            y: 10,
            nodeId: 'destination',
            ticksLeft: 100,
            ticksTotal: 100, // Just started traveling
          },
        },
      } as GameState;

      vi.mocked(isTraveling).mockReturnValue(true);
      vi.mocked(gamestate).mockReturnValue(mockState);

      const result = travelVisualizationProgress();

      expect(result.isActive).toBe(true);
      expect(result.progress).toBe(0); // Should be 0 when just started
      expect(result.interpolatedPosition.x).toBe(0); // Should be at source
      expect(result.interpolatedPosition.y).toBe(0); // Should be at source
    });

    it('should be halfway when half the travel time has elapsed', () => {
      const mockState = {
        hero: {
          position: { x: 0, y: 0, nodeId: 'start' },
          travel: {
            x: 10,
            y: 10,
            nodeId: 'destination',
            ticksLeft: 50,
            ticksTotal: 100, // Half travel time left
          },
        },
      } as GameState;

      vi.mocked(isTraveling).mockReturnValue(true);
      vi.mocked(gamestate).mockReturnValue(mockState);

      const result = travelVisualizationProgress();

      expect(result.isActive).toBe(true);
      expect(result.progress).toBe(0.5); // Should be halfway
      expect(result.interpolatedPosition.x).toBe(5); // Should be halfway between 0 and 10
      expect(result.interpolatedPosition.y).toBe(5); // Should be halfway between 0 and 10
    });

    it('should be near destination when travel is almost complete', () => {
      const mockState = {
        hero: {
          position: { x: 0, y: 0, nodeId: 'start' },
          travel: {
            x: 10,
            y: 10,
            nodeId: 'destination',
            ticksLeft: 1,
            ticksTotal: 100, // Almost finished traveling
          },
        },
      } as GameState;

      vi.mocked(isTraveling).mockReturnValue(true);
      vi.mocked(gamestate).mockReturnValue(mockState);

      const result = travelVisualizationProgress();

      expect(result.isActive).toBe(true);
      expect(result.progress).toBe(0.99); // Should be almost complete
      expect(result.interpolatedPosition.x).toBeCloseTo(9.9); // Should be near destination
      expect(result.interpolatedPosition.y).toBeCloseTo(9.9); // Should be near destination
    });

    it('should handle edge case with zero total travel time', () => {
      const mockState = {
        hero: {
          position: { x: 0, y: 0, nodeId: 'start' },
          travel: {
            x: 10,
            y: 10,
            nodeId: 'destination',
            ticksLeft: 0,
            ticksTotal: 0, // Instant travel
          },
        },
      } as GameState;

      vi.mocked(isTraveling).mockReturnValue(true);
      vi.mocked(gamestate).mockReturnValue(mockState);

      const result = travelVisualizationProgress();

      expect(result.isActive).toBe(true);
      expect(result.progress).toBe(0); // Should handle division by zero
      expect(result.interpolatedPosition.x).toBe(0); // Should be at source
      expect(result.interpolatedPosition.y).toBe(0); // Should be at source
    });

    it('should work correctly with travel time multipliers', () => {
      // This simulates the bug scenario where travel time was modified by multipliers
      // Previously, the visualization would use base time (50) instead of actual time (150)
      const mockState = {
        hero: {
          position: { x: 0, y: 0, nodeId: 'start' },
          travel: {
            x: 10,
            y: 0,
            nodeId: 'destination',
            ticksLeft: 150, // Just started, actual travel time with multipliers
            ticksTotal: 150, // Actual total time (base time was 50, but multipliers made it 150)
          },
        },
      } as GameState;

      vi.mocked(isTraveling).mockReturnValue(true);
      vi.mocked(gamestate).mockReturnValue(mockState);

      const result = travelVisualizationProgress();

      expect(result.isActive).toBe(true);
      expect(result.progress).toBe(0); // Should be 0 when just started (not 2/3 as would happen with wrong calculation)
      expect(result.interpolatedPosition.x).toBe(0); // Should be at source
      expect(result.interpolatedPosition.y).toBe(0); // Should be at source
    });
  });
});