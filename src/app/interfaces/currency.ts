import type { DropRarity } from '@interfaces/droppable';
import type { GameElement } from '@interfaces/element';
import type { Content } from '@interfaces/identifiable';

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
