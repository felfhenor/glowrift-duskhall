import { gamestate } from '@helpers/state-game';
import { travelVisualizationProgress } from '@helpers/travel-visualization';
import { isTraveling } from '@helpers/travel';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the dependencies
vi.mock('@helpers/state-game', () => ({
  gamestate: vi.fn(),
}));

vi.mock('@helpers/travel', () => ({
  isTraveling: vi.fn(),
}));

describe('Travel visualization bug fix demonstration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should demonstrate the bug fix - hero starts at source when travel time has multipliers', () => {
    // Simulate scenario where base travel time is 50 ticks, but due to festival/location 
    // multipliers, the actual travel time becomes 150 ticks
    const baseDistance = 10; // Distance of 10 would give base time of 50 ticks (10 * 5)
    const actualTravelTime = 150; // With multipliers applied
    
    const mockState = {
      hero: {
        position: { x: 0, y: 0, nodeId: 'start' },
        travel: {
          x: baseDistance,
          y: 0,
          nodeId: 'destination',
          ticksLeft: actualTravelTime, // Just started traveling
          ticksTotal: actualTravelTime, // Store the actual total time
        },
      },
    };

    vi.mocked(isTraveling).mockReturnValue(true);
    vi.mocked(gamestate).mockReturnValue(mockState as any);

    const result = travelVisualizationProgress();

    // Before the fix: progress would be calculated as:
    // approximateTotalTime = Math.floor(distance * 5) = Math.floor(10 * 5) = 50
    // timeElapsed = 50 - 150 = -100 (clamped to 0, but still gives wrong calculation)
    // This would show the hero starting at wrong position

    // After the fix: progress should be calculated as:
    // timeElapsed = actualTravelTime - ticksLeft = 150 - 150 = 0
    // progress = 0 / 150 = 0
    // Hero should start at source position (x: 0, y: 0)

    expect(result.isActive).toBe(true);
    expect(result.progress).toBe(0); // Should be 0 when just started
    expect(result.interpolatedPosition.x).toBe(0); // Should be at source
    expect(result.interpolatedPosition.y).toBe(0); // Should be at source
    expect(result.fromPosition).toEqual({ x: 0, y: 0, nodeId: 'start' });
    expect(result.toPosition).toEqual({ x: baseDistance, y: 0, nodeId: 'destination' });
  });

  it('should work correctly when travel is halfway done with multipliers', () => {
    const mockState = {
      hero: {
        position: { x: 0, y: 0, nodeId: 'start' },
        travel: {
          x: 10,
          y: 0,
          nodeId: 'destination',
          ticksLeft: 75, // Half the actual travel time has elapsed
          ticksTotal: 150, // Actual total time with multipliers
        },
      },
    };

    vi.mocked(isTraveling).mockReturnValue(true);
    vi.mocked(gamestate).mockReturnValue(mockState as any);

    const result = travelVisualizationProgress();

    // timeElapsed = 150 - 75 = 75
    // progress = 75 / 150 = 0.5
    expect(result.progress).toBe(0.5);
    expect(result.interpolatedPosition.x).toBe(5); // Halfway between 0 and 10
    expect(result.interpolatedPosition.y).toBe(0);
  });
});