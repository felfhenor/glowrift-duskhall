import type { IsContentItem } from '@interfaces/identifiable';

export type LocationType = 'town' | 'village' | 'cave' | 'dungeon' | 'castle';

export type WorldConfigContent = IsContentItem & {
  width: number;
  height: number;

  maxLevel: number;
  nodeCount: Record<LocationType, { min: number; max: number }>;
};
