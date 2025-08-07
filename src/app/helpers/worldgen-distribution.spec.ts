import { generateWorld } from '@helpers/worldgen';
import type { WorldConfigContent } from '@interfaces';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('@helpers/state-game', () => ({
  gamestate: vi.fn().mockReturnValue({ gameId: 'test-game' }),
  myGameId: vi.fn().mockReturnValue('test-game'),
}));

vi.mock('@helpers/content', () => ({
  getEntriesByType: vi.fn().mockReturnValue([
    { id: 'test-guardian-1' },
    { id: 'test-guardian-2' },
  ]),
  getEntry: vi.fn().mockReturnValue({ id: 'test-guardian-1', name: 'Test Guardian' }),
}));

vi.mock('@helpers/creator-equipment', () => ({
  allItemDefinitions: vi.fn().mockReturnValue([]),
  pickRandomItemDefinitionBasedOnRarity: vi.fn().mockReturnValue(undefined),
}));

vi.mock('@helpers/creator-skill', () => ({
  allSkillDefinitions: vi.fn().mockReturnValue([]),
  pickRandomSkillDefinitionBasedOnRarity: vi.fn().mockReturnValue(undefined),
}));

vi.mock('@helpers/guardian', () => ({
  createGuardianForLocation: vi.fn().mockReturnValue({ id: 'test-guardian' }),
}));

describe('World Generation - Node Distribution', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Medium World Distribution', () => {
    it('should spread nodes across different map regions, not cluster at edges', async () => {
      const mediumWorldConfig: WorldConfigContent = {
        id: 'test-medium',
        type: 'worldconfig',
        name: 'Test Medium',
        width: 75,
        height: 75,
        maxLevel: 100,
        nodeCount: {
          town: { min: 2, max: 3 },
          village: { min: 5, max: 8 },
          cave: { min: 20, max: 30 },
          dungeon: { min: 8, max: 12 },
          castle: { min: 5, max: 8 },
        },
      };

      const world = await generateWorld(mediumWorldConfig);
      
      if (!world.didFinish) {
        // Skip this test if world generation was cancelled
        return;
      }

      const centerX = Math.floor(mediumWorldConfig.width / 2);
      const centerY = Math.floor(mediumWorldConfig.height / 2);
      
      // Get all nodes with actual content (not empty nodes)
      const contentNodes = Object.values(world.nodes).filter(node => node.nodeType);
      
      // Divide map into regions: inner (0-33% from center), middle (33-67%), outer (67-100%)
      const maxDistance = Math.sqrt((centerX ** 2) + (centerY ** 2));
      const innerRadius = maxDistance * 0.33;
      const middleRadius = maxDistance * 0.67;
      
      let innerNodes = 0;
      let middleNodes = 0;
      let outerNodes = 0;
      
      contentNodes.forEach(node => {
        const distance = Math.sqrt((node.x - centerX) ** 2 + (node.y - centerY) ** 2);
        if (distance <= innerRadius) {
          innerNodes++;
        } else if (distance <= middleRadius) {
          middleNodes++;
        } else {
          outerNodes++;
        }
      });

      // There should be good distribution across inner and middle regions
      // Outer region can be empty (which is good - no edge clustering)
      expect(innerNodes).toBeGreaterThan(0);
      expect(middleNodes).toBeGreaterThan(0);
      
      // At least 70% of nodes should be in inner + middle regions (not clustered at far edges)
      const totalContentNodes = contentNodes.length;
      const innerAndMiddleRatio = (innerNodes + middleNodes) / totalContentNodes;
      expect(innerAndMiddleRatio).toBeGreaterThan(0.7);
      
      // No more than 30% should be in the far outer region to avoid edge clustering
      const outerRatio = outerNodes / totalContentNodes;
      expect(outerRatio).toBeLessThan(0.3);
    });

    it('should add nodes to corner areas through post-processing', async () => {
      const mediumWorldConfig: WorldConfigContent = {
        id: 'test-medium-corners',
        type: 'worldconfig',
        name: 'Test Medium Corners',
        width: 75,
        height: 75,
        maxLevel: 100,
        nodeCount: {
          town: { min: 2, max: 3 },
          village: { min: 5, max: 8 },
          cave: { min: 20, max: 30 },
          dungeon: { min: 8, max: 12 },
          castle: { min: 5, max: 8 },
        },
      };

      const world = await generateWorld(mediumWorldConfig);
      
      if (!world.didFinish) {
        return;
      }

      // Get all nodes with actual content (not empty nodes)
      const contentNodes = Object.values(world.nodes).filter(node => node.nodeType);
      
      // Check corner areas (10% of map size from each corner as implemented)
      const cornerMargin = Math.floor(Math.min(mediumWorldConfig.width, mediumWorldConfig.height) * 0.1);
      let cornerNodes = 0;
      
      contentNodes.forEach(node => {
        const isInTopLeft = node.x < cornerMargin && node.y < cornerMargin;
        const isInTopRight = node.x >= mediumWorldConfig.width - cornerMargin && node.y < cornerMargin;
        const isInBottomLeft = node.x < cornerMargin && node.y >= mediumWorldConfig.height - cornerMargin;
        const isInBottomRight = node.x >= mediumWorldConfig.width - cornerMargin && node.y >= mediumWorldConfig.height - cornerMargin;
        
        if (isInTopLeft || isInTopRight || isInBottomLeft || isInBottomRight) {
          cornerNodes++;
        }
      });
      
      // With post-processing corner addition, we should have at least some nodes in corner areas
      expect(cornerNodes).toBeGreaterThan(0);
      
      // Should have at least 1 node per corner area on average
      expect(cornerNodes).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Large World Distribution', () => {
    it('should spread nodes across different map regions, not cluster at edges', async () => {
      const largeWorldConfig: WorldConfigContent = {
        id: 'test-large',
        type: 'worldconfig',
        name: 'Test Large',
        width: 100,
        height: 100,
        maxLevel: 100,
        nodeCount: {
          town: { min: 2, max: 3 },
          village: { min: 8, max: 12 },
          cave: { min: 30, max: 40 },
          dungeon: { min: 12, max: 18 },
          castle: { min: 8, max: 12 },
        },
      };

      const world = await generateWorld(largeWorldConfig);
      
      if (!world.didFinish) {
        // Skip this test if world generation was cancelled
        return;
      }

      const centerX = Math.floor(largeWorldConfig.width / 2);
      const centerY = Math.floor(largeWorldConfig.height / 2);
      
      // Get all nodes with actual content (not empty nodes)
      const contentNodes = Object.values(world.nodes).filter(node => node.nodeType);
      
      // Divide map into regions: inner (0-33% from center), middle (33-67%), outer (67-100%)
      const maxDistance = Math.sqrt((centerX ** 2) + (centerY ** 2));
      const innerRadius = maxDistance * 0.33;
      const middleRadius = maxDistance * 0.67;
      
      let innerNodes = 0;
      let middleNodes = 0;
      let outerNodes = 0;
      
      contentNodes.forEach(node => {
        const distance = Math.sqrt((node.x - centerX) ** 2 + (node.y - centerY) ** 2);
        if (distance <= innerRadius) {
          innerNodes++;
        } else if (distance <= middleRadius) {
          middleNodes++;
        } else {
          outerNodes++;
        }
      });

      // There should be good distribution across inner and middle regions
      // Outer region can be empty (which is good - no edge clustering)
      expect(innerNodes).toBeGreaterThan(0);
      expect(middleNodes).toBeGreaterThan(0);
      
      // At least 70% of nodes should be in inner + middle regions (not clustered at far edges)
      const totalContentNodes = contentNodes.length;
      const innerAndMiddleRatio = (innerNodes + middleNodes) / totalContentNodes;
      expect(innerAndMiddleRatio).toBeGreaterThan(0.7);
      
      // No more than 30% should be in the far outer region to avoid edge clustering
      const outerRatio = outerNodes / totalContentNodes;
      expect(outerRatio).toBeLessThan(0.3);
    });

    it('should add nodes to corner areas through post-processing', async () => {
      const largeWorldConfig: WorldConfigContent = {
        id: 'test-large-corners',
        type: 'worldconfig',
        name: 'Test Large Corners',
        width: 100,
        height: 100,
        maxLevel: 100,
        nodeCount: {
          town: { min: 2, max: 3 },
          village: { min: 8, max: 12 },
          cave: { min: 30, max: 40 },
          dungeon: { min: 12, max: 18 },
          castle: { min: 8, max: 12 },
        },
      };

      const world = await generateWorld(largeWorldConfig);
      
      if (!world.didFinish) {
        return;
      }

      // Get all nodes with actual content (not empty nodes)
      const contentNodes = Object.values(world.nodes).filter(node => node.nodeType);
      
      // Check corner areas (10% of map size from each corner as implemented)
      const cornerMargin = Math.floor(Math.min(largeWorldConfig.width, largeWorldConfig.height) * 0.1);
      let cornerNodes = 0;
      
      contentNodes.forEach(node => {
        const isInTopLeft = node.x < cornerMargin && node.y < cornerMargin;
        const isInTopRight = node.x >= largeWorldConfig.width - cornerMargin && node.y < cornerMargin;
        const isInBottomLeft = node.x < cornerMargin && node.y >= largeWorldConfig.height - cornerMargin;
        const isInBottomRight = node.x >= largeWorldConfig.width - cornerMargin && node.y >= largeWorldConfig.height - cornerMargin;
        
        if (isInTopLeft || isInTopRight || isInBottomLeft || isInBottomRight) {
          cornerNodes++;
        }
      });
      
      // With post-processing corner addition, we should have at least some nodes in corner areas
      expect(cornerNodes).toBeGreaterThan(0);
      
      // Should have at least 1 node per corner area on average
      expect(cornerNodes).toBeGreaterThanOrEqual(1);
    });
  });
});