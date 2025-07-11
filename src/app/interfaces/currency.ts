import { DropRarity } from '@interfaces/droppable';
import { GameElement } from '@interfaces/element';
import { Content } from '@interfaces/identifiable';

export type GameCurrency =
  | 'Mana'
  | 'Soul Essence'
  | `${GameElement} Sliver`
  | `${GameElement} Shard`
  | `${GameElement} Crystal`
  | `${GameElement} Core`
  | `${DropRarity} Dust`;

export type CurrencyBlock = Record<GameCurrency, number>;

export interface CurrencyContent extends Content {
  name: GameCurrency;
  element?: GameElement;
  value: number;
}
