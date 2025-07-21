import type { CameraBounds, CameraState } from '@interfaces/camera';
import { gamestate, updateGamestate } from '@helpers/index';

/**
 * Calculates camera bounds based on world and viewport dimensions
 * @param worldWidth World width in tiles
 * @param worldHeight World height in tiles
 * @param viewportWidth Viewport width in tiles
 * @param viewportHeight Viewport height in tiles
 * @returns Camera bounds
 */
export function calculateCameraBounds(
  worldWidth: number,
  worldHeight: number,
  viewportWidth: number,
  viewportHeight: number,
): CameraBounds {
  return {
    maxX: Math.max(0, worldWidth - viewportWidth),
    maxY: Math.max(0, worldHeight - viewportHeight),
  };
}

/**
 * Clamps camera position within world bounds
 * @param camera Current camera position
 * @param bounds Camera bounds
 * @returns Clamped camera position
 */
export function clampCameraPosition(
  camera: CameraState,
  bounds: CameraBounds,
): CameraState {
  return {
    x: Math.max(0, Math.min(bounds.maxX, camera.x)),
    y: Math.max(0, Math.min(bounds.maxY, camera.y)),
  };
}

/**
 * Handles camera movement based on drag input
 * @param dragDelta Accumulated drag delta
 * @param currentCamera Current camera position
 * @param bounds Camera bounds
 * @param tileSize Size of each tile in pixels
 * @returns Updated camera position and remaining drag
 */
export function processCameraDrag(
  dragDelta: { x: number; y: number },
  currentCamera: CameraState,
  bounds: CameraBounds,
  tileSize: number = 64,
): {
  newCamera: CameraState;
  remainingDrag: { x: number; y: number };
} {
  const newCamera = { ...currentCamera };
  const remainingDrag = { ...dragDelta };

  if (Math.abs(dragDelta.x) >= tileSize) {
    const tilesToMoveX = Math.floor(dragDelta.x / tileSize) * -1;
    const newCameraX = currentCamera.x + tilesToMoveX;
    const clampedX = Math.max(0, Math.min(bounds.maxX, newCameraX));

    if (clampedX !== currentCamera.x) {
      newCamera.x = clampedX;
    }

    remainingDrag.x = dragDelta.x % tileSize;
  }

  if (Math.abs(dragDelta.y) >= tileSize) {
    const tilesToMoveY = Math.floor(dragDelta.y / tileSize) * -1;
    const newCameraY = currentCamera.y + tilesToMoveY;
    const clampedY = Math.max(0, Math.min(bounds.maxY, newCameraY));

    if (clampedY !== currentCamera.y) {
      newCamera.y = clampedY;
    }

    remainingDrag.y = dragDelta.y % tileSize;
  }

  return { newCamera, remainingDrag };
}

/**
 * Updates the game state camera position
 * @param newCamera New camera position
 */
export function updateCameraPosition(newCamera: CameraState): void {
  const currentCamera = gamestate().camera;

  if (newCamera.x !== currentCamera.x || newCamera.y !== currentCamera.y) {
    updateGamestate((state) => {
      state.camera.x = newCamera.x;
      state.camera.y = newCamera.y;
      return state;
    });
  }
}
