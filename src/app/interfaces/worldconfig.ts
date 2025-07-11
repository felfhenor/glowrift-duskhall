import { Content } from './identifiable';

export type LocationType = 'town' | 'village' | 'cave' | 'dungeon' | 'castle';

export interface WorldConfigContent extends Content {
  width: number;
  height: number;

  maxLevel: number;
  nodeCount: Record<LocationType, { min: number; max: number }>;
}
