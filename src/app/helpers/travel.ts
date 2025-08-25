import { exploringUpdateGlobalStatusText } from '@helpers/explore';
import { festivalExplorationTickMultiplier } from '@helpers/festival-exploration';
import { error } from '@helpers/logging';
import { distanceBetweenNodes } from '@helpers/math';
import { gamestate, updateGamestate } from '@helpers/state-game';
import { locationTraitExplorationMultiplier } from '@helpers/trait-location-exploration';
import { globalStatusText } from '@helpers/ui';
import { locationGetNearest } from '@helpers/world-location';
import type { WorldLocation, WorldPosition } from '@interfaces';
import { allHeroes } from '@helpers/hero';
import { meanBy } from 'es-toolkit/compat';

export function isTraveling() {
  return gamestate().hero.travel.ticksLeft > 0;
}

export function travelCurrentPosition() {
  return gamestate().hero.position;
}

export function travelTimeBetweenNodes(
  a: WorldPosition,
  b: WorldPosition,
): number {
  return Math.floor(distanceBetweenNodes(a, b) * 5);
}

export function travelTimeFromCurrentLocationTo(node: WorldLocation): number {
  const currentLocation = travelCurrentPosition();
  const travelTimeMultiplier =
    festivalExplorationTickMultiplier() +
    locationTraitExplorationMultiplier(node);
  const baseTravelTime = travelTimeBetweenNodes(currentLocation, node);
  const travelTimeModification = Math.floor(
    baseTravelTime * travelTimeMultiplier,
  );

  const averageHeroSpeed = meanBy(
    allHeroes(),
    (heroSpeed) => heroSpeed.totalStats.Speed,
  );

  const tickReduction = averageHeroSpeed;

  const totalTravelTime = baseTravelTime + travelTimeModification;

  return Math.max(1, totalTravelTime - tickReduction);
}

export function travelToNode(node: WorldLocation): void {
  const travelTime = travelTimeFromCurrentLocationTo(node);

  globalStatusText.set(`Travel to ${node.name} initiated...`);

  updateGamestate((state) => {
    state.hero.travel.nodeId = node.id;
    state.hero.travel.x = node.x;
    state.hero.travel.y = node.y;
    state.hero.travel.ticksLeft = travelTime;
    state.hero.travel.ticksTotal = travelTime;
    return state;
  });
}

export function travelIsAtNode(node: WorldLocation): boolean {
  const currentLocation = travelCurrentPosition();
  return currentLocation.nodeId === node.id;
}

export function isTravelingToNode(node: WorldLocation): boolean {
  return gamestate().hero.travel.nodeId === node.id;
}

export function travelHome(): void {
  const currentPosition = travelCurrentPosition();
  const nearestTown = locationGetNearest(currentPosition, ['town']);

  if (!nearestTown) {
    error('No towns found in the world.');
    return;
  }

  exploringUpdateGlobalStatusText('Returning to nearest town...');
  travelToNode(nearestTown);
}
