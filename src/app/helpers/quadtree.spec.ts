import { Quadtree } from '@helpers/quadtree';
import type { QuadtreeBounds, QuadtreePoint } from '@interfaces/world';
import { beforeEach, describe, expect, it } from 'vitest';

describe('Quadtree', () => {
  let quadtree: Quadtree;
  const bounds: QuadtreeBounds = { x: 0, y: 0, width: 100, height: 100 };

  beforeEach(() => {
    quadtree = new Quadtree(bounds);
  });

  describe('basic insertion and retrieval', () => {
    it('should insert and retrieve a single point', () => {
      const point: QuadtreePoint = { x: 10, y: 10, taken: false };
      quadtree.insert(point);

      const retrieved = quadtree.retrieve({
        x: 5,
        y: 5,
        width: 10,
        height: 10,
      });
      expect(retrieved).toHaveLength(1);
      expect(retrieved[0]).toEqual(point);
    });

    it('should not retrieve points outside the query bounds', () => {
      const point: QuadtreePoint = { x: 50, y: 50, taken: false };
      quadtree.insert(point);

      const retrieved = quadtree.retrieve({
        x: 0,
        y: 0,
        width: 10,
        height: 10,
      });
      expect(retrieved).toHaveLength(0);
    });

    it('should insert multiple points and retrieve them correctly', () => {
      const points: QuadtreePoint[] = [
        { x: 10, y: 10, taken: false },
        { x: 20, y: 20, taken: false },
        { x: 30, y: 30, taken: false },
        { x: 80, y: 80, taken: false },
      ];

      points.forEach((point) => quadtree.insert(point));

      // Query that should get first 3 points
      const retrieved1 = quadtree.retrieve({
        x: 0,
        y: 0,
        width: 40,
        height: 40,
      });
      expect(retrieved1).toHaveLength(3);

      // Query that should get only the last point
      const retrieved2 = quadtree.retrieve({
        x: 70,
        y: 70,
        width: 30,
        height: 30,
      });
      expect(retrieved2).toHaveLength(1);
      expect(retrieved2[0]).toEqual(points[3]);
    });
  });

  describe('boundary conditions', () => {
    it('should not insert points outside the quadtree bounds', () => {
      const outsidePoint: QuadtreePoint = { x: 150, y: 150, taken: false };
      quadtree.insert(outsidePoint);

      const allPoints = quadtree.getAllPoints();
      expect(allPoints).toHaveLength(0);
    });

    it('should handle points on the exact boundaries', () => {
      const boundaryPoints: QuadtreePoint[] = [
        { x: 0, y: 0, taken: false },
        { x: 99, y: 0, taken: false },
        { x: 0, y: 99, taken: false },
        { x: 99, y: 99, taken: false },
      ];

      boundaryPoints.forEach((point) => quadtree.insert(point));
      const allPoints = quadtree.getAllPoints();
      expect(allPoints).toHaveLength(4);
    });
  });

  describe('subdivision and splitting', () => {
    it('should split when too many points are added to one area', () => {
      // Add many points to the same small area to force splitting
      for (let i = 0; i < 15; i++) {
        quadtree.insert({ x: 10 + i, y: 10, taken: false });
      }

      const retrieved = quadtree.retrieve({
        x: 0,
        y: 0,
        width: 30,
        height: 30,
      });
      expect(retrieved).toHaveLength(15);
    });

    it('should maintain all points after subdivision', () => {
      const points: QuadtreePoint[] = [];

      // Add points distributed across all quadrants
      for (let x = 5; x < 100; x += 10) {
        for (let y = 5; y < 100; y += 10) {
          const point = { x, y, taken: false };
          points.push(point);
          quadtree.insert(point);
        }
      }

      const allRetrieved = quadtree.retrieve({
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      });
      expect(allRetrieved).toHaveLength(points.length);
    });
  });

  describe('point management', () => {
    it('should update point taken status', () => {
      const point: QuadtreePoint = { x: 25, y: 25, taken: false };
      quadtree.insert(point);

      quadtree.updatePoint(25, 25, true);

      const retrieved = quadtree.retrieve({
        x: 20,
        y: 20,
        width: 10,
        height: 10,
      });
      expect(retrieved[0].taken).toBe(true);
    });

    it('should clear all points', () => {
      for (let i = 0; i < 20; i++) {
        quadtree.insert({ x: i * 5, y: i * 5, taken: false });
      }

      quadtree.clear();
      const allPoints = quadtree.getAllPoints();
      expect(allPoints).toHaveLength(0);
    });
  });

  describe('edge cases for world generation use case', () => {
    it('should handle a world-sized grid efficiently', () => {
      const worldBounds: QuadtreeBounds = { x: 0, y: 0, width: 50, height: 50 };
      const worldQuadtree = new Quadtree(worldBounds);

      // Insert all positions like in world generation
      for (let x = 0; x < 50; x++) {
        for (let y = 0; y < 50; y++) {
          worldQuadtree.insert({ x, y, taken: false });
        }
      }

      // Test retrieval of a small area
      const centerArea = worldQuadtree.retrieve({
        x: 20,
        y: 20,
        width: 10,
        height: 10,
      });
      expect(centerArea).toHaveLength(100); // 10x10 area

      // Test marking some positions as taken
      worldQuadtree.updatePoint(25, 25, true);
      const centerPoint = worldQuadtree.retrieve({
        x: 25,
        y: 25,
        width: 1,
        height: 1,
      });
      expect(centerPoint[0].taken).toBe(true);
    });

    it('should efficiently find available positions in a sparse world', () => {
      const worldBounds: QuadtreeBounds = {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      };
      const sparseQuadtree = new Quadtree(worldBounds);

      // Create a sparse world with mostly taken positions
      for (let x = 0; x < 100; x++) {
        for (let y = 0; y < 100; y++) {
          sparseQuadtree.insert({ x, y, taken: x % 5 !== 0 || y % 5 !== 0 });
        }
      }

      // Find available positions (should be much fewer)
      const allPositions = sparseQuadtree.retrieve({
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      });
      const availablePositions = allPositions.filter((p) => !p.taken);

      // Should have positions at (0,0), (0,5), (0,10), etc.
      expect(availablePositions.length).toBe(400); // 20x20 grid of available positions
    });
  });

  describe('query optimization', () => {
    it('should not return points from non-intersecting regions', () => {
      // Insert points in different quadrants
      quadtree.insert({ x: 10, y: 10, taken: false }); // top-left
      quadtree.insert({ x: 90, y: 10, taken: false }); // top-right
      quadtree.insert({ x: 10, y: 90, taken: false }); // bottom-left
      quadtree.insert({ x: 90, y: 90, taken: false }); // bottom-right

      // Query only top-left quadrant
      const topLeft = quadtree.retrieve({ x: 0, y: 0, width: 50, height: 50 });
      expect(topLeft).toHaveLength(1);
      expect(topLeft[0]).toEqual({ x: 10, y: 10, taken: false });
    });

    it('should handle overlapping query bounds correctly', () => {
      quadtree.insert({ x: 45, y: 45, taken: false });
      quadtree.insert({ x: 55, y: 55, taken: false });

      // Query that overlaps quadrant boundaries
      const overlapping = quadtree.retrieve({
        x: 40,
        y: 40,
        width: 20,
        height: 20,
      });
      expect(overlapping).toHaveLength(2);
    });
  });
});
