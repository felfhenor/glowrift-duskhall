import { angleBetweenPoints } from '@helpers/math';
import { rngNumber, rngSeeded } from '@helpers/rng';
import { gamestate } from '@helpers/state-game';
import { elementsForCardinalDirection } from '@helpers/worldgen';
import type { GameElement, LocationType, WorldPosition } from '@interfaces';
import * as Compass from 'cardinal-direction';

export function spriteGetFromIndex(index: number): string {
  return index.toString().padStart(4, '0');
}

export function spriteGetForPosition(x: number, y: number): string {
  const state = gamestate();

  const elementStartSprites: Record<GameElement, number> = {
    Air: 16,
    Earth: 0,
    Fire: 24,
    Water: 12,
  };

  const centerPosition: WorldPosition = {
    x: Math.floor(state.world.config.width / 2),
    y: Math.floor(state.world.config.height / 2),
  };

  const cardinality = Compass.cardinalFromDegree(
    angleBetweenPoints(centerPosition, { x, y }),
    Compass.CardinalSubset.Intercardinal,
  );

  const elements = elementsForCardinalDirection(
    Compass.CardinalDirection[
      cardinality as unknown as number
    ] as unknown as Compass.CardinalDirection,
  );

  const dominantElement = elements[0]?.element ?? 'Air';

  return spriteGetFromIndex(
    elementStartSprites[dominantElement] +
      rngNumber(4, rngSeeded(`${state.gameId}-${x},${y}`)),
  );
}

export function spriteGetFromNodeType(
  nodeType: LocationType | undefined,
): string {
  switch (nodeType) {
    case 'castle':
      return '0001';
    case 'dungeon':
      return '0002';
    case 'cave':
      return '0003';
    case 'village':
      return '0004';
    case 'town':
      return '0005';
    default:
      return '';
  }
}
