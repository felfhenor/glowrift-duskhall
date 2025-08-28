import { cameraPosition } from '@helpers/camera';
import { windowHeightTiles, windowWidthTiles } from '@helpers/ui';
import type { WorldPosition } from '@interfaces/world';

/**
 * Checks if a world position is currently visible on screen
 * @param position World position to check
 * @returns True if position is visible, false if offscreen
 */
export function isPositionOnScreen(position: WorldPosition): boolean {
  const camera = cameraPosition();
  const viewportWidth = windowWidthTiles();
  const viewportHeight = windowHeightTiles();

  const relativeX = position.x - camera.x;
  const relativeY = position.y - camera.y;

  return (
    relativeX >= 0 &&
    relativeX < viewportWidth &&
    relativeY >= 0 &&
    relativeY < viewportHeight
  );
}

/**
 * Calculates the direction vector from screen center to a world position
 * @param position World position to point to
 * @returns Normalized direction vector
 */
export function calculateDirectionToPosition(position: WorldPosition): {
  x: number;
  y: number;
} {
  const camera = cameraPosition();
  const viewportWidth = windowWidthTiles();
  const viewportHeight = windowHeightTiles();

  // Screen center in world coordinates
  const screenCenterX = camera.x + viewportWidth / 2;
  const screenCenterY = camera.y + viewportHeight / 2;

  // Direction vector from screen center to position
  const dx = position.x - screenCenterX;
  const dy = position.y - screenCenterY;

  // Normalize the vector
  const length = Math.sqrt(dx * dx + dy * dy);
  if (length === 0) return { x: 1, y: 0 }; // Default direction if at center

  return {
    x: dx / length,
    y: dy / length,
  };
}

/**
 * Calculates the position on screen edge where the offscreen arrow should be placed
 * @param direction Direction vector pointing toward the offscreen position
 * @returns Screen edge position in pixels
 */
export function calculateScreenEdgePosition(direction: {
  x: number;
  y: number;
}): { x: number; y: number } {
  const viewportWidth = windowWidthTiles() * 64;
  const viewportHeight = windowHeightTiles() * 64;

  // Margin from the edge
  const margin = 32;

  let edgeX: number;
  let edgeY: number;

  // Determine which edge the arrow should be on
  const absX = Math.abs(direction.x);
  const absY = Math.abs(direction.y);

  if (absX > absY) {
    // Left or right edge
    if (direction.x > 0) {
      // Right edge
      edgeX = viewportWidth - margin;
      edgeY = (viewportHeight / 2) + (direction.y / direction.x) * (viewportWidth / 2 - margin);
    } else {
      // Left edge
      edgeX = margin;
      edgeY = (viewportHeight / 2) - (direction.y / direction.x) * (viewportWidth / 2 - margin);
    }
  } else {
    // Top or bottom edge
    if (direction.y > 0) {
      // Bottom edge
      edgeY = viewportHeight - margin;
      edgeX = (viewportWidth / 2) + (direction.x / direction.y) * (viewportHeight / 2 - margin);
    } else {
      // Top edge
      edgeY = margin;
      edgeX = (viewportWidth / 2) - (direction.x / direction.y) * (viewportHeight / 2 - margin);
    }
  }

  // Clamp to ensure the arrow stays within bounds
  edgeX = Math.max(margin, Math.min(viewportWidth - margin, edgeX));
  edgeY = Math.max(margin, Math.min(viewportHeight - margin, edgeY));

  return { x: edgeX, y: edgeY };
}