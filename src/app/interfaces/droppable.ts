import type { Artable } from '@interfaces/artable';
import type { IsContentItem } from '@interfaces/identifiable';

export type DropRarity =
  | 'Common'
  | 'Uncommon'
  | 'Rare'
  | 'Mystical'
  | 'Legendary'
  | 'Unique';

export interface HasRarity {
  rarity: DropRarity;
}

export type Droppable = HasRarity & {
  preventModification?: boolean;
  preventDrop?: boolean;
  dropLevel: number;
};

export type DroppableEquippable = IsContentItem & Artable & Droppable;
