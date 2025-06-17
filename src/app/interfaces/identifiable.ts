export type ContentType =
  | 'worldconfig'
  | 'currency'
  | 'guardian'
  | 'skill'
  | 'weapon'
  | 'accessory'
  | 'trinket'
  | 'armor'
  | 'skill';

export interface Identifiable {
  id: string;
  name: string;
}

export interface Content extends Identifiable {
  __type: ContentType;
}

declare const __brand: unique symbol;

export type Branded<T, K> = T & {
  readonly [__brand]: K;
};
