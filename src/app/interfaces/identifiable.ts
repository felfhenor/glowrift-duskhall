export type ContentType =
  | 'worldconfig'
  | 'currency'
  | 'guardian'
  | 'skill'
  | 'weapon'
  | 'accessory'
  | 'trinket'
  | 'armor'
  | 'festival'
  | 'statuseffect'
  | 'talent'
  | 'talenttree'
  | 'traitequipment'
  | 'traitlocation';

export interface Identifiable {
  id: string;
  name: string;
}

export interface IsContentItem extends Identifiable {
  __type: ContentType;
}

declare const __brand: unique symbol;

export type Branded<T, K> = T & {
  readonly [__brand]: K;
};
