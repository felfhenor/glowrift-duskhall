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
  // We need to reconstruct this since we only have ticksLeft
  const currentTicksLeft = state.hero.travel.ticksLeft;

  // Calculate distance and approximate total travel time
  const distance = Math.sqrt(
    (toPosition.x - fromPosition.x) ** 2 + (toPosition.y - fromPosition.y) ** 2,
  );
  const baseTravelTime = Math.floor(distance * 5);

  // For simplicity, use base travel time as approximate total
  // In reality this might be modified by traits/festivals, but this gives us a good approximation
  const approximateTotalTime = baseTravelTime;
  const timeElapsed = Math.max(0, approximateTotalTime - currentTicksLeft);
  const progress =
    approximateTotalTime > 0 ? timeElapsed / approximateTotalTime : 0;

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
