import { signal } from '@angular/core';
import { LocationType } from '../interfaces';

export const spriteIterationCount = signal<number>(0);

export function indexToSprite(index: number): string {
  return index.toString().padStart(4, '0');
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
