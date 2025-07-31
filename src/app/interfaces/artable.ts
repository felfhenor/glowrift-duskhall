import type { ALL_ICONS } from '@helpers';

export type Icon = keyof typeof ALL_ICONS;

export interface Artable {
  sprite: string;
}

export type Animatable = Artable & {
  frames: number;
};

export type AtlasedImage =
  | 'hero'
  | 'guardian'
  | 'world-object'
  | 'world-terrain'
  | 'accessory'
  | 'weapon'
  | 'trinket'
  | 'talent'
  | 'armor'
  | 'skill';
