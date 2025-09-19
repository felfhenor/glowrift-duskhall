import type { DropRarity } from '@interfaces/droppable';
import type { GameElement } from '@interfaces/element';
import type { Branded, IsContentItem } from '@interfaces/identifiable';

export type CurrencyId = Branded<string, 'CurrencyId'>;

export type GameCurrency =
  | 'Mana'
  | 'Soul Essence'
  | 'Duskmote'
  | `${GameElement} Sliver`
  | `${GameElement} Shard`
  | `${GameElement} Crystal`
  | `${GameElement} Core`
  | `${DropRarity} Dust`;

export type CurrencyBlock = Record<GameCurrency, number>;

export type CurrencyContent = IsContentItem & {
  id: CurrencyId;
  name: GameCurrency;
  element?: GameElement;
  value: number;
};
