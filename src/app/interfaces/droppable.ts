import type { Artable } from '@interfaces/artable';
import type { IsContentItem } from '@interfaces/identifiable';

export type DropRarity =
  | 'Common'
  | 'Uncommon'
  | 'Rare'
  | 'Mystical'
  | 'Legendary'
  | 'Unique';

export const RARITY_PRIORITY: Record<DropRarity, number> = {
  Common: 1,
  Uncommon: 2,
  Rare: 3,
  Mystical: 4,
  Legendary: 5,
  Unique: 6,
};

export interface HasRarity {
  rarity: DropRarity;
}

export type SymmetryLevel = 0 | 1 | 2 | 3 | 4 | 5;

export type HasSymmetry = {
  symmetryCount: number;
};

export type Droppable = HasRarity & {
  preventModification?: boolean;
  preventDrop?: boolean;
  dropLevel: number;
  isFavorite?: boolean;
};

export type DroppableEquippable = IsContentItem & Artable & Droppable;
