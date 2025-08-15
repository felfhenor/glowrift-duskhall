import {
  cameraCenterOn,
  cameraCenterOnPlayer,
  cameraPositionSet,
} from '@helpers/camera';
import type { GameState, WorldPosition } from '@interfaces';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock all dependencies to avoid Angular imports
vi.mock('@helpers/hero', () => ({
  heroPositionGet: vi.fn(),
}));

vi.mock('@helpers/state-game', () => ({
  gamestate: vi.fn(),
  updateGamestate: vi.fn(),
}));

vi.mock('@helpers/ui', () => ({
  windowHeightTiles: vi.fn(),
  windowWidthTiles: vi.fn(),
}));

vi.mock('es-toolkit/compat', () => ({
  clamp: vi.fn((value: number, min: number, max: number) => {
    // Match es-toolkit/compat behavior: when max < min, return max
    if (max < min) return max;
    return Math.min(Math.max(value, min), max);
  }),
}));

// Import the mocked functions
import { heroPositionGet } from '@helpers/hero';
import { gamestate, updateGamestate } from '@helpers/state-game';
import { windowHeightTiles, windowWidthTiles } from '@helpers/ui';

const mockHeroPositionGet = vi.mocked(heroPositionGet);
const mockGamestate = vi.mocked(gamestate);
const mockUpdateGamestate = vi.mocked(updateGamestate);
const mockWindowWidthTiles = vi.mocked(windowWidthTiles);
const mockWindowHeightTiles = vi.mocked(windowHeightTiles);

describe('Camera Functions', () => {
  let mockState: GameState;

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock state
    mockState = {
      world: {
        config: {
          width: 100,
          height: 80,
        },
      },
      camera: {
        x: 10,
        y: 5,
      },
    } as unknown as GameState;

    mockGamestate.mockReturnValue(mockState);
    mockWindowWidthTiles.mockReturnValue(20);
    mockWindowHeightTiles.mockReturnValue(15);

    // Mock updateGamestate to call the provided function
    mockUpdateGamestate.mockImplementation((updateFn) => {
      const updatedState = updateFn(mockState);
      Object.assign(mockState, updatedState);
    });
  });

  describe('cameraPositionSet', () => {
    it('should set camera position with clamping when position is within bounds', () => {
      cameraPositionSet(30, 25);

      expect(mockUpdateGamestate).toHaveBeenCalledTimes(1);
      expect(mockState.camera.x).toBe(30);
      expect(mockState.camera.y).toBe(25);
    });

    it('should clamp camera position to minimum bounds (0,0)', () => {
      cameraPositionSet(-10, -5);

      expect(mockUpdateGamestate).toHaveBeenCalledTimes(1);
      expect(mockState.camera.x).toBe(0);
      expect(mockState.camera.y).toBe(0);
    });

    it('should clamp camera position to maximum bounds based on world and viewport size', () => {
      // World: 100x80, Viewport: 20x15
      // Max camera position should be: (100-20, 80-15) = (80, 65)
      cameraPositionSet(90, 75);

      expect(mockUpdateGamestate).toHaveBeenCalledTimes(1);
      expect(mockState.camera.x).toBe(80);
      expect(mockState.camera.y).toBe(65);
    });

    it('should floor decimal positions', () => {
      cameraPositionSet(25.7, 18.9);

      expect(mockUpdateGamestate).toHaveBeenCalledTimes(1);
      expect(mockState.camera.x).toBe(25);
      expect(mockState.camera.y).toBe(18);
    });

    it('should handle edge case when viewport is larger than world', () => {
      mockState.world.config.width = 10;
      mockState.world.config.height = 8;
      // Viewport: 20x15, World: 10x8
      // Max camera bound calculation: Math.floor(10 - 20) = -10, Math.floor(8 - 15) = -7
      // clamp(Math.floor(5), 0, -10) = clamp(5, 0, -10) = -10
      // clamp(Math.floor(3), 0, -7) = clamp(3, 0, -7) = -7

      cameraPositionSet(5, 3);

      expect(mockUpdateGamestate).toHaveBeenCalledTimes(1);
      expect(mockState.camera.x).toBe(-10);
      expect(mockState.camera.y).toBe(-7);
    });

    it('should handle different viewport sizes', () => {
      mockWindowWidthTiles.mockReturnValue(30);
      mockWindowHeightTiles.mockReturnValue(25);

      // World: 100x80, Viewport: 30x25
      // Max camera position should be: (100-30, 80-25) = (70, 55)
      cameraPositionSet(75, 60);

      expect(mockUpdateGamestate).toHaveBeenCalledTimes(1);
      expect(mockState.camera.x).toBe(70);
      expect(mockState.camera.y).toBe(55);
    });

    it('should use current world dimensions from gamestate', () => {
      mockState.world.config.width = 200;
      mockState.world.config.height = 150;

      // World: 200x150, Viewport: 20x15
      // Max camera position should be: (200-20, 150-15) = (180, 135)
      cameraPositionSet(190, 140);

      expect(mockGamestate).toHaveBeenCalled();
      expect(mockWindowWidthTiles).toHaveBeenCalled();
      expect(mockWindowHeightTiles).toHaveBeenCalled();
      expect(mockState.camera.x).toBe(180);
      expect(mockState.camera.y).toBe(135);
    });
  });

  describe('cameraCenterOn', () => {
    it('should center camera on specified coordinates', () => {
      // Target: (50, 40), Viewport: 20x15
      // Camera should be set to: (50 - 20/2, 40 - 15/2) = (40, 32.5) -> (40, 32)
      cameraCenterOn(50, 40);

      expect(mockWindowWidthTiles).toHaveBeenCalled();
      expect(mockWindowHeightTiles).toHaveBeenCalled();
      expect(mockUpdateGamestate).toHaveBeenCalledTimes(1);
      expect(mockState.camera.x).toBe(40);
      expect(mockState.camera.y).toBe(32);
    });

    it('should handle centering with decimal viewport dimensions', () => {
      mockWindowWidthTiles.mockReturnValue(21);
      mockWindowHeightTiles.mockReturnValue(13);

      // Target: (50, 40), Viewport: 21x13
      // Camera should be set to: (50 - 21/2, 40 - 13/2) = (39.5, 33.5) -> (39, 33)
      cameraCenterOn(50, 40);

      expect(mockState.camera.x).toBe(39);
      expect(mockState.camera.y).toBe(33);
    });

    it('should apply clamping when centering would exceed bounds', () => {
      // Target: (5, 3), Viewport: 20x15
      // Desired camera: (5 - 10, 3 - 7.5) = (-5, -4.5) -> clamped to (0, 0)
      cameraCenterOn(5, 3);

      expect(mockState.camera.x).toBe(0);
      expect(mockState.camera.y).toBe(0);
    });

    it('should apply clamping when centering near world edge', () => {
      // Target: (95, 75), Viewport: 20x15, World: 100x80
      // Desired camera: (95 - 10, 75 - 7.5) = (85, 67.5) -> (85, 67)
      // Max allowed: (80, 65), so should clamp to (80, 65)
      cameraCenterOn(95, 75);

      expect(mockState.camera.x).toBe(80);
      expect(mockState.camera.y).toBe(65);
    });

    it('should handle different viewport sizes for centering', () => {
      mockWindowWidthTiles.mockReturnValue(40);
      mockWindowHeightTiles.mockReturnValue(30);

      // Target: (50, 40), Viewport: 40x30
      // Camera should be set to: (50 - 20, 40 - 15) = (30, 25)
      cameraCenterOn(50, 40);

      expect(mockState.camera.x).toBe(30);
      expect(mockState.camera.y).toBe(25);
    });
  });

  describe('cameraCenterOnPlayer', () => {
    it('should center camera on player position', () => {
      const playerPosition: WorldPosition = { x: 45, y: 35 };
      mockHeroPositionGet.mockReturnValue(playerPosition);

      cameraCenterOnPlayer();

      expect(mockHeroPositionGet).toHaveBeenCalledTimes(1);
      expect(mockWindowWidthTiles).toHaveBeenCalled();
      expect(mockWindowHeightTiles).toHaveBeenCalled();
      expect(mockUpdateGamestate).toHaveBeenCalledTimes(1);

      // Player at (45, 35), Viewport: 20x15
      // Camera should be: (45 - 10, 35 - 7.5) = (35, 27.5) -> (35, 27)
      expect(mockState.camera.x).toBe(35);
      expect(mockState.camera.y).toBe(27);
    });

    it('should handle player at world origin', () => {
      const playerPosition: WorldPosition = { x: 0, y: 0 };
      mockHeroPositionGet.mockReturnValue(playerPosition);

      cameraCenterOnPlayer();

      expect(mockHeroPositionGet).toHaveBeenCalledTimes(1);

      // Player at (0, 0), Viewport: 20x15
      // Desired camera: (0 - 10, 0 - 7.5) = (-10, -7.5) -> clamped to (0, 0)
      expect(mockState.camera.x).toBe(0);
      expect(mockState.camera.y).toBe(0);
    });

    it('should handle player near world edge', () => {
      const playerPosition: WorldPosition = { x: 95, y: 75 };
      mockHeroPositionGet.mockReturnValue(playerPosition);

      cameraCenterOnPlayer();

      expect(mockHeroPositionGet).toHaveBeenCalledTimes(1);

      // Player at (95, 75), Viewport: 20x15, World: 100x80
      // Desired camera: (95 - 10, 75 - 7.5) = (85, 67.5) -> (85, 67)
      // Max allowed: (80, 65), so should clamp to (80, 65)
      expect(mockState.camera.x).toBe(80);
      expect(mockState.camera.y).toBe(65);
    });

    it('should handle player in center of large world', () => {
      mockState.world.config.width = 200;
      mockState.world.config.height = 150;

      const playerPosition: WorldPosition = { x: 100, y: 75 };
      mockHeroPositionGet.mockReturnValue(playerPosition);

      cameraCenterOnPlayer();

      expect(mockHeroPositionGet).toHaveBeenCalledTimes(1);

      // Player at (100, 75), Viewport: 20x15, World: 200x150
      // Camera should be: (100 - 10, 75 - 7.5) = (90, 67.5) -> (90, 67)
      expect(mockState.camera.x).toBe(90);
      expect(mockState.camera.y).toBe(67);
    });

    it('should handle varying viewport sizes when centering on player', () => {
      mockWindowWidthTiles.mockReturnValue(24);
      mockWindowHeightTiles.mockReturnValue(18);

      const playerPosition: WorldPosition = { x: 50, y: 40 };
      mockHeroPositionGet.mockReturnValue(playerPosition);

      cameraCenterOnPlayer();

      expect(mockHeroPositionGet).toHaveBeenCalledTimes(1);

      // Player at (50, 40), Viewport: 24x18
      // Camera should be: (50 - 12, 40 - 9) = (38, 31)
      expect(mockState.camera.x).toBe(38);
      expect(mockState.camera.y).toBe(31);
    });

    it('should handle decimal player positions', () => {
      const playerPosition: WorldPosition = { x: 25.8, y: 18.3 };
      mockHeroPositionGet.mockReturnValue(playerPosition);

      cameraCenterOnPlayer();

      expect(mockHeroPositionGet).toHaveBeenCalledTimes(1);

      // Player at (25.8, 18.3), Viewport: 20x15
      // Camera should be: (25.8 - 10, 18.3 - 7.5) = (15.8, 10.8) -> (15, 10)
      expect(mockState.camera.x).toBe(15);
      expect(mockState.camera.y).toBe(10);
    });
  });

  describe('Integration tests', () => {
    it('should maintain camera state across multiple calls', () => {
      // Set initial position
      cameraPositionSet(20, 15);
      expect(mockState.camera.x).toBe(20);
      expect(mockState.camera.y).toBe(15);

      // Center on a different position
      cameraCenterOn(60, 45);
      expect(mockState.camera.x).toBe(50);
      expect(mockState.camera.y).toBe(37);

      // Center on player
      mockHeroPositionGet.mockReturnValue({ x: 30, y: 25 });
      cameraCenterOnPlayer();
      expect(mockState.camera.x).toBe(20);
      expect(mockState.camera.y).toBe(17);
    });

    it('should handle edge case of minimum world size', () => {
      mockState.world.config.width = 1;
      mockState.world.config.height = 1;
      mockWindowWidthTiles.mockReturnValue(20);
      mockWindowHeightTiles.mockReturnValue(15);

      // World: 1x1, Viewport: 20x15
      // Max bounds: Math.floor(1 - 20) = -19, Math.floor(1 - 15) = -14
      // Any camera position will be clamped to these negative max values
      cameraPositionSet(10, 8);
      expect(mockState.camera.x).toBe(-19);
      expect(mockState.camera.y).toBe(-14);

      cameraCenterOn(5, 3);
      // cameraCenterOn calls cameraPositionSet with (5 - 10, 3 - 7.5) = (-5, -4.5)
      // clamped to clamp(Math.floor(-5), 0, -19) = clamp(-5, 0, -19) = -19
      // clamped to clamp(Math.floor(-4.5), 0, -14) = clamp(-5, 0, -14) = -14
      expect(mockState.camera.x).toBe(-19);
      expect(mockState.camera.y).toBe(-14);

      mockHeroPositionGet.mockReturnValue({ x: 0, y: 0 });
      cameraCenterOnPlayer();
      // cameraCenterOnPlayer calls cameraCenterOn(0, 0) which calls cameraPositionSet(0 - 10, 0 - 7.5) = (-10, -7.5)
      // clamped to clamp(Math.floor(-10), 0, -19) = clamp(-10, 0, -19) = -19
      // clamped to clamp(Math.floor(-7.5), 0, -14) = clamp(-8, 0, -14) = -14
      expect(mockState.camera.x).toBe(-19);
      expect(mockState.camera.y).toBe(-14);
    });

    it('should handle camera operations with world exactly matching viewport', () => {
      mockState.world.config.width = 20;
      mockState.world.config.height = 15;
      mockWindowWidthTiles.mockReturnValue(20);
      mockWindowHeightTiles.mockReturnValue(15);

      // Camera should always be at (0, 0) since world = viewport
      cameraPositionSet(5, 3);
      expect(mockState.camera.x).toBe(0);
      expect(mockState.camera.y).toBe(0);

      cameraCenterOn(10, 7);
      expect(mockState.camera.x).toBe(0);
      expect(mockState.camera.y).toBe(0);

      mockHeroPositionGet.mockReturnValue({ x: 15, y: 10 });
      cameraCenterOnPlayer();
      expect(mockState.camera.x).toBe(0);
      expect(mockState.camera.y).toBe(0);
    });
  });
});
