import { WorldLocation, WorldPosition } from '../interfaces';
import { getExplorationTickMultiplier } from './festival-exploration';
import { notify } from './notify';
import { gamestate, updateGamestate } from './state-game';

export function isTraveling() {
  return gamestate().hero.travel.ticksLeft > 0;
}

export function distanceBetweenNodes(
  a: WorldPosition,
  b: WorldPosition,
): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function travelTimeBetweenNodes(
  a: WorldPosition,
  b: WorldPosition,
): number {
  return Math.floor(distanceBetweenNodes(a, b) * 5);
}

export function travelTimeFromCurrentLocationTo(node: WorldPosition): number {
  const currentLocation = gamestate().hero.position;
  const travelTimeMultiplier = getExplorationTickMultiplier();
  const baseTravelTime = travelTimeBetweenNodes(currentLocation, node);
  const travelTimeModification = Math.floor(
    baseTravelTime * travelTimeMultiplier,
  );
  const totalTravelTime = baseTravelTime + travelTimeModification;

  return totalTravelTime;
}

export function travelToNode(node: WorldLocation): void {
  const travelTime = travelTimeFromCurrentLocationTo(node);

  notify(`Travel to ${node.name} initiated...`, 'Travel');

  updateGamestate((state) => {
    state.hero.travel.nodeId = node.id;
    state.hero.travel.x = node.x;
    state.hero.travel.y = node.y;
    state.hero.travel.ticksLeft = travelTime;
    return state;
  });
}

export function isAtNode(node: WorldLocation): boolean {
  const currentLocation = gamestate().hero.position;
  return currentLocation.nodeId === node.id;
}

export function isTravelingToNode(node: WorldLocation): boolean {
  return gamestate().hero.travel.nodeId === node.id;
}
