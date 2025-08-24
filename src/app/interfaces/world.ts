import type { LocationUpgradeId } from '@interfaces/content-locationupgrade';
import type { TraitLocationId } from '@interfaces/content-trait-location';
import type { LocationType } from '@interfaces/content-worldconfig';
import type { GameElement } from '@interfaces/element';
import type { Identifiable } from '@interfaces/identifiable';

export type WorldLocationCaptureType = 'guardians' | 'time';

export interface QuadtreePoint {
  x: number;
  y: number;
  taken: boolean;
}

export interface QuadtreeBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WorldPosition {
  x: number;
  y: number;
}

export interface WorldLocationElement {
  element: GameElement;
  intensity: number;
}

export type WorldLocation = WorldPosition &
  Identifiable & {
    nodeType?: LocationType;
    captureType: WorldLocationCaptureType;
    elements: WorldLocationElement[];

    permanentlyClaimed: boolean;
    currentlyClaimed: boolean;
    claimCount: number;
    encounterLevel: number;
    unclaimTime: number;

    guardianIds: string[];
    claimLootIds: string[];

    traitIds: TraitLocationId[];

    locationUpgrades: Record<LocationUpgradeId, number>;
  };

/**
 * Revelation radius for each location type when claimed
 */
export const REVELATION_RADIUS: Record<LocationType, number> = {
  cave: 1, // 3x3 area (radius 1)
  dungeon: 2, // 5x5 area (radius 2)
  village: 3, // 7x7 area (radius 3)
  castle: 4, // 9x9 area (radius 4)
  town: 5, // 11x11 area (radius 5)
};
