import type { WorldPosition } from '@interfaces/world';

export function angleBetweenPoints(
  center: WorldPosition,
  check: WorldPosition,
): number {
  function rad2deg(radians: number) {
    return (radians * 180) / Math.PI;
  }

  let angle = rad2deg(Math.atan2(check.y - center.y, check.x - center.x));
  if (angle < 0) {
    angle += 360;
  }

  return angle;
}

export function distanceBetweenNodes(
  a: WorldPosition,
  b: WorldPosition,
): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}
