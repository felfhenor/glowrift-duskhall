import { describe, expect, it } from 'vitest';

import { angleBetweenPoints, distanceBetweenNodes } from '@helpers/math';
import type { WorldPosition } from '@interfaces/world';

describe('Math Functions', () => {
  describe('angleBetweenPoints', () => {
    const createPosition = (x: number, y: number): WorldPosition => ({ x, y });

    it('should return 0 degrees for point to the right', () => {
      const center = createPosition(0, 0);
      const check = createPosition(1, 0);

      expect(angleBetweenPoints(center, check)).toBe(0);
    });

    it('should return 90 degrees for point above', () => {
      const center = createPosition(0, 0);
      const check = createPosition(0, 1);

      expect(angleBetweenPoints(center, check)).toBe(90);
    });

    it('should return 180 degrees for point to the left', () => {
      const center = createPosition(0, 0);
      const check = createPosition(-1, 0);

      expect(angleBetweenPoints(center, check)).toBe(180);
    });

    it('should return 270 degrees for point below', () => {
      const center = createPosition(0, 0);
      const check = createPosition(0, -1);

      expect(angleBetweenPoints(center, check)).toBe(270);
    });

    it('should return 45 degrees for point in upper-right quadrant', () => {
      const center = createPosition(0, 0);
      const check = createPosition(1, 1);

      expect(angleBetweenPoints(center, check)).toBe(45);
    });

    it('should return 135 degrees for point in upper-left quadrant', () => {
      const center = createPosition(0, 0);
      const check = createPosition(-1, 1);

      expect(angleBetweenPoints(center, check)).toBe(135);
    });

    it('should return 225 degrees for point in lower-left quadrant', () => {
      const center = createPosition(0, 0);
      const check = createPosition(-1, -1);

      expect(angleBetweenPoints(center, check)).toBe(225);
    });

    it('should return 315 degrees for point in lower-right quadrant', () => {
      const center = createPosition(0, 0);
      const check = createPosition(1, -1);

      expect(angleBetweenPoints(center, check)).toBe(315);
    });

    it('should handle same position (returns 0)', () => {
      const center = createPosition(5, 3);
      const check = createPosition(5, 3);

      expect(angleBetweenPoints(center, check)).toBe(0);
    });

    it('should work with negative center coordinates', () => {
      const center = createPosition(-5, -3);
      const check = createPosition(-4, -3);

      expect(angleBetweenPoints(center, check)).toBe(0);
    });

    it('should work with large coordinates', () => {
      const center = createPosition(1000, 1000);
      const check = createPosition(1001, 1000);

      expect(angleBetweenPoints(center, check)).toBe(0);
    });

    it('should work with floating point coordinates', () => {
      const center = createPosition(0.5, 0.5);
      const check = createPosition(1.5, 0.5);

      expect(angleBetweenPoints(center, check)).toBe(0);
    });

    it('should handle cases where angle would be negative (converts to positive)', () => {
      const center = createPosition(0, 0);
      const check = createPosition(-1, -1);
      const angle = angleBetweenPoints(center, check);

      expect(angle).toBe(225);
      expect(angle).toBeGreaterThanOrEqual(0);
      expect(angle).toBeLessThan(360);
    });

    it('should return values between 0 and 360 degrees (exclusive of 360)', () => {
      const center = createPosition(0, 0);
      const testPoints = [
        createPosition(1, 0),
        createPosition(0, 1),
        createPosition(-1, 0),
        createPosition(0, -1),
        createPosition(1, 1),
        createPosition(-1, 1),
        createPosition(-1, -1),
        createPosition(1, -1),
      ];

      testPoints.forEach((point) => {
        const angle = angleBetweenPoints(center, point);
        expect(angle).toBeGreaterThanOrEqual(0);
        expect(angle).toBeLessThan(360);
      });
    });

    it('should handle zero coordinates', () => {
      const center = createPosition(0, 0);
      const check = createPosition(0, 0);

      expect(angleBetweenPoints(center, check)).toBe(0);
    });

    it('should handle very small differences in coordinates', () => {
      const center = createPosition(0, 0);
      const check = createPosition(0.0001, 0);

      expect(angleBetweenPoints(center, check)).toBe(0);
    });
  });

  describe('distanceBetweenNodes', () => {
    const createPosition = (x: number, y: number): WorldPosition => ({ x, y });

    it('should return 0 for same position', () => {
      const posA = createPosition(0, 0);
      const posB = createPosition(0, 0);

      expect(distanceBetweenNodes(posA, posB)).toBe(0);
    });

    it('should return correct distance for horizontal movement', () => {
      const posA = createPosition(0, 0);
      const posB = createPosition(3, 0);

      expect(distanceBetweenNodes(posA, posB)).toBe(3);
    });

    it('should return correct distance for vertical movement', () => {
      const posA = createPosition(0, 0);
      const posB = createPosition(0, 4);

      expect(distanceBetweenNodes(posA, posB)).toBe(4);
    });

    it('should return correct distance for diagonal movement (3-4-5 triangle)', () => {
      const posA = createPosition(0, 0);
      const posB = createPosition(3, 4);

      expect(distanceBetweenNodes(posA, posB)).toBe(5);
    });

    it('should return correct distance for negative coordinates', () => {
      const posA = createPosition(-3, -4);
      const posB = createPosition(0, 0);

      expect(distanceBetweenNodes(posA, posB)).toBe(5);
    });

    it('should be symmetric (distance A to B equals distance B to A)', () => {
      const posA = createPosition(1, 2);
      const posB = createPosition(4, 6);

      const distanceAB = distanceBetweenNodes(posA, posB);
      const distanceBA = distanceBetweenNodes(posB, posA);

      expect(distanceAB).toBe(distanceBA);
    });

    it('should handle floating point coordinates', () => {
      const posA = createPosition(1.5, 2.5);
      const posB = createPosition(4.5, 6.5);

      const distance = distanceBetweenNodes(posA, posB);
      expect(distance).toBe(5);
    });

    it('should handle large coordinates', () => {
      const posA = createPosition(1000, 1000);
      const posB = createPosition(1003, 1004);

      const distance = distanceBetweenNodes(posA, posB);
      expect(distance).toBe(5);
    });

    it('should return square root of 2 for unit diagonal', () => {
      const posA = createPosition(0, 0);
      const posB = createPosition(1, 1);

      const distance = distanceBetweenNodes(posA, posB);
      expect(distance).toBeCloseTo(Math.sqrt(2), 10);
    });

    it('should handle zero coordinates', () => {
      const posA = createPosition(0, 0);
      const posB = createPosition(5, 12);

      const distance = distanceBetweenNodes(posA, posB);
      expect(distance).toBe(13);
    });

    it('should handle very small distances', () => {
      const posA = createPosition(0, 0);
      const posB = createPosition(0.0001, 0.0001);

      const distance = distanceBetweenNodes(posA, posB);
      expect(distance).toBeCloseTo(Math.sqrt(2) * 0.0001, 10);
    });

    it('should handle very large distances', () => {
      const posA = createPosition(-1000000, -1000000);
      const posB = createPosition(1000000, 1000000);

      const distance = distanceBetweenNodes(posA, posB);
      expect(distance).toBeCloseTo(Math.sqrt(2) * 2000000, 5);
    });

    it('should always return positive distance', () => {
      const testCases = [
        [createPosition(-5, -3), createPosition(2, 1)],
        [createPosition(10, -20), createPosition(-15, 30)],
        [createPosition(0, 0), createPosition(-1, -1)],
      ];

      testCases.forEach(([posA, posB]) => {
        const distance = distanceBetweenNodes(posA, posB);
        expect(distance).toBeGreaterThanOrEqual(0);
      });
    });

    it('should calculate correct distance for mixed positive/negative coordinates', () => {
      const posA = createPosition(-2, 3);
      const posB = createPosition(1, -1);

      // Distance should be sqrt((1-(-2))^2 + (-1-3)^2) = sqrt(9 + 16) = sqrt(25) = 5
      const distance = distanceBetweenNodes(posA, posB);
      expect(distance).toBe(5);
    });

    it('should handle positions with one zero coordinate', () => {
      const posA = createPosition(0, 5);
      const posB = createPosition(12, 0);

      // Distance should be sqrt(144 + 25) = sqrt(169) = 13
      const distance = distanceBetweenNodes(posA, posB);
      expect(distance).toBe(13);
    });
  });
});
