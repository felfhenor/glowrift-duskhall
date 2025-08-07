import { describe, it, expect, beforeEach } from 'vitest';
import { getTravelProgress, isTravelingToPosition } from '@helpers/travel-visualization';
import { updateGamestate } from '@helpers/state-game';

describe('Travel Visualization', () => {
  beforeEach(() => {
    // Reset game state for each test
    updateGamestate((state) => {
      state.hero.position = { x: 0, y: 0, nodeId: 'start' };
      state.hero.travel = { x: 0, y: 0, nodeId: '', ticksLeft: 0 };
      return state;
    });
  });

  describe('getTravelProgress', () => {
    it('should return inactive when not traveling', () => {
      const progress = getTravelProgress();
      
      expect(progress.isActive).toBe(false);
      expect(progress.progress).toBe(0);
    });

    it('should calculate progress when traveling', () => {
      updateGamestate((state) => {
        state.hero.position = { x: 0, y: 0, nodeId: 'start' };
        state.hero.travel = { x: 10, y: 0, nodeId: 'dest', ticksLeft: 25 };
        return state;
      });

      const progress = getTravelProgress();
      
      expect(progress.isActive).toBe(true);
      expect(progress.fromPosition).toEqual({ x: 0, y: 0, nodeId: 'start' });
      expect(progress.toPosition).toEqual({ x: 10, y: 0, nodeId: 'dest' });
      expect(progress.progress).toBeGreaterThan(0);
      expect(progress.progress).toBeLessThanOrEqual(1);
    });

    it('should interpolate position correctly', () => {
      updateGamestate((state) => {
        state.hero.position = { x: 0, y: 0, nodeId: 'start' };
        state.hero.travel = { x: 10, y: 0, nodeId: 'dest', ticksLeft: 25 };
        return state;
      });

      const progress = getTravelProgress();
      
      expect(progress.interpolatedPosition.x).toBeGreaterThan(0);
      expect(progress.interpolatedPosition.x).toBeLessThan(10);
      expect(progress.interpolatedPosition.y).toBe(0);
    });
  });

  describe('isTravelingToPosition', () => {
    it('should return false when not traveling', () => {
      const result = isTravelingToPosition({ x: 5, y: 5 });
      expect(result).toBe(false);
    });

    it('should return true when traveling to the position', () => {
      updateGamestate((state) => {
        state.hero.travel = { x: 5, y: 5, nodeId: 'dest', ticksLeft: 30 };
        return state;
      });

      const result = isTravelingToPosition({ x: 5, y: 5 });
      expect(result).toBe(true);
    });

    it('should return false when traveling to a different position', () => {
      updateGamestate((state) => {
        state.hero.travel = { x: 5, y: 5, nodeId: 'dest', ticksLeft: 30 };
        return state;
      });

      const result = isTravelingToPosition({ x: 10, y: 10 });
      expect(result).toBe(false);
    });
  });
});