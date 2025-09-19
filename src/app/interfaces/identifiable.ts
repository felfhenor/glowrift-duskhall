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
  | 'traitlocation'
  | 'townupgrade'
  | 'locationupgrade'
  | 'help'
  | 'cameo'
  | 'job'
  | 'duskmotebundle';

export interface Identifiable {
  id: string;
  name: string;
}

export type IsContentItem = Identifiable & {
  __type: ContentType;
};

declare const __brand: unique symbol;

export type Branded<T, K> = T & {
  readonly [__brand]: K;
};
