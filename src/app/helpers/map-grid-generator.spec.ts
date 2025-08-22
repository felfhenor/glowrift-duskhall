import { beforeEach, describe, expect, it, vi } from 'vitest';

import { mapGridGenerate } from '@helpers/map-grid-generator';

// Mock the dependencies
vi.mock('@helpers/sprite', () => ({
  spriteGetForPosition: vi.fn(),
}));

// Import the mocked functions
import { spriteGetForPosition } from '@helpers/sprite';

describe('Map Grid Generator', () => {
  describe('mapGridGenerate', () => {
    beforeEach(() => {
      vi.clearAllMocks();

      // Setup default mock behavior
      vi.mocked(spriteGetForPosition).mockImplementation(
        (x: number, y: number) => `sprite-${x}-${y}`,
      );
    });

    it('should generate correct grid dimensions for normal viewport', () => {
      const result = mapGridGenerate(0, 0, 10, 8, 50, 40);

      expect(result.width).toBe(11); // viewport width + 1
      expect(result.height).toBe(9); // viewport height + 1
      expect(result.tiles).toHaveLength(9);
      expect(result.tiles[0]).toHaveLength(11);
    });

    it('should limit grid dimensions to world size when viewport is larger', () => {
      const result = mapGridGenerate(0, 0, 100, 80, 10, 8);

      expect(result.width).toBe(10); // limited to world width
      expect(result.height).toBe(8); // limited to world height
      expect(result.tiles).toHaveLength(8);
      expect(result.tiles[0]).toHaveLength(10);
    });

    it('should generate tiles with correct relative positions', () => {
      const result = mapGridGenerate(5, 3, 2, 2, 20, 20);

      expect(result.tiles[0][0]).toMatchObject({
        x: 0,
        y: 0,
      });
      expect(result.tiles[0][1]).toMatchObject({
        x: 1,
        y: 0,
      });
      expect(result.tiles[1][0]).toMatchObject({
        x: 0,
        y: 1,
      });
    });

    it('should request sprites at correct absolute positions based on camera', () => {
      const cameraX = 10;
      const cameraY = 15;

      mapGridGenerate(cameraX, cameraY, 2, 2, 50, 50);

      // Should call spriteGetForPosition with camera offset
      expect(spriteGetForPosition).toHaveBeenCalledWith(10, 15); // camera + (0,0)
      expect(spriteGetForPosition).toHaveBeenCalledWith(11, 15); // camera + (1,0)
      expect(spriteGetForPosition).toHaveBeenCalledWith(12, 15); // camera + (2,0)
      expect(spriteGetForPosition).toHaveBeenCalledWith(10, 16); // camera + (0,1)
      expect(spriteGetForPosition).toHaveBeenCalledWith(11, 16); // camera + (1,1)
      expect(spriteGetForPosition).toHaveBeenCalledWith(12, 16); // camera + (2,1)
      expect(spriteGetForPosition).toHaveBeenCalledWith(10, 17); // camera + (0,2)
      expect(spriteGetForPosition).toHaveBeenCalledWith(11, 17); // camera + (1,2)
      expect(spriteGetForPosition).toHaveBeenCalledWith(12, 17); // camera + (2,2)
    });

    it('should request sprites at correct absolute positions based on camera', () => {
      const cameraX = 5;
      const cameraY = 8;

      mapGridGenerate(cameraX, cameraY, 1, 1, 20, 20);

      // Should call spriteGetForPosition with camera offset
      expect(spriteGetForPosition).toHaveBeenCalledWith(5, 8); // camera + (0,0)
      expect(spriteGetForPosition).toHaveBeenCalledWith(6, 8); // camera + (1,0)
      expect(spriteGetForPosition).toHaveBeenCalledWith(5, 9); // camera + (0,1)
      expect(spriteGetForPosition).toHaveBeenCalledWith(6, 9); // camera + (1,1)
    });

    it('should include tileSprite from spriteGetForPosition in tiles', () => {
      const spriteId = 'test-sprite-123';
      vi.mocked(spriteGetForPosition).mockReturnValue(spriteId);

      const result = mapGridGenerate(7, 12, 1, 1, 20, 20);

      expect(result.tiles[0][0].tileSprite).toBe(spriteId);
    });

    it('should include tileSprite from spriteGetForPosition in tiles', () => {
      const spriteId = 'test-sprite-123';
      vi.mocked(spriteGetForPosition).mockReturnValue(spriteId);

      const result = mapGridGenerate(0, 0, 1, 1, 10, 10);

      expect(result.tiles[0][0].tileSprite).toBe(spriteId);
    });

    it('should handle zero viewport dimensions', () => {
      const result = mapGridGenerate(0, 0, 0, 0, 10, 10);

      expect(result.width).toBe(1); // min(10, 0 + 1)
      expect(result.height).toBe(1); // min(10, 0 + 1)
      expect(result.tiles).toHaveLength(1);
      expect(result.tiles[0]).toHaveLength(1);
    });

    it('should handle zero world dimensions', () => {
      const result = mapGridGenerate(0, 0, 5, 5, 0, 0);

      expect(result.width).toBe(0); // min(0, 5 + 1)
      expect(result.height).toBe(0); // min(0, 5 + 1)
      expect(result.tiles).toHaveLength(0);
    });

    it('should only push rows that have tiles', () => {
      // When height is 0, no rows should be added
      const result = mapGridGenerate(0, 0, 5, 0, 10, 0);

      expect(result.tiles).toHaveLength(0);
    });

    it('should handle negative camera positions', () => {
      mapGridGenerate(-5, -3, 1, 1, 20, 20);

      expect(spriteGetForPosition).toHaveBeenCalledWith(-5, -3); // camera + (0,0)
      expect(spriteGetForPosition).toHaveBeenCalledWith(-4, -3); // camera + (1,0)
      expect(spriteGetForPosition).toHaveBeenCalledWith(-5, -2); // camera + (0,1)
      expect(spriteGetForPosition).toHaveBeenCalledWith(-4, -2); // camera + (1,1)
    });

    it('should handle floating point camera positions', () => {
      mapGridGenerate(2.7, 3.9, 1, 1, 10, 10);

      // Should use camera positions as-is (not rounded)
      expect(spriteGetForPosition).toHaveBeenCalledWith(2.7, 3.9);
      expect(spriteGetForPosition).toHaveBeenCalledWith(3.7, 3.9);
      expect(spriteGetForPosition).toHaveBeenCalledWith(2.7, 4.9);
      expect(spriteGetForPosition).toHaveBeenCalledWith(3.7, 4.9);
    });

    it('should generate grid with large dimensions', () => {
      const result = mapGridGenerate(100, 200, 50, 40, 1000, 800);

      expect(result.width).toBe(51); // viewport + 1
      expect(result.height).toBe(41); // viewport + 1
      expect(result.tiles).toHaveLength(41);
      expect(result.tiles[0]).toHaveLength(51);
    });

    it('should correctly structure the returned MapGridData', () => {
      const result = mapGridGenerate(0, 0, 2, 2, 10, 10);

      // Verify the structure matches MapGridData interface
      expect(result).toHaveProperty('tiles');
      expect(result).toHaveProperty('width');
      expect(result).toHaveProperty('height');

      expect(Array.isArray(result.tiles)).toBe(true);
      expect(typeof result.width).toBe('number');
      expect(typeof result.height).toBe('number');
    });

    it('should generate tiles with correct MapTileData structure', () => {
      const mockSprite = 'test-sprite';

      vi.mocked(spriteGetForPosition).mockReturnValue(mockSprite);

      const result = mapGridGenerate(1, 2, 1, 1, 10, 10);

      const tile = result.tiles[0][0];

      // Verify the structure matches MapTileData interface
      expect(tile).toHaveProperty('x');
      expect(tile).toHaveProperty('y');
      expect(tile).toHaveProperty('tileSprite');

      expect(typeof tile.x).toBe('number');
      expect(typeof tile.y).toBe('number');
      expect(typeof tile.tileSprite).toBe('string');
    });

    it('should handle edge case where viewport equals world size', () => {
      const worldWidth = 10;
      const worldHeight = 8;

      const result = mapGridGenerate(
        0,
        0,
        worldWidth,
        worldHeight,
        worldWidth,
        worldHeight,
      );

      expect(result.width).toBe(worldWidth); // min(10, 10 + 1) = 10
      expect(result.height).toBe(worldHeight); // min(8, 8 + 1) = 8
    });

    it('should handle edge case where viewport is one tile smaller than world', () => {
      const worldWidth = 10;
      const worldHeight = 8;

      const result = mapGridGenerate(
        0,
        0,
        worldWidth - 1,
        worldHeight - 1,
        worldWidth,
        worldHeight,
      );

      expect(result.width).toBe(worldWidth); // min(10, 9 + 1) = 10
      expect(result.height).toBe(worldHeight); // min(8, 7 + 1) = 8
    });

    it('should call spriteGetForPosition the correct number of times', () => {
      const viewportWidth = 3;
      const viewportHeight = 2;

      mapGridGenerate(0, 0, viewportWidth, viewportHeight, 10, 10);

      const expectedCalls = (viewportWidth + 1) * (viewportHeight + 1);
      expect(spriteGetForPosition).toHaveBeenCalledTimes(expectedCalls);
    });

    it('should handle case where world is smaller than minimum grid (1x1)', () => {
      const result = mapGridGenerate(0, 0, 10, 10, 1, 1);

      expect(result.width).toBe(1);
      expect(result.height).toBe(1);
      expect(result.tiles).toHaveLength(1);
      expect(result.tiles[0]).toHaveLength(1);
    });

    it('should maintain consistent tile ordering in 2D array', () => {
      const result = mapGridGenerate(10, 20, 2, 2, 50, 50);

      // First row should have y=0, varying x
      expect(result.tiles[0][0]).toMatchObject({ x: 0, y: 0 });
      expect(result.tiles[0][1]).toMatchObject({ x: 1, y: 0 });
      expect(result.tiles[0][2]).toMatchObject({ x: 2, y: 0 });

      // Second row should have y=1, varying x
      expect(result.tiles[1][0]).toMatchObject({ x: 0, y: 1 });
      expect(result.tiles[1][1]).toMatchObject({ x: 1, y: 1 });
      expect(result.tiles[1][2]).toMatchObject({ x: 2, y: 1 });
    });

    it('should handle boundary conditions with camera at world edge', () => {
      const worldWidth = 10;
      const worldHeight = 10;
      const cameraX = worldWidth - 1;
      const cameraY = worldHeight - 1;

      mapGridGenerate(cameraX, cameraY, 5, 5, worldWidth, worldHeight);

      // Should not crash and should call spriteGetForPosition with positions beyond world bounds
      expect(spriteGetForPosition).toHaveBeenCalledWith(cameraX, cameraY);
      expect(spriteGetForPosition).toHaveBeenCalledWith(cameraX + 1, cameraY); // Beyond world width
      expect(spriteGetForPosition).toHaveBeenCalledWith(cameraX, cameraY + 1); // Beyond world height
    });
  });
});
