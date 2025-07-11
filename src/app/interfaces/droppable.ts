import { Artable } from '@interfaces/artable';
import { Content } from '@interfaces/identifiable';

export type DropRarity =
  | 'Common'
  | 'Uncommon'
  | 'Rare'
  | 'Mystical'
  | 'Legendary'
  | 'Unique';

export interface Droppable {
  preventModification?: boolean;
  preventDrop?: boolean;

  rarity: DropRarity;
  dropLevel: number;
}

export type DroppableEquippable = Content & Artable & Droppable;
