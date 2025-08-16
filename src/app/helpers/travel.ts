import { getFestivalExplorationTickMultiplier } from '@helpers/festival-exploration';
import { notify } from '@helpers/notify';
import { gamestate, updateGamestate } from '@helpers/state-game';
import { locationTraitExplorationMultiplier } from '@helpers/trait-location-exploration';
import type { Hero, WorldLocation, WorldPosition } from '@interfaces';
import { allHeroes } from '@helpers/hero';
import { meanBy } from 'es-toolkit/compat';

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

export function travelTimeFromCurrentLocationTo(node: WorldLocation): number {
  const currentLocation = gamestate().hero.position;
  const travelTimeMultiplier =
    getFestivalExplorationTickMultiplier() +
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
