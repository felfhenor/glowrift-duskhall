import { gamestate } from '@helpers/state-game';
import { isTraveling } from '@helpers/travel';
import type { WorldPosition } from '@interfaces';

/**
 * Calculates the interpolated position during travel
 * @returns WorldPosition with fractional coordinates representing current travel position
 */
export function travelVisualizationProgress(): {
  isActive: boolean;
  fromPosition: WorldPosition;
  toPosition: WorldPosition;
  progress: number;
  interpolatedPosition: WorldPosition;
} {
  const state = gamestate();
  const traveling = isTraveling();

  if (!traveling) {
    return {
      isActive: false,
      fromPosition: state.hero.position,
      toPosition: state.hero.position,
      progress: 0,
      interpolatedPosition: state.hero.position,
    };
  }

  const fromPosition = state.hero.position;
  const toPosition = {
    x: state.hero.travel.x,
    y: state.hero.travel.y,
    nodeId: state.hero.travel.nodeId,
  };

  // Calculate total travel time by checking how much time has passed
  // We now have the actual total travel time stored
  const currentTicksLeft = state.hero.travel.ticksLeft;
  const totalTravelTime = state.hero.travel.ticksTotal;

  const timeElapsed = Math.max(0, totalTravelTime - currentTicksLeft);
  const progress = totalTravelTime > 0 ? timeElapsed / totalTravelTime : 0;

  // Clamp progress between 0 and 1
  const clampedProgress = Math.max(0, Math.min(1, progress));

  // Calculate interpolated position
  const interpolatedPosition = {
    x: fromPosition.x + (toPosition.x - fromPosition.x) * clampedProgress,
    y: fromPosition.y + (toPosition.y - fromPosition.y) * clampedProgress,
    nodeId: '', // Interpolated position doesn't have a node ID
  };

  return {
    isActive: true,
    fromPosition,
    toPosition,
    progress: clampedProgress,
    interpolatedPosition,
  };
}
