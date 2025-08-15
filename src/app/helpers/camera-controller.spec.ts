import {
  cameraCalculateBounds,
  cameraClampPosition,
  cameraPositionUpdate,
  cameraProcessDrag,
} from '@helpers/camera-controller';
import type { GameState } from '@interfaces';
import type { CameraBounds, CameraState } from '@interfaces/camera';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('@helpers/index', () => ({
  gamestate: vi.fn(),
  updateGamestate: vi.fn(),
}));

import { gamestate, updateGamestate } from '@helpers/index';

describe('Camera Controller Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('cameraCalculateBounds', () => {
    it('should calculate correct bounds when world is larger than viewport', () => {
      const bounds = cameraCalculateBounds(100, 80, 20, 15);

      expect(bounds).toEqual({
        maxX: 80, // 100 - 20
        maxY: 65, // 80 - 15
      });
    });

    it('should return zero bounds when world is smaller than viewport', () => {
      const bounds = cameraCalculateBounds(10, 8, 20, 15);

      expect(bounds).toEqual({
        maxX: 0, // Math.max(0, 10 - 20)
        maxY: 0, // Math.max(0, 8 - 15)
      });
    });

    it('should handle equal world and viewport sizes', () => {
      const bounds = cameraCalculateBounds(20, 15, 20, 15);

      expect(bounds).toEqual({
        maxX: 0,
        maxY: 0,
      });
    });
  });

  describe('cameraClampPosition', () => {
    const bounds: CameraBounds = { maxX: 50, maxY: 40 };

    it('should not clamp when camera is within bounds', () => {
      const camera: CameraState = { x: 25, y: 20 };
      const result = cameraClampPosition(camera, bounds);

      expect(result).toEqual({ x: 25, y: 20 });
    });

    it('should clamp negative positions to zero', () => {
      const camera: CameraState = { x: -10, y: -5 };
      const result = cameraClampPosition(camera, bounds);

      expect(result).toEqual({ x: 0, y: 0 });
    });

    it('should clamp positions exceeding maximum bounds', () => {
      const camera: CameraState = { x: 60, y: 50 };
      const result = cameraClampPosition(camera, bounds);

      expect(result).toEqual({ x: 50, y: 40 });
    });

    it('should handle edge case positions', () => {
      const camera: CameraState = { x: 0, y: 40 };
      const result = cameraClampPosition(camera, bounds);

      expect(result).toEqual({ x: 0, y: 40 });
    });
  });

  describe('cameraProcessDrag', () => {
    const currentCamera: CameraState = { x: 10, y: 10 };
    const bounds: CameraBounds = { maxX: 50, maxY: 40 };
    const tileSize = 64;

    it('should not move camera when drag is less than tile size', () => {
      const dragDelta = { x: 32, y: 16 }; // Less than 64
      const result = cameraProcessDrag(
        dragDelta,
        currentCamera,
        bounds,
        tileSize,
      );

      expect(result.newCamera).toEqual(currentCamera);
      expect(result.remainingDrag).toEqual(dragDelta);
    });

    it('should move camera when drag exceeds tile size in X direction', () => {
      const dragDelta = { x: 128, y: 32 }; // 2 tiles worth in X
      const result = cameraProcessDrag(
        dragDelta,
        currentCamera,
        bounds,
        tileSize,
      );

      expect(result.newCamera).toEqual({ x: 8, y: 10 }); // moved 2 tiles left
      expect(result.remainingDrag).toEqual({ x: 0, y: 32 });
    });

    it('should move camera when drag exceeds tile size in Y direction', () => {
      const dragDelta = { x: 32, y: 192 }; // 3 tiles worth in Y
      const result = cameraProcessDrag(
        dragDelta,
        currentCamera,
        bounds,
        tileSize,
      );

      expect(result.newCamera).toEqual({ x: 10, y: 7 }); // moved 3 tiles up
      expect(result.remainingDrag).toEqual({ x: 32, y: 0 });
    });

    it('should move camera in both directions when both exceed tile size', () => {
      const dragDelta = { x: -128, y: -64 }; // negative drag (right/down movement)
      const result = cameraProcessDrag(
        dragDelta,
        currentCamera,
        bounds,
        tileSize,
      );

      expect(result.newCamera).toEqual({ x: 12, y: 11 }); // moved right and down
      expect(Math.abs(result.remainingDrag.x)).toBe(0);
      expect(Math.abs(result.remainingDrag.y)).toBe(0);
    });

    it('should respect camera bounds when moving', () => {
      const cameraNearBounds: CameraState = { x: 49, y: 39 };
      const dragDelta = { x: -128, y: -128 }; // trying to move beyond bounds
      const result = cameraProcessDrag(
        dragDelta,
        cameraNearBounds,
        bounds,
        tileSize,
      );

      expect(result.newCamera).toEqual({ x: 50, y: 40 }); // clamped to max bounds
      expect(Math.abs(result.remainingDrag.x)).toBe(0);
      expect(Math.abs(result.remainingDrag.y)).toBe(0);
    });

    it('should respect minimum bounds when moving', () => {
      const cameraNearOrigin: CameraState = { x: 1, y: 1 };
      const dragDelta = { x: 256, y: 192 }; // trying to move beyond minimum
      const result = cameraProcessDrag(
        dragDelta,
        cameraNearOrigin,
        bounds,
        tileSize,
      );

      expect(result.newCamera).toEqual({ x: 0, y: 0 }); // clamped to minimum bounds
      expect(result.remainingDrag).toEqual({ x: 0, y: 0 });
    });

    it('should use default tile size when not provided', () => {
      const dragDelta = { x: 64, y: 0 }; // exactly one default tile
      const result = cameraProcessDrag(dragDelta, currentCamera, bounds); // no tileSize param

      expect(result.newCamera).toEqual({ x: 9, y: 10 }); // moved 1 tile left
      expect(result.remainingDrag).toEqual({ x: 0, y: 0 });
    });

    it('should not update camera position when clamping results in same position', () => {
      const cameraAtBounds: CameraState = { x: 0, y: 0 };
      const dragDelta = { x: 128, y: 128 }; // trying to move left/up from origin
      const result = cameraProcessDrag(
        dragDelta,
        cameraAtBounds,
        bounds,
        tileSize,
      );

      expect(result.newCamera).toEqual({ x: 0, y: 0 }); // no change due to clamping
      expect(result.remainingDrag).toEqual({ x: 0, y: 0 });
    });
  });

  describe('cameraPositionUpdate', () => {
    const mockGameState: Partial<GameState> = {
      camera: { x: 5, y: 8 },
    };

    beforeEach(() => {
      vi.mocked(gamestate).mockReturnValue(mockGameState as GameState);
    });

    it('should update game state when camera position changes', () => {
      const newCamera: CameraState = { x: 10, y: 15 };

      cameraPositionUpdate(newCamera);

      expect(updateGamestate).toHaveBeenCalledTimes(1);
      expect(updateGamestate).toHaveBeenCalledWith(expect.any(Function));

      // Test the callback function
      const updateCallback = vi.mocked(updateGamestate).mock.calls[0][0];
      const testState = { camera: { x: 5, y: 8 } } as GameState;
      const result = updateCallback(testState);

      expect(result.camera).toEqual({ x: 10, y: 15 });
    });

    it('should not update game state when camera position is the same', () => {
      const sameCamera: CameraState = { x: 5, y: 8 }; // same as current

      cameraPositionUpdate(sameCamera);

      expect(updateGamestate).not.toHaveBeenCalled();
    });

    it('should update when only X position changes', () => {
      const newCamera: CameraState = { x: 7, y: 8 }; // only X changed

      cameraPositionUpdate(newCamera);

      expect(updateGamestate).toHaveBeenCalledTimes(1);
    });

    it('should update when only Y position changes', () => {
      const newCamera: CameraState = { x: 5, y: 12 }; // only Y changed

      cameraPositionUpdate(newCamera);

      expect(updateGamestate).toHaveBeenCalledTimes(1);
    });
  });
});
