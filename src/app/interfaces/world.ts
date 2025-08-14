import type { LocationUpgradeId } from '@interfaces/content-locationupgrade';
import type { TraitLocationId } from '@interfaces/content-trait-location';
import type { LocationType } from '@interfaces/content-worldconfig';
import type { GameElement } from '@interfaces/element';
import type { Identifiable } from '@interfaces/identifiable';

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
    elements: WorldLocationElement[];

    currentlyClaimed: boolean;
    claimCount: number;
    encounterLevel: number;
    unclaimTime: number;

    guardianIds: string[];
    claimLootIds: string[];

    traitIds: TraitLocationId[];

    locationUpgrades: Record<LocationUpgradeId, number>;
  };
