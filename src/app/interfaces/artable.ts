import { ALL_ICONS } from '@helpers';

export type Icon = keyof typeof ALL_ICONS;

export interface Artable {
  sprite: string;
}

export interface Animatable extends Artable {
  frames: number;
}
