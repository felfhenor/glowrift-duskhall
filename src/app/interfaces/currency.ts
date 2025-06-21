import { DropRarity } from './droppable';
import { GameElement } from './element';
import { Content } from './identifiable';

export type GameCurrency =
  | 'Mana'
  | 'Soul Essence'
  | `${GameElement} Sliver`
  | `${GameElement} Shard`
  | `${GameElement} Crystal`
  | `${GameElement} Core`
  | `${DropRarity} Dust`;

export type CurrencyBlock = Record<GameCurrency, number>;

export interface Currency extends Content {
  name: GameCurrency;
  element?: GameElement;
  value: number;
}
