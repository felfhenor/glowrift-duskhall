import {
  calculateDirectionToPosition,
  calculateScreenEdgePosition,
  isPositionOnScreen,
} from '@helpers/pixi-offscreen-indicator';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the dependencies
vi.mock('@helpers/camera', () => ({
  cameraPosition: vi.fn(() => ({ x: 10, y: 10 })),
}));

vi.mock('@helpers/ui', () => ({
  windowWidthTiles: vi.fn(() => 20),
  windowHeightTiles: vi.fn(() => 15),
}));

describe('offscreen-indicator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isPositionOnScreen', () => {
    it('should return true for positions on screen', () => {
      // Position at (15, 15) with camera at (10, 10) and viewport 20x15
      // Relative position is (5, 5) which is within bounds
      const position = { x: 15, y: 15 };
      expect(isPositionOnScreen(position)).toBe(true);
    });

    it('should return false for positions off screen to the right', () => {
      // Position at (35, 15) with camera at (10, 10) and viewport 20x15
      // Relative position is (25, 5) which is outside horizontal bounds
      const position = { x: 35, y: 15 };
      expect(isPositionOnScreen(position)).toBe(false);
    });

    it('should return false for positions off screen below', () => {
      // Position at (15, 30) with camera at (10, 10) and viewport 20x15
      // Relative position is (5, 20) which is outside vertical bounds
      const position = { x: 15, y: 30 };
      expect(isPositionOnScreen(position)).toBe(false);
    });

    it('should return false for positions off screen to the left', () => {
      // Position at (5, 15) with camera at (10, 10) and viewport 20x15
      // Relative position is (-5, 5) which is outside horizontal bounds
      const position = { x: 5, y: 15 };
      expect(isPositionOnScreen(position)).toBe(false);
    });

    it('should return false for positions off screen above', () => {
      // Position at (15, 5) with camera at (10, 10) and viewport 20x15
      // Relative position is (5, -5) which is outside vertical bounds
      const position = { x: 15, y: 5 };
      expect(isPositionOnScreen(position)).toBe(false);
    });
  });

  describe('calculateDirectionToPosition', () => {
    it('should calculate direction from screen center to position', () => {
      // Screen center is at (20, 17.5) in world coordinates (camera 10,10 + viewport 20x15 / 2)
      // Position at (30, 17.5) should give direction (1, 0)
      const position = { x: 30, y: 17.5 };
      const direction = calculateDirectionToPosition(position);

      expect(direction.x).toBeCloseTo(1, 5);
      expect(direction.y).toBeCloseTo(0, 5);
    });

    it('should return normalized direction vector', () => {
      const position = { x: 30, y: 25 };
      const direction = calculateDirectionToPosition(position);

      // Vector should be normalized (length = 1)
      const length = Math.sqrt(
        direction.x * direction.x + direction.y * direction.y,
      );
      expect(length).toBeCloseTo(1, 5);
    });

    it('should handle positions at screen center', () => {
      // Position exactly at screen center
      const position = { x: 20, y: 17.5 };
      const direction = calculateDirectionToPosition(position);

      // Should return default direction when at center
      expect(direction.x).toBe(1);
      expect(direction.y).toBe(0);
    });
  });

  describe('calculateScreenEdgePosition', () => {
    it('should place arrow on right edge for rightward direction', () => {
      const direction = { x: 1, y: 0 };
      const edgePosition = calculateScreenEdgePosition(direction);

      // Should be near right edge (viewport is 20 tiles * 64 pixels = 1280)
      expect(edgePosition.x).toBeCloseTo(1184, 1); // 1280 - 96 margin
      expect(edgePosition.y).toBeCloseTo(480, 1); // center height (15 * 64 / 2)
    });

    it('should place arrow on bottom edge for downward direction', () => {
      const direction = { x: 0, y: 1 };
      const edgePosition = calculateScreenEdgePosition(direction);

      // Should be near bottom edge (viewport is 15 tiles * 64 pixels = 960)
      expect(edgePosition.x).toBeCloseTo(640, 1); // center width (20 * 64 / 2)
      expect(edgePosition.y).toBeCloseTo(864, 1); // 960 - 96 margin
    });

    it('should place arrow on left edge for leftward direction', () => {
      const direction = { x: -1, y: 0 };
      const edgePosition = calculateScreenEdgePosition(direction);

      expect(edgePosition.x).toBeCloseTo(96, 1); // margin
      expect(edgePosition.y).toBeCloseTo(480, 1); // center height
    });

    it('should place arrow on top edge for upward direction', () => {
      const direction = { x: 0, y: -1 };
      const edgePosition = calculateScreenEdgePosition(direction);

      expect(edgePosition.x).toBeCloseTo(640, 1); // center width
      expect(edgePosition.y).toBeCloseTo(96, 1); // margin
    });

    it('should handle diagonal directions', () => {
      const direction = { x: 0.707, y: 0.707 }; // 45 degrees down-right
      const edgePosition = calculateScreenEdgePosition(direction);

      // Should be on one of the edges
      expect(edgePosition.x).toBeGreaterThanOrEqual(32);
      expect(edgePosition.x).toBeLessThanOrEqual(1248);
      expect(edgePosition.y).toBeGreaterThanOrEqual(32);
      expect(edgePosition.y).toBeLessThanOrEqual(928);
    });
  });
});
