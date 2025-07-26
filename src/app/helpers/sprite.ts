import { signal } from '@angular/core';
import { randomNumber, seededrng } from '@helpers/rng';
import { gamestate } from '@helpers/state-game';
import {
  getAngleBetweenPoints,
  getElementsForCardinalDirection,
} from '@helpers/worldgen';
import type { GameElement, LocationType, WorldPosition } from '@interfaces';
import * as Compass from 'cardinal-direction';

export const spriteIterationCount = signal<number>(0);

export function indexToSprite(index: number): string {
  return index.toString().padStart(4, '0');
}

export function getSpriteForPosition(x: number, y: number): string {
  const state = gamestate();

  const elementStartSprites: Record<GameElement, number> = {
    Air: 16,
    Earth: 0,
    Fire: 24,
    Water: 12,
  };

  const centerPosition: WorldPosition = {
    x: Math.floor(state.world.width / 2),
    y: Math.floor(state.world.height / 2),
  };

  const cardinality = Compass.cardinalFromDegree(
    getAngleBetweenPoints(centerPosition, { x, y }),
    Compass.CardinalSubset.Intercardinal,
  );

  const elements = getElementsForCardinalDirection(
    Compass.CardinalDirection[
      cardinality as unknown as number
    ] as unknown as Compass.CardinalDirection,
  );

  const dominantElement = elements[0]?.element ?? 'Air';

  return indexToSprite(
    elementStartSprites[dominantElement] +
      randomNumber(4, seededrng(`${state.gameId}-${x},${y}`)),
  );
}

export function getSpriteFromNodeType(
  nodeType: LocationType | undefined,
): string {
  switch (nodeType) {
    case 'town':
      return '0021';
    case 'castle':
      return '0000';
    case 'cave':
      return '0020';
    case 'dungeon':
      return '0023';
    case 'village':
      return '0022';
    default:
      return '';
  }
}
